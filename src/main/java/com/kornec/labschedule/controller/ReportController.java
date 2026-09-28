package com.kornec.labschedule.controller;

import com.kornec.labschedule.dto.ReportCreateRequest;
import com.kornec.labschedule.dto.ReportDto;
import com.kornec.labschedule.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<List<ReportDto>> getReports(@PathVariable Long projectId) {
        return ResponseEntity.ok(reportService.getProjectReports(projectId));
    }

    @PostMapping
    public ResponseEntity<ReportDto> createReport(@PathVariable Long projectId, @Valid @RequestBody ReportCreateRequest request) {
        return ResponseEntity.ok(reportService.createReport(projectId, request));
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long projectId, @PathVariable Long reportId) {
        reportService.deleteReport(reportId);
        return ResponseEntity.ok().build();
    }
}
