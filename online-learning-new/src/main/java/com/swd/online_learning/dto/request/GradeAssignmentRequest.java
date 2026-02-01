package com.swd.online_learning.dto.request;

import lombok.Data;

@Data
public class GradeAssignmentRequest {
    private Float score; // Điểm số (0-10)
    private String feedback; // Lời phê
}