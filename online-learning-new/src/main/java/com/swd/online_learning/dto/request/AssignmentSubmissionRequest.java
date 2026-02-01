package com.swd.online_learning.dto.request;

import lombok.Data;

@Data
public class AssignmentSubmissionRequest {
    private Long assignmentId;
    private String fileUrl; // Link ảnh/pdf từ Cloudinary
    private String textResponse; // Lời nhắn của học sinh (optional)
}