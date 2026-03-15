package com.swd.online_learning.repository;

import com.swd.online_learning.entity.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ClassRoomRepository extends JpaRepository<ClassRoom, Long> {
    Optional<ClassRoom> findByEnrollmentKey(String enrollmentKey);
    List<ClassRoom> findByCourse_CourseId(Long courseId);
}