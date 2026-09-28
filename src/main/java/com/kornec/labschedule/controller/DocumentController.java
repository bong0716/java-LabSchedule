package com.kornec.labschedule.controller;

import com.kornec.labschedule.dto.DocumentDto;
import com.kornec.labschedule.dto.FileUploadRequest;
import com.kornec.labschedule.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    public ResponseEntity<List<DocumentDto>> getDocuments(@PathVariable Long projectId) {
        return ResponseEntity.ok(documentService.getProjectDocuments(projectId));
    }

    @PostMapping
    public ResponseEntity<DocumentDto> uploadDocument(@PathVariable Long projectId, @Valid @RequestBody FileUploadRequest request) {
        return ResponseEntity.ok(documentService.uploadDocument(projectId, request));
    }

    @PostMapping("/{documentId}/versions")
    public ResponseEntity<DocumentDto> addVersion(@PathVariable Long projectId, @PathVariable Long documentId, @Valid @RequestBody FileUploadRequest request) {
        return ResponseEntity.ok(documentService.addVersion(documentId, request));
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long projectId, @PathVariable Long documentId) {
        documentService.deleteDocument(documentId);
        return ResponseEntity.ok().build();
    }
}
