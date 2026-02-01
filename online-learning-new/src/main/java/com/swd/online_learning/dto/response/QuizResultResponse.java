package com.swd.online_learning.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuizResultResponse {
    private Long submissionId;
    private Float score;
    private int totalCorrect;
    private int totalQuestions;
    private boolean isPassed; // true nếu điểm >= 5.0
}