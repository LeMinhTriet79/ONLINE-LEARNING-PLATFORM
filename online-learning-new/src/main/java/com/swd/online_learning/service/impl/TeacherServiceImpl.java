package com.swd.online_learning.service.impl;

import com.swd.online_learning.dto.request.*;
import com.swd.online_learning.entity.*;
import com.swd.online_learning.enums.SubmissionStatus;
import com.swd.online_learning.enums.SubmissionType;
import com.swd.online_learning.repository.*;
import com.swd.online_learning.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherServiceImpl implements TeacherService {

    private final CourseRepository courseRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Override
    @Transactional
    public Course createCourse(CourseRequest request, String instructorUsername) {
        // Lấy thông tin giáo viên từ token (username)
        User instructor = userRepository.findByUsername(instructorUsername)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .instructor(instructor)
                .build();

        return courseRepository.save(course);
    }

    @Override
    public List<Course> getMyCourses(String instructorUsername) {
        return courseRepository.findByInstructorUsername(instructorUsername);
    }

    @Override
    public Chapter createChapter(Long courseId, ChapterRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Chapter chapter = Chapter.builder()
                .title(request.getTitle())
                .orderIndex(request.getOrderIndex())
                .course(course)
                .build();

        return chapterRepository.save(chapter);
    }

    @Override
    public Lesson createLesson(Long chapterId, LessonRequest request) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter not found"));

        Lesson lesson = Lesson.builder()
                .title(request.getTitle())
                .contentText(request.getContentText())
                .videoUrl(request.getVideoUrl())
                .attachmentUrl(request.getAttachmentUrl())
                .orderIndex(request.getOrderIndex())
                .chapter(chapter)
                .build();

        return lessonRepository.save(lesson);
    }

    @Override
    @Transactional
    public Quiz createQuiz(Long lessonId, QuizRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        // Map DTO sang Entity (Logic phức tạp nhất nằm ở đây)
        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .lesson(lesson)
                .build();

        List<Question> questions = request.getQuestions().stream().map(qReq -> {
            Question question = Question.builder()
                    .content(qReq.getContent())
                    .quiz(quiz)
                    .build();

            List<QuizOption> options = qReq.getOptions().stream().map(oReq ->
                    QuizOption.builder()
                            .content(oReq.getContent())
                            .isCorrect(oReq.isCorrect())
                            .question(question)
                            .build()
            ).collect(Collectors.toList());

            question.setOptions(options);
            return question;
        }).collect(Collectors.toList());

        quiz.setQuestions(questions);

        return quizRepository.save(quiz);
    }

    @Override
    public Assignment createAssignment(Long lessonId, AssignmentRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        // Map từ DTO sang Entity mới tinh -> ID chắc chắn là null -> Hibernate sẽ CREATE
        Assignment assignment = Assignment.builder()
                .title(request.getTitle())
                .instructions(request.getInstructions())
                .attachmentUrl(request.getAttachmentUrl())
                .lesson(lesson)
                .build();

        return assignmentRepository.save(assignment);
    }


    @Override
    @Transactional
    public Submission gradeAssignment(Long submissionId, GradeAssignmentRequest request) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (submission.getType() != SubmissionType.ASSIGNMENT) {
            throw new RuntimeException("Cannot grade a Quiz manually");
        }

        // Cập nhật điểm và feedback
        submission.setScore(request.getScore());
        submission.setTeacherFeedback(request.getFeedback());
        submission.setStatus(SubmissionStatus.GRADED); // Đổi trạng thái thành Đã chấm

        Submission savedSubmission = submissionRepository.save(submission);

        // QUAN TRỌNG: CẬP NHẬT TIẾN ĐỘ CHO HỌC SINH
        if (request.getScore() >= 5.0) {
            updateProgress(submission.getEnrollment());
        }

        return savedSubmission;
    }

    private void updateProgress(Enrollment enrollment) {
        //  lấy Course từ Enrollment -> đếm tổng bài -> đếm bài qua -> tính %
        Course course = enrollment.getCourse();
        long totalQuizzes = course.getChapters().stream()
                .flatMap(c -> c.getLessons().stream())
                .mapToLong(l -> l.getQuizzes().size()).sum();
        long totalAssignments = course.getChapters().stream()
                .flatMap(c -> c.getLessons().stream())
                .mapToLong(l -> l.getAssignments().size()).sum();

        long totalItems = totalQuizzes + totalAssignments;
        if (totalItems == 0) return;

        long passedItems = submissionRepository.countPassedItems(enrollment.getEnrollmentId());
        float progress = (float) passedItems / totalItems * 100;
        if (progress > 100.0f) progress = 100.0f;

        enrollment.setProgressPercent(progress);
        enrollmentRepository.save(enrollment);
    }

    @Override
    @Transactional
    public Lesson updateLesson(Long lessonId, LessonRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        // Cập nhật thông tin mới
        lesson.setTitle(request.getTitle());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setContentText(request.getContentText());
        lesson.setAttachmentUrl(request.getAttachmentUrl());

        return lessonRepository.save(lesson);
    }

    @Override
    public Lesson getLessonDetail(Long lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
    }

    @Override
    @Transactional
    public Quiz updateQuiz(Long quizId, QuizRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        quiz.setTitle(request.getTitle());

        // XÓA HẾT CŨ - THÊM MỚI (Cách an toàn nhất để tránh lỗi trùng lặp)
        // Nhờ orphanRemoval = true ở Entity, lệnh clear() này sẽ xóa bay dữ liệu cũ trong DB
        quiz.getQuestions().clear();

        // Convert Request -> Entity
        List<Question> newQuestions = request.getQuestions().stream().map(qReq -> {
            Question question = Question.builder()
                    .content(qReq.getContent())
                    .quiz(quiz) // Gán ngược lại quiz cho question
                    .build();

            List<QuizOption> options = qReq.getOptions().stream().map(oReq ->
                    QuizOption.builder()
                            .content(oReq.getContent())
                            .isCorrect(oReq.isCorrect())
                            .question(question) // Gán ngược lại question cho option
                            .build()
            ).collect(Collectors.toList());

            question.setOptions(options);
            return question;
        }).collect(Collectors.toList());

        // Thêm danh sách mới vào
        quiz.getQuestions().addAll(newQuestions);

        return quizRepository.save(quiz);
    }

    @Override
    public void deleteQuiz(Long quizId) {
        quizRepository.deleteById(quizId);
    }

    @Override
    @Transactional
    public Assignment updateAssignment(Long assignmentId, AssignmentRequest request) {
        Assignment assignment = assignmentRepository.findById(assignmentId).orElseThrow(() -> new RuntimeException("Assignment not found"));
        assignment.setTitle(request.getTitle());
        assignment.setInstructions(request.getInstructions());
        assignment.setAttachmentUrl(request.getAttachmentUrl());
        return assignmentRepository.save(assignment);
    }

    @Override
    public void deleteAssignment(Long assignmentId) {
        assignmentRepository.deleteById(assignmentId);
    }
}