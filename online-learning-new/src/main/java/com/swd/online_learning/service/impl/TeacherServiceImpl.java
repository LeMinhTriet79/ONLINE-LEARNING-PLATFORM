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
    private final ClassRoomRepository classRoomRepository;

    @Override
    @Transactional
    public Course createCourse(CourseRequest request, String instructorUsername) {
        User instructor = userRepository.findByUsername(instructorUsername)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .instructor(instructor)
                .build();
        return courseRepository.save(course);
    }

    @Override
    public List<Course> getMyCourses(String instructorUsername) {
        return courseRepository.findByInstructor_Username(instructorUsername);
    }

    @Override
    @Transactional
    public Course updateCourse(Long courseId, CourseRequest request) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setImageUrl(request.getImageUrl());
        return courseRepository.save(course);
    }

    @Override
    @Transactional
    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        List<Enrollment> enrollments = enrollmentRepository.findByClassRoom_Course(course);
        for (Enrollment enrollment : enrollments) {
            submissionRepository.deleteByEnrollment(enrollment);
            enrollmentRepository.delete(enrollment);
        }
        courseRepository.delete(course);
    }

    @Override
    @Transactional
    public Chapter createChapter(Long courseId, ChapterRequest request) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        Chapter chapter = Chapter.builder().title(request.getTitle()).orderIndex(request.getOrderIndex()).course(course).build();
        return chapterRepository.save(chapter);
    }

    @Override
    @Transactional
    public Chapter updateChapter(Long chapterId, ChapterRequest request) {
        Chapter chapter = chapterRepository.findById(chapterId).orElseThrow();
        chapter.setTitle(request.getTitle());
        chapter.setOrderIndex(request.getOrderIndex());
        return chapterRepository.save(chapter);
    }

    @Override
    @Transactional
    public void deleteChapter(Long chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId).orElseThrow();
        Course course = chapter.getCourse();
        for (Lesson lesson : chapter.getLessons()) cleanUpLessonData(lesson);
        chapterRepository.delete(chapter);
        recalculateCourseProgress(course);
    }

    @Override
    @Transactional
    public Lesson createLesson(Long chapterId, LessonRequest request) {
        Chapter chapter = chapterRepository.findById(chapterId).orElseThrow();
        Lesson lesson = Lesson.builder()
                .title(request.getTitle())
                .contentText(request.getContentText())
                .videoUrl(request.getVideoUrl())
                .attachmentUrl(request.getAttachmentUrl())
                .orderIndex(request.getOrderIndex())
                .chapter(chapter).build();
        return lessonRepository.save(lesson);
    }

    @Override
    public Lesson getLessonDetail(Long lessonId) {
        return lessonRepository.findById(lessonId).orElseThrow();
    }

    @Override
    @Transactional
    public Lesson updateLesson(Long lessonId, LessonRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow();
        lesson.setTitle(request.getTitle());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setContentText(request.getContentText());
        lesson.setAttachmentUrl(request.getAttachmentUrl());
        return lessonRepository.save(lesson);
    }

    @Override
    @Transactional
    public void deleteLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow();
        Course course = lesson.getChapter().getCourse();
        cleanUpLessonData(lesson);
        lesson.getChapter().getLessons().remove(lesson);
        chapterRepository.save(lesson.getChapter());
        recalculateCourseProgress(course);
    }

    @Override
    @Transactional
    public Quiz createQuiz(Long lessonId, QuizRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow();
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
        Quiz savedQuiz = quizRepository.save(quiz);
        recalculateCourseProgress(lesson.getChapter().getCourse());
        return savedQuiz;
    }

    @Override
    @Transactional
    public Quiz updateQuiz(Long quizId, QuizRequest request) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow();
        quiz.setTitle(request.getTitle());
        List<Question> updatedQuestions = request.getQuestions().stream().map(qReq -> {
            Question question = Question.builder().content(qReq.getContent()).quiz(quiz).build();
            List<QuizOption> options = qReq.getOptions().stream().map(oReq ->
                    QuizOption.builder().content(oReq.getContent()).isCorrect(oReq.isCorrect()).question(question).build()
            ).collect(Collectors.toList());
            question.setOptions(options);
            return question;
        }).collect(Collectors.toList());

        if (!submissionRepository.existsByQuiz(quiz)) {
            quiz.getQuestions().clear();
            quiz.getQuestions().addAll(updatedQuestions);
        } else {
            submissionRepository.deleteAll(submissionRepository.findByQuiz(quiz));
            quiz.getQuestions().clear();
            quiz.getQuestions().addAll(updatedQuestions);
            recalculateCourseProgress(quiz.getLesson().getChapter().getCourse());
        }
        return quizRepository.save(quiz);
    }

    @Override
    @Transactional
    public void deleteQuiz(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow();
        Course course = quiz.getLesson().getChapter().getCourse();
        submissionRepository.deleteAll(submissionRepository.findByQuiz(quiz));
        quiz.getLesson().getQuizzes().remove(quiz);
        lessonRepository.save(quiz.getLesson());
        recalculateCourseProgress(course);
    }

    @Override
    @Transactional
    public Assignment createAssignment(Long lessonId, AssignmentRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow();
        Assignment assignment = Assignment.builder().title(request.getTitle()).instructions(request.getInstructions()).attachmentUrl(request.getAttachmentUrl()).lesson(lesson).build();
        Assignment savedAssign = assignmentRepository.save(assignment);
        recalculateCourseProgress(lesson.getChapter().getCourse());
        return savedAssign;
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
        Assignment assignment = assignmentRepository.findById(assignmentId).orElseThrow();
        Course course = assignment.getLesson().getChapter().getCourse();
        submissionRepository.deleteAll(submissionRepository.findByAssignment(assignment));
        assignment.getLesson().getAssignments().remove(assignment);
        lessonRepository.save(assignment.getLesson());
        recalculateCourseProgress(course);
    }

    @Override
    @Transactional
    public Submission gradeAssignment(Long submissionId, GradeAssignmentRequest request) {
        Submission submission = submissionRepository.findById(submissionId).orElseThrow();
        if (submission.getType() != SubmissionType.ASSIGNMENT) throw new RuntimeException("Cannot grade a Quiz manually");

        submission.setScore(request.getScore());
        submission.setTeacherFeedback(request.getFeedback());
        submission.setStatus(SubmissionStatus.GRADED);
        Submission savedSubmission = submissionRepository.save(submission);

        if (request.getScore() >= 5.0) updateProgress(submission.getEnrollment());
        return savedSubmission;
    }

    private void updateProgress(Enrollment enrollment) {
        Course course = enrollment.getClassRoom().getCourse();
        long totalQuizzes = course.getChapters().stream().flatMap(c -> c.getLessons().stream()).mapToLong(l -> l.getQuizzes().size()).sum();
        long totalAssignments = course.getChapters().stream().flatMap(c -> c.getLessons().stream()).mapToLong(l -> l.getAssignments().size()).sum();
        long totalItems = totalQuizzes + totalAssignments;
        if (totalItems == 0) return;

        long passedItems = submissionRepository.countPassedItems(enrollment.getEnrollmentId());
        float progress = (float) passedItems / totalItems * 100;
        enrollment.setProgressPercent(Math.min(progress, 100.0f));
        enrollmentRepository.save(enrollment);
    }

    private void recalculateCourseProgress(Course course) {
        List<Enrollment> enrollments = enrollmentRepository.findByClassRoom_Course(course);
        for (Enrollment enrollment : enrollments) updateProgress(enrollment);
    }

    private void cleanUpLessonData(Lesson lesson) {
        for (Quiz quiz : lesson.getQuizzes()) submissionRepository.deleteAll(submissionRepository.findByQuiz(quiz));
        for (Assignment assignment : lesson.getAssignments()) submissionRepository.deleteAll(submissionRepository.findByAssignment(assignment));
    }

    @Override
    public List<Enrollment> getCourseStudents(Long courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        return enrollmentRepository.findByClassRoom_Course(course);
    }

    @Override
    public List<Submission> getCoursePendingSubmissions(Long courseId) {
        if (!courseRepository.existsById(courseId)) throw new RuntimeException("Course not found");
        return submissionRepository.findPendingSubmissionsByCourse(courseId);
    }

    @Override
    public List<Submission> getGradedSubmissions(String instructorUsername) {
        return submissionRepository.findGradedSubmissionsByInstructor(instructorUsername);
    }

    @Override
    @Transactional
    public void deleteStudentSubmission(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        Enrollment enrollment = submission.getEnrollment();

        submissionRepository.delete(submission);

        // Xóa bài nộp xong phải trừ điểm quá trình của học sinh đi
        updateProgress(enrollment);
    }

    // ================= CLASSROOM (LỚP HỌC) =================
    @Override
    @Transactional
    public ClassRoom createClassRoom(Long courseId, ClassRoomRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Kiểm tra xem mã tham gia này đã có ai xài chưa
        if (classRoomRepository.findByEnrollmentKey(request.getEnrollmentKey()).isPresent()) {
            throw new RuntimeException("Mã tham gia này đã tồn tại, vui lòng chọn mã khác!");
        }

        ClassRoom classRoom = ClassRoom.builder()
                .className(request.getClassName())
                .enrollmentKey(request.getEnrollmentKey())
                .course(course)
                .build();
        return classRoomRepository.save(classRoom);
    }

    @Override
    @Transactional
    public ClassRoom updateClassRoom(Long classId, ClassRoomRequest request) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        // Kiểm tra trùng mã (nếu mã mới khác mã cũ)
        classRoomRepository.findByEnrollmentKey(request.getEnrollmentKey())
                .ifPresent(existing -> {
                    if (!existing.getClassId().equals(classId)) {
                        throw new RuntimeException("Mã tham gia này đã tồn tại, vui lòng chọn mã khác!");
                    }
                });

        classRoom.setClassName(request.getClassName());
        classRoom.setEnrollmentKey(request.getEnrollmentKey());
        return classRoomRepository.save(classRoom);
    }

    @Override
    @Transactional
    public void deleteClassRoom(Long classId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        // Phải xóa sạch bài nộp của học sinh trong lớp này trước khi xóa lớp
        List<Enrollment> enrollments = enrollmentRepository.findByClassRoom(classRoom);
        for (Enrollment enrollment : enrollments) {
            submissionRepository.deleteByEnrollment(enrollment);
            enrollmentRepository.delete(enrollment);
        }
        classRoomRepository.delete(classRoom);
    }
}