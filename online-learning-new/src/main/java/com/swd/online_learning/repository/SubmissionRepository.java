package com.swd.online_learning.repository;

import com.swd.online_learning.entity.Submission;
import com.swd.online_learning.enums.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    // Đếm số lượng bài Quiz/Assignment đã hoàn thành (Điểm >= 5.0) của 1 học sinh trong 1 khóa học
    // Query này hơi phức tạp một chút để loại bỏ các lần làm lại (Retake), chỉ đếm các bài Unique đã qua môn
    @Query("SELECT COUNT(DISTINCT s.quiz) + COUNT(DISTINCT s.assignment) " +
            "FROM Submission s " +
            "WHERE s.enrollment.enrollmentId = :enrollmentId " +
            "AND s.score >= 5.0 " +
            "AND s.status = 'GRADED'")
    Long countPassedItems(@Param("enrollmentId") Long enrollmentId);
}