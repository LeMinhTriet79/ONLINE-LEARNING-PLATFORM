package com.swd.online_learning.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quiz")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quiz_id")
    private Long quizId;

    private String title;

    @Column(name = "passing_score")
    private Double passingScore;

    @ManyToOne
    @JoinColumn(name = "chapter_id")
    private Chapter chapter;
}