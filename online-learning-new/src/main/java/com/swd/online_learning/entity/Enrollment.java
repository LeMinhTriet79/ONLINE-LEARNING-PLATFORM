package com.swd.online_learning.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "enrollments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long enrollmentId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User student;

    // TRONG Enrollment.java - Sửa lại như sau:
    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private ClassRoom classRoom; // Sinh viên giờ được ghi danh thẳng vào Lớp (10A1), từ Lớp sẽ suy ra được Môn (Toán 10).

    @Column(nullable = false)
    private Float progressPercent = 0.0f;
}