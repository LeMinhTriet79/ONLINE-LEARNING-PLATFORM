package com.swd.online_learning.dto.response;

import lombok.Data;

@Data
public class CourseResponse {
    private Long courseId;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String instructorName; // Chỉ cần tên, không cần cả object User
    private String status;
}