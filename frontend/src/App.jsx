import React, { useState, useEffect, useRef } from 'react';
import { Upload, Send, FileText, Loader2, Bot, User } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll al final cuando llega un mensaje nuevo
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUpload = async () => {
    if (!file) {
      alert("Por favor, selecciona un archivo primero");
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert("¡PDF procesado y entrenado con éxito!");
      } else {
        const errorData = await res.text();
        alert("Error del servidor: " + errorData);
      }
    } catch (err) {
      alert("No se pudo conectar con el servidor Java. Revisa si está corriendo.");
    } finally {
      setUploading(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    const aiMessage = { role: 'ai', text: '' };
    setMessages(prev => [...prev, aiMessage]);

    try {
      const response = await fetch(`http://localhost:8080/api/chat?message=${encodeURIComponent(currentInput)}`);
      
      if (!response.body) throw new Error("No hay cuerpo en la respuesta");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const cleanChunk = chunk.replace(/data:/g, '').replace(/\n\n/g, '');
        
        fullText += cleanChunk;

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'ai', text: fullText };
          return newMessages;
        });
      }
    } catch (err) {
      console.error("Error en el chat:", err);
      setMessages(prev => [...prev, { role: 'ai', text: "Lo siento, hubo un error al procesar tu pregunta." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans">
      
      {/* BARRA LATERAL */}
      <div className="w-80 bg-[#1e293b] p-6 flex flex-col border-r border-slate-700 shadow-xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FileText size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Resumidor de PDF IA</h1>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Documento Fuente
            </label>
            <div className="group relative">
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-slate-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-xs file:font-bold file:uppercase
                  file:bg-slate-700 file:text-slate-200
                  hover:file:bg-slate-600 cursor-pointer"
              />
            </div>
            {file && (
              <p className="mt-2 text-xs text-blue-400 truncate font-medium">
                Seleccionado: {file.name}
              </p>
            )}
          </div>

          <button 
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
          >
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
            {uploading ? "Procesando..." : "Entrenar Modelo"}
          </button>
        </div>

        <div className="mt-auto p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <p className="text-[10px] text-slate-500 leading-relaxed text-center">
            Sube un PDF para que la IA pueda analizarlo y responder tus dudas usando RAG.
          </p>
        </div>
      </div>

      {/* ÁREA DE CHAT */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* MENSAJES */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
              <Bot size={64} strokeWidth={1} />
              <p className="text-lg">Sube un archivo y empieza a preguntar</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700 border border-slate-600'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                }`}>
                  <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* INPUT DE TEXTO */}
        <div className="p-6 bg-[#0f172a] border-t border-slate-800">
          <form onSubmit={handleChat} className="max-w-4xl mx-auto relative group">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={file ? "Haz una pregunta sobre el PDF..." : "Primero carga un PDF en la izquierda"}
              disabled={!file || isTyping}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-6 pr-14 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 placeholder:text-slate-500"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl transition-colors shadow-md"
            >
              {isTyping ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;