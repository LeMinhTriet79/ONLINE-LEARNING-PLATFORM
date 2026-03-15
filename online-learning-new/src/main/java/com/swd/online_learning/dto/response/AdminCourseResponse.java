package com.swd.online_learning.dto.response;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminCourseResponse {
    private Long courseId;
    private String title;
    private String imageUrl;
    private String instructorName;
    private int totalClasses; // Số lượng lớp học của môn này
}