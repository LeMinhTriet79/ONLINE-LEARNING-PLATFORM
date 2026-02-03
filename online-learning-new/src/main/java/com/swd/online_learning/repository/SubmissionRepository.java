package com.swd.online_learning.repository;

import com.swd.online_learning.entity.Quiz;
import com.swd.online_learning.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    // Tìm bài nộp mới nhất của quiz (để Student xem lại)
    @Query("SELECT s FROM Submission s WHERE s.enrollment.enrollmentId = :enrollmentId AND s.quiz.quizId = :quizId ORDER BY s.submissionId DESC LIMIT 1")
    Optional<Submission> findLatestQuizSubmission(Long enrollmentId, Long quizId);

    // Tìm bài nộp assignment
    @Query("SELECT s FROM Submission s WHERE s.enrollment.enrollmentId = :enrollmentId AND s.assignment.assignmentId = :assignmentId ORDER BY s.submissionId DESC LIMIT 1")
    Optional<Submission> findLatestAssignmentSubmission(Long enrollmentId, Long assignmentId);

    // QUAN TRỌNG: Câu lệnh tìm bài cần chấm cho Giáo Viên
    @Query("SELECT s FROM Submission s WHERE s.status = 'PENDING' AND s.enrollment.course.instructor.username = :username")
    List<Submission> findPendingSubmissionsByInstructor(String username);

    // QUAN TRỌNG: Câu lệnh tính tiến độ (Đếm số bài có điểm >= 5.0)
    @Query("SELECT COUNT(DISTINCT q.quizId) + COUNT(DISTINCT a.assignmentId) " +
            "FROM Submission s " +
            "LEFT JOIN s.quiz q " +
            "LEFT JOIN s.assignment a " +
            "WHERE s.enrollment.enrollmentId = :enrollmentId " +
            "AND s.score >= 5.0")
    long countPassedItems(Long enrollmentId);

    boolean existsByQuiz(Quiz quiz);

    // (Tùy chọn) Hàm xóa hết bài làm của Quiz này (Nếu bạn muốn Reset)
    void deleteByQuiz(Quiz quiz);
}