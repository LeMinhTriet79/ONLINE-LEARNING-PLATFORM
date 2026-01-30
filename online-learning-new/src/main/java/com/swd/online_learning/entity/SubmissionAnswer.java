package com.swd.online_learning.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "submission_answers")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SubmissionAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne
    @JoinColumn(name = "selected_option_id")
    private QuizOption selectedOption;
}