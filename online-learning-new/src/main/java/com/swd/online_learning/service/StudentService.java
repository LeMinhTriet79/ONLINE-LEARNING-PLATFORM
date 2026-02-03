package com.swd.online_learning.service;

import com.swd.online_learning.dto.request.AssignmentSubmissionRequest;
import com.swd.online_learning.dto.request.QuizSubmissionRequest;
import com.swd.online_learning.dto.response.QuizResultResponse;
import com.swd.online_learning.entity.*;

import java.util.List;

public interface StudentService {
    void enrollCourse(Long courseId, String enrollmentKey, String username);

    // 2. Xem nội dung
    List<Enrollment> getMyEnrolledCourses(String studentUsername);
    Lesson getLessonDetail(Long lessonId, String studentUsername);

    // --- LUỒNG 3 ---
    QuizResultResponse submitQuiz(QuizSubmissionRequest request, String username);
    Submission submitAssignment(AssignmentSubmissionRequest request, String username);

    List<Course> getAllCourses();
    Course getFullCourseDetail(Long courseId, String username); // <--- THÊM MỚI

    Submission getLatestQuizSubmission(Long quizId, String username);
    Submission getLatestAssignmentSubmission(Long assignmentId, String username);
    void deleteSubmission(Long submissionId, String username);
}