# 🔒 Secrets Detector

A full-stack web application that scans code for exposed secrets (API keys, passwords, tokens) using regex pattern matching and machine learning.

## 🎯 Features

- **🔍 8+ Secret Patterns**: Detects AWS keys, private keys, GitHub PATs, JWTs, API keys, database passwords, and more
- **⚠️ Severity Levels**: Categorizes findings as CRITICAL, HIGH, MEDIUM, or LOW
- **📊 Real-time Scanning**: Instant analysis of uploaded files or pasted code
- **💾 History Tracking**: View, manage, and delete previous scans
- **🎨 Dark UI**: Professional dark-themed interface with Tailwind CSS
- **🔐 Security First**: Secrets are masked (first 4 + last 7 chars visible)

## 🛠️ Tech Stack

### Backend
- **Spring Boot 3.2** (Java 17)
- **Spring Data JPA** (Hibernate ORM)
- **H2 Database** (In-memory, development)
- **Maven** (Build tool)
- **Lombok** (Boilerplate reduction)

### Frontend
- **React 18** (TypeScript)
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)
- **Axios** (HTTP client)
- **Lucide React** (Icons)

## 📁 Project Structure
