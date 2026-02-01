package com.swd.online_learning.service;

import com.swd.online_learning.dto.request.AssignmentSubmissionRequest;
import com.swd.online_learning.dto.request.QuizSubmissionRequest;
import com.swd.online_learning.dto.response.QuizResultResponse;
import com.swd.online_learning.entity.*;

import java.util.List;

public interface StudentService {
    void enrollCourse(Long courseId, String username);


    // 2. Xem nội dung
    List<Course> getMyEnrolledCourses(String studentUsername);
    Lesson getLessonDetail(Long lessonId, String studentUsername);

    // --- LUỒNG 3 ---
    QuizResultResponse submitQuiz(QuizSubmissionRequest request, String username);
    Submission submitAssignment(AssignmentSubmissionRequest request, String username);
}