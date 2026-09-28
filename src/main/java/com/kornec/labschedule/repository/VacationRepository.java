package com.kornec.labschedule.repository;

import com.kornec.labschedule.entity.Vacation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface VacationRepository extends JpaRepository<Vacation, Long> {
    List<Vacation> findAllByOrderByStartDateDesc();

    @Query("SELECT v FROM Vacation v WHERE v.startDate <= :date AND v.endDate >= :date")
    List<Vacation> findTodayVacations(LocalDate date);

    List<Vacation> findByStaffId(Long staffId);
}
