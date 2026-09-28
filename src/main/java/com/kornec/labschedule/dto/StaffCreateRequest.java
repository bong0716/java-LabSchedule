package com.kornec.labschedule.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StaffCreateRequest {
    @NotBlank
    private String name;
    private String position;
    @NotBlank
    private String team;
    private String email;
    private String phone;
}
