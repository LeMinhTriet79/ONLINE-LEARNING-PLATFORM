package com.swd.online_learning.controller;

import com.swd.online_learning.dto.ApiResponse;
import com.swd.online_learning.dto.AuthResponse;

import com.swd.online_learning.dto.request.LoginDto;
import com.swd.online_learning.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginDto loginDto) {
        AuthResponse response = authService.login(loginDto);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        // Với JWT (Stateless), server không lưu session.
        // Client chỉ cần xóa token ở localStorage là xong.
        return ResponseEntity.ok(ApiResponse.success(null, "Logout successful (Please clear token on client)"));
    }
}