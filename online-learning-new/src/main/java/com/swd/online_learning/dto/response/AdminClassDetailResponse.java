package com.swd.online_learning.dto.response;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AdminClassDetailResponse {
    private Long classId;
    private String className;
    private String courseName;
    private String instructorName;
    private String enrollmentKey;
    private int totalStudents;
    private List<AdminStudentProgressResponse> students;
}