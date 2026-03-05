package com.swd.online_learning.config;

import com.swd.online_learning.entity.*;
import com.swd.online_learning.enums.RoleName;
import com.swd.online_learning.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ClassRoomRepository classRoomRepository;

    // Thêm các Repo để tạo dữ liệu chi tiết
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizOptionRepository quizOptionRepository;
    private final AssignmentRepository assignmentRepository;

    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Tạo Roles
        if (roleRepository.count() == 0) {
            roleRepository.save(Role.builder().roleName(RoleName.ADMIN).build());
            roleRepository.save(Role.builder().roleName(RoleName.TEACHER).build());
            roleRepository.save(Role.builder().roleName(RoleName.STUDENT).build());
        }

        // 2. Tạo Users
        if (userRepository.count() == 0) {
            createUser("admin", "admin@gmail.com", RoleName.ADMIN, "Admin System");
            createUser("teacher", "teacher@gmail.com", RoleName.TEACHER, "Giáo viên Đa khoa");
            createUser("student", "student@gmail.com", RoleName.STUDENT, "Học sinh Giỏi");

            // TẠO THÊM GIÁO VIÊN TIN HỌC MỚI
            createUser("teacher_tin", "tin_teacher@gmail.com", RoleName.TEACHER, "Thầy Tin Học");
        }

        // 3. Tạo Courses và dữ liệu mẫu
        if (courseRepository.count() == 0) {
            User teacher = userRepository.findByUsername("teacher").orElseThrow();
            User teacherTin = userRepository.findByUsername("teacher_tin").orElseThrow();

            // Môn học cơ bản cũ
            createCourseAndClasses("Vật lý 10", "Khóa học Vật lý cơ bản lớp 10...", "https://thuvienvatly.com/home/images/download_thumb/1PAWkMteydy2rR7UEJFmuLL4KXwwj1Wer.jpg", "VATLY10", teacher);
            createCourseAndClasses("Hóa học 10", "Khóa học Hóa học lớp 10...", "https://hieusach24h.com/wp-content/uploads/2021/09/Hoa-hoc-10-1.jpg", "HOA10", teacher);
            createCourseAndClasses("Lịch sử 10", "Khóa học Lịch sử lớp 10...", "https://sachcuatui.net/wp-content/uploads/2019/10/Sach-giao-khoa-lich-su-lop-10.jpg", "SU10", teacher);
            createCourseAndClasses("Sinh học 10", "Khóa học Sinh học lớp 10...", "https://vn-live-01.slatic.net/p/784fee23dd8b3de89994a1288dfeac4f.jpg", "SINH10", teacher);
            createCourseAndClasses("Địa lý 10", "Khóa học Địa lý lớp 10...", "https://hieusach24h.com/wp-content/uploads/2021/09/Dia-li-10-1.jpg", "DIA10", teacher);

            // MÔN HỌC CHI TIẾT: LẬP TRÌNH PASCAL
            createDetailedPascalCourse(teacherTin);
        }
    }

    private void createUser(String username, String email, RoleName roleName, String fullName) {
        Role role = roleRepository.findByRoleName(roleName).orElseThrow();
        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode("123")) // Mật khẩu chung 123
                .fullName(fullName)
                .email(email)
                .role(role)
                .build();
        userRepository.save(user);
    }

    private void createCourseAndClasses(String title, String description, String imageUrl, String baseKey, User instructor) {
        Course course = Course.builder()
                .title(title)
                .description(description)
                .imageUrl(imageUrl)
                .instructor(instructor)
                .build();
        Course savedCourse = courseRepository.save(course);

        // Tạo 2 lớp giả lập cho mỗi môn
        ClassRoom class1 = ClassRoom.builder().className("10A1").enrollmentKey(baseKey + "_A1").course(savedCourse).build();
        ClassRoom class2 = ClassRoom.builder().className("10A2").enrollmentKey(baseKey + "_A2").course(savedCourse).build();

        classRoomRepository.save(class1);
        classRoomRepository.save(class2);
    }

    // --- HÀM TẠO DỮ LIỆU CHI TIẾT MÔN PASCAL ---
    private void createDetailedPascalCourse(User instructor) {
        // 1. Tạo Khóa học
        Course pascalCourse = Course.builder()
                .title("Lập trình Pascal lớp 11")
                .description("Ngôn ngữ lập trình cơ sở giúp học sinh làm quen với tư duy thuật toán và logic máy tính.")
                .imageUrl("https://upload.wikimedia.org/wikipedia/commons/f/f3/Free_Pascal_logo.png")
                .instructor(instructor)
                .build();
        pascalCourse = courseRepository.save(pascalCourse);

        // 2. Tạo 2 lớp 10A1 và 10A2 cho môn Pascal
        classRoomRepository.save(ClassRoom.builder().className("10A1").enrollmentKey("PASCAL_10A1").course(pascalCourse).build());
        classRoomRepository.save(ClassRoom.builder().className("10A2").enrollmentKey("PASCAL_10A2").course(pascalCourse).build());

        // 3. Tạo Chương 1
        Chapter chapter1 = chapterRepository.save(Chapter.builder().title("Chương 1: Làm quen với Pascal").orderIndex(1).course(pascalCourse).build());

        // Bài 1.1
        Lesson lesson1_1 = lessonRepository.save(Lesson.builder()
                .title("Cấu trúc của một chương trình Pascal")
                .contentText("Một chương trình Pascal chuẩn gồm 3 phần chính:\n1. Phần khai báo chương trình (program)\n2. Phần khai báo biến, hằng, thư viện (uses, const, var)\n3. Phần thân chương trình (begin ... end.)")
                .videoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ") // Thay bằng link thật nếu có
                .orderIndex(1)
                .chapter(chapter1)
                .build());

        // Bài 1.2
        Lesson lesson1_2 = lessonRepository.save(Lesson.builder()
                .title("Khai báo Biến và Hằng số")
                .contentText("Biến (Var) là đại lượng có thể thay đổi giá trị trong quá trình thực hiện chương trình.\nHằng (Const) là đại lượng không thay đổi giá trị.")
                .orderIndex(2)
                .chapter(chapter1)
                .build());

        // 4. Thêm Quiz (Trắc nghiệm) vào Bài 1.1
        Quiz quiz1 = quizRepository.save(Quiz.builder().title("Trắc nghiệm: Cấu trúc chương trình").lesson(lesson1_1).build());

        // Câu hỏi 1
        Question q1 = questionRepository.save(Question.builder().content("Phần khai báo thư viện trong Pascal bắt đầu bằng từ khóa nào?").quiz(quiz1).build());
        quizOptionRepository.save(QuizOption.builder().content("program").isCorrect(false).question(q1).build());
        quizOptionRepository.save(QuizOption.builder().content("uses").isCorrect(true).question(q1).build());
        quizOptionRepository.save(QuizOption.builder().content("var").isCorrect(false).question(q1).build());
        quizOptionRepository.save(QuizOption.builder().content("begin").isCorrect(false).question(q1).build());

        // Câu hỏi 2
        Question q2 = questionRepository.save(Question.builder().content("Phần thân chương trình Pascal được giới hạn bởi cặp từ khóa nào?").quiz(quiz1).build());
        quizOptionRepository.save(QuizOption.builder().content("start ... end.").isCorrect(false).question(q2).build());
        quizOptionRepository.save(QuizOption.builder().content("begin ... finish.").isCorrect(false).question(q2).build());
        quizOptionRepository.save(QuizOption.builder().content("begin ... end.").isCorrect(true).question(q2).build());

        // 5. Thêm Assignment (Tự luận) vào Bài 1.2
        assignmentRepository.save(Assignment.builder()
                .title("Viết chương trình đầu tiên")
                .instructions("Yêu cầu: Em hãy viết một chương trình Pascal thực hiện in ra màn hình dòng chữ 'Hello World'. \nLưu file với đuôi .pas hoặc nộp code trực tiếp vào khung text.")
                .lesson(lesson1_2)
                .build());

        // 6. Tạo Chương 2
        Chapter chapter2 = chapterRepository.save(Chapter.builder().title("Chương 2: Cấu trúc điều khiển").orderIndex(2).course(pascalCourse).build());

        // Bài 2.1
        Lesson lesson2_1 = lessonRepository.save(Lesson.builder()
                .title("Câu lệnh rẽ nhánh If-Then")
                .contentText("Cấu trúc If-Then dùng để kiểm tra một điều kiện.\nDạng thiếu: if <điều kiện> then <câu lệnh>;\nDạng đủ: if <điều kiện> then <câu lệnh 1> else <câu lệnh 2>;")
                .orderIndex(1)
                .chapter(chapter2)
                .build());

        // Quiz Bài 2.1
        Quiz quiz2 = quizRepository.save(Quiz.builder().title("Kiểm tra câu lệnh điều kiện").lesson(lesson2_1).build());
        Question q3 = questionRepository.save(Question.builder().content("Đoạn code sau in ra màn hình kết quả gì?\nif (5 > 3) then write('Dung') else write('Sai');").quiz(quiz2).build());
        quizOptionRepository.save(QuizOption.builder().content("Dung").isCorrect(true).question(q3).build());
        quizOptionRepository.save(QuizOption.builder().content("Sai").isCorrect(false).question(q3).build());
        quizOptionRepository.save(QuizOption.builder().content("Lỗi cú pháp").isCorrect(false).question(q3).build());
    }
}