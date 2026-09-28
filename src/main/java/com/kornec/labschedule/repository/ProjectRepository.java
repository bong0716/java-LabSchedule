package com.kornec.labschedule.repository;

import com.kornec.labschedule.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    long countByStatus(String status);
    List<Project> findAllByOrderByCreatedAtDesc();
    List<Project> findByStatusIn(List<String> statuses);
}
