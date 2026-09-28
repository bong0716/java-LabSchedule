package com.kornec.labschedule.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FileUploadRequest {
    @NotBlank
    private String name;
    private String category;
    @NotBlank
    private String version;
    private String fileSize;
    private String note;
    private Long uploaderId;
}
