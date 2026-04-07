package com.chatbot.pdf.service;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.spring.AiService;
import dev.langchain4j.service.TokenStream;

@AiService
public interface Assistant {
    @SystemMessage("Eres un asistente que responde basándose en los PDFs subidos.")
    TokenStream chat(String message);
}