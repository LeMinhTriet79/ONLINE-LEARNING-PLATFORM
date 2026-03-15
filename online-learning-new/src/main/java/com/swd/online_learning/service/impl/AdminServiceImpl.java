package com.swd.online_learning.service.impl;

import com.swd.online_learning.dto.request.UserRequest;
import com.swd.online_learning.dto.response.*;
import com.swd.online_learning.entity.ClassRoom;
import com.swd.online_learning.entity.Course;
import com.swd.online_learning.entity.Enrollment;
import com.swd.online_learning.entity.Role;
import com.swd.online_learning.entity.User;
import com.swd.online_learning.enums.RoleName;
import com.swd.online_learning.repository.*;
import com.swd.online_learning.service.AdminService;
import com.swd.online_learning.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CourseRepository courseRepository;
    private final ClassRoomRepository classRoomRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;

    private final TeacherService teacherService;
    private final SubmissionRepository submissionRepository;

    @Override
    public AdminDashboardStatResponse getDashboardStats() {
        return AdminDashboardStatResponse.builder()
                .totalTeachers(userRepository.countByRole_RoleName(RoleName.TEACHER))
                .totalStudents(userRepository.countByRole_RoleName(RoleName.STUDENT))
                .totalCourses(courseRepository.count())
                .totalClasses(classRoomRepository.count())
                .build();
    }

    @Override
    public List<UserResponse> getUsersByRole(RoleName roleName) {
        return userRepository.findByRole_RoleName(roleName).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã tồn tại!");
        }

        // XỬ LÝ EMAIL TÙY CHỌN: Chuyển thành null nếu chuỗi rỗng
        String email = (request.getEmail() != null && !request.getEmail().trim().isEmpty()) ? request.getEmail().trim() : null;

        // Chỉ check trùng lặp nếu Admin có nhập email
        if (email != null && userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        Role role = roleRepository.findByRoleName(request.getRoleName())
                .orElseThrow(() -> new RuntimeException("Role không hợp lệ"));

        User newUser = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword())) // Bắt buộc mã hóa mật khẩu
                .fullName(request.getFullName())
                .email(email) // Lưu null nếu không nhập
                .role(role)

                .build();

        User savedUser = userRepository.save(newUser);
        return mapToResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long userId, UserRequest request) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User!"));

        // Cập nhật thông tin cơ bản
        existingUser.setFullName(request.getFullName());

        // XỬ LÝ EMAIL TÙY CHỌN
        String email = (request.getEmail() != null && !request.getEmail().trim().isEmpty()) ? request.getEmail().trim() : null;

        // Nếu email mới khác email cũ và khác null thì check trùng
        if (email != null && !email.equals(existingUser.getEmail())) {
            if (userRepository.existsByEmail(email)) {
                throw new RuntimeException("Email đã được sử dụng bởi người khác!");
            }
        }
        existingUser.setEmail(email);

        // Cập nhật password nếu Admin có nhập pass mới
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return mapToResponse(userRepository.save(existingUser));
    }



    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User!"));

        if (user.getRole().getRoleName() == RoleName.ADMIN) {
            throw new RuntimeException("Không được phép xóa tài khoản Admin!");
        }

        // ==========================================
        // DỌN DẸP DỮ LIỆU LIÊN QUAN TRƯỚC KHI XÓA
        // ==========================================
        if (user.getRole().getRoleName() == RoleName.TEACHER) {
            // Nếu là Giáo viên: Tìm và xóa sạch tất cả khóa học do GV này tạo
            List<Course> courses = courseRepository.findByInstructor_UserId(userId);
            for (Course course : courses) {
                // Gọi lại hàm xóa khóa học của TeacherService (Hàm này đã có sẵn logic xóa bài học, lớp học...)
                teacherService.deleteCourse(course.getCourseId());
            }
        }
        else if (user.getRole().getRoleName() == RoleName.STUDENT) {
            // Nếu là Học sinh: Tìm và xóa sạch tất cả Bài nộp (Submissions) và Ghi danh (Enrollments)
            List<Enrollment> enrollments = enrollmentRepository.findByStudent_UserId(userId);
            for (Enrollment enrollment : enrollments) {
                submissionRepository.deleteByEnrollment(enrollment); // Xóa bài đã nộp
                enrollmentRepository.delete(enrollment); // Xóa tên khỏi danh sách lớp
            }
        }

        // Sau khi đã dọn sạch sẽ "rác" liên quan, giờ mới tiến hành xóa Tài khoản
        userRepository.delete(user);
    }

    // === QUẢN LÝ KHÓA HỌC VÀ LỚP HỌC ===

    @Override
    public List<AdminCourseResponse> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        return courses.stream().map(course -> AdminCourseResponse.builder()
                .courseId(course.getCourseId())
                .title(course.getTitle())
                .imageUrl(course.getImageUrl())
                .instructorName(course.getInstructor().getFullName())
                .totalClasses(course.getClasses() != null ? course.getClasses().size() : 0)
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    public List<AdminClassResponse> getAllClasses() {
        List<ClassRoom> classes = classRoomRepository.findAll();
        return classes.stream().map(cls -> {
            int studentCount = enrollmentRepository.findByClassRoom_ClassId(cls.getClassId()).size();
            return AdminClassResponse.builder()
                    .classId(cls.getClassId())
                    .className(cls.getClassName())
                    .courseName(cls.getCourse().getTitle())
                    .instructorName(cls.getCourse().getInstructor().getFullName())
                    .enrollmentKey(cls.getEnrollmentKey())
                    .totalStudents(studentCount)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public AdminClassDetailResponse getClassDetail(Long classId) {
        ClassRoom cls = classRoomRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học!"));

        List<Enrollment> enrollments = enrollmentRepository.findByClassRoom_ClassId(classId);

        List<AdminStudentProgressResponse> studentList = enrollments.stream().map(enroll ->
                AdminStudentProgressResponse.builder()
                        .studentId(enroll.getStudent().getUserId())
                        .fullName(enroll.getStudent().getFullName())
                        .username(enroll.getStudent().getUsername())
                        .email(enroll.getStudent().getEmail())
                        .progressPercent(enroll.getProgressPercent())
                        .build()
        ).collect(Collectors.toList());

        return AdminClassDetailResponse.builder()
                .classId(cls.getClassId())
                .className(cls.getClassName())
                .courseName(cls.getCourse().getTitle())
                .instructorName(cls.getCourse().getInstructor().getFullName())
                .enrollmentKey(cls.getEnrollmentKey())
                .totalStudents(studentList.size())
                .students(studentList)
                .build();
    }

    @Override
    public List<Enrollment> getClassEnrollments(Long classId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học!"));
        return enrollmentRepository.findByClassRoom(classRoom);
    }

    // Hàm phụ trợ map Entity sang DTO
    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail()) // Có thể trả về null, Frontend sẽ hiển thị là "Chưa cập nhật"
                .roleName(user.getRole().getRoleName().name())

                .build();
    }
}