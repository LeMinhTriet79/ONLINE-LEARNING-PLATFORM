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
    @Transactional
    public void enrollCourse(Long courseId, String enrollmentKey, String username) {
        // 1. Tìm khóa học theo ID (User chọn khóa nào thì tìm khóa đó)
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại!"));

        // 2. Kiểm tra Mã tham gia (Key)
        if (course.getEnrollmentKey() == null || !course.getEnrollmentKey().equals(enrollmentKey)) {
            throw new RuntimeException("Mã tham gia không chính xác! Vui lòng kiểm tra lại.");
        }

        // 3. Kiểm tra đã học chưa
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (enrollmentRepository.existsByStudentAndCourse(student, course)) {
            throw new RuntimeException("Bạn đã tham gia khóa học này rồi!");
        }

        // 4. Lưu Enrollment
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .progressPercent(0.0f)
                .build();
        enrollmentRepository.save(enrollment);
    }
    @Override
    public List<Course> getAllCourses() {
        return courseRepository.findAll(); // Lấy tất cả khóa học trong hệ thống
    }



    @Override
    public List<Enrollment> getMyEnrolledCourses(String studentUsername) {
        User student = userRepository.findByUsername(studentUsername)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Trả về nguyên cục Enrollment để lấy được field progressPercent
        return enrollmentRepository.findByStudent(student);
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

    @Override
    @Transactional(readOnly = true)
    public Course getFullCourseDetail(Long courseId, String username) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // 1. Kiểm tra xem học sinh có trong danh sách lớp không
        if (!enrollmentRepository.existsByStudentAndCourse(student, course)) {
            throw new RuntimeException("Bạn chưa tham gia khóa học này!");
        }

        // 2. Ép Hibernate tải dữ liệu Chapters và Lessons (tránh lỗi Lazy Loading)
        // Vì mặc định JPA sẽ không tự lấy list con
        course.getChapters().forEach(chapter -> {
            chapter.getLessons().forEach(lesson -> {
                // Chỉ cần gọi .size() là Hibernate sẽ query lấy dữ liệu về
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
        Enrollment enrollment = enrollmentRepository.findByStudentAndCourse(student, quiz.getLesson().getChapter().getCourse()).orElseThrow();

        Submission submission = submissionRepository.findLatestQuizSubmission(enrollment.getEnrollmentId(), quizId).orElse(null);

        if (submission != null) {
            // Chỉ cần gọi size() là đủ để Hibernate tải list về
            // Nhờ @JsonIgnore bên Entity, nó sẽ không bị vòng lặp nữa
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
        Enrollment enrollment = enrollmentRepository.findByStudentAndCourse(student, assignment.getLesson().getChapter().getCourse()).orElseThrow();

        return submissionRepository.findLatestAssignmentSubmission(enrollment.getEnrollmentId(), assignmentId).orElse(null);
    }

    @Override
    @Transactional
    public void deleteSubmission(Long submissionId, String username) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        // Chỉ cho phép xóa nếu là bài của chính mình và chưa được chấm
        if (!submission.getEnrollment().getStudent().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }
        if (submission.getStatus() == SubmissionStatus.GRADED) {
            throw new RuntimeException("Bài đã được chấm, không thể thu hồi!");
        }
        submissionRepository.delete(submission);
    }
}