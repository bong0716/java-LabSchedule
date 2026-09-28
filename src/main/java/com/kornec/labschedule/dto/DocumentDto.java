package com.kornec.labschedule.dto;

import lombok.*;
import java.util.List;

@Data @Builder
public class DocumentDto {
    private Long id;
    private String name;
    private String category;
    private String uploader;
    private Long uploaderId;
    private String createdAt;
    private String latestVersion;
    private String projectName;
    private Long projectId;
    private List<VersionDto> versions;

    @Data @Builder
    public static class VersionDto {
        private Long id;
        private String version;
        private String uploader;
        private String fileSize;
        private String note;
        private String uploadedAt;
    }
}
