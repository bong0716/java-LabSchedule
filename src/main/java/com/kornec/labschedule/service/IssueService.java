package com.kornec.labschedule.service;

import com.kornec.labschedule.dto.IssueCreateRequest;
import com.kornec.labschedule.dto.IssueDto;
import com.kornec.labschedule.dto.IssueResponseRequest;
import com.kornec.labschedule.entity.*;
import com.kornec.labschedule.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final IssueResponseRepository responseRepository;
    private final ProjectRepository projectRepository;
    private final StaffRepository staffRepository;
    private final TimelineRepository timelineRepository;

    @Transactional(readOnly = true)
    public List<IssueDto> getProjectIssues(Long projectId) {
        return issueRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IssueDto> getActiveIssues() {
        return issueRepository.findByStatusIn(List.of("진행중", "보류")).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public IssueDto createIssue(Long projectId, IssueCreateRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다"));

        long count = issueRepository.countByProjectId(projectId);
        String issueCode = String.format("ISS-%03d", count + 1);

        Staff assignee = request.getAssigneeId() != null
                ? staffRepository.findById(request.getAssigneeId()).orElse(null)
                : null;
        Staff reporter = request.getReporterId() != null
                ? staffRepository.findById(request.getReporterId()).orElse(null)
                : null;

        Issue issue = Issue.builder()
                .project(project)
                .issueCode(issueCode)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : "진행중")
                .assignee(assignee)
                .reporter(reporter)
                .openedDate(request.getOpenedDate() != null ? LocalDate.parse(request.getOpenedDate()) : LocalDate.now())
                .dueDate(request.getDueDate() != null ? LocalDate.parse(request.getDueDate()) : null)
                .build();
        issue = issueRepository.save(issue);

        // Timeline
        Timeline tl = Timeline.builder()
                .project(project)
                .eventType("issue")
                .content("이슈 등록: " + issue.getTitle())
                .author(reporter != null ? reporter.getName() : null)
                .eventDate(LocalDate.now())
                .build();
        timelineRepository.save(tl);

        return toDto(issue);
    }

    @Transactional
    public IssueDto updateIssueStatus(Long issueId, String status) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new EntityNotFoundException("이슈를 찾을 수 없습니다"));
        issue.setStatus(status);
        return toDto(issueRepository.save(issue));
    }

    @Transactional
    public IssueDto addResponse(Long issueId, IssueResponseRequest request) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new EntityNotFoundException("이슈를 찾을 수 없습니다"));

        Staff author = request.getAuthorId() != null
                ? staffRepository.findById(request.getAuthorId()).orElse(null)
                : null;

        IssueResponse response = IssueResponse.builder()
                .issue(issue)
                .author(author)
                .action(request.getAction())
                .content(request.getContent())
                .build();
        responseRepository.save(response);

        return toDto(issue);
    }

    @Transactional
    public void deleteIssue(Long issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new EntityNotFoundException("이슈를 찾을 수 없습니다"));
        responseRepository.deleteByIssueId(issueId);
        issueRepository.delete(issue);
    }

    private IssueDto toDto(Issue issue) {
        List<IssueDto.IssueResponseDto> responses = responseRepository.findByIssueIdOrderByCreatedAtAsc(issue.getId()).stream()
                .map(r -> IssueDto.IssueResponseDto.builder()
                        .id(r.getId())
                        .author(r.getAuthor() != null ? r.getAuthor().getName() : null)
                        .action(r.getAction())
                        .content(r.getContent())
                        .createdAt(r.getCreatedAt().toString())
                        .build())
                .collect(Collectors.toList());

        return IssueDto.builder()
                .id(issue.getId())
                .issueCode(issue.getIssueCode())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .status(issue.getStatus())
                .assignee(issue.getAssignee() != null ? issue.getAssignee().getName() : null)
                .assigneeId(issue.getAssignee() != null ? issue.getAssignee().getId() : null)
                .reporter(issue.getReporter() != null ? issue.getReporter().getName() : null)
                .reporterId(issue.getReporter() != null ? issue.getReporter().getId() : null)
                .openedDate(issue.getOpenedDate() != null ? issue.getOpenedDate().toString() : null)
                .dueDate(issue.getDueDate() != null ? issue.getDueDate().toString() : null)
                .projectName(issue.getProject().getName())
                .projectId(issue.getProject().getId())
                .responses(responses)
                .build();
    }
}
