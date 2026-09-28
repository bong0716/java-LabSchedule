package com.kornec.labschedule.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CalendarEventRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String eventType;
    @NotBlank
    private String startDate;
    private String endDate;
    private Long projectId;
    private Long staffId;
    private String memo;
}
