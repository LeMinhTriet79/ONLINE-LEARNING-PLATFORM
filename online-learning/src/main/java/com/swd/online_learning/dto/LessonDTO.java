package com.swd.online_learning.dto;

import lombok.Data;

@Data
public class LessonDTO {
    private Long lessonId;
    private String title;
    private String type; // VIDEO, PDF
    private String contentUrl;
    private Integer durationSeconds;
    private Boolean isCompleted; // Trường này rất quan trọng để FE hiển thị dấu tích xanh
}