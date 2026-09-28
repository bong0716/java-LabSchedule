package com.kornec.labschedule.dto;

import lombok.*;

@Data @Builder
public class ReportDto {
    private Long id;
    private String reportType;
    private String title;
    private String author;
    private Long authorId;
    private String reportDate;
    private String periodStart;
    private String periodEnd;
    private String[] thisPeriod;
    private String[] nextPeriod;
    private String issues;
}
