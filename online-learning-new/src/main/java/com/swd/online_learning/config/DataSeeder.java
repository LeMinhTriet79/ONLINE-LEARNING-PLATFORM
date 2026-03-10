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
            // ADMIN
            createuser("admin", "admin@gmail.com", RoleName.ADMIN, "Trần Cao Sĩ");

            // GIÁO VIÊN
            createuser("teacher_hai", "hai@gmail.com", RoleName.TEACHER, "Đỗ Hồng Hài");
            createuser("teacher_khoa", "khoa@gmail.com", RoleName.TEACHER, "Trương Thị Kim Khoa");
            createuser("teacher_son", "son@gmail.com", RoleName.TEACHER, "Nguyễn Văn Sơn");

            // HỌC SINH (Học sinh cũ + Danh sách 11 học sinh mới)
            createuser("student", "student@gmail.com", RoleName.STUDENT, "Phạm Võ Khải Anh");
            createuser("student_khai", "khai@gmail.com", RoleName.STUDENT, "Đào Minh Khải");
            createuser("student_tien", "tien@gmail.com", RoleName.STUDENT, "Trần Thị Mỹ Tiên");
            createuser("student_thanh", "thanh@gmail.com", RoleName.STUDENT, "Nguyễn Tuấn Thanh");
            createuser("student_phuc", "phuc@gmail.com", RoleName.STUDENT, "Ngô Tấn Phúc");
            createuser("student_trung", "trung@gmail.com", RoleName.STUDENT, "Nguyễn Minh Trung");
            createuser("student_toi", "toi@gmail.com", RoleName.STUDENT, "Nguyễn Thanh Tới");
            createuser("student_nganem", "nganem@gmail.com", RoleName.STUDENT, "Thái Thị Ngân Em");
            createuser("student_tho", "tho@gmail.com", RoleName.STUDENT, "Võ Quốc Thọ");
            createuser("student_linh", "linh@gmail.com", RoleName.STUDENT, "Quang Văn Hoài Linh");
            createuser("student_mai", "mai@gmail.com", RoleName.STUDENT, "Lương Thị Ngọc Mai");
            createuser("student_hanh", "hanh@gmail.com", RoleName.STUDENT, "Bùi Thị Hạnh");
        }

        if (courseRepository.count() == 0) {
            // Lấy từng giáo viên ra để giao đúng môn
            User teacherHai = userRepository.findByUsername("teacher_hai").orElse(null);
            User teacherKhoa = userRepository.findByUsername("teacher_khoa").orElse(null);
            User teacherSon = userRepository.findByUsername("teacher_son").orElse(null);

            if (teacherHai != null) {
                createCourse("Vật lý 10", "Môn học Vật lý 10", "https://thuvienvatly.com/home/images/download_thumb/1PAWkMteydy2rR7UEJFmuLL4KXwwj1Wer.jpg", "VATLY10", teacherHai);
            }
            if (teacherKhoa != null) {
                createCourse("Hóa học 10", "Môn học Hóa học 10", "https://hieusach24h.com/wp-content/uploads/2021/09/Hoa-hoc-10-1.jpg", "HOA10", teacherKhoa);
            }
            if (teacherSon != null) {
                createCourse("Lịch sử 10", "Môn học Lịch sử 10", "https://sachcuatui.net/wp-content/uploads/2019/10/Sach-giao-khoa-lich-su-lop-10.jpg", "SU10", teacherSon);
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
                .build();
        userRepository.save(user);
    }

    private void createCourse(String title, String description, String imageUrl, String baseKey, User instructor) {
        Course course = Course.builder()
                .title(title)
                .description(description)
                .imageUrl(imageUrl)
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