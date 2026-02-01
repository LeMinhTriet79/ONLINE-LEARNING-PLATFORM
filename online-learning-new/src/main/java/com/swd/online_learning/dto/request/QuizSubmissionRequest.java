package com.swd.online_learning.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class QuizSubmissionRequest {
    private Long quizId;
    private List<AnswerRequest> answers;

    @Data
    public static class AnswerRequest {
        private Long questionId;
        private Long selectedOptionId;
    }
}