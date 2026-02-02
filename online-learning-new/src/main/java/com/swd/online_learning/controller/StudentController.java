package com.swd.online_learning.controller;

import com.swd.online_learning.dto.ApiResponse;
import com.swd.online_learning.dto.request.AssignmentSubmissionRequest;
import com.swd.online_learning.dto.request.QuizSubmissionRequest;
import com.swd.online_learning.dto.response.QuizResultResponse;
import com.swd.online_learning.entity.Course;
import com.swd.online_learning.entity.Enrollment;
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

    // API MỚI: Lấy danh sách tất cả khóa học (Catalog)
    @GetMapping("/all-courses")
    public ResponseEntity<ApiResponse<List<Course>>> getAllCourses() {
        return ResponseEntity.ok(ApiResponse.success(studentService.getAllCourses(), "Fetched all courses"));
    }

    // SỬA API ENROLL: Nhận courseId trên URL và key qua param
    @PostMapping("/courses/{courseId}/enroll")
    public ResponseEntity<ApiResponse<Void>> enrollCourse(
            @PathVariable Long courseId,
            @RequestParam String key,
            @AuthenticationPrincipal UserDetails userDetails) {

        studentService.enrollCourse(courseId, key, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Tham gia khóa học thành công!"));
    }

     @GetMapping("/my-courses")
    public ResponseEntity<ApiResponse<List<Enrollment>>> getMyCourses(
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

    @GetMapping("/courses/{courseId}/full")
    public ResponseEntity<ApiResponse<Course>> getFullCourseDetail(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(ApiResponse.success(
                studentService.getFullCourseDetail(courseId, userDetails.getUsername()),
                "Fetched full course detail"));
    }

    // Lấy lịch sử làm bài Quiz
    @GetMapping("/quiz/{quizId}/latest")
    public ResponseEntity<ApiResponse<Submission>> getLatestQuizSubmission(@PathVariable Long quizId, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getLatestQuizSubmission(quizId, userDetails.getUsername()), "Fetched"));
    }

    // Lấy bài Assignment đã nộp
    @GetMapping("/assignment/{assignmentId}/latest")
    public ResponseEntity<ApiResponse<Submission>> getLatestAssignmentSubmission(@PathVariable Long assignmentId, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getLatestAssignmentSubmission(assignmentId, userDetails.getUsername()), "Fetched"));
    }

    // Thu hồi bài nộp (Xóa)
    @DeleteMapping("/submissions/{submissionId}")
    public ResponseEntity<ApiResponse<Void>> deleteSubmission(@PathVariable Long submissionId, @AuthenticationPrincipal UserDetails userDetails) {
        studentService.deleteSubmission(submissionId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Deleted"));
    }
}