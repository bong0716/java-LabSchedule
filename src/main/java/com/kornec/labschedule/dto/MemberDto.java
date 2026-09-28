package com.kornec.labschedule.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder
public class MemberDto {
    private Long id;
    private Long staffId;
    private String name;
    private String role;
    private String team;
    private BigDecimal mm;
    private String joinedDate;
    private boolean isFreelancer;
    private String company;
    private String contact;
}
