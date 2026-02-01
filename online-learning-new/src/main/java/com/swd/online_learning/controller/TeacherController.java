package com.swd.online_learning.controller;

import com.swd.online_learning.dto.ApiResponse;
import com.swd.online_learning.dto.request.*;
import com.swd.online_learning.entity.*;
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
// Chỉ cho phép TEACHER truy cập toàn bộ Controller này
@PreAuthorize("hasRole('TEACHER')")
public class TeacherController {

    private final TeacherService teacherService;

    // 1. Tạo khóa học mới
    @PostMapping("/courses")
    public ResponseEntity<ApiResponse<Course>> createCourse(
            @RequestBody CourseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) { // Lấy user đang đăng nhập

        Course newCourse = teacherService.createCourse(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(newCourse, "Course created successfully"));
    }

    // 2. Lấy danh sách khóa học của tôi
    @GetMapping("/my-courses")
    public ResponseEntity<ApiResponse<List<Course>>> getMyCourses(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getMyCourses(userDetails.getUsername()), "Fetched courses"));
    }

    // 3. Tạo chương (Chapter) vào khóa học
    @PostMapping("/courses/{courseId}/chapters")
    public ResponseEntity<ApiResponse<Chapter>> createChapter(
            @PathVariable Long courseId,
            @RequestBody ChapterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.createChapter(courseId, request), "Chapter created"));
    }

    // 4. Tạo bài học (Lesson) vào chương
    @PostMapping("/chapters/{chapterId}/lessons")
    public ResponseEntity<ApiResponse<Lesson>> createLesson(
            @PathVariable Long chapterId,
            @RequestBody LessonRequest request) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.createLesson(chapterId, request), "Lesson created"));
    }

    // 5. Tạo Quiz cho bài học
    @PostMapping("/lessons/{lessonId}/quizzes")
    public ResponseEntity<ApiResponse<Quiz>> createQuiz(
            @PathVariable Long lessonId,
            @RequestBody QuizRequest request) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.createQuiz(lessonId, request), "Quiz created"));
    }

    // 6. Tạo Assignment cho bài học
    @PostMapping("/lessons/{lessonId}/assignments")
    public ResponseEntity<ApiResponse<Assignment>> createAssignment(
            @PathVariable Long lessonId,
            @RequestBody AssignmentRequest request) { // Đổi thành Request
        return ResponseEntity.ok(ApiResponse.success(teacherService.createAssignment(lessonId, request), "Assignment created"));
    }
}