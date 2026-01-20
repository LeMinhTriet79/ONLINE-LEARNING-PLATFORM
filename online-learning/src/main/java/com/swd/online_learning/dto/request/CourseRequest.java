package com.swd.online_learning.dto.request;

import lombok.Data;

@Data
public class CourseRequest {
    private String title;
    private String description;
    private String thumbnailUrl;
    private String status; // "DRAFT" hoặc "PUBLISHED"
}