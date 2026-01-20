package com.swd.online_learning.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    private boolean status;  // true: Thành công, false: Thất bại
    private String message;  // Thông báo (VD: "Đăng nhập thành công", "Lỗi hệ thống")
    private T data;          // Dữ liệu thực tế (User, List<Course>, Token...)

    // Hàm tiện ích để trả về nhanh Success
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data);
    }

    // Hàm tiện ích để trả về nhanh Error
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}