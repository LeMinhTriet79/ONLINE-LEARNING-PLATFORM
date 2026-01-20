package com.swd.online_learning.dto.request;

import lombok.Data;

@Data
public class AIRequest {
    private Long lessonId;    // Hỏi trong bài nào
    private String question;  // Nội dung câu hỏi
}