package com.swd.online_learning.service;

import com.swd.online_learning.dto.ApiResponse;
import com.swd.online_learning.dto.request.ClassRequest;
import com.swd.online_learning.dto.response.ClassResponse;
import com.swd.online_learning.entity.ClassEntity;

import java.util.List;

public interface ClassService {
    // 1. Tạo lớp mới
    ApiResponse<ClassEntity> createClass(ClassRequest request);

    // 2. Cập nhật lớp
    ApiResponse<ClassEntity> updateClass(String classId, ClassRequest request);

    // 3. Xóa lớp
    ApiResponse<String> deleteClass(String classId);

    // 4. Lấy tất cả lớp (Cho Admin)
    ApiResponse<List<ClassEntity>> getAllClasses();

    // 5. Lấy lớp hiện tại (Cho Học sinh đăng ký)
    List<ClassResponse> getCurrentClasses();
}