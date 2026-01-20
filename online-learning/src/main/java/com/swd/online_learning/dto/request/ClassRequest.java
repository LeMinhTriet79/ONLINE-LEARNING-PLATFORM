package com.swd.online_learning.dto.request;

import lombok.Data;

@Data
public class ClassRequest {
    private String classId;       // VD: "10A1_2026" (Dùng làm ID luôn)
    private String className;     // VD: "Lớp 10A1 (Niên khóa 26-27)"
    private String academicYear;  // VD: "2026-2027"
}