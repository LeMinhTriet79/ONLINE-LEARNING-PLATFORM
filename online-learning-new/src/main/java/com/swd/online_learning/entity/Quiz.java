package com.swd.online_learning.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "quizzes")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long quizId;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    private String title;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions;
}