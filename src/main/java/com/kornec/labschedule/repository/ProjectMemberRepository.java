package com.kornec.labschedule.repository;

import com.kornec.labschedule.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByProjectId(Long projectId);
    List<ProjectMember> findByStaffId(Long staffId);
    void deleteByProjectIdAndId(Long projectId, Long id);
}
