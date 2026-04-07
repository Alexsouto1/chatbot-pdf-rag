package com.chatbot.pdf.config;

import com.chatbot.pdf.service.Assistant;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.ollama.OllamaEmbeddingModel;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.chroma.ChromaEmbeddingStore;
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.Duration;
import dev.langchain4j.model.chat.StreamingChatLanguageModel;
import dev.langchain4j.model.ollama.OllamaStreamingChatModel;

@Configuration
public class LangChainConfig {

    @Value("${chromadb.url}")
    private String chromaUrl;

    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        System.out.println("Conectando a Chroma en: " + chromaUrl);

        return ChromaEmbeddingStore.builder()
                .baseUrl(chromaUrl)
                .collectionName("pdf_collection")
                .build();
    }

    @Bean
    public ContentRetriever contentRetriever(EmbeddingStore<TextSegment> embeddingStore, EmbeddingModel embeddingModel) {
        return EmbeddingStoreContentRetriever.builder()
                .embeddingStore(embeddingStore)
                .embeddingModel(embeddingModel)
                .maxResults(3)
                .build();
    }

    @Bean
    public ChatMemory chatMemory() {
        return MessageWindowChatMemory.builder()
                .maxMessages(10)
                .build();
    }

    @Bean
    public EmbeddingModel embeddingModel() {
        return OllamaEmbeddingModel.builder()
                .baseUrl("http://localhost:11434")
                .modelName("mxbai-embed-large")
                .timeout(Duration.ofMinutes(2))
                .build();
    }

    @Bean
    public StreamingChatLanguageModel streamingChatLanguageModel() {
        return OllamaStreamingChatModel.builder()
                .baseUrl("http://localhost:11434")
                .modelName("llama3")
                .timeout(Duration.ofMinutes(2))
                .build();}

    @Bean
    public Assistant assistant(
            StreamingChatLanguageModel streamingChatLanguageModel,
            ContentRetriever contentRetriever,
            ChatMemory chatMemory) {
        return AiServices.builder(Assistant.class)
                .streamingChatLanguageModel(streamingChatLanguageModel) // <--- Aquí es donde se conecta
                .contentRetriever(contentRetriever)
                .chatMemory(chatMemory)
                .build();
    }
}