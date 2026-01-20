package com.swd.online_learning.service;

import com.swd.online_learning.Enum.Role; // Import đúng package Enum của bạn
import com.swd.online_learning.dto.ApiResponse;
import com.swd.online_learning.dto.request.LoginRequest;
import com.swd.online_learning.dto.request.RegisterRequest;
import com.swd.online_learning.dto.response.AuthResponse;
import com.swd.online_learning.entity.ClassEntity; // Import đúng Entity
import com.swd.online_learning.entity.User;
import com.swd.online_learning.repository.ClassEntityRepository; // Import đúng Repo
import com.swd.online_learning.repository.UserRepository;
import com.swd.online_learning.security.JwtUtils;
import com.swd.online_learning.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final ClassEntityRepository classEntityRepository; // Sửa tên biến cho rõ
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    public ApiResponse<AuthResponse> login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        // Lấy quyền (Role)
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(item -> item.getAuthority())
                .orElse("STUDENT");

        AuthResponse authResponse = AuthResponse.builder()
                .token(jwt)
                .username(userDetails.getUsername())
                .userId(userDetails.getId())
                .role(role)
                .build();

        return ApiResponse.success(authResponse, "Login successful");
    }

    public ApiResponse<String> register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ApiResponse.error("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ApiResponse.error("Error: Email is already in use!");
        }

        // Tạo User mới
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPasswordHash(encoder.encode(request.getPassword()));

        // Xử lý Role (Chuyển từ String sang Enum)
        try {
            // Chuyển string "STUDENT" thành Enum Role.STUDENT
            Role role = Role.valueOf(request.getRole().toUpperCase());
            user.setRole(role);

            // Logic: Nếu là STUDENT thì bắt buộc phải có ClassId hợp lệ
            if (role == Role.STUDENT) {
                if (request.getClassId() == null || request.getClassId().isEmpty()) {
                    return ApiResponse.error("Error: Student must be assigned to a Class!");
                }

                // Tìm ClassEntity trong DB
                ClassEntity classEntity = classEntityRepository.findById(request.getClassId())
                        .orElseThrow(() -> new RuntimeException("Error: Class not found with id: " + request.getClassId()));

                user.setMyClass(classEntity);
            }

        } catch (IllegalArgumentException e) {
            return ApiResponse.error("Error: Invalid Role. Allowed: STUDENT, INSTRUCTOR");
        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        }

        userRepository.save(user);
        return ApiResponse.success("User registered successfully!", "Success");
    }
}