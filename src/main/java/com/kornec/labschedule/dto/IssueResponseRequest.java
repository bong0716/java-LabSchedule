package com.kornec.labschedule.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IssueResponseRequest {
    private Long authorId;
    private String action;
    @NotBlank
    private String content;
}
