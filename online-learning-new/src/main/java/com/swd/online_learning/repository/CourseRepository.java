package com.swd.online_learning.repository;

import com.swd.online_learning.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByInstructorUsername(String username);
}
