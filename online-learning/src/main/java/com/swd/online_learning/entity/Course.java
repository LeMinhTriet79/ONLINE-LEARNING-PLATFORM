package com.swd.online_learning.entity;

import com.swd.online_learning.Enum.CourseStatus;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "course")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Long courseId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Enumerated(EnumType.STRING)
    private CourseStatus status; // DRAFT, PUBLISHED, CLOSED

    // Giảng viên phụ trách
    @ManyToOne
    @JoinColumn(name = "instructor_id")
    private User instructor;

    // 1 Khóa học có nhiều Chương
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Chapter> chapters;
}