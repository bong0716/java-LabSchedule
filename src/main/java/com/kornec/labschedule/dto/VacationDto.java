package com.kornec.labschedule.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder
public class VacationDto {
    private Long id;
    private String name;
    private Long staffId;
    private String type;
    private String start;
    private String end;
    private BigDecimal days;
}
