package com.kornec.labschedule.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReportCreateRequest {
    @NotBlank
    private String reportType;
    @NotBlank
    private String title;
    private Long authorId;
    private String reportDate;
    private String periodStart;
    private String periodEnd;
    private String[] thisPeriod;
    private String[] nextPeriod;
    private String issues;
}
