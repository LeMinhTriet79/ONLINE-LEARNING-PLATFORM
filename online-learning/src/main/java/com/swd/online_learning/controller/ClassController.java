package com.swd.online_learning.controller;

import com.swd.online_learning.dto.ApiResponse;
import com.swd.online_learning.dto.request.ClassRequest;
import com.swd.online_learning.dto.response.ClassResponse;
import com.swd.online_learning.entity.ClassEntity;
import com.swd.online_learning.service.ClassService; // Import Interface
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassController {

    // Ở đây khai báo Interface, code nhìn sẽ sạch và tính trừu tượng cao hơn
    private final ClassService classService;

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<List<ClassResponse>>> getClassesForRegistration() {
        List<ClassResponse> classes = classService.getCurrentClasses();
        return ResponseEntity.ok(ApiResponse.success(classes, "Fetched current classes successfully"));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ClassEntity>>> getAllClasses() {
        return ResponseEntity.ok(classService.getAllClasses());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ClassEntity>> createClass(@RequestBody ClassRequest request) {
        return ResponseEntity.ok(classService.createClass(request));
    }

    @PutMapping("/{classId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ClassEntity>> updateClass(@PathVariable String classId, @RequestBody ClassRequest request) {
        return ResponseEntity.ok(classService.updateClass(classId, request));
    }

    @DeleteMapping("/{classId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteClass(@PathVariable String classId) {
        return ResponseEntity.ok(classService.deleteClass(classId));
    }
}