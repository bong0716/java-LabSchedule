package com.kornec.labschedule.dto;

import lombok.*;
import java.util.List;

@Data @Builder
public class StaffDto {
    private Long id;
    private String name;
    private String position;
    private String team;
    private String email;
    private String phone;
    private List<String> projects;
}
