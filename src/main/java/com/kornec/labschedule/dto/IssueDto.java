package com.kornec.labschedule.dto;

import lombok.*;
import java.util.List;

@Data @Builder
public class IssueDto {
    private Long id;
    private String issueCode;
    private String title;
    private String description;
    private String status;
    private String assignee;
    private Long assigneeId;
    private String reporter;
    private Long reporterId;
    private String openedDate;
    private String dueDate;
    private String projectName;
    private Long projectId;
    private List<IssueResponseDto> responses;

    @Data @Builder
    public static class IssueResponseDto {
        private Long id;
        private String author;
        private String action;
        private String content;
        private String createdAt;
    }
}
