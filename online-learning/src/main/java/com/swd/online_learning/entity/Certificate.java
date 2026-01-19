package com.swd.online_learning.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificate")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Certificate {

    @Id
    @Column(name = "certificate_code", unique = true)
    private String certificateCode; // Mã UUID string do hệ thống sinh ra

    @OneToOne
    @JoinColumn(name = "enrollment_id", unique = true)
    private Enrollment enrollment;

    @Column(name = "issue_date")
    private LocalDateTime issueDate;

    @Column(name = "pdf_url")
    private String pdfUrl;
}