package com.chatbot.pdf.service;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.parser.apache.pdfbox.ApachePdfBoxDocumentParser;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class PdfService {
    private final EmbeddingStore<TextSegment> embeddingStore;
    private final EmbeddingModel embeddingModel;

    public void ingestPdf(MultipartFile file) throws IOException {
        Document document = new ApachePdfBoxDocumentParser().parse(file.getInputStream());
        DocumentSplitter splitter = DocumentSplitters.recursive(300, 30);
        embeddingStore.addAll(embeddingModel.embedAll(splitter.split(document)).content(), splitter.split(document));
    }
}