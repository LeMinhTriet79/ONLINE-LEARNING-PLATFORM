package com.swd.online_learning.entity;

import com.swd.online_learning.Enum.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users") // "user" thường là từ khóa trong SQL nên đặt là "users"
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "avatar_url")
    private String avatarUrl;

    // Liên kết đến bảng Class (Nhiều User thuộc 1 Class)
    @ManyToOne
    @JoinColumn(name = "class_id") // Khóa ngoại trỏ về bảng Class
    private ClassEntity myClass;
}