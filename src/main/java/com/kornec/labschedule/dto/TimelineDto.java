package com.kornec.labschedule.dto;

import lombok.*;

@Data @Builder
public class TimelineDto {
    private Long id;
    private String eventType;
    private String content;
    private String detail;
    private String author;
    private String eventDate;
}
