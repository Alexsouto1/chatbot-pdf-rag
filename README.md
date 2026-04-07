<img width="1917" height="914" alt="chatbot" src="https://github.com/user-attachments/assets/be7cb072-8c17-4eed-98c4-1cf9bcd7a3c1" />

# Chatbot RAG con Java & React

Este es un chatbot inteligente capaz de analizar documentos PDF y responder preguntas basadas en su contenido. 
Utiliza una arquitectura RAG para extraer contexto del documento y generar respuestas precisas usando modelos locales.

## Tecnologías utilizadas

- **Backend:** Java 21, Spring Boot 3.2.5, LangChain4j.
- **Frontend:** React + Vite, Tailwind CSS v4, Lucide Icons.
- **IA Local:** Ollama (Modelos: `llama3` para chat y `mxbai-embed-large` para embeddings).
- **Base de Datos Vectorial:** ChromaDB (vía LangChain4j).

## Requisitos previos

1. Tener **Ollama** instalado y corriendo.
2. Descargar los modelos necesarios:
   ```bash
   ollama pull llama3
   ollama pull mxbai-embed-large

   chroma run --host localhost --port 8000

