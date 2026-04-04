import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AITwin = () => {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm Nikhil's AI Twin. I'm now powered by Vertex AI Vector Search and Gemini to share my experience with you! Feel free to ask me anything about my skills, projects, or cloud journey.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // We stream messages securely from our decoupled RAG backend
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const initChat = async () => {
    // Initializing is now handled by the serverless backend
  };

  useEffect(() => {
    initChat();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Server error');
      }

      setMessages(prev => [...prev, { text: result.text, sender: 'bot' }]);
    } catch (error) {
      console.error("Serverless RAG Error:", error);
      setMessages(prev => [...prev, { 
        text: "Oops! My backend brain is currently offline. Ensure the API Gateway is deployed and Vertex AI is enabled.", 
        sender: 'bot',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="inline-chat-container">
      <div className="ai-chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`ai-msg ${msg.sender} animate-fade-in`} style={msg.isError ? { borderColor: 'red', color: '#ff8a8a' } : {}}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="ai-msg bot" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <div className="typing-dot" style={{ animationDelay: '0s' }}>•</div>
            <div className="typing-dot" style={{ animationDelay: '0.2s' }}>•</div>
            <div className="typing-dot" style={{ animationDelay: '0.4s' }}>•</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="ai-chat-input-area">
        <input 
          type="text" 
          placeholder="Ask about my skills..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading} style={{ opacity: isLoading ? 0.5 : 1 }}>
          <Send size={18} />
        </button>
      </div>
      
      <style>{`
        .typing-dot {
          font-size: 1.5rem;
          line-height: 0.5;
          animation: blink 1.4s infinite both;
        }
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default AITwin;
