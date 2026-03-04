package com.swd.online_learning.repository;

import com.swd.online_learning.entity.ClassRoom;
import com.swd.online_learning.entity.Course;
import com.swd.online_learning.entity.Enrollment;
import com.swd.online_learning.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    // Tìm các hàm có chữ Course sửa thành ClassRoom
    List<Enrollment> findByStudent(User student);
    List<Enrollment> findByClassRoom(ClassRoom classRoom);
    Optional<Enrollment> findByStudentAndClassRoom(User student, ClassRoom classRoom);

    // Kiểm tra học sinh đã tham gia Môn này (thông qua lớp bất kỳ) chưa?
    boolean existsByStudentAndClassRoom_Course(User student, Course course);
    Optional<Enrollment> findByStudentAndClassRoom_Course(User student, Course course);
    List<Enrollment> findByClassRoom_Course(Course course);
}