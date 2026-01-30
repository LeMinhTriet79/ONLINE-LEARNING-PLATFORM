package com.swd.online_learning.entity;

import com.swd.online_learning.enums.SubmissionStatus;
import com.swd.online_learning.enums.SubmissionType;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "submissions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long submissionId;

    @ManyToOne
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    @ManyToOne
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionType type;

    private Float score;

    @Enumerated(EnumType.STRING)
    private SubmissionStatus status;

    @Column(columnDefinition = "TEXT")
    private String studentTextResponse;

    private String attachmentUrl;

    @Column(columnDefinition = "TEXT")
    private String teacherFeedback;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL)
    private List<SubmissionAnswer> answers;
}