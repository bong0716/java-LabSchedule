package com.kornec.labschedule.service;

import com.kornec.labschedule.dto.CalendarEventDto;
import com.kornec.labschedule.dto.CalendarEventRequest;
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
public class CalendarEventService {

    private final CalendarEventRepository eventRepository;
    private final ProjectRepository projectRepository;
    private final StaffRepository staffRepository;

    @Transactional(readOnly = true)
    public List<CalendarEventDto> getEventsByMonth(int year, int month) {
        LocalDate monthStart = LocalDate.of(year, month, 1);
        LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());
        return eventRepository.findByDateRange(monthStart, monthEnd).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CalendarEventDto> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CalendarEventDto createEvent(CalendarEventRequest request) {
        Project project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId()).orElse(null);
        }
        Staff staff = null;
        if (request.getStaffId() != null) {
            staff = staffRepository.findById(request.getStaffId()).orElse(null);
        }

        LocalDate startDate = LocalDate.parse(request.getStartDate());
        LocalDate endDate = request.getEndDate() != null && !request.getEndDate().isBlank()
                ? LocalDate.parse(request.getEndDate())
                : startDate;

        CalendarEvent event = CalendarEvent.builder()
                .title(request.getTitle())
                .eventType(request.getEventType())
                .startDate(startDate)
                .endDate(endDate)
                .project(project)
                .staff(staff)
                .memo(request.getMemo())
                .build();
        event = eventRepository.save(event);

        return toDto(event);
    }

    @Transactional
    public CalendarEventDto updateEvent(Long id, CalendarEventRequest request) {
        CalendarEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("일정을 찾을 수 없습니다"));

        LocalDate startDate = LocalDate.parse(request.getStartDate());
        LocalDate endDate = request.getEndDate() != null && !request.getEndDate().isBlank()
                ? LocalDate.parse(request.getEndDate())
                : startDate;

        event.setTitle(request.getTitle());
        event.setEventType(request.getEventType());
        event.setStartDate(startDate);
        event.setEndDate(endDate);
        event.setMemo(request.getMemo());

        if (request.getProjectId() != null) {
            event.setProject(projectRepository.findById(request.getProjectId()).orElse(null));
        } else {
            event.setProject(null);
        }
        if (request.getStaffId() != null) {
            event.setStaff(staffRepository.findById(request.getStaffId()).orElse(null));
        } else {
            event.setStaff(null);
        }

        return toDto(eventRepository.save(event));
    }

    @Transactional
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    private CalendarEventDto toDto(CalendarEvent e) {
        String color = switch (e.getEventType()) {
            case "project" -> "bg-primary-100 text-primary-700 border-primary-200";
            case "vacation" -> "bg-yellow-100 text-yellow-700 border-yellow-200";
            default -> "bg-blue-100 text-blue-700 border-blue-200";
        };

        return CalendarEventDto.builder()
                .id(e.getId())
                .title(e.getTitle())
                .eventType(e.getEventType())
                .startDate(e.getStartDate().toString())
                .endDate(e.getEndDate().toString())
                .project(e.getProject() != null ? e.getProject().getName() : null)
                .projectId(e.getProject() != null ? e.getProject().getId() : null)
                .staff(e.getStaff() != null ? e.getStaff().getName() : null)
                .staffId(e.getStaff() != null ? e.getStaff().getId() : null)
                .memo(e.getMemo())
                .color(color)
                .build();
    }
}
