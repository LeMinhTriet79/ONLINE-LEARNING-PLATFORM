package com.swd.online_learning.repository;

import com.swd.online_learning.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
}
