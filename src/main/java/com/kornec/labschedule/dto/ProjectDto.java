package com.kornec.labschedule.dto;

import lombok.*;
import java.util.List;

@Data @Builder
public class ProjectDto {
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
    private List<String> team;
}
