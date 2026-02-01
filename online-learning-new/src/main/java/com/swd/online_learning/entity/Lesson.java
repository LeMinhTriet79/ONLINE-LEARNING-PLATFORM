package com.swd.online_learning.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "lessons")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long lessonId;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String contentText; // Ngữ cảnh cho AI

    private String videoUrl;

    private Integer orderIndex;
    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL)
    private List<Quiz> quizzes;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL)
    private List<Assignment> assignments;
}