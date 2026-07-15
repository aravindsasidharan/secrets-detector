package com.secretsdetector.repository;

import com.secretsdetector.entity.SecretFinding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SecretFindingRepository extends JpaRepository<SecretFinding, String> {
    List<SecretFinding> findByCodeScan_Id(String scanId);
    List<SecretFinding> findBySecretType(String secretType);
    List<SecretFinding> findBySeverity(String severity);
    Long countBySecretType(String secretType);
}