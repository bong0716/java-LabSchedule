package com.kornec.labschedule.service;

import com.kornec.labschedule.dto.*;
import com.kornec.labschedule.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final VacationService vacationService;
    private final CalendarEventService calendarEventService;
    private final DocumentService documentService;
    private final IssueService issueService;
    private final CalendarEventRepository calendarEventRepository;

    @Transactional(readOnly = true)
    public DashboardDto getDashboard() {
        long inProgress = projectRepository.countByStatus("진행중") + projectRepository.countByStatus("마감임박");
        long completed = projectRepository.countByStatus("완료");
        List<VacationDto> todayVacations = vacationService.getTodayVacations();

        // Upcoming deadlines: calendar events within next 7 days
        LocalDate today = LocalDate.now();
        LocalDate weekLater = today.plusDays(7);
        List<CalendarEventDto> upcoming = calendarEventRepository.findByDateRange(today, weekLater).stream()
                .map(e -> CalendarEventDto.builder()
                        .id(e.getId())
                        .title(e.getTitle())
                        .eventType(e.getEventType())
                        .startDate(e.getStartDate().toString())
                        .endDate(e.getEndDate().toString())
                        .project(e.getProject() != null ? e.getProject().getName() : null)
                        .projectId(e.getProject() != null ? e.getProject().getId() : null)
                        .memo(e.getMemo())
                        .build())
                .collect(Collectors.toList());

        List<DocumentDto> recentFiles = documentService.getRecentDocuments();
        List<IssueDto> activeIssues = issueService.getActiveIssues();

        // All projects as "myProjects" for now (can be filtered by user later)
        List<ProjectDto> myProjects = projectRepository.findByStatusIn(List.of("진행중", "마감임박")).stream()
                .map(p -> ProjectDto.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .status(p.getStatus())
                        .build())
                .collect(Collectors.toList());

        return DashboardDto.builder()
                .inProgressCount(inProgress)
                .completedCount(completed)
                .todayVacationCount(todayVacations.size())
                .upcomingDeadlineCount(upcoming.size())
                .todayVacations(todayVacations)
                .myProjects(myProjects)
                .upcomingSchedules(upcoming)
                .recentFiles(recentFiles)
                .activeIssues(activeIssues)
                .build();
    }
}
