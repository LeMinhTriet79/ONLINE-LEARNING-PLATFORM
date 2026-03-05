package com.swd.online_learning.repository;

import com.swd.online_learning.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByInstructor_Username(String username); // Sửa lại đúng chuẩn JPA (findByInstructor_Username hoặc findByInstructorUsername)


    //Optional<Course> findByEnrollmentKey(String enrollmentKey);
}
