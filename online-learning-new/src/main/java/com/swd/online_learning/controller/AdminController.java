package com.swd.online_learning.controller;

import com.swd.online_learning.dto.ApiResponse;
import com.swd.online_learning.dto.request.UserRequest;
import com.swd.online_learning.dto.response.AdminDashboardStatResponse;
import com.swd.online_learning.dto.response.UserResponse;
import com.swd.online_learning.enums.RoleName;
import com.swd.online_learning.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // Chặn mọi quyền trừ ADMIN
public class AdminController {

    private final AdminService adminService;

    // 1. Thống kê Dashboard
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminDashboardStatResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats(), "Thống kê tổng quan"));
    }

    // 2. Lấy danh sách User theo Role (VD: ?role=TEACHER hoặc ?role=STUDENT)
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByRole(@RequestParam RoleName role) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUsersByRole(role), "Lấy danh sách người dùng thành công"));
    }

    // 3. Tạo User mới (Cấp tài khoản)
    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@RequestBody UserRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.createUser(request), "Tạo tài khoản thành công"));
    }

    // 4. Sửa thông tin User
    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@PathVariable Long id, @RequestBody UserRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateUser(id, request), "Cập nhật thông tin thành công"));
    }

    // 5. Xóa vĩnh viễn tài khoản
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa tài khoản thành công"));
    }

    // === QUẢN LÝ KHÓA HỌC VÀ LỚP HỌC ===

    // 6. Lấy tất cả khóa học
    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<List<com.swd.online_learning.entity.Course>>> getAllCourses() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllCourses(), "Lấy danh sách khóa học thành công"));
    }

    // 7. Lấy tất cả lớp học
    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<List<com.swd.online_learning.entity.ClassRoom>>> getAllClasses() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllClasses(), "Lấy danh sách lớp học thành công"));
    }

    // 8. Lấy danh sách học sinh trong lớp
    @GetMapping("/classes/{classId}/enrollments")
    public ResponseEntity<ApiResponse<List<com.swd.online_learning.entity.Enrollment>>> getClassEnrollments(@PathVariable Long classId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getClassEnrollments(classId), "Lấy danh sách học sinh thành công"));
    }
}