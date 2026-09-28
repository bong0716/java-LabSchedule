package com.kornec.labschedule.dto;

import lombok.*;
import java.util.List;

@Data @Builder
public class ProjectDetailDto {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String status;
    private String category;
    private String pm;
    private Long pmId;
    private String startDate;
    private String endDate;
    private List<MemberDto> members;
    private List<DocumentDto> documents;
    private List<TimelineDto> timeline;
    private List<IssueDto> issues;
    private List<ReportDto> reports;
}
