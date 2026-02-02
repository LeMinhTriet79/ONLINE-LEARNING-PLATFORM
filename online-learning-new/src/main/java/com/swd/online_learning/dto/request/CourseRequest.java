package com.swd.online_learning.dto.request;

import lombok.Data;

@Data
public class CourseRequest {
    private String title;
    private String description;
    private String imageUrl;
    private String enrollmentKey;
}