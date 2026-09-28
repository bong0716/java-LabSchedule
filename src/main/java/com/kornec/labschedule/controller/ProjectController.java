package com.kornec.labschedule.controller;

import com.kornec.labschedule.dto.ProjectCreateRequest;
import com.kornec.labschedule.dto.ProjectDetailDto;
import com.kornec.labschedule.dto.ProjectDto;
import com.kornec.labschedule.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectDto>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDetailDto> getProjectDetail(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectDetail(id));
    }

    @PostMapping
    public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody ProjectCreateRequest request) {
        return ResponseEntity.ok(projectService.createProject(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id, @RequestBody ProjectCreateRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }
}
