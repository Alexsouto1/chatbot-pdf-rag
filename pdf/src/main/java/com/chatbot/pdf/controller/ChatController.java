package com.chatbot.pdf.controller;

import com.chatbot.pdf.service.Assistant;
import com.chatbot.pdf.service.PdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import java.io.IOException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Para pruebas, aceptamos todo
@RequiredArgsConstructor
public class ChatController {

    private final PdfService pdfService;
    private final Assistant assistant;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadPdf(@RequestParam("file") MultipartFile file) {
        try {
            pdfService.ingestPdf(file);
            return ResponseEntity.ok("PDF procesado y guardado en ChromaDB correctamente.");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error al procesar el PDF: " + e.getMessage());
        }
    }

    @GetMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(@RequestParam("message") String message) {
        Sinks.Many<String> sink = Sinks.many().unicast().onBackpressureBuffer();

        assistant.chat(message)
                .onNext(sink::tryEmitNext)
                .onComplete(c -> sink.tryEmitComplete())
                .onError(sink::tryEmitError)
                .start();

        return sink.asFlux();
    }
}