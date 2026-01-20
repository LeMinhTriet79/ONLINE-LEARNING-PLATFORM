package com.swd.online_learning.repository;

import com.swd.online_learning.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
}

