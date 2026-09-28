package com.kornec.labschedule.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class ProjectCreateRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String code;
    private String description;
    private String status;
    private String category;
    private Long pmId;
    private String startDate;
    private String endDate;
    private List<Long> teamMemberIds;
}
