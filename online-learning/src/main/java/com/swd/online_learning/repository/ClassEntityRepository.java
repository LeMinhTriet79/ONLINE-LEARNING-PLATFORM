package com.swd.online_learning.repository;

import com.swd.online_learning.entity.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassEntityRepository extends JpaRepository<ClassEntity, String> {

    List<ClassEntity> findByAcademicYear(String academicYear);
}

