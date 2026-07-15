package com.secretsdetector.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ScanResultDTO {
    private String scanId;
    private String fileName;
    private String language;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private Integer totalSecrets;
    private Integer criticalCount;
    private Integer highCount;
    private Integer mediumCount;
    private Integer lowCount;
    private List<SecretFindingDTO> findings;
}