package com.kornec.labschedule.service;

import com.kornec.labschedule.dto.DocumentDto;
import com.kornec.labschedule.dto.FileUploadRequest;
import com.kornec.labschedule.entity.*;
import com.kornec.labschedule.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository versionRepository;
    private final ProjectRepository projectRepository;
    private final StaffRepository staffRepository;
    private final TimelineRepository timelineRepository;

    @Transactional(readOnly = true)
    public List<DocumentDto> getProjectDocuments(Long projectId) {
        return documentRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> getRecentDocuments() {
        return documentRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DocumentDto uploadDocument(Long projectId, FileUploadRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다"));

        Staff uploader = null;
        if (request.getUploaderId() != null) {
            uploader = staffRepository.findById(request.getUploaderId()).orElse(null);
        }

        // Check if document with same name exists
        List<Document> existing = documentRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .filter(d -> d.getName().equals(request.getName()))
                .collect(Collectors.toList());

        Document document;
        if (!existing.isEmpty()) {
            document = existing.get(0);
        } else {
            document = Document.builder()
                    .project(project)
                    .name(request.getName())
                    .category(request.getCategory())
                    .uploader(uploader)
                    .build();
            document = documentRepository.save(document);
        }

        // Create version
        DocumentVersion version = DocumentVersion.builder()
                .document(document)
                .version(request.getVersion())
                .uploader(uploader)
                .fileSize(request.getFileSize())
                .note(request.getNote())
                .build();
        versionRepository.save(version);

        // Add timeline entry
        Timeline tl = Timeline.builder()
                .project(project)
                .eventType("upload")
                .content(request.getName() + " " + request.getVersion() + " 업로드")
                .author(uploader != null ? uploader.getName() : null)
                .eventDate(LocalDate.now())
                .build();
        timelineRepository.save(tl);

        return toDto(document);
    }

    @Transactional
    public DocumentDto addVersion(Long documentId, FileUploadRequest request) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("산출물을 찾을 수 없습니다"));

        Staff uploader = null;
        if (request.getUploaderId() != null) {
            uploader = staffRepository.findById(request.getUploaderId()).orElse(null);
        }

        DocumentVersion version = DocumentVersion.builder()
                .document(document)
                .version(request.getVersion())
                .uploader(uploader)
                .fileSize(request.getFileSize())
                .note(request.getNote())
                .build();
        versionRepository.save(version);

        // Add timeline
        Timeline tl = Timeline.builder()
                .project(document.getProject())
                .eventType("upload")
                .content(document.getName() + " " + request.getVersion() + " 업로드")
                .author(uploader != null ? uploader.getName() : null)
                .eventDate(LocalDate.now())
                .build();
        timelineRepository.save(tl);

        return toDto(document);
    }

    @Transactional
    public void deleteDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("산출물을 찾을 수 없습니다"));
        versionRepository.deleteByDocumentId(documentId);
        documentRepository.delete(document);
    }

    private DocumentDto toDto(Document doc) {
        List<DocumentDto.VersionDto> versions = versionRepository.findByDocumentIdOrderByUploadedAtDesc(doc.getId()).stream()
                .map(v -> DocumentDto.VersionDto.builder()
                        .id(v.getId())
                        .version(v.getVersion())
                        .uploader(v.getUploader() != null ? v.getUploader().getName() : null)
                        .fileSize(v.getFileSize())
                        .note(v.getNote())
                        .uploadedAt(v.getUploadedAt().toLocalDate().toString())
                        .build())
                .collect(Collectors.toList());

        return DocumentDto.builder()
                .id(doc.getId())
                .name(doc.getName())
                .category(doc.getCategory())
                .uploader(doc.getUploader() != null ? doc.getUploader().getName() : null)
                .uploaderId(doc.getUploader() != null ? doc.getUploader().getId() : null)
                .createdAt(doc.getCreatedAt().toLocalDate().toString())
                .latestVersion(versions.isEmpty() ? null : versions.get(0).getVersion())
                .projectName(doc.getProject().getName())
                .projectId(doc.getProject().getId())
                .versions(versions)
                .build();
    }
}
