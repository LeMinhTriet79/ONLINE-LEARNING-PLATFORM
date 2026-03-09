package com.swd.online_learning.config;

import com.swd.online_learning.entity.*;
import com.swd.online_learning.enums.RoleName;
import com.swd.online_learning.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ClassRoomRepository classRoomRepository; // Cần thiết để tạo lớp
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            roleRepository.save(Role.builder().roleName(RoleName.ADMIN).build());
            roleRepository.save(Role.builder().roleName(RoleName.TEACHER).build());
            roleRepository.save(Role.builder().roleName(RoleName.STUDENT).build());
        }

        if (userRepository.count() == 0) {
            createuser("admin", "admin@gmail.com", RoleName.ADMIN, "Admin System");
            createuser("teacher", "teacher@gmail.com", RoleName.TEACHER, "Giáo viên Demo");
            createuser("student", "student@gmail.com", RoleName.STUDENT, "Học sinh Demo");
        }

        if (courseRepository.count() == 0) {
            User teacher = userRepository.findByUsername("teacher").orElse(null);
            if (teacher != null) {
                createCourse("Vật lý 10", "Khóa học Vật lý 10", "https://thuvienvatly.com/home/images/download_thumb/1PAWkMteydy2rR7UEJFmuLL4KXwwj1Wer.jpg", "VATLY10", teacher);
                createCourse("Hóa học 10", "Khóa học Hóa học 10", "https://hieusach24h.com/wp-content/uploads/2021/09/Hoa-hoc-10-1.jpg", "HOA10", teacher);
                createCourse("Lịch sử 10", "Khóa học Lịch sử 10", "https://sachcuatui.net/wp-content/uploads/2019/10/Sach-giao-khoa-lich-su-lop-10.jpg", "SU10", teacher);
            }
        }
    }

    private void createuser(String username, String email, RoleName roleName, String fullName) {
        Role role = roleRepository.findByRoleName(roleName).orElseThrow();
        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode("123")) // Mật khẩu mã hóa BCrypt
                .fullName(fullName)
                .email(email)
                .role(role)
                // ĐÃ XÓA .isActive() THEO Ý BẠN
                .build();
        userRepository.save(user);
    }

    private void createCourse(String title, String description, String imageUrl, String baseKey, User instructor) {
        Course course = Course.builder()
                .title(title)
                .description(description)
                .imageUrl(imageUrl)
                // ĐÃ XÓA .enrollmentKey(baseKey)
                .instructor(instructor)
                .build();
        Course savedCourse = courseRepository.save(course);

        // Tự động chia 2 lớp cho môn học này
        ClassRoom class1 = ClassRoom.builder().className("10A1").enrollmentKey(baseKey + "_A1").course(savedCourse).build();
        ClassRoom class2 = ClassRoom.builder().className("10A2").enrollmentKey(baseKey + "_A2").course(savedCourse).build();

        classRoomRepository.save(class1);
        classRoomRepository.save(class2);
    }
}