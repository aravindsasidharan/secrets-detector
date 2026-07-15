package com.secretsdetector.controller;

import com.secretsdetector.dto.CodeSubmissionDTO;
import com.secretsdetector.dto.ScanResultDTO;
import com.secretsdetector.dto.SecretFindingDTO;
import com.secretsdetector.entity.CodeScan;
import com.secretsdetector.entity.SecretFinding;
import com.secretsdetector.service.SecretsDetectorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/secrets")
@CrossOrigin(origins = "http://localhost:3000")
public class SecretsController {

    @Autowired
    private SecretsDetectorService detectorService;

    @PostMapping("/scan/text")
    public ResponseEntity<?> scanText(@RequestBody CodeSubmissionDTO request) {
        try {
            if (request.getCode() == null || request.getCode().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Code cannot be empty"));
            }

            if (request.getFileName() == null) request.setFileName("untitled");
            if (request.getLanguage() == null) request.setLanguage("unknown");

            CodeScan scan = detectorService.scanCode(
                    request.getFileName(),
                    request.getLanguage(),
                    request.getCode()
            );

            ScanResultDTO result = convertToDTO(scan);

            return ResponseEntity.ok(new SuccessResponse(
                    "Scan completed",
                    scan.getId(),
                    result
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Scan failed: " + e.getMessage()));
        }
    }

    @PostMapping("/scan/file")
    public ResponseEntity<?> scanFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "language", required = false) String language) {
        try {
            if (file.getSize() > 10_000_000) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("File too large"));
            }

            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("File is empty"));
            }

            String code = new String(file.getBytes(), StandardCharsets.UTF_8);
            String fileName = file.getOriginalFilename();

            if (language == null || language.isEmpty()) {
                language = detectLanguage(fileName);
            }

            CodeScan scan = detectorService.scanCode(fileName, language, code);
            ScanResultDTO result = convertToDTO(scan);

            return ResponseEntity.ok(new SuccessResponse(
                    "File scan completed",
                    scan.getId(),
                    result
            ));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Error reading file"));
        }
    }

    @GetMapping("/results/{scanId}")
    public ResponseEntity<?> getResults(@PathVariable String scanId) {
        try {
            CodeScan scan = detectorService.getScanResults(scanId);
            ScanResultDTO result = convertToDTO(scan);

            return ResponseEntity.ok(new SuccessResponse(
                    "Results retrieved",
                    scanId,
                    result
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Scan not found"));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllScans() {
        try {
            List<CodeScan> scans = detectorService.getAllScans();
            List<ScanResultDTO> results = scans.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new AllScansResponse(results));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error"));
        }
    }

    @DeleteMapping("/{scanId}")
    public ResponseEntity<?> deleteScan(@PathVariable String scanId) {
        try {
            detectorService.deleteScan(scanId);
            return ResponseEntity.ok(new SimpleMessage("Scan deleted"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error"));
        }
    }

    private ScanResultDTO convertToDTO(CodeScan scan) {
        ScanResultDTO dto = new ScanResultDTO();
        dto.setScanId(scan.getId());
        dto.setFileName(scan.getFileName());
        dto.setLanguage(scan.getLanguage());
        dto.setStatus(scan.getStatus());
        dto.setCreatedAt(scan.getCreatedAt());
        dto.setCompletedAt(scan.getCompletedAt());

        dto.setTotalSecrets(scan.getTotalSecrets());
        dto.setCriticalCount(scan.getCriticalCount());
        dto.setHighCount(scan.getHighCount());
        dto.setMediumCount(scan.getMediumCount());
        dto.setLowCount(scan.getLowCount());

        List<SecretFindingDTO> findingDTOs = scan.getFindings().stream()
                .map(this::convertFindingToDTO)
                .collect(Collectors.toList());
        dto.setFindings(findingDTOs);

        return dto;
    }

    private SecretFindingDTO convertFindingToDTO(SecretFinding finding) {
        SecretFindingDTO dto = new SecretFindingDTO();
        dto.setId(finding.getId());
        dto.setSecretType(finding.getSecretType());
        dto.setSeverity(finding.getSeverity());
        dto.setLineNumber(finding.getLineNumber());
        dto.setColumnNumber(finding.getColumnNumber());
        dto.setMaskedValue(finding.getMaskedValue());
        dto.setDescription(finding.getDescription());
        dto.setRemediation(finding.getRemediation());
        dto.setContextCode(finding.getContextCode());
        return dto;
    }

    private String detectLanguage(String fileName) {
        if (fileName == null) return "unknown";
        fileName = fileName.toLowerCase();

        if (fileName.endsWith(".java")) return "java";
        if (fileName.endsWith(".py")) return "python";
        if (fileName.endsWith(".js")) return "javascript";
        if (fileName.endsWith(".ts")) return "typescript";

        return "unknown";
    }

    public static class SuccessResponse {
        public boolean success = true;
        public String message;
        public String scanId;
        public ScanResultDTO data;

        public SuccessResponse(String message, String scanId, ScanResultDTO data) {
            this.message = message;
            this.scanId = scanId;
            this.data = data;
        }
    }

    public static class AllScansResponse {
        public boolean success = true;
        public List<ScanResultDTO> scans;

        public AllScansResponse(List<ScanResultDTO> scans) {
            this.scans = scans;
        }
    }

    public static class SimpleMessage {
        public boolean success = true;
        public String message;

        public SimpleMessage(String message) {
            this.message = message;
        }
    }

    public static class ErrorResponse {
        public boolean success = false;
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}