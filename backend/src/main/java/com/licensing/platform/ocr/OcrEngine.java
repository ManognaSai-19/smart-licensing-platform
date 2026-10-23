package com.licensing.platform.ocr;

import java.nio.file.Path;

public interface OcrEngine {

    String getName();

    String getVersion();

    boolean isAvailable();

    OcrResult extract(Path filePath, String contentType, String documentCode);
}
