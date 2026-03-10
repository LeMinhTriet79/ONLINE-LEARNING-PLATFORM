package com.swd.online_learning.dto.response;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStudentProgressResponse {
    private Long studentId;
    private String fullName;
    private String username;
    private String email;
    private float progressPercent; // Tiến độ học tập
}