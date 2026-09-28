package com.kornec.labschedule.repository;

import com.kornec.labschedule.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<Issue> findByStatusIn(List<String> statuses);
    long countByProjectId(Long projectId);
}
