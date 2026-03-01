package com.swd.online_learning.dto.request;

import lombok.Data;

@Data
public class AiHintRequest {
    private String questionContent; // Nội dung câu hỏi + các đáp án
    private String studentQuery;    // Câu hỏi/Thắc mắc của học sinh gửi cho AI
}