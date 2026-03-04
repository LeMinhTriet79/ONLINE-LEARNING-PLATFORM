package com.swd.online_learning.dto.request;

import lombok.Data;

@Data
public class ClassRoomRequest {
    private String className;
    private String enrollmentKey; // Giáo viên tự đặt mã (VD: TOAN10A1)
}