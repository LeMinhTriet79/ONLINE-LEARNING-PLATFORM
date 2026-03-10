package com.swd.online_learning.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String roleName;
   // private boolean isActive; // Trạng thái đang hoạt động hay bị khóa
}