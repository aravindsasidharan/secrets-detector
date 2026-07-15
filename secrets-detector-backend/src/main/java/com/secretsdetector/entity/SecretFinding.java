package com.secretsdetector.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Entity
@Table(name = "secret_findings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SecretFinding {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String secretType;

    @Column(nullable = false, length = 50)
    private String severity;

    @Column(nullable = false)
    private Integer lineNumber;

    @Column(nullable = false)
    private Integer columnNumber;

    @Column(nullable = false, length = 255)
    private String maskedValue;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String remediation;

    @Column(columnDefinition = "TEXT")
    private String contextCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scan_id", nullable = false)
    private CodeScan codeScan;

    public static String maskSecret(String secret) {
        if (secret.length() <= 8) {
            return "***";
        }
        String start = secret.substring(0, 4);
        String end = secret.substring(Math.max(0, secret.length() - 7));
        return start + "***" + end;
    }
}