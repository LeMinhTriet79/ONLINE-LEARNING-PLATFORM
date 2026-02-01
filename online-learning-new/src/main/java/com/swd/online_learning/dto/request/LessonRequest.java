package com.swd.online_learning.dto.request;

import lombok.Data;

@Data
public class LessonRequest {
    private String title;
    private String contentText; // Nội dung lý thuyết hoặc link PDF
    private String videoUrl;
    private Integer orderIndex;
}