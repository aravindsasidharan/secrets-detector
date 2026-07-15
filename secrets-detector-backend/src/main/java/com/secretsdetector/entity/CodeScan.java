package com.secretsdetector.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "code_scans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeScan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 255)
    private String fileName;

    @Column(nullable = false, length = 50)
    private String language;

    @Column(columnDefinition = "TEXT")
    private String codePreview;

    @Column(nullable = false)
    private Integer totalSecrets = 0;

    @Column(nullable = false)
    private Integer criticalCount = 0;

    @Column(nullable = false)
    private Integer highCount = 0;

    @Column(nullable = false)
    private Integer mediumCount = 0;

    @Column(nullable = false)
    private Integer lowCount = 0;

    @Column(nullable = false, length = 50)
    private String status = "PENDING";

    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime createdAt;

    @Column
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime completedAt;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @OneToMany(mappedBy = "codeScan", cascade = CascadeType.REMOVE, fetch = FetchType.EAGER)
    private List<SecretFinding> findings = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public void recalculateCounts() {
        totalSecrets = findings.size();
        criticalCount = 0;
        highCount = 0;
        mediumCount = 0;
        lowCount = 0;

        for (SecretFinding finding : findings) {
            switch (finding.getSeverity()) {
                case "CRITICAL" -> criticalCount++;
                case "HIGH" -> highCount++;
                case "MEDIUM" -> mediumCount++;
                case "LOW" -> lowCount++;
            }
        }
    }

    public void markCompleted() {
        this.status = "COMPLETED";
        this.completedAt = LocalDateTime.now();
    }

    public void markError(String error) {
        this.status = "ERROR";
        this.errorMessage = error;
        this.completedAt = LocalDateTime.now();
    }
}