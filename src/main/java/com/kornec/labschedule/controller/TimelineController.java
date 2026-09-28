package com.kornec.labschedule.controller;

import com.kornec.labschedule.dto.TimelineDto;
import com.kornec.labschedule.service.TimelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/timeline")
@RequiredArgsConstructor
public class TimelineController {

    private final TimelineService timelineService;

    @GetMapping
    public ResponseEntity<List<TimelineDto>> getTimeline(@PathVariable Long projectId) {
        return ResponseEntity.ok(timelineService.getProjectTimeline(projectId));
    }
}
