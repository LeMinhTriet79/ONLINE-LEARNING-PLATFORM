package com.swd.online_learning.entity;

import com.swd.online_learning.Enum.LessonType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lesson")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lesson_id")
    private Long lessonId;

    private String title;

    @Enumerated(EnumType.STRING)
    private LessonType type; // VIDEO, PDF

    @Column(name = "content_url")
    private String contentUrl;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    // Cột mới thêm cho AI (Context)
    @Column(name = "content_text", columnDefinition = "LONGTEXT")
    private String contentText;

    @ManyToOne
    @JoinColumn(name = "chapter_id")
    private Chapter chapter;
}