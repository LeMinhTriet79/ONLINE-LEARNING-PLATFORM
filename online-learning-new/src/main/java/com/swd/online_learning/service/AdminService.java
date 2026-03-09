package com.swd.online_learning.service;

import com.swd.online_learning.dto.request.UserRequest;
import com.swd.online_learning.dto.response.AdminDashboardStatResponse;
import com.swd.online_learning.dto.response.UserResponse;
import com.swd.online_learning.entity.ClassRoom;
import com.swd.online_learning.entity.Course;
import com.swd.online_learning.entity.Enrollment;
import com.swd.online_learning.enums.RoleName;

import java.util.List;

public interface AdminService {
    AdminDashboardStatResponse getDashboardStats();

    List<UserResponse> getUsersByRole(RoleName roleName);

    UserResponse createUser(UserRequest request);

    UserResponse updateUser(Long userId, UserRequest request);

    void deleteUser(Long userId);

    // Quản lý khóa học và lớp học
    List<Course> getAllCourses();

    List<ClassRoom> getAllClasses();

    List<Enrollment> getClassEnrollments(Long classId);
}