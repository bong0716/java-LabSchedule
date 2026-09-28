package com.kornec.labschedule.controller;

import com.kornec.labschedule.dto.IssueCreateRequest;
import com.kornec.labschedule.dto.IssueDto;
import com.kornec.labschedule.dto.IssueResponseRequest;
import com.kornec.labschedule.service.IssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @GetMapping
    public ResponseEntity<List<IssueDto>> getIssues(@PathVariable Long projectId) {
        return ResponseEntity.ok(issueService.getProjectIssues(projectId));
    }

    @PostMapping
    public ResponseEntity<IssueDto> createIssue(@PathVariable Long projectId, @Valid @RequestBody IssueCreateRequest request) {
        return ResponseEntity.ok(issueService.createIssue(projectId, request));
    }

    @PutMapping("/{issueId}")
    public ResponseEntity<IssueDto> updateStatus(@PathVariable Long projectId, @PathVariable Long issueId, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(issueService.updateIssueStatus(issueId, body.get("status")));
    }

    @DeleteMapping("/{issueId}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long projectId, @PathVariable Long issueId) {
        issueService.deleteIssue(issueId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{issueId}/responses")
    public ResponseEntity<IssueDto> addResponse(@PathVariable Long projectId, @PathVariable Long issueId, @Valid @RequestBody IssueResponseRequest request) {
        return ResponseEntity.ok(issueService.addResponse(issueId, request));
    }
}
