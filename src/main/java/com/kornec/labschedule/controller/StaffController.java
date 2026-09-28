package com.kornec.labschedule.controller;

import com.kornec.labschedule.dto.StaffCreateRequest;
import com.kornec.labschedule.dto.StaffDto;
import com.kornec.labschedule.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @GetMapping
    public ResponseEntity<List<StaffDto>> getAllStaff() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffDto> getStaff(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.getStaff(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffDto> createStaff(@Valid @RequestBody StaffCreateRequest request) {
        return ResponseEntity.ok(staffService.createStaff(request));
    }
}
