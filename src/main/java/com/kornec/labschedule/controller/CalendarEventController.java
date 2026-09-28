package com.kornec.labschedule.controller;

import com.kornec.labschedule.dto.CalendarEventDto;
import com.kornec.labschedule.dto.CalendarEventRequest;
import com.kornec.labschedule.service.CalendarEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarEventController {

    private final CalendarEventService calendarEventService;

    @GetMapping
    public ResponseEntity<List<CalendarEventDto>> getEvents(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        if (year != null && month != null) {
            return ResponseEntity.ok(calendarEventService.getEventsByMonth(year, month));
        }
        return ResponseEntity.ok(calendarEventService.getAllEvents());
    }

    @PostMapping
    public ResponseEntity<CalendarEventDto> createEvent(@Valid @RequestBody CalendarEventRequest request) {
        return ResponseEntity.ok(calendarEventService.createEvent(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CalendarEventDto> updateEvent(@PathVariable Long id, @Valid @RequestBody CalendarEventRequest request) {
        return ResponseEntity.ok(calendarEventService.updateEvent(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        calendarEventService.deleteEvent(id);
        return ResponseEntity.ok().build();
    }
}
