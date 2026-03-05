package com.swd.online_learning.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "class_rooms")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ClassRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long classId;

    @Column(nullable = false)
    private String className; // VD: "10A1", "10A2"

    @Column(unique = true, nullable = false)
    private String enrollmentKey; // Mã để join lớp (VD: TOAN10A1)

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties("classes")
    private Course course; // Thuộc môn học nào (VD: Toán 10)

    @JsonIgnore
    @OneToMany(mappedBy = "classRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Enrollment> enrollments;
}