package com.swd.online_learning.controller;

import com.swd.online_learning.dto.ApiResponse;
import com.swd.online_learning.dto.request.AssignmentSubmissionRequest;
import com.swd.online_learning.dto.request.QuizSubmissionRequest;
import com.swd.online_learning.dto.response.QuizResultResponse;
import com.swd.online_learning.entity.Course;
import com.swd.online_learning.entity.Lesson;
import com.swd.online_learning.entity.Submission;
import com.swd.online_learning.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')") // Chỉ Student mới được gọi
public class StudentController {

    private final StudentService studentService;

    // 1. Đăng ký học
    @PostMapping("/enroll/{courseId}")
    public ResponseEntity<ApiResponse<String>> enrollCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {
        studentService.enrollCourse(courseId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Enrolled successfully"));
    }

    // 2. Xem danh sách khóa học của mình
    @GetMapping("/my-courses")
    public ResponseEntity<ApiResponse<List<Course>>> getMyCourses(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                studentService.getMyEnrolledCourses(userDetails.getUsername()),
                "Fetched enrolled courses"));
    }

    // 3. Vào học (Lấy chi tiết bài học + Quiz + Assignment)
    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<ApiResponse<Lesson>> getLesson(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                studentService.getLessonDetail(lessonId, userDetails.getUsername()),
                "Fetched lesson details"));
    }

    @PostMapping("/quiz/submit")
    public ResponseEntity<ApiResponse<QuizResultResponse>> submitQuiz(
            @RequestBody QuizSubmissionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                studentService.submitQuiz(request, userDetails.getUsername()),
                "Quiz submitted"));
    }

    // 2. Nộp Assignment
    @PostMapping("/assignment/submit")
    public ResponseEntity<ApiResponse<Submission>> submitAssignment(
            @RequestBody AssignmentSubmissionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                studentService.submitAssignment(request, userDetails.getUsername()),
                "Assignment submitted"));
    }
}