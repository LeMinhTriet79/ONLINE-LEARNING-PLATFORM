package com.swd.online_learning.config;

import com.swd.online_learning.entity.Course;
import com.swd.online_learning.entity.Role;
import com.swd.online_learning.entity.User;
import com.swd.online_learning.enums.RoleName;
import com.swd.online_learning.repository.CourseRepository;
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
    private final CourseRepository courseRepository; // Thêm Repository này
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

        // 3. Tạo Courses (Các môn học lớp 10) nếu chưa có
        if (courseRepository.count() == 0) {
            // Lấy user teacher để làm giảng viên cho các khóa này
            User teacher = userRepository.findByUsername("teacher").orElse(null);

            if (teacher != null) {
                createCourse(
                        "Vật lý 10",
                        "Khóa học Vật lý cơ bản lớp 10, cung cấp kiến thức nền tảng về cơ học, nhiệt học...",
                        "https://thuvienvatly.com/home/images/download_thumb/1PAWkMteydy2rR7UEJFmuLL4KXwwj1Wer.jpg",
                        "VATLY10",
                        teacher
                );

                createCourse(
                        "Hóa học 10",
                        "Khóa học Hóa học lớp 10, tìm hiểu về cấu tạo nguyên tử, bảng tuần hoàn và liên kết hóa học.",
                        "https://hieusach24h.com/wp-content/uploads/2021/09/Hoa-hoc-10-1.jpg",
                        "HOA10",
                        teacher
                );

                createCourse(
                        "Lịch sử 10",
                        "Khóa học Lịch sử lớp 10, bao quát lịch sử thế giới cổ trung đại và lịch sử Việt Nam.",
                        "https://sachcuatui.net/wp-content/uploads/2019/10/Sach-giao-khoa-lich-su-lop-10.jpg",
                        "SU10",
                        teacher
                );

                createCourse(
                        "Sinh học 10",
                        "Khóa học Sinh học lớp 10, giới thiệu về sinh học tế bào và thế giới vi sinh vật.",
                        "https://vn-live-01.slatic.net/p/784fee23dd8b3de89994a1288dfeac4f.jpg",
                        "SINH10",
                        teacher
                );

                createCourse(
                        "Địa lý 10",
                        "Khóa học Địa lý lớp 10, nghiên cứu về địa lý tự nhiên đại cương và kinh tế - xã hội.",
                        "https://hieusach24h.com/wp-content/uploads/2021/09/Dia-li-10-1.jpg",
                        "DIA10",
                        teacher
                );
            }
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

    // Hàm phụ trợ để tạo khóa học gọn gàng hơn
    private void createCourse(String title, String description, String imageUrl, String enrollmentKey, User instructor) {
        Course course = Course.builder()
                .title(title)
                .description(description)
                .imageUrl(imageUrl)
                .enrollmentKey(enrollmentKey)
                .instructor(instructor)
                .build();
        courseRepository.save(course);
    }
}