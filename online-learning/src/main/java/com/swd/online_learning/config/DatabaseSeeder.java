package com.swd.online_learning.config;

import com.swd.online_learning.Enum.Role;
import com.swd.online_learning.entity.ClassEntity;
import com.swd.online_learning.entity.User;
import com.swd.online_learning.repository.ClassEntityRepository;
import com.swd.online_learning.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ClassEntityRepository classEntityRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Tạo dữ liệu Lớp học trước (Nếu chưa có)
        if (classEntityRepository.count() == 0) {
            seedClasses();
        }

        // 2. Tạo dữ liệu User (Nếu chưa có)
        if (userRepository.count() == 0) {
            seedUsers();
        }
    }

    private void seedClasses() {
        System.out.println("🌱 Seeding Classes...");
        List<ClassEntity> classes = List.of(
                new ClassEntity("10A1", "Lớp 10A1 - Chất lượng cao", "2024-2025", null),
                new ClassEntity("11B2", "Lớp 11B2 - Tự nhiên", "2024-2025", null),
                new ClassEntity("12C3", "Lớp 12C3 - Xã hội", "2024-2025", null)
        );
        classEntityRepository.saveAll(classes);
    }

    private void seedUsers() {
        System.out.println("🌱 Seeding Users...");

        // --- 1. Tạo Admin ---
        User admin = new User();
        admin.setUsername("admin");
        admin.setPasswordHash(passwordEncoder.encode("123456"));
        admin.setFullName("System Administrator");
        admin.setEmail("admin@school.edu.vn");
        admin.setRole(Role.ADMIN);
        admin.setAvatarUrl("https://ui-avatars.com/api/?name=Admin");
        userRepository.save(admin);

        // --- 2. Tạo Giảng viên (Instructor) ---
        User instructor = new User();
        instructor.setUsername("teacher1");
        instructor.setPasswordHash(passwordEncoder.encode("123456"));
        instructor.setFullName("Thầy Nguyễn Văn A");
        instructor.setEmail("teacher1@school.edu.vn");
        instructor.setRole(Role.INSTRUCTOR);
        instructor.setAvatarUrl("https://ui-avatars.com/api/?name=Teacher+A");
        userRepository.save(instructor);

        // --- 3. Tạo Học sinh (Student) ---
        // Lưu ý: Học sinh phải có lớp
        ClassEntity class10A1 = classEntityRepository.findById("10A1").orElse(null);

        User student = new User();
        student.setUsername("student1");
        student.setPasswordHash(passwordEncoder.encode("123456"));
        student.setFullName("Trần Học Trò");
        student.setEmail("student1@school.edu.vn");
        student.setRole(Role.STUDENT);
        student.setMyClass(class10A1); // Gán vào lớp 10A1
        student.setAvatarUrl("https://ui-avatars.com/api/?name=Student+1");
        userRepository.save(student);

        System.out.println("✅ Database Seeded Successfully!");
        System.out.println("👉 Admin: admin / 123456");
        System.out.println("👉 Teacher: teacher1 / 123456");
        System.out.println("👉 Student: student1 / 123456");
    }
}