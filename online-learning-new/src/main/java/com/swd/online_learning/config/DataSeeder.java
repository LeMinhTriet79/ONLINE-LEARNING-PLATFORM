package com.swd.online_learning.config;

import com.swd.online_learning.entity.User;
import com.swd.online_learning.entity.Role;
import com.swd.online_learning.enums.RoleName;
import com.swd.online_learning.repository.RoleRepository;
import com.swd.online_learning.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Tạo Roles nếu chưa có
        if (roleRepository.count() == 0) {
            Role adminRole = Role.builder().roleName(RoleName.ADMIN).build();
            Role teacherRole = Role.builder().roleName(RoleName.TEACHER).build();
            Role studentRole = Role.builder().roleName(RoleName.STUDENT).build();
            roleRepository.save(adminRole);
            roleRepository.save(teacherRole);
            roleRepository.save(studentRole);
        }

        // 2. Tạo Users nếu chưa có
        if (userRepository.count() == 0) {
            createuser("admin", "admin@gmail.com", RoleName.ADMIN);
            createuser("teacher", "teacher@gmail.com", RoleName.TEACHER);
            createuser("student", "student@gmail.com", RoleName.STUDENT);
        }
    }

    private void createuser(String username, String email, RoleName roleName) {
        Role role = roleRepository.findByRoleName(roleName).orElseThrow();
        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode("123")) // Mật khẩu chung 123
                .fullName(username.toUpperCase() + " User")
                .email(email)
                .role(role)
                .build();
        userRepository.save(user);
    }
}