package com.kornec.labschedule.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class MemberAddRequest {
    private Long staffId;
    @NotBlank
    private String name;
    private String role;
    private String team;
    private BigDecimal mm;
    private String joinedDate;
    private boolean isFreelancer;
    private String company;
    private String contact;
}
