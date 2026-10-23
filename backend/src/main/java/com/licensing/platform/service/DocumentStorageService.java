package com.licensing.platform.service;

import com.licensing.platform.exception.ValidationException;
import com.licensing.platform.model.RequiredDocumentType;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

@Service
public class DocumentStorageService {

    private static final Logger log = LoggerFactory.getLogger(DocumentStorageService.class);

    private final Path rootStorageLocation;

    // Magic Byte Signatures
    // PDF: %PDF- -> 0x25, 0x50, 0x44, 0x46
    private static final byte[] PDF_MAGIC = new byte[]{(byte) 0x25, (byte) 0x50, (byte) 0x44, (byte) 0x46};
    // JPEG: 0xFF, 0xD8, 0xFF
    private static final byte[] JPEG_MAGIC = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    // PNG: 0x89, 0x50, 0x4E, 0x47
    private static final byte[] PNG_MAGIC = new byte[]{(byte) 0x89, (byte) 0x50, (byte) 0x4E, (byte) 0x47};

    public DocumentStorageService(@Value("${app.storage.upload-dir:./storage/uploads}") String uploadDir) {
        this.rootStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootStorageLocation);
            log.info("Initialized secure private document storage directory at: {}", rootStorageLocation);
        } catch (IOException e) {
            log.error("Failed to initialize document storage directory", e);
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    public Path getRootStorageLocation() {
        return rootStorageLocation;
    }

    /**
     * Validates file size, file extension, declared MIME type, and binary magic bytes
     * against the requirements of the specified RequiredDocumentType.
     */
    public void validateFile(MultipartFile file, RequiredDocumentType docType) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("File is empty or missing", Map.of("file", "Please provide a valid non-empty file"));
        }

        // 1. Filename sanitization & path traversal check
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new ValidationException("Invalid filename", Map.of("file", "Filename must not be empty"));
        }
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\") || originalFilename.contains("\0")) {
            throw new ValidationException("Filename contains invalid path traversal characters",
                    Map.of("file", "Filename contains illegal characters"));
        }

        // 2. File size enforcement
        long maxBytes = docType.getMaxSizeBytes() != null ? docType.getMaxSizeBytes() : 5242880L;
        if (file.getSize() > maxBytes) {
            double maxMb = maxBytes / (1024.0 * 1024.0);
            throw new ValidationException(
                    String.format("File size (%d bytes) exceeds the maximum allowed limit of %.1f MB", file.getSize(), maxMb),
                    Map.of("file", String.format("File size must not exceed %.1f MB", maxMb))
            );
        }

        // 3. Allowed MIME types check
        String acceptedMimeTypesStr = docType.getAcceptedMimeTypes() != null
                ? docType.getAcceptedMimeTypes()
                : "image/jpeg,image/png,application/pdf";
        List<String> acceptedMimes = Arrays.stream(acceptedMimeTypesStr.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .toList();

        String rawContentType = file.getContentType();
        String normalizedContentType = rawContentType != null ? rawContentType.toLowerCase().trim() : "";

        // 4. Magic-byte verification to detect spoofed files
        byte[] headerBytes = new byte[8];
        int bytesRead;
        try (InputStream in = file.getInputStream()) {
            bytesRead = in.read(headerBytes);
        } catch (IOException e) {
            throw new ValidationException("Could not read file for verification", Map.of("file", "Unable to inspect file bytes"));
        }

        if (bytesRead < 4) {
            throw new ValidationException("File is too small to be a valid document", Map.of("file", "Corrupt or truncated file content"));
        }

        String detectedMimeType = detectMimeFromMagicBytes(headerBytes);
        if (detectedMimeType == null) {
            throw new ValidationException(
                    "Invalid file format: Binary magic bytes do not match any accepted document format (PDF, JPEG, PNG)",
                    Map.of("file", "File format not supported or binary header is invalid")
            );
        }

        // Verify detected MIME type is accepted by this required document type
        boolean isAccepted = acceptedMimes.stream().anyMatch(m -> m.equalsIgnoreCase(detectedMimeType));
        if (!isAccepted) {
            throw new ValidationException(
                    String.format("Detected file format '%s' is not accepted. Accepted formats: %s", detectedMimeType, acceptedMimeTypesStr),
                    Map.of("file", "File format not accepted for this document type")
            );
        }
    }

    /**
     * Inspects binary header to determine true format regardless of file extension or client header.
     */
    public String detectMimeFromMagicBytes(byte[] header) {
        if (header == null || header.length < 4) {
            return null;
        }

        // Check PDF (%PDF-)
        if (header[0] == PDF_MAGIC[0] && header[1] == PDF_MAGIC[1] && header[2] == PDF_MAGIC[2] && header[3] == PDF_MAGIC[3]) {
            return "application/pdf";
        }

        // Check JPEG (0xFF, 0xD8, 0xFF)
        if ((header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }

        // Check PNG (0x89, 0x50, 0x4E, 0x47)
        if ((header[0] & 0xFF) == 0x89 && header[1] == PNG_MAGIC[1] && header[2] == PNG_MAGIC[2] && header[3] == PNG_MAGIC[3]) {
            return "image/png";
        }

        return null;
    }

    /**
     * Calculates SHA-256 checksum of the file bytes.
     */
    public String calculateChecksum(MultipartFile file) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (InputStream in = file.getInputStream()) {
                byte[] buffer = new byte[8192];
                int n;
                while ((n = in.read(buffer)) != -1) {
                    digest.update(buffer, 0, n);
                }
            }
            byte[] hash = digest.digest();
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException | IOException e) {
            log.error("Failed to compute SHA-256 checksum", e);
            throw new RuntimeException("Checksum calculation failed", e);
        }
    }

    /**
     * Stores file to private disk with an unguessable UUID storage key.
     */
    public String storeFile(MultipartFile file, String subDirectory) {
        String originalFilename = Paths.get(Objects.requireNonNull(file.getOriginalFilename())).getFileName().toString();
        // Sanitize filename to alphanumeric and standard safe chars
        String sanitizedName = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String storageKey = (subDirectory != null ? subDirectory + "/" : "") + UUID.randomUUID() + "_" + sanitizedName;

        Path targetPath = this.rootStorageLocation.resolve(storageKey).normalize();

        // Path traversal defense
        if (!targetPath.startsWith(this.rootStorageLocation)) {
            throw new SecurityException("Cannot store file outside current storage directory");
        }

        try {
            Files.createDirectories(targetPath.getParent());
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }
            log.info("Securely stored private document with key: {}", storageKey);
            return storageKey;
        } catch (IOException e) {
            log.error("Failed to store file with key {}", storageKey, e);
            throw new RuntimeException("Failed to store document file", e);
        }
    }

    /**
     * Loads file as a Spring Resource from the private storage directory.
     */
    public Resource loadFileAsResource(String storageKey) {
        try {
            Path filePath = this.rootStorageLocation.resolve(storageKey).normalize();
            if (!filePath.startsWith(this.rootStorageLocation)) {
                throw new SecurityException("Unauthorized file path access");
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found or unreadable: " + storageKey);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("File path is invalid: " + storageKey, e);
        }
    }

    /**
     * Deletes a file from the private storage directory.
     */
    public boolean deleteFile(String storageKey) {
        try {
            Path filePath = this.rootStorageLocation.resolve(storageKey).normalize();
            if (!filePath.startsWith(this.rootStorageLocation)) {
                throw new SecurityException("Unauthorized file path access");
            }
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Could not delete file with storage key: {}", storageKey, e);
            return false;
        }
    }
}
