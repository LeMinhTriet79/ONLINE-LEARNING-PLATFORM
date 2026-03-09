package com.swd.online_learning.repository;

import com.swd.online_learning.entity.User;
import com.swd.online_learning.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);

    // Thêm các hàm này để phục vụ Admin
    long countByRole_RoleName(RoleName roleName);
    List<User> findByRole_RoleName(RoleName roleName);
    boolean existsByEmail(String email);
}
