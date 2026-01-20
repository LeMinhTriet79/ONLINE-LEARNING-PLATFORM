package com.swd.online_learning.service.impl;

import com.swd.online_learning.dto.ApiResponse;
import com.swd.online_learning.dto.request.ClassRequest;
import com.swd.online_learning.dto.response.ClassResponse;
import com.swd.online_learning.entity.ClassEntity;
import com.swd.online_learning.repository.ClassEntityRepository;
import com.swd.online_learning.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service // Đánh dấu đây là Bean được Spring quản lý
@RequiredArgsConstructor
public class ClassServiceImpl implements ClassService {

    private final ClassEntityRepository classEntityRepository;

    @Override
    public ApiResponse<ClassEntity> createClass(ClassRequest request) {
        if (classEntityRepository.existsById(request.getClassId())) {
            return ApiResponse.error("Error: Class ID " + request.getClassId() + " already exists!");
        }

        ClassEntity newClass = new ClassEntity();
        newClass.setClassId(request.getClassId());
        newClass.setClassName(request.getClassName());
        newClass.setAcademicYear(request.getAcademicYear());

        classEntityRepository.save(newClass);
        return ApiResponse.success(newClass, "Class created successfully");
    }

    @Override
    public ApiResponse<ClassEntity> updateClass(String classId, ClassRequest request) {
        ClassEntity existingClass = classEntityRepository.findById(classId)
                .orElse(null);

        if (existingClass == null) {
            return ApiResponse.error("Error: Class not found");
        }

        existingClass.setClassName(request.getClassName());
        existingClass.setAcademicYear(request.getAcademicYear());

        classEntityRepository.save(existingClass);
        return ApiResponse.success(existingClass, "Class updated successfully");
    }

    @Override
    public ApiResponse<String> deleteClass(String classId) {
        ClassEntity existingClass = classEntityRepository.findById(classId)
                .orElse(null);

        if (existingClass == null) {
            return ApiResponse.error("Error: Class not found");
        }

        if (existingClass.getStudents() != null && !existingClass.getStudents().isEmpty()) {
            return ApiResponse.error("Cannot delete class because it contains students! Move students first.");
        }

        classEntityRepository.delete(existingClass);
        return ApiResponse.success(null, "Class deleted successfully");
    }

    @Override
    public ApiResponse<List<ClassEntity>> getAllClasses() {
        List<ClassEntity> classes = classEntityRepository.findAll();
        return ApiResponse.success(classes, "Fetch all classes success");
    }

    @Override
    public List<ClassResponse> getCurrentClasses() {
        String currentAcademicYear = calculateCurrentAcademicYear();
        List<ClassEntity> classes = classEntityRepository.findByAcademicYear(currentAcademicYear);
        return classes.stream()
                .map(clazz -> ClassResponse.builder()
                        .classId(clazz.getClassId())
                        .displayName(clazz.getClassName() + " (" + clazz.getAcademicYear() + ")")
                        .build())
                .collect(Collectors.toList());
    }

    // Hàm private hỗ trợ (Helper method) - Không cần đưa vào Interface
    private String calculateCurrentAcademicYear() {
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();
        if (month < 8) return (year - 1) + "-" + year;
        else return year + "-" + (year + 1);
    }
}