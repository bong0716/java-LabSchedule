package com.kornec.labschedule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "timeline")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Timeline {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "event_type", length = 20)
    private String eventType;

    @Column(nullable = false, length = 300)
    private String content;

    @Column(columnDefinition = "TEXT")
    private String detail;

    @Column(length = 50)
    private String author;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
