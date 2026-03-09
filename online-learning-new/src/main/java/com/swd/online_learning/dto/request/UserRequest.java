package com.swd.online_learning.dto.request;

import com.swd.online_learning.enums.RoleName;
import lombok.Data;

@Data
public class UserRequest {
    private String username;
    private String password; // Khi tạo mới bắt buộc có, khi update có thể để trống nếu không đổi pass
    private String fullName;
    private String email;
    private RoleName roleName; // ADMIN, TEACHER, STUDENT
}