package com.swd.online_learning.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "class")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassEntity {

    @Id
    @Column(name = "class_id", length = 50)
    private String classId; // Ví dụ: "10A1"

    @Column(name = "class_name", nullable = false)
    private String className;

    @Column(name = "academic_year")
    private String academicYear;

    // Quan hệ 1 Lớp có nhiều Học sinh
    @OneToMany(mappedBy = "myClass", fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<User> students;
}