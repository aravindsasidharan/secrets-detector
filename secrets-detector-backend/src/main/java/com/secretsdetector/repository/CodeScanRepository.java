package com.secretsdetector.repository;

import com.secretsdetector.entity.CodeScan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CodeScanRepository extends JpaRepository<CodeScan, String> {
    List<CodeScan> findByStatus(String status);
    List<CodeScan> findAllByOrderByCreatedAtDesc();
    Long countByStatus(String status);
}