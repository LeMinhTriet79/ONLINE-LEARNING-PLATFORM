package com.swd.online_learning.repository;

import com.swd.online_learning.entity.Role;
import com.swd.online_learning.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
        Optional<Role> findByRoleName(RoleName roleName);
}
