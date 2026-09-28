package com.kornec.labschedule.dto;

import lombok.*;
import java.util.List;

@Data @Builder
public class DashboardDto {
    private long inProgressCount;
    private long completedCount;
    private long todayVacationCount;
    private long upcomingDeadlineCount;
    private List<VacationDto> todayVacations;
    private List<ProjectDto> myProjects;
    private List<CalendarEventDto> upcomingSchedules;
    private List<DocumentDto> recentFiles;
    private List<IssueDto> activeIssues;
}
