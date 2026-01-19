package com.swd.online_learning.entity;

import com.swd.online_learning.Enum.EnrollmentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "enrollment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "enrollment_id")
    private Long enrollmentId;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(name = "enrolled_date")
    private LocalDateTime enrolledDate; // Tự động lấy ngày giờ hiện tại

    @Column(name = "total_progress_percent")
    private Float totalProgressPercent = 0.0f;

    @Enumerated(EnumType.STRING)
    private EnrollmentStatus status;

    // Quan hệ để truy xuất tiến độ chi tiết
    @OneToMany(mappedBy = "enrollment", cascade = CascadeType.ALL)
    private List<LearningProgress> progressList;

    @OneToMany(mappedBy = "enrollment", cascade = CascadeType.ALL)
    private List<QuizSubmission> quizSubmissions;

    @PrePersist
    protected void onCreate() {
        enrolledDate = LocalDateTime.now();
    }
}