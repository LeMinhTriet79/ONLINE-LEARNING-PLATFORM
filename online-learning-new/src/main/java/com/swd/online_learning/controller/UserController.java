package com.swd.online_learning.controller;

import com.swd.online_learning.dto.ApiResponse;
import com.swd.online_learning.entity.User;
import com.swd.online_learning.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 1. Lấy thông tin cá nhân
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(user, "Fetched profile"));
    }

    // 2. Cập nhật thông tin (Tên, Email, Avatar)
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> request) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.containsKey("fullName")) user.setFullName(request.get("fullName"));
        if (request.containsKey("email")) user.setEmail(request.get("email"));
        if (request.containsKey("avatarUrl")) user.setAvatarUrl(request.get("avatarUrl"));

        return ResponseEntity.ok(ApiResponse.success(userRepository.save(user), "Updated profile"));
    }

    // 3. Đổi mật khẩu
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> request) {

        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();

        String oldPass = request.get("oldPassword");
        String newPass = request.get("newPassword");

        if (!passwordEncoder.matches(oldPass, user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không đúng!");
        }

        user.setPassword(passwordEncoder.encode(newPass));
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success(null, "Changed password"));
    }
}