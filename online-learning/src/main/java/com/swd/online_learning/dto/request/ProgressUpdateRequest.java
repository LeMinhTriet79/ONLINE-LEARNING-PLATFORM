package com.swd.online_learning.dto.request;

import lombok.Data;

@Data
public class ProgressUpdateRequest {
    private Long lessonId;
    private Integer secondWatched; // Đã xem đến giây thứ mấy
}