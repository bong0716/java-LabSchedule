package com.kornec.labschedule.repository;

import com.kornec.labschedule.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    // 해당 월과 기간이 겹치는 이벤트 조회 (startDate <= 월말 AND endDate >= 월초)
    @Query("SELECT e FROM CalendarEvent e WHERE e.startDate <= :monthEnd AND e.endDate >= :monthStart")
    List<CalendarEvent> findByDateRange(LocalDate monthStart, LocalDate monthEnd);

    // 휴가 연동: staff + type + 날짜로 매칭
    Optional<CalendarEvent> findByStaffIdAndEventTypeAndStartDateAndEndDate(
            Long staffId, String eventType, LocalDate startDate, LocalDate endDate);
}
