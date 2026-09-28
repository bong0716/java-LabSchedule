package com.kornec.labschedule.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class VacationCreateRequest {
    @NotNull
    private Long staffId;
    @NotBlank
    private String vacationType;
    @NotBlank
    private String startDate;
    @NotBlank
    private String endDate;
    @NotNull
    private BigDecimal days;
}
