package com.swd.online_learning.service;

import com.swd.online_learning.dto.request.*;
import com.swd.online_learning.entity.*;
import java.util.List;

public interface TeacherService {
    // --- 1. QUẢN LÝ KHÓA HỌC (COURSE) ---
    Course createCourse(CourseRequest request, String instructorUsername);
    List<Course> getMyCourses(String instructorUsername);
    Course updateCourse(Long courseId, CourseRequest request);
    void deleteCourse(Long courseId);

    // --- 2. QUẢN LÝ CHƯƠNG (CHAPTER) ---
    Chapter createChapter(Long courseId, ChapterRequest request);
    Chapter updateChapter(Long chapterId, ChapterRequest request);
    void deleteChapter(Long chapterId);

    // --- 3. QUẢN LÝ BÀI HỌC (LESSON) ---
    Lesson createLesson(Long chapterId, LessonRequest request);
    Lesson getLessonDetail(Long lessonId);
    Lesson updateLesson(Long lessonId, LessonRequest request);
    void deleteLesson(Long lessonId);

    // --- 4. QUẢN LÝ BÀI TẬP (QUIZ & ASSIGNMENT) ---
    Quiz createQuiz(Long lessonId, QuizRequest request);
    Quiz updateQuiz(Long quizId, QuizRequest request);
    void deleteQuiz(Long quizId);

    Assignment createAssignment(Long lessonId, AssignmentRequest request);
    Assignment updateAssignment(Long assignmentId, AssignmentRequest request);
    void deleteAssignment(Long assignmentId);

    // --- 5. CHẤM ĐIỂM ---
    Submission gradeAssignment(Long submissionId, GradeAssignmentRequest request);
}