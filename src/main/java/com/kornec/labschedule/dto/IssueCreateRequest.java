package com.kornec.labschedule.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IssueCreateRequest {
    @NotBlank
    private String title;
    private String description;
    private String status;
    private Long assigneeId;
    private Long reporterId;
    private String openedDate;
    private String dueDate;
}
