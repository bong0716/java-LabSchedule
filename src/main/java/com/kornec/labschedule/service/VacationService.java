package com.kornec.labschedule.service;

import com.kornec.labschedule.dto.VacationCreateRequest;
import com.kornec.labschedule.dto.VacationDto;
import com.kornec.labschedule.entity.CalendarEvent;
import com.kornec.labschedule.entity.Staff;
import com.kornec.labschedule.entity.Vacation;
import com.kornec.labschedule.repository.CalendarEventRepository;
import com.kornec.labschedule.repository.StaffRepository;
import com.kornec.labschedule.repository.VacationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VacationService {

    private final VacationRepository vacationRepository;
    private final StaffRepository staffRepository;
    private final CalendarEventRepository calendarEventRepository;

    @Transactional(readOnly = true)
    public List<VacationDto> getAllVacations() {
        return vacationRepository.findAllByOrderByStartDateDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VacationDto> getTodayVacations() {
        return vacationRepository.findTodayVacations(LocalDate.now()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public VacationDto createVacation(VacationCreateRequest request) {
        Staff staff = staffRepository.findById(request.getStaffId())
                .orElseThrow(() -> new EntityNotFoundException("직원을 찾을 수 없습니다"));

        LocalDate startDate = LocalDate.parse(request.getStartDate());
        LocalDate endDate = LocalDate.parse(request.getEndDate());

        Vacation vacation = Vacation.builder()
                .staff(staff)
                .vacationType(request.getVacationType())
                .startDate(startDate)
                .endDate(endDate)
                .days(request.getDays())
                .build();
        vacation = vacationRepository.save(vacation);

        // 캘린더에 자동 등록
        String title = staff.getName() + " " + request.getVacationType();
        CalendarEvent calEvent = CalendarEvent.builder()
                .title(title)
                .eventType("vacation")
                .startDate(startDate)
                .endDate(endDate)
                .staff(staff)
                .build();
        calendarEventRepository.save(calEvent);

        return toDto(vacation);
    }

    @Transactional
    public VacationDto updateVacation(Long id, VacationCreateRequest request) {
        Vacation vacation = vacationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("휴가 신청을 찾을 수 없습니다"));

        LocalDate oldStart = vacation.getStartDate();
        LocalDate oldEnd = vacation.getEndDate();
        Long staffId = vacation.getStaff().getId();

        LocalDate newStart = LocalDate.parse(request.getStartDate());
        LocalDate newEnd = LocalDate.parse(request.getEndDate());

        vacation.setVacationType(request.getVacationType());
        vacation.setStartDate(newStart);
        vacation.setEndDate(newEnd);
        vacation.setDays(request.getDays());
        vacationRepository.save(vacation);

        // 기존 캘린더 이벤트 수정
        calendarEventRepository
                .findByStaffIdAndEventTypeAndStartDateAndEndDate(staffId, "vacation", oldStart, oldEnd)
                .ifPresent(ce -> {
                    ce.setTitle(vacation.getStaff().getName() + " " + request.getVacationType());
                    ce.setStartDate(newStart);
                    ce.setEndDate(newEnd);
                    calendarEventRepository.save(ce);
                });

        return toDto(vacation);
    }

    @Transactional
    public void deleteVacation(Long id) {
        Vacation vacation = vacationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("휴가 신청을 찾을 수 없습니다"));

        // 캘린더 이벤트도 삭제
        calendarEventRepository
                .findByStaffIdAndEventTypeAndStartDateAndEndDate(
                        vacation.getStaff().getId(), "vacation",
                        vacation.getStartDate(), vacation.getEndDate())
                .ifPresent(calendarEventRepository::delete);

        vacationRepository.deleteById(id);
    }

    private VacationDto toDto(Vacation v) {
        return VacationDto.builder()
                .id(v.getId())
                .name(v.getStaff().getName())
                .staffId(v.getStaff().getId())
                .type(v.getVacationType())
                .start(v.getStartDate().toString())
                .end(v.getEndDate().toString())
                .days(v.getDays())
                .build();
    }
}
