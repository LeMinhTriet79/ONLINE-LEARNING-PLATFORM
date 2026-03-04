package com.swd.online_learning.service.impl;

import com.swd.online_learning.dto.request.*;
import com.swd.online_learning.dto.response.QuizResultResponse;
import com.swd.online_learning.entity.*;
import com.swd.online_learning.enums.*;
import com.swd.online_learning.repository.*;
import com.swd.online_learning.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final QuestionRepository questionRepository;
    private final QuizOptionRepository quizOptionRepository;
    private final LessonRepository lessonRepository;
    private final ClassRoomRepository classRoomRepository;

    @Override
    @Transactional
    public void enrollCourse(Long courseId, String enrollmentKey, String username) {
        ClassRoom classRoom = classRoomRepository.findByEnrollmentKey(enrollmentKey)
                .orElseThrow(() -> new RuntimeException("Mã tham gia không chính xác hoặc lớp không tồn tại!"));

        if (!classRoom.getCourse().getCourseId().equals(courseId)) {
            throw new RuntimeException("Mã tham gia này không thuộc về khóa học hiện tại!");
        }

        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh"));

        if (enrollmentRepository.existsByStudentAndClassRoom_Course(student, classRoom.getCourse())) {
            throw new RuntimeException("Bạn đã tham gia khóa học này (ở một lớp nào đó) rồi!");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .classRoom(classRoom)
                .progressPercent(0.0f)
                .build();
        enrollmentRepository.save(enrollment);
    }

    @Override
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Override
    public List<Enrollment> getMyEnrolledCourses(String studentUsername) {
        User student = userRepository.findByUsername(studentUsername).orElseThrow();
        return enrollmentRepository.findByStudent(student);
    }

    @Override
    @Transactional
    public QuizResultResponse submitQuiz(QuizSubmissionRequest request, String username) {
        User student = userRepository.findByUsername(username).orElseThrow();
        Quiz quiz = quizRepository.findById(request.getQuizId()).orElseThrow();

        Enrollment enrollment = enrollmentRepository.findByStudentAndClassRoom_Course(student, quiz.getLesson().getChapter().getCourse())
                .orElseThrow(() -> new RuntimeException("You must enroll in this course first"));

        int totalCorrect = 0;
        int totalQuestions = quiz.getQuestions().size();
        List<SubmissionAnswer> submissionAnswers = new ArrayList<>();

        Submission submission = Submission.builder()
                .enrollment(enrollment)
                .quiz(quiz)
                .type(SubmissionType.QUIZ)
                .status(SubmissionStatus.GRADED)
                .build();

        Map<Long, Boolean> correctOptions = quiz.getQuestions().stream()
                .flatMap(q -> q.getOptions().stream())
                .collect(Collectors.toMap(QuizOption::getOptionId, QuizOption::isCorrect));

        for (QuizSubmissionRequest.AnswerRequest ans : request.getAnswers()) {
            boolean isCorrect = correctOptions.getOrDefault(ans.getSelectedOptionId(), false);
            if (isCorrect) totalCorrect++;

            submissionAnswers.add(SubmissionAnswer.builder()
                    .submission(submission)
                    .question(questionRepository.getReferenceById(ans.getQuestionId()))
                    .selectedOption(quizOptionRepository.getReferenceById(ans.getSelectedOptionId()))
                    .build());
        }

        float score = (float) totalCorrect / totalQuestions * 10;
        submission.setScore(score);
        submission.setAnswers(submissionAnswers);

        Submission savedSubmission = submissionRepository.save(submission);

        if (score >= 5.0) updateProgress(enrollment);

        return QuizResultResponse.builder()
                .submissionId(savedSubmission.getSubmissionId())
                .score(score)
                .totalCorrect(totalCorrect)
                .totalQuestions(totalQuestions)
                .isPassed(score >= 5.0)
                .build();
    }

    @Override
    @Transactional
    public Submission submitAssignment(AssignmentSubmissionRequest request, String username) {
        User student = userRepository.findByUsername(username).orElseThrow();
        Assignment assignment = assignmentRepository.findById(request.getAssignmentId()).orElseThrow();

        Enrollment enrollment = enrollmentRepository.findByStudentAndClassRoom_Course(student, assignment.getLesson().getChapter().getCourse())
                .orElseThrow(() -> new RuntimeException("You must enroll first"));

        Submission submission = Submission.builder()
                .enrollment(enrollment)
                .assignment(assignment)
                .type(SubmissionType.ASSIGNMENT)
                .status(SubmissionStatus.PENDING)
                .attachmentUrl(request.getFileUrl())
                .studentTextResponse(request.getTextResponse())
                .score(null)
                .build();

        return submissionRepository.save(submission);
    }

    private void updateProgress(Enrollment enrollment) {
        Course course = enrollment.getClassRoom().getCourse();
        long totalQuizzes = course.getChapters().stream().flatMap(c -> c.getLessons().stream()).mapToLong(l -> l.getQuizzes().size()).sum();
        long totalAssignments = course.getChapters().stream().flatMap(c -> c.getLessons().stream()).mapToLong(l -> l.getAssignments().size()).sum();
        long totalItems = totalQuizzes + totalAssignments;

        if (totalItems == 0) {
            enrollment.setProgressPercent(0.0f);
        } else {
            long passedItems = submissionRepository.countPassedItems(enrollment.getEnrollmentId());
            float progress = (float) passedItems / totalItems * 100;
            enrollment.setProgressPercent(progress > 100 ? 100 : progress);
        }
        enrollmentRepository.save(enrollment);
    }

    @Override
    public Lesson getLessonDetail(Long lessonId, String studentUsername) {
        User student = userRepository.findByUsername(studentUsername).orElseThrow();
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow();

        Course course = lesson.getChapter().getCourse();
        if (!enrollmentRepository.existsByStudentAndClassRoom_Course(student, course)) {
            throw new RuntimeException("You must enroll in this course to view the lesson.");
        }
        return lesson;
    }

    @Override
    @Transactional(readOnly = true)
    public Course getFullCourseDetail(Long courseId, String username) {
        User student = userRepository.findByUsername(username).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();

        if (!enrollmentRepository.existsByStudentAndClassRoom_Course(student, course)) {
            throw new RuntimeException("Bạn chưa tham gia khóa học này!");
        }

        course.getChapters().forEach(chapter -> {
            chapter.getLessons().forEach(lesson -> {
                lesson.getQuizzes().size();
                lesson.getAssignments().size();
            });
        });
        return course;
    }

    @Transactional
    public Submission getLatestQuizSubmission(Long quizId, String username) {
        User student = userRepository.findByUsername(username).orElseThrow();
        Quiz quiz = quizRepository.findById(quizId).orElseThrow();
        Enrollment enrollment = enrollmentRepository.findByStudentAndClassRoom_Course(student, quiz.getLesson().getChapter().getCourse()).orElseThrow();

        Submission submission = submissionRepository.findLatestQuizSubmission(enrollment.getEnrollmentId(), quizId).orElse(null);

        if (submission != null) {
            submission.getAnswers().size();
            submission.getAnswers().forEach(ans -> {
                if (ans.getQuestion() != null) ans.getQuestion().getContent();
                if (ans.getSelectedOption() != null) ans.getSelectedOption().getContent();
            });
        }
        return submission;
    }

    @Override
    public Submission getLatestAssignmentSubmission(Long assignmentId, String username) {
        User student = userRepository.findByUsername(username).orElseThrow();
        Assignment assignment = assignmentRepository.findById(assignmentId).orElseThrow();
        Enrollment enrollment = enrollmentRepository.findByStudentAndClassRoom_Course(student, assignment.getLesson().getChapter().getCourse()).orElseThrow();

        return submissionRepository.findLatestAssignmentSubmission(enrollment.getEnrollmentId(), assignmentId).orElse(null);
    }

    @Override
    @Transactional
    public void deleteSubmission(Long submissionId, String username) {
        Submission submission = submissionRepository.findById(submissionId).orElseThrow();
        if (!submission.getEnrollment().getStudent().getUsername().equals(username)) throw new RuntimeException("Unauthorized");
        if (submission.getStatus() == SubmissionStatus.GRADED) throw new RuntimeException("Bài đã được chấm, không thể thu hồi!");
        submissionRepository.delete(submission);
    }
}