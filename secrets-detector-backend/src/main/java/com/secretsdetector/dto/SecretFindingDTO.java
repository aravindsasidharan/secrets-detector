package com.secretsdetector.dto;

import lombok.Data;

@Data
public class SecretFindingDTO {
    private String id;
    private String secretType;
    private String severity;
    private Integer lineNumber;
    private Integer columnNumber;
    private String maskedValue;
    private String description;
    private String remediation;
    private String contextCode;
}