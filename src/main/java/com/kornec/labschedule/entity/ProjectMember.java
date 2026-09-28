package com.kornec.labschedule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "project_member")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectMember {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 20)
    private String role;

    @Column(length = 30)
    private String team;

    @Column(precision = 4, scale = 1)
    private BigDecimal mm;

    @Column(name = "joined_date")
    private LocalDate joinedDate;

    @Column(name = "is_freelancer", nullable = false)
    private Boolean isFreelancer;

    @Column(length = 50)
    private String company;

    @Column(length = 50)
    private String contact;

    @PrePersist
    protected void onCreate() {
        if (this.role == null) this.role = "팀원";
        if (this.isFreelancer == null) this.isFreelancer = false;
    }
}
