package com.kornec.labschedule.service;

import com.kornec.labschedule.dto.*;
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
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final StaffRepository staffRepository;
    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository versionRepository;
    private final TimelineRepository timelineRepository;
    private final IssueRepository issueRepository;
    private final IssueResponseRepository issueResponseRepository;
    private final ReportRepository reportRepository;

    @Transactional(readOnly = true)
    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDetailDto getProjectDetail(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다: " + id));

        List<MemberDto> members = memberRepository.findByProjectId(id).stream()
                .map(this::toMemberDto)
                .collect(Collectors.toList());

        List<DocumentDto> documents = documentRepository.findByProjectIdOrderByCreatedAtDesc(id).stream()
                .map(doc -> {
                    List<DocumentDto.VersionDto> versions = versionRepository.findByDocumentIdOrderByUploadedAtDesc(doc.getId()).stream()
                            .map(v -> DocumentDto.VersionDto.builder()
                                    .id(v.getId())
                                    .version(v.getVersion())
                                    .uploader(v.getUploader() != null ? v.getUploader().getName() : null)
                                    .fileSize(v.getFileSize())
                                    .note(v.getNote())
                                    .uploadedAt(v.getUploadedAt().toString())
                                    .build())
                            .collect(Collectors.toList());

                    return DocumentDto.builder()
                            .id(doc.getId())
                            .name(doc.getName())
                            .category(doc.getCategory())
                            .uploader(doc.getUploader() != null ? doc.getUploader().getName() : null)
                            .uploaderId(doc.getUploader() != null ? doc.getUploader().getId() : null)
                            .createdAt(doc.getCreatedAt().toLocalDate().toString())
                            .latestVersion(versions.isEmpty() ? null : versions.get(0).getVersion())
                            .versions(versions)
                            .build();
                })
                .collect(Collectors.toList());

        List<TimelineDto> timeline = timelineRepository.findByProjectIdOrderByEventDateDescCreatedAtDesc(id).stream()
                .map(t -> TimelineDto.builder()
                        .id(t.getId())
                        .eventType(t.getEventType())
                        .content(t.getContent())
                        .detail(t.getDetail())
                        .author(t.getAuthor())
                        .eventDate(t.getEventDate() != null ? t.getEventDate().toString() : null)
                        .build())
                .collect(Collectors.toList());

        List<IssueDto> issues = issueRepository.findByProjectIdOrderByCreatedAtDesc(id).stream()
                .map(issue -> {
                    List<IssueDto.IssueResponseDto> responses = issueResponseRepository.findByIssueIdOrderByCreatedAtAsc(issue.getId()).stream()
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
                            .responses(responses)
                            .build();
                })
                .collect(Collectors.toList());

        List<ReportDto> reports = reportRepository.findByProjectIdOrderByReportDateDesc(id).stream()
                .map(r -> ReportDto.builder()
                        .id(r.getId())
                        .reportType(r.getReportType())
                        .title(r.getTitle())
                        .author(r.getAuthor() != null ? r.getAuthor().getName() : null)
                        .authorId(r.getAuthor() != null ? r.getAuthor().getId() : null)
                        .reportDate(r.getReportDate() != null ? r.getReportDate().toString() : null)
                        .periodStart(r.getPeriodStart() != null ? r.getPeriodStart().toString() : null)
                        .periodEnd(r.getPeriodEnd() != null ? r.getPeriodEnd().toString() : null)
                        .thisPeriod(r.getThisPeriod())
                        .nextPeriod(r.getNextPeriod())
                        .issues(r.getIssues())
                        .build())
                .collect(Collectors.toList());

        return ProjectDetailDto.builder()
                .id(project.getId())
                .name(project.getName())
                .code(project.getCode())
                .description(project.getDescription())
                .status(project.getStatus())
                .category(project.getCategory())
                .pm(project.getPm() != null ? project.getPm().getName() : null)
                .pmId(project.getPm() != null ? project.getPm().getId() : null)
                .startDate(project.getStartDate() != null ? project.getStartDate().toString() : null)
                .endDate(project.getEndDate() != null ? project.getEndDate().toString() : null)
                .members(members)
                .documents(documents)
                .timeline(timeline)
                .issues(issues)
                .reports(reports)
                .build();
    }

    @Transactional
    public ProjectDto createProject(ProjectCreateRequest request) {
        Staff pm = null;
        if (request.getPmId() != null) {
            pm = staffRepository.findById(request.getPmId())
                    .orElseThrow(() -> new EntityNotFoundException("PM을 찾을 수 없습니다: " + request.getPmId()));
        }

        Project project = Project.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : "대기중")
                .category(request.getCategory())
                .pm(pm)
                .startDate(request.getStartDate() != null ? LocalDate.parse(request.getStartDate()) : null)
                .endDate(request.getEndDate() != null ? LocalDate.parse(request.getEndDate()) : null)
                .build();
        project = projectRepository.save(project);

        // Add team members
        if (request.getTeamMemberIds() != null) {
            for (Long staffId : request.getTeamMemberIds()) {
                Staff staff = staffRepository.findById(staffId).orElse(null);
                if (staff != null) {
                    ProjectMember member = ProjectMember.builder()
                            .project(project)
                            .staff(staff)
                            .name(staff.getName())
                            .role(staffId.equals(request.getPmId()) ? "PM" : "팀원")
                            .team(staff.getTeam())
                            .build();
                    memberRepository.save(member);
                }
            }
        }

        // Add timeline entry
        Timeline tl = Timeline.builder()
                .project(project)
                .eventType("milestone")
                .content("프로젝트 '" + project.getName() + "' 생성")
                .author(pm != null ? pm.getName() : "시스템")
                .eventDate(LocalDate.now())
                .build();
        timelineRepository.save(tl);

        return toDto(project);
    }

    @Transactional
    public ProjectDto updateProject(Long id, ProjectCreateRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다: " + id));

        if (request.getName() != null) project.setName(request.getName());
        if (request.getCode() != null) project.setCode(request.getCode());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getCategory() != null) project.setCategory(request.getCategory());
        if (request.getStartDate() != null) project.setStartDate(LocalDate.parse(request.getStartDate()));
        if (request.getEndDate() != null) project.setEndDate(LocalDate.parse(request.getEndDate()));

        if (request.getPmId() != null) {
            Staff pm = staffRepository.findById(request.getPmId())
                    .orElseThrow(() -> new EntityNotFoundException("PM을 찾을 수 없습니다"));
            project.setPm(pm);
        }

        return toDto(projectRepository.save(project));
    }

    private ProjectDto toDto(Project project) {
        List<String> teamNames = memberRepository.findByProjectId(project.getId()).stream()
                .map(ProjectMember::getName)
                .collect(Collectors.toList());

        return ProjectDto.builder()
                .id(project.getId())
                .name(project.getName())
                .code(project.getCode())
                .description(project.getDescription())
                .status(project.getStatus())
                .category(project.getCategory())
                .pm(project.getPm() != null ? project.getPm().getName() : null)
                .pmId(project.getPm() != null ? project.getPm().getId() : null)
                .startDate(project.getStartDate() != null ? project.getStartDate().toString() : null)
                .endDate(project.getEndDate() != null ? project.getEndDate().toString() : null)
                .team(teamNames)
                .build();
    }

    private MemberDto toMemberDto(ProjectMember pm) {
        return MemberDto.builder()
                .id(pm.getId())
                .staffId(pm.getStaff() != null ? pm.getStaff().getId() : null)
                .name(pm.getName())
                .role(pm.getRole())
                .team(pm.getTeam())
                .mm(pm.getMm())
                .joinedDate(pm.getJoinedDate() != null ? pm.getJoinedDate().toString() : null)
                .isFreelancer(pm.getIsFreelancer())
                .company(pm.getCompany())
                .contact(pm.getContact())
                .build();
    }
}
