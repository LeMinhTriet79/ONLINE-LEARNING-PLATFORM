package com.swd.online_learning.repository;

import com.swd.online_learning.entity.LearningProgress;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LearningProgressRepository extends JpaRepository<LearningProgress, Long> {
}

