package com.swd.online_learning.repository;

import com.swd.online_learning.entity.Course;
import com.swd.online_learning.entity.Enrollment;
import com.swd.online_learning.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    boolean existsByStudentAndCourse(User student, Course course);
    List<Enrollment> findByStudent(User student);
    Optional<Enrollment> findByStudentAndCourse(User student, Course course);
}
