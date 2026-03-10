package com.swd.online_learning.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardStatResponse {
    private long totalTeachers;
    private long totalStudents;
    private long totalCourses;
    private long totalClasses;
}