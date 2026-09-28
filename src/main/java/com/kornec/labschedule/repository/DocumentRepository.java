package com.kornec.labschedule.repository;

import com.kornec.labschedule.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<Document> findTop10ByOrderByCreatedAtDesc();
}
