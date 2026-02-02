package com.swd.online_learning.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class QuizRequest {
    private String title;
    private List<QuestionRequest> questions;

    @Data
    public static class QuestionRequest {
        private String content;
        private List<OptionRequest> options;
    }

    @Data
    public static class OptionRequest {
        private String content;
        @JsonProperty("isCorrect")
        private boolean isCorrect;
    }
}