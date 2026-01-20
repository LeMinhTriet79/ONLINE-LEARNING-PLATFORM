package com.swd.online_learning.dto.request;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String fullName;
    private String email;
    private String role; // "STUDENT" hoặc "INSTRUCTOR"
    private String classId; // Nếu là Student thì bắt buộc
}