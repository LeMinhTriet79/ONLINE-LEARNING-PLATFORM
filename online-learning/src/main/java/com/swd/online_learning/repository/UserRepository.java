package com.swd.online_learning.repository;

import com.swd.online_learning.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Tìm user bằng username (để dùng lúc đăng nhập)
    Optional<User> findByUsername(String username);

    // Tìm user bằng email (để check trùng)
    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}

