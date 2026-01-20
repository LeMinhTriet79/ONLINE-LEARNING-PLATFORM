package com.swd.online_learning.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClassResponse {
    private String classId;       // Giá trị để gửi lên khi đăng ký (VD: 10A1)
    private String displayName;   // Giá trị để hiện lên màn hình (VD: 10A1 (2026-2027))
}