package com.kornec.labschedule.dto;

import lombok.*;

@Data @Builder
public class CalendarEventDto {
    private Long id;
    private String title;
    private String eventType;
    private String startDate;
    private String endDate;
    private String project;
    private Long projectId;
    private String staff;
    private Long staffId;
    private String memo;
    private String color;
}
