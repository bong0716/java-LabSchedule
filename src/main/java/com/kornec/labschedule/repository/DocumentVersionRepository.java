package com.kornec.labschedule.repository;

import com.kornec.labschedule.entity.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {
    List<DocumentVersion> findByDocumentIdOrderByUploadedAtDesc(Long documentId);
    void deleteByDocumentId(Long documentId);
}
