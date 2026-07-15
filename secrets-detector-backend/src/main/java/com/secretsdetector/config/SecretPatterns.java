package com.secretsdetector.config;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

public class SecretPatterns {

    private static final Map<String, SecretPattern> PATTERNS = new HashMap<>();

    static {
        PATTERNS.put("AWS_ACCESS_KEY", new SecretPattern(
                "AKIA[0-9A-Z]{16}",
                "CRITICAL",
                "AWS Access Key - Can access all AWS resources",
                "Store in AWS Secrets Manager"
        ));

        PATTERNS.put("PRIVATE_KEY", new SecretPattern(
                "-----BEGIN [A-Z0-9 ]*PRIVATE KEY[A-Z0-9 ]*-----",
                "CRITICAL",
                "Private Key - Allows impersonation",
                "Never commit private keys"
        ));

        PATTERNS.put("GITHUB_PAT", new SecretPattern(
                "ghp_[0-9a-zA-Z]{36}",
                "CRITICAL",
                "GitHub PAT - Full account access",
                "Revoke at github.com/settings/tokens"
        ));

        PATTERNS.put("JWT_TOKEN", new SecretPattern(
                "eyJ[A-Za-z0-9_-]{100,}",
                "HIGH",
                "JWT Token - Used for authentication",
                "Never embed in code"
        ));

        PATTERNS.put("API_KEY", new SecretPattern(
                "(api[_-]?key|apikey)[\\s]*[=:][\\s]*['\\\"]?[A-Za-z0-9\\-_]{20,}['\\\"]?",
                "MEDIUM",
                "API Key - Can access API",
                "Use environment variables"
        ));

        PATTERNS.put("DATABASE_PASSWORD", new SecretPattern(
                "(?i)(password|passwd)[\\s]*[=:][\\s]*['\\\"]([^'\\\"]{8,})['\\\"]",
                "HIGH",
                "Database Password - Direct access",
                "Move to environment variable"
        ));

        PATTERNS.put("DATABASE_URL_WITH_CREDS", new SecretPattern(
                "(?i)(mysql|postgres|mongodb)://[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+@",
                "HIGH",
                "DB URL with credentials",
                "Extract credentials to env variables"
        ));

        PATTERNS.put("SLACK_BOT_TOKEN", new SecretPattern(
                "xoxb-[0-9]{10,13}-[0-9]{10,13}-[A-Za-z0-9_-]{24}",
                "MEDIUM",
                "Slack Bot Token - Workspace access",
                "Revoke and regenerate"
        ));
    }

    public static Map<String, SecretPattern> getAllPatterns() {
        return new HashMap<>(PATTERNS);
    }

    public static SecretPattern getPattern(String name) {
        return PATTERNS.get(name);
    }

    public static class SecretPattern {
        public final Pattern regex;
        public final String patternName;
        public final String severity;
        public final String description;
        public final String remediation;

        public SecretPattern(String regexStr, String severity,
                             String description, String remediation) {
            this.regex = Pattern.compile(regexStr, Pattern.CASE_INSENSITIVE);
            this.patternName = regexStr;
            this.severity = severity;
            this.description = description;
            this.remediation = remediation;
        }

        public boolean matches(String text) {
            return regex.matcher(text).find();
        }
    }
}