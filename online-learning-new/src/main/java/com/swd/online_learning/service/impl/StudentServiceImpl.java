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
    @Override
    public void enrollCourse(Long courseId, String username) {
        User student = userRepository.findByUsername(username).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();

        if (enrollmentRepository.existsByStudentAndCourse(student, course)) {
            throw new RuntimeException("Already enrolled");
        }
        enrollmentRepository.save(Enrollment.builder().student(student).course(course).progressPercent(0.0f).build());
    }



    @Override
    public List<Course> getMyEnrolledCourses(String studentUsername) {
        User student = userRepository.findByUsername(studentUsername)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Lấy danh sách enrollment rồi map ra Course
        return enrollmentRepository.findByStudent(student).stream()
                .map(Enrollment::getCourse)
                .collect(Collectors.toList());
    }
    // --- LOGIC CHẤM ĐIỂM QUIZ TỰ ĐỘNG ---
    @Override
    @Transactional
    public QuizResultResponse submitQuiz(QuizSubmissionRequest request, String username) {
        User student = userRepository.findByUsername(username).orElseThrow();
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        // 1. Tìm Enrollment (Học sinh phải ghi danh mới được làm bài)
        Enrollment enrollment = enrollmentRepository.findByStudentAndCourse(student, quiz.getLesson().getChapter().getCourse())
                .orElseThrow(() -> new RuntimeException("You must enroll in this course first"));

        // 2. Tính điểm
        int totalCorrect = 0;
        int totalQuestions = quiz.getQuestions().size();
        List<SubmissionAnswer> submissionAnswers = new ArrayList<>();

        // Tạo bản ghi Submission trước
        Submission submission = Submission.builder()
                .enrollment(enrollment)
                .quiz(quiz)
                .type(SubmissionType.QUIZ)
                .status(SubmissionStatus.GRADED) // Quiz có điểm ngay
                .build();

        // Map đáp án đúng để check cho nhanh
        Map<Long, Boolean> correctOptions = quiz.getQuestions().stream()
                .flatMap(q -> q.getOptions().stream())
                .collect(Collectors.toMap(QuizOption::getOptionId, QuizOption::isCorrect));

        for (QuizSubmissionRequest.AnswerRequest ans : request.getAnswers()) {
            boolean isCorrect = correctOptions.getOrDefault(ans.getSelectedOptionId(), false);
            if (isCorrect) totalCorrect++;

            // Lưu lịch sử chọn
            submissionAnswers.add(SubmissionAnswer.builder()
                    .submission(submission)
                    .question(questionRepository.getReferenceById(ans.getQuestionId()))
                    .selectedOption(quizOptionRepository.getReferenceById(ans.getSelectedOptionId()))
                    .build());
        }

        // Quy đổi ra thang điểm 10
        float score = (float) totalCorrect / totalQuestions * 10;
        submission.setScore(score);
        submission.setAnswers(submissionAnswers);

        Submission savedSubmission = submissionRepository.save(submission);

        // 3. CẬP NHẬT TIẾN ĐỘ (Nếu qua môn)
        if (score >= 5.0) {
            updateProgress(enrollment);
        }

        return QuizResultResponse.builder()
                .submissionId(savedSubmission.getSubmissionId())
                .score(score)
                .totalCorrect(totalCorrect)
                .totalQuestions(totalQuestions)
                .isPassed(score >= 5.0)
                .build();
    }

    // --- LOGIC NỘP ASSIGNMENT (CHƯA CÓ ĐIỂM) ---
    @Override
    @Transactional
    public Submission submitAssignment(AssignmentSubmissionRequest request, String username) {
        User student = userRepository.findByUsername(username).orElseThrow();
        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        Enrollment enrollment = enrollmentRepository.findByStudentAndCourse(student, assignment.getLesson().getChapter().getCourse())
                .orElseThrow(() -> new RuntimeException("You must enroll first"));

        Submission submission = Submission.builder()
                .enrollment(enrollment)
                .assignment(assignment)
                .type(SubmissionType.ASSIGNMENT)
                .status(SubmissionStatus.PENDING) // Chờ giáo viên chấm
                .attachmentUrl(request.getFileUrl())
                .studentTextResponse(request.getTextResponse())
                .score(null) // Chưa có điểm
                .build();

        return submissionRepository.save(submission);
    }

    // --- HELPER: TÍNH TOÁN TIẾN ĐỘ ---
    private void updateProgress(Enrollment enrollment) {
        Course course = enrollment.getCourse();

        // 1. Tổng số bài tập trong khóa học (Quiz + Assignment)
        long totalQuizzes = course.getChapters().stream()
                .flatMap(c -> c.getLessons().stream())
                .mapToLong(l -> l.getQuizzes().size()).sum();

        long totalAssignments = course.getChapters().stream()
                .flatMap(c -> c.getLessons().stream())
                .mapToLong(l -> l.getAssignments().size()).sum();

        long totalItems = totalQuizzes + totalAssignments;
        if (totalItems == 0) return;

        // 2. Số bài tập đã qua (Score >= 5.0)
        long passedItems = submissionRepository.countPassedItems(enrollment.getEnrollmentId());

        // 3. Tính %
        float progress = (float) passedItems / totalItems * 100;
        if (progress > 100.0f) progress = 100.0f;

        // 4. Lưu lại
        enrollment.setProgressPercent(progress);
        enrollmentRepository.save(enrollment);
    }

    // --- BỔ SUNG HÀM THIẾU ---
    @Override
    public Lesson getLessonDetail(Long lessonId, String studentUsername) {
        User student = userRepository.findByUsername(studentUsername)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        // (Tùy chọn) Kiểm tra bảo mật: Học sinh có ghi danh khóa này chưa?
        // Nếu chưa ghi danh thì không cho xem bài học
        Course course = lesson.getChapter().getCourse();
        if (!enrollmentRepository.existsByStudentAndCourse(student, course)) {
            throw new RuntimeException("You must enroll in this course to view the lesson.");
        }

        return lesson;
    }
}