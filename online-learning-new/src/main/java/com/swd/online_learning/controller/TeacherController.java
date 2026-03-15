package com.swd.online_learning.controller;

import com.swd.online_learning.dto.ApiResponse;
import com.swd.online_learning.dto.request.*;
import com.swd.online_learning.entity.*;
import com.swd.online_learning.repository.CourseRepository;
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
    private final CourseRepository courseRepository;

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

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<Course>> getCourseDetail(@PathVariable Long courseId) {
        Course course = teacherService.getMyCourses("").stream().filter(c -> c.getCourseId().equals(courseId)).findFirst().orElse(null); // Bypass for simple fetch
        if(course == null) course = courseRepository.findById(courseId).orElse(null);
        return ResponseEntity.ok(ApiResponse.success(course, "Fetched detail"));
    }


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

    @GetMapping("/submissions/pending")
    public ResponseEntity<ApiResponse<List<Submission>>> getPendingSubmissions(@AuthenticationPrincipal UserDetails userDetails) {
        List<Submission> pending = submissionRepository.findPendingSubmissionsByInstructor(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(pending, "Fetched"));
    }

    // API MỚI: LẤY DANH SÁCH BÀI ĐÃ CHẤM
    @GetMapping("/submissions/graded")
    public ResponseEntity<ApiResponse<List<Submission>>> getGradedSubmissions(@AuthenticationPrincipal UserDetails userDetails) {
        List<Submission> graded = teacherService.getGradedSubmissions(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(graded, "Fetched Graded"));
    }

    @PostMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<ApiResponse<Submission>> gradeAssignment(@PathVariable Long submissionId, @RequestBody GradeAssignmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.gradeAssignment(submissionId, request), "Graded"));
    }

    // API MỚI: GIÁO VIÊN XÓA BÀI NỘP CỦA HỌC SINH
    @DeleteMapping("/submissions/{submissionId}")
    public ResponseEntity<ApiResponse<Void>> deleteStudentSubmission(@PathVariable Long submissionId) {
        teacherService.deleteStudentSubmission(submissionId);
        return ResponseEntity.ok(ApiResponse.success(null, "Deleted submission successfully"));
    }

    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<ApiResponse<List<Enrollment>>> getCourseStudents(@PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getCourseStudents(courseId), "Fetched students"));
    }

    @GetMapping("/courses/{courseId}/submissions/pending")
    public ResponseEntity<ApiResponse<List<Submission>>> getCoursePendingSubmissions(@PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getCoursePendingSubmissions(courseId), "Fetched pending submissions"));
    }

    @PostMapping("/courses/{courseId}/classes")
    public ResponseEntity<ApiResponse<ClassRoom>> createClassRoom(@PathVariable Long courseId, @RequestBody ClassRoomRequest request) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.createClassRoom(courseId, request), "Created Class"));
    }

    @PutMapping("/classes/{classId}")
    public ResponseEntity<ApiResponse<ClassRoom>> updateClassRoom(@PathVariable Long classId, @RequestBody ClassRoomRequest request) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.updateClassRoom(classId, request), "Updated Class"));
    }

    @DeleteMapping("/classes/{classId}")
    public ResponseEntity<ApiResponse<Void>> deleteClassRoom(@PathVariable Long classId) {
        teacherService.deleteClassRoom(classId);
        return ResponseEntity.ok(ApiResponse.success(null, "Deleted Class"));
    }
}