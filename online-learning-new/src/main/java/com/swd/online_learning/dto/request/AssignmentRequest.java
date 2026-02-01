package com.swd.online_learning.dto.request;

import lombok.Data;

@Data
public class AssignmentRequest {
    private String title;
    private String instructions;
    private String attachmentUrl;
}