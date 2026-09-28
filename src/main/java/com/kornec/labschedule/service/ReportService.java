package com.kornec.labschedule.service;

import com.kornec.labschedule.dto.ReportCreateRequest;
import com.kornec.labschedule.dto.ReportDto;
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
public class ReportService {

    private final ReportRepository reportRepository;
    private final ProjectRepository projectRepository;
    private final StaffRepository staffRepository;
    private final TimelineRepository timelineRepository;

    @Transactional(readOnly = true)
    public List<ReportDto> getProjectReports(Long projectId) {
        return reportRepository.findByProjectIdOrderByReportDateDesc(projectId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReportDto createReport(Long projectId, ReportCreateRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다"));

        Staff author = request.getAuthorId() != null
                ? staffRepository.findById(request.getAuthorId()).orElse(null)
                : null;

        Report report = Report.builder()
                .project(project)
                .reportType(request.getReportType())
                .title(request.getTitle())
                .author(author)
                .reportDate(request.getReportDate() != null ? LocalDate.parse(request.getReportDate()) : LocalDate.now())
                .periodStart(request.getPeriodStart() != null ? LocalDate.parse(request.getPeriodStart()) : null)
                .periodEnd(request.getPeriodEnd() != null ? LocalDate.parse(request.getPeriodEnd()) : null)
                .thisPeriod(request.getThisPeriod())
                .nextPeriod(request.getNextPeriod())
                .issues(request.getIssues())
                .build();
        report = reportRepository.save(report);

        // Timeline
        Timeline tl = Timeline.builder()
                .project(project)
                .eventType("upload")
                .content(request.getReportType() + " 보고서 작성: " + request.getTitle())
                .author(author != null ? author.getName() : null)
                .eventDate(LocalDate.now())
                .build();
        timelineRepository.save(tl);

        return toDto(report);
    }

    @Transactional
    public void deleteReport(Long reportId) {
        reportRepository.deleteById(reportId);
    }

    private ReportDto toDto(Report r) {
        return ReportDto.builder()
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
                .build();
    }
}
