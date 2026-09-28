package com.kornec.labschedule.repository;

import com.kornec.labschedule.entity.IssueResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IssueResponseRepository extends JpaRepository<IssueResponse, Long> {
    List<IssueResponse> findByIssueIdOrderByCreatedAtAsc(Long issueId);
    void deleteByIssueId(Long issueId);
}
