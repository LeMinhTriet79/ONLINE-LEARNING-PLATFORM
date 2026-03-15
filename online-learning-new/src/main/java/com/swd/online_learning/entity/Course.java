package com.swd.online_learning.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "courses")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long courseId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String imageUrl;



    @ManyToOne
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;

    // QUAN TRỌNG: cascade = ALL để xóa Course là xóa hết Chapter con
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("course") // Cắt vòng lặp: Lấy Course -> Lấy Chapter -> NGỪNG (Không lấy ngược lại Course nữa)
    private List<Chapter> chapters;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("course")
    private List<ClassRoom> classes;
}