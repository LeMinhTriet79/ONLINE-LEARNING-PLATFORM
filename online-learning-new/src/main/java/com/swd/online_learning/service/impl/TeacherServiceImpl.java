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

    // ================= COURSE (KHÓA HỌC) =================
    @Override
    @Transactional
    public Course createCourse(CourseRequest request, String instructorUsername) {
        User instructor = userRepository.findByUsername(instructorUsername)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl()) // <--- LƯU ẢNH
                .instructor(instructor)
                .build();

        return courseRepository.save(course);
    }

    @Override
    public List<Course> getMyCourses(String instructorUsername) {
        return courseRepository.findByInstructorUsername(instructorUsername);
    }

    @Override
    @Transactional
    public Course updateCourse(Long courseId, CourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setImageUrl(request.getImageUrl()); // <--- CẬP NHẬT ẢNH

        return courseRepository.save(course);
    }

    @Override
    @Transactional
    public void deleteCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) throw new RuntimeException("Course not found");
        courseRepository.deleteById(courseId); // Xóa Course -> Xóa luôn Chapter -> Lesson (do Cascade)
    }

    // ================= CHAPTER (CHƯƠNG) =================
    @Override
    @Transactional
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
    @Transactional
    public Chapter updateChapter(Long chapterId, ChapterRequest request) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter not found"));
        chapter.setTitle(request.getTitle());
        chapter.setOrderIndex(request.getOrderIndex());
        return chapterRepository.save(chapter);
    }

    @Override
    @Transactional
    public void deleteChapter(Long chapterId) {
        if (!chapterRepository.existsById(chapterId)) throw new RuntimeException("Chapter not found");
        chapterRepository.deleteById(chapterId);
    }

    // ================= LESSON (BÀI HỌC) =================
    @Override
    @Transactional
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
    public Lesson getLessonDetail(Long lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
    }

    @Override
    @Transactional
    public Lesson updateLesson(Long lessonId, LessonRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        lesson.setTitle(request.getTitle());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setContentText(request.getContentText());
        lesson.setAttachmentUrl(request.getAttachmentUrl());
        // Không update orderIndex ở đây nếu không cần thiết
        return lessonRepository.save(lesson);
    }

    @Override
    @Transactional
    public void deleteLesson(Long lessonId) {
        if (!lessonRepository.existsById(lessonId)) throw new RuntimeException("Lesson not found");
        lessonRepository.deleteById(lessonId);
    }

    // ================= QUIZ & ASSIGNMENT (BÀI TẬP) =================
    @Override
    @Transactional
    public Quiz createQuiz(Long lessonId, QuizRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        Quiz quiz = Quiz.builder().title(request.getTitle()).lesson(lesson).build();

        List<Question> questions = request.getQuestions().stream().map(qReq -> {
            Question question = Question.builder().content(qReq.getContent()).quiz(quiz).build();
            List<QuizOption> options = qReq.getOptions().stream().map(oReq ->
                    QuizOption.builder().content(oReq.getContent()).isCorrect(oReq.isCorrect()).question(question).build()
            ).collect(Collectors.toList());
            question.setOptions(options);
            return question;
        }).collect(Collectors.toList());

        quiz.setQuestions(questions);
        return quizRepository.save(quiz);
    }

    @Override
    @Transactional
    public Quiz updateQuiz(Long quizId, QuizRequest request) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new RuntimeException("Quiz not found"));
        quiz.setTitle(request.getTitle());
        quiz.getQuestions().clear(); // Xóa cũ (Entity phải có orphanRemoval=true)

        List<Question> newQuestions = request.getQuestions().stream().map(qReq -> {
            Question question = Question.builder().content(qReq.getContent()).quiz(quiz).build();
            List<QuizOption> options = qReq.getOptions().stream().map(oReq ->
                    QuizOption.builder().content(oReq.getContent()).isCorrect(oReq.isCorrect()).question(question).build()
            ).collect(Collectors.toList());
            question.setOptions(options);
            return question;
        }).collect(Collectors.toList());

        quiz.getQuestions().addAll(newQuestions);
        return quizRepository.save(quiz);
    }

    @Override
    @Transactional
    public void deleteQuiz(Long quizId) {
        quizRepository.deleteById(quizId);
    }

    @Override
    @Transactional
    public Assignment createAssignment(Long lessonId, AssignmentRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow();
        Assignment assignment = Assignment.builder()
                .title(request.getTitle())
                .instructions(request.getInstructions())
                .attachmentUrl(request.getAttachmentUrl())
                .lesson(lesson).build();
        return assignmentRepository.save(assignment);
    }

    @Override
    @Transactional
    public Assignment updateAssignment(Long assignmentId, AssignmentRequest request) {
        Assignment assignment = assignmentRepository.findById(assignmentId).orElseThrow();
        assignment.setTitle(request.getTitle());
        assignment.setInstructions(request.getInstructions());
        assignment.setAttachmentUrl(request.getAttachmentUrl());
        return assignmentRepository.save(assignment);
    }

    @Override
    @Transactional
    public void deleteAssignment(Long assignmentId) {
        assignmentRepository.deleteById(assignmentId);
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


}