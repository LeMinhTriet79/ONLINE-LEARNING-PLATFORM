package com.swd.online_learning.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "class_rooms")
public class ClassRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long classId;

    private String className; // VD: "SE1807"

    @Column(unique = true)
    private String enrollmentKey; // Chuyển từ Course sang đây

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course; // Lớp này thuộc khóa học nào
}
