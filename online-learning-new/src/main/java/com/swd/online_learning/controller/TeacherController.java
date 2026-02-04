package com.swd.online_learning.controller;

import com.swd.online_learning.dto.ApiResponse;
import com.swd.online_learning.dto.request.*;
import com.swd.online_learning.entity.*;
import com.swd.online_learning.repository.SubmissionRepository;
import com.swd.online_learning.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class TeacherController {

    private final TeacherService teacherService;

    private final SubmissionRepository submissionRepository;
    // --- COURSE ---
    @PostMapping("/courses")
    public ResponseEntity<ApiResponse<Course>> createCourse(@RequestBody CourseRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.createCourse(request, userDetails.getUsername()), "Created"));
    }
    @GetMapping("/my-courses")
    public ResponseEntity<ApiResponse<List<Course>>> getMyCourses(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getMyCourses(userDetails.getUsername()), "Fetched"));
    }
    @PutMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<Course>> updateCourse(@PathVariable Long courseId, @RequestBody CourseRequest request) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.updateCourse(courseId, request), "Updated"));
    }
    @DeleteMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long courseId) {
        teacherService.deleteCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success(null, "Deleted"));
    }

    // --- CHAPTER ---
    @PostMapping("/courses/{courseId}/chapters")
    public ResponseEntity<ApiResponse<Chapter>> createChapter(@PathVariable Long courseId, @RequestBody ChapterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.createChapter(courseId, request), "Created"));
    }
    @PutMapping("/chapters/{chapterId}")
    public ResponseEntity<ApiResponse<Chapter>> updateChapter(@PathVariable Long chapterId, @RequestBody ChapterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.updateChapter(chapterId, request), "Updated"));
    }
    @DeleteMapping("/chapters/{chapterId}")
    public ResponseEntity<ApiResponse<Void>> deleteChapter(@PathVariable Long chapterId) {
        teacherService.deleteChapter(chapterId);
        return ResponseEntity.ok(ApiResponse.success(null, "Deleted"));
    }

    // --- LESSON ---
    @PostMapping("/chapters/{chapterId}/lessons")
    public ResponseEntity<ApiResponse<Lesson>> createLesson(@PathVariable Long chapterId, @RequestBody LessonRequest request) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.createLesson(chapterId, request), "Created"));
    }
    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<ApiResponse<Lesson>> getLessonDetail(@PathVariable Long lessonId) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getLessonDetail(lessonId), "Fetched"));
    }
    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<ApiResponse<Lesson>> updateLesson(@PathVariable Long lessonId, @RequestBody LessonRequest request) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.updateLesson(lessonId, request), "Updated"));
    }
    @DeleteMapping("/lessons/{lessonId}")
    public ResponseEntity<ApiResponse<Void>> deleteLesson(@PathVariable Long lessonId) {
        teacherService.deleteLesson(lessonId);
        return ResponseEntity.ok(ApiResponse.success(null, "Deleted"));
    }

    // --- QUIZ & ASSIGNMENT (Giữ nguyên các endpoint cũ) ---
    @PostMapping("/lessons/{lessonId}/quizzes")
    public ResponseEntity<ApiResponse<Quiz>> createQuiz(@PathVariable Long lessonId, @RequestBody QuizRequest request) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.createQuiz(lessonId, request), "Created"));
    }
    @PutMapping("/quizzes/{quizId}")
    public ResponseEntity<ApiResponse<Quiz>> updateQuiz(@PathVariable Long quizId, @RequestBody QuizRequest request) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.updateQuiz(quizId, request), "Updated"));
    }
    @DeleteMapping("/quizzes/{quizId}")
    public ResponseEntity<ApiResponse<Void>> deleteQuiz(@PathVariable Long quizId) {
        teacherService.deleteQuiz(quizId);
        return ResponseEntity.ok(ApiResponse.success(null, "Deleted"));
    }

    @PostMapping("/lessons/{lessonId}/assignments")
    public ResponseEntity<ApiResponse<Assignment>> createAssignment(@PathVariable Long lessonId, @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.createAssignment(lessonId, request), "Created"));
    }
    @PutMapping("/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse<Assignment>> updateAssignment(@PathVariable Long assignmentId, @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.updateAssignment(assignmentId, request), "Updated"));
    }
    @DeleteMapping("/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(@PathVariable Long assignmentId) {
        teacherService.deleteAssignment(assignmentId);
        return ResponseEntity.ok(ApiResponse.success(null, "Deleted"));
    }

    // ... code cũ

    // API lấy danh sách bài tập cần chấm điểm
    @GetMapping("/submissions/pending")
    public ResponseEntity<ApiResponse<List<Submission>>> getPendingSubmissions(@AuthenticationPrincipal UserDetails userDetails) {
        // Gọi Repository để tìm các bài status = PENDING của giáo viên này
        List<Submission> list = submissionRepository.findPendingSubmissionsByInstructor(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(list, "Fetched pending submissions"));
    }

    // API Chấm điểm (Submit Grade)
    @PostMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<ApiResponse<Submission>> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestBody GradeAssignmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.gradeAssignment(submissionId, request), "Graded"));
    }

    // 1. Lấy danh sách học viên + tiến độ của khóa học
    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<ApiResponse<List<Enrollment>>> getCourseStudents(@PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getCourseStudents(courseId), "Fetched students"));
    }

    // 2. Lấy danh sách bài cần chấm CỦA KHÓA HỌC NÀY
    @GetMapping("/courses/{courseId}/submissions/pending")
    public ResponseEntity<ApiResponse<List<Submission>>> getCoursePendingSubmissions(@PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getCoursePendingSubmissions(courseId), "Fetched pending submissions"));
    }
}