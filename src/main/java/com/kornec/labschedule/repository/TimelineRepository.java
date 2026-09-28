package com.kornec.labschedule.repository;

import com.kornec.labschedule.entity.Timeline;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TimelineRepository extends JpaRepository<Timeline, Long> {
    List<Timeline> findByProjectIdOrderByEventDateDescCreatedAtDesc(Long projectId);
}
