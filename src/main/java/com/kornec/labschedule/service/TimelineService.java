package com.kornec.labschedule.service;

import com.kornec.labschedule.dto.TimelineDto;
import com.kornec.labschedule.repository.TimelineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimelineService {

    private final TimelineRepository timelineRepository;

    public List<TimelineDto> getProjectTimeline(Long projectId) {
        return timelineRepository.findByProjectIdOrderByEventDateDescCreatedAtDesc(projectId).stream()
                .map(t -> TimelineDto.builder()
                        .id(t.getId())
                        .eventType(t.getEventType())
                        .content(t.getContent())
                        .detail(t.getDetail())
                        .author(t.getAuthor())
                        .eventDate(t.getEventDate() != null ? t.getEventDate().toString() : null)
                        .build())
                .collect(Collectors.toList());
    }
}
