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

        // Kiểm tra trùng Key (nếu cần kỹ)
        if (request.getEnrollmentKey() != null && courseRepository.findByEnrollmentKey(request.getEnrollmentKey()).isPresent()) {
            throw new RuntimeException("Mã tham gia này đã tồn tại, vui lòng chọn mã khác!");
        }

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .enrollmentKey(request.getEnrollmentKey()) // <--- LƯU KEY
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
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setImageUrl(request.getImageUrl());

        // Cập nhật key nếu có thay đổi
        if (request.getEnrollmentKey() != null && !request.getEnrollmentKey().equals(course.getEnrollmentKey())) {
            if (courseRepository.findByEnrollmentKey(request.getEnrollmentKey()).isPresent()) {
                throw new RuntimeException("Mã tham gia đã tồn tại!");
            }
            course.setEnrollmentKey(request.getEnrollmentKey());
        }

        return courseRepository.save(course);
    }

    @Override
    @Transactional
    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // 1. Xóa tất cả Enrollments (và Submissions đi kèm)
        List<Enrollment> enrollments = enrollmentRepository.findByCourse(course);
        for (Enrollment enrollment : enrollments) {
            // Xóa hết bài nộp của học sinh này trước
            submissionRepository.deleteByEnrollment(enrollment);
            // Xóa ghi danh
            enrollmentRepository.delete(enrollment);
        }

        // 2. Xóa Khóa học (Cascade sẽ tự xóa Chapter -> Lesson -> Quiz/Assignment)
        courseRepository.delete(course);
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
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter not found"));
        Course course = chapter.getCourse();

        // 1. Duyệt qua tất cả bài học để xóa sạch Submissions con
        for (Lesson lesson : chapter.getLessons()) {
            cleanUpLessonData(lesson); // Hàm dọn dẹp (xem bên dưới)
        }

        // 2. Xóa Chương
        chapterRepository.delete(chapter);

        // 3. Tính lại tiến độ (Vì mất đi một lượng bài tập lớn)
        recalculateCourseProgress(course);
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
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Chapter chapter = lesson.getChapter();
        Course course = chapter.getCourse();

        // 1. Xóa dữ liệu bài làm của học sinh trước
        cleanUpLessonData(lesson);

        // 2. QUAN TRỌNG: Xóa khỏi danh sách của Cha (Chapter)
        // Khi orphanRemoval = true ở Chapter, hành động này sẽ xóa Lesson khỏi DB
        chapter.getLessons().remove(lesson);
        chapterRepository.save(chapter); // Lưu cha để kích hoạt xóa con

        // 3. Tính lại tiến độ
        recalculateCourseProgress(course);
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
        Quiz savedQuiz = quizRepository.save(quiz);

        // --- QUAN TRỌNG: TÍNH LẠI TIẾN ĐỘ VÌ TỔNG SỐ BÀI ĐÃ TĂNG ---
        recalculateCourseProgress(lesson.getChapter().getCourse());

        return savedQuiz;
    }

    @Override
    @Transactional
    public Quiz updateQuiz(Long quizId, QuizRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        quiz.setTitle(request.getTitle());

        // --- LOGIC SMART UPDATE (Thay vì clear() toàn bộ) ---
        // 1. Duyệt qua danh sách câu hỏi từ Request gửi lên
        List<Question> updatedQuestions = request.getQuestions().stream().map(qReq -> {
            // Nếu Frontend gửi ID -> Tìm câu hỏi cũ để cập nhật
            // Nếu không có ID -> Tạo câu hỏi mới
            // (Lưu ý: Bạn cần đảm bảo QuizRequest.QuestionRequest có trường id, hoặc logic tìm kiếm tương đương)
            // Tuy nhiên, với cấu trúc hiện tại, cách đơn giản nhất để tránh lỗi FK là:
            // "Nếu Quiz đã có người làm, CHẶN không cho sửa cấu trúc, chỉ cho sửa text".

            // Nhưng để hỗ trợ "Thêm câu hỏi", ta làm như sau:
            Question question = Question.builder()
                    .content(qReq.getContent())
                    .quiz(quiz)
                    .build();

            // Tạm thời tạo mới options cho câu hỏi này
            List<QuizOption> options = qReq.getOptions().stream().map(oReq ->
                    QuizOption.builder().content(oReq.getContent()).isCorrect(oReq.isCorrect()).question(question).build()
            ).collect(Collectors.toList());
            question.setOptions(options);
            return question;
        }).collect(Collectors.toList());

        // 2. Xử lý xóa cũ thay mới
        // NẾU QUIZ CHƯA CÓ AI LÀM -> Xóa thoải mái
        if (!submissionRepository.existsByQuiz(quiz)) {
            quiz.getQuestions().clear();
            quiz.getQuestions().addAll(updatedQuestions);
        } else {
            // NẾU ĐÃ CÓ NGƯỜI LÀM -> Không được xóa câu hỏi cũ, chỉ được THÊM câu hỏi mới
            // Đây là giải pháp an toàn nhất. Nếu muốn xóa câu cũ, phải xóa Submission trước.
            // Đoạn code dưới đây sẽ nối thêm câu hỏi mới vào danh sách cũ
            // (Lưu ý: Cách này sẽ duplicate câu hỏi nếu bạn bấm lưu nhiều lần mà Frontend gửi cả câu cũ lên)

            // GIẢI PHÁP TỐI ƯU NHẤT CHO DỰ ÁN NÀY:
            // Xóa sạch Submission cũ trước khi Update (Reset kết quả thi của học sinh)
            submissionRepository.deleteAll(submissionRepository.findByQuiz(quiz));
            // Sau đó mới xóa câu hỏi
            quiz.getQuestions().clear();
            quiz.getQuestions().addAll(updatedQuestions);

            // Tính lại tiến độ (vì bài làm bị xóa, % sẽ giảm)
            recalculateCourseProgress(quiz.getLesson().getChapter().getCourse());
        }

        return quizRepository.save(quiz);
    }

    @Override
    @Transactional
    public void deleteQuiz(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        Lesson lesson = quiz.getLesson();
        Course course = lesson.getChapter().getCourse();

        // 1. Xóa bài làm
        List<Submission> submissions = submissionRepository.findByQuiz(quiz);
        submissionRepository.deleteAll(submissions);

        // 2. QUAN TRỌNG: Xóa khỏi danh sách của Cha (Lesson)
        // Khi orphanRemoval = true ở Lesson (vừa thêm ở bước 1), Quiz sẽ bị xóa vĩnh viễn
        lesson.getQuizzes().remove(quiz);
        lessonRepository.save(lesson);

        // 3. Tính lại tiến độ
        recalculateCourseProgress(course);
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

        Assignment savedAssign = assignmentRepository.save(assignment);

        // --- QUAN TRỌNG: TÍNH LẠI TIẾN ĐỘ ---
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
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        Lesson lesson = assignment.getLesson();
        Course course = lesson.getChapter().getCourse();

        // 1. Xóa bài làm
        List<Submission> submissions = submissionRepository.findByAssignment(assignment);
        submissionRepository.deleteAll(submissions);

        // 2. QUAN TRỌNG: Xóa khỏi danh sách của Cha (Lesson)
        lesson.getAssignments().remove(assignment);
        lessonRepository.save(lesson);

        // 3. Tính lại tiến độ
        recalculateCourseProgress(course);
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

    private void recalculateCourseProgress(Course course) {
        List<Enrollment> enrollments = enrollmentRepository.findByCourse(course);
        for (Enrollment enrollment : enrollments) {
            updateProgress(enrollment); // Hàm updateProgress bạn đã có ở code trước
        }
    }

    private void cleanUpLessonData(Lesson lesson) {
        // Xóa sạch bài nộp của các Quiz trong bài học này
        for (Quiz quiz : lesson.getQuizzes()) {
            List<Submission> submissions = submissionRepository.findByQuiz(quiz);
            submissionRepository.deleteAll(submissions);
        }
        // Xóa sạch bài nộp của các Assignment trong bài học này
        for (Assignment assignment : lesson.getAssignments()) {
            List<Submission> submissions = submissionRepository.findByAssignment(assignment);
            submissionRepository.deleteAll(submissions);
        }
    }

    @Override
    public List<Enrollment> getCourseStudents(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return enrollmentRepository.findByCourse(course);
    }

    @Override
    public List<Submission> getCoursePendingSubmissions(Long courseId) {
        // Chỉ cần check course tồn tại là được
        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found");
        }
        return submissionRepository.findPendingSubmissionsByCourse(courseId);
    }

}