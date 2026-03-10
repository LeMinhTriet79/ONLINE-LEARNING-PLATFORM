package com.swd.online_learning.dto.response;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminClassResponse {
    private Long classId;
    private String className;
    private String courseName;
    private String instructorName;
    private String enrollmentKey;
    private int totalStudents; // Sĩ số học sinh của lớp
}