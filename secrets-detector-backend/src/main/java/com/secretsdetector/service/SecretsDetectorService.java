package com.secretsdetector.service;

import com.secretsdetector.config.SecretPatterns;
import com.secretsdetector.entity.CodeScan;
import com.secretsdetector.entity.SecretFinding;
import com.secretsdetector.repository.CodeScanRepository;
import com.secretsdetector.repository.SecretFindingRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.regex.Matcher;

@Slf4j
@Service
public class SecretsDetectorService {

    @Autowired
    private CodeScanRepository codeScanRepository;

    @Autowired
    private SecretFindingRepository secretFindingRepository;

    public CodeScan scanCode(String fileName, String language, String code) {
        log.info("Scanning: {} ({})", fileName, language);

        CodeScan scan = new CodeScan();
        scan.setFileName(fileName);
        scan.setLanguage(language);
        scan.setCodePreview(code.substring(0, Math.min(code.length(), 5000)));
        scan.setStatus("PENDING");

        try {
            CodeScan savedScan = codeScanRepository.save(scan);

            List<SecretFinding> findings = findSecrets(code, savedScan);

            savedScan.setFindings(findings);
            savedScan.recalculateCounts();
            savedScan.markCompleted();

            savedScan = codeScanRepository.save(savedScan);
            log.info("Found {} secrets", findings.size());

            return savedScan;

        } catch (Exception e) {
            log.error("Scan failed: {}", e.getMessage());
            scan.markError(e.getMessage());
            codeScanRepository.save(scan);
            throw new RuntimeException("Scan failed: " + e.getMessage());
        }
    }

    private List<SecretFinding> findSecrets(String code, CodeScan codeScan) {
        List<SecretFinding> findings = new ArrayList<>();

        Map<String, SecretPatterns.SecretPattern> patterns =
                SecretPatterns.getAllPatterns();

        for (Map.Entry<String, SecretPatterns.SecretPattern> entry : patterns.entrySet()) {
            String patternName = entry.getKey();
            SecretPatterns.SecretPattern pattern = entry.getValue();

            Matcher matcher = pattern.regex.matcher(code);

            while (matcher.find()) {
                int lineNumber = calculateLineNumber(code, matcher.start());
                int columnNumber = calculateColumnNumber(code, matcher.start());
                String matchedSecret = matcher.group();

                SecretFinding finding = new SecretFinding();
                finding.setSecretType(patternName);
                finding.setSeverity(pattern.severity);
                finding.setLineNumber(lineNumber);
                finding.setColumnNumber(columnNumber);
                finding.setMaskedValue(SecretFinding.maskSecret(matchedSecret));
                finding.setDescription(pattern.description);
                finding.setRemediation(pattern.remediation);

                String contextCode = getLineContent(code, lineNumber);
                String maskedContext = contextCode.replace(
                        matchedSecret,
                        SecretFinding.maskSecret(matchedSecret)
                );
                finding.setContextCode(maskedContext);
                finding.setCodeScan(codeScan);

                SecretFinding savedFinding = secretFindingRepository.save(finding);
                findings.add(savedFinding);
            }
        }

        return findings;
    }

    private int calculateLineNumber(String code, int position) {
        int lineNumber = 1;
        for (int i = 0; i < position && i < code.length(); i++) {
            if (code.charAt(i) == '\n') {
                lineNumber++;
            }
        }
        return lineNumber;
    }

    private int calculateColumnNumber(String code, int position) {
        int column = 1;
        for (int i = position - 1; i >= 0; i--) {
            if (code.charAt(i) == '\n') {
                break;
            }
            column++;
        }
        return column;
    }

    private String getLineContent(String code, int lineNumber) {
        String[] lines = code.split("\n");
        if (lineNumber > 0 && lineNumber <= lines.length) {
            return lines[lineNumber - 1];
        }
        return "";
    }

    public CodeScan getScanResults(String scanId) {
        return codeScanRepository.findById(scanId)
                .orElseThrow(() -> new RuntimeException("Scan not found"));
    }

    public List<CodeScan> getAllScans() {
        return codeScanRepository.findAllByOrderByCreatedAtDesc();
    }

    public void deleteScan(String scanId) {
        codeScanRepository.deleteById(scanId);
    }
}