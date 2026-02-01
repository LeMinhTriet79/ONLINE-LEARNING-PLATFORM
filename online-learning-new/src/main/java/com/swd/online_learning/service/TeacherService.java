package com.swd.online_learning.service;

import com.swd.online_learning.dto.request.*;
import com.swd.online_learning.entity.*;

import java.util.List;

public interface TeacherService {
    // 1. Quản lý khóa học
    Course createCourse(CourseRequest request, String instructorUsername);
    List<Course> getMyCourses(String instructorUsername);

    // 2. Quản lý chương & bài học
    Chapter createChapter(Long courseId, ChapterRequest request);
    Lesson createLesson(Long chapterId, LessonRequest request);

    // 3. Gắn bài tập
    Quiz createQuiz(Long lessonId, QuizRequest request);
    Assignment createAssignment(Long lessonId, AssignmentRequest request);

    Submission gradeAssignment(Long submissionId, GradeAssignmentRequest request);
}

