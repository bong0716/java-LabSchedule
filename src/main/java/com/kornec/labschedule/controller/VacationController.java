package com.kornec.labschedule.controller;

import com.kornec.labschedule.dto.VacationCreateRequest;
import com.kornec.labschedule.dto.VacationDto;
import com.kornec.labschedule.service.VacationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vacations")
@RequiredArgsConstructor
public class VacationController {

    private final VacationService vacationService;

    @GetMapping
    public ResponseEntity<List<VacationDto>> getAllVacations() {
        return ResponseEntity.ok(vacationService.getAllVacations());
    }

    @PostMapping
    public ResponseEntity<VacationDto> createVacation(@Valid @RequestBody VacationCreateRequest request) {
        return ResponseEntity.ok(vacationService.createVacation(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VacationDto> updateVacation(@PathVariable Long id, @Valid @RequestBody VacationCreateRequest request) {
        return ResponseEntity.ok(vacationService.updateVacation(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVacation(@PathVariable Long id) {
        vacationService.deleteVacation(id);
        return ResponseEntity.ok().build();
    }
}
