import React, { useState } from 'react';
import { MessageSquare, RefreshCw, Send } from 'lucide-react';

const ChatAssistant = ({ chatHistory, onSendChat, isLoading }) => {
    const [chatInput, setChatInput] = useState('');

    const handleSend = () => {
        if (!chatInput.trim()) return;
        onSendChat(chatInput);
        setChatInput('');
    };

    return (
        <div className="view">
            <div className="hero">
                <h1>AI Assistant</h1>
                <p>Get personalized financial advice</p>
            </div>

            <div className="chat-container">
                <div className="chat-messages">
                    {chatHistory.length === 0 ? (
                        <div className="chat-empty">
                            <MessageSquare />
                            <p>Ask me anything about your finances!</p>
                        </div>
                    ) : (
                        chatHistory.map((msg, i) => (
                            <div key={i} className={`chat-message chat-${msg.role}`}>
                                <div className="chat-bubble">{msg.content}</div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="chat-message chat-assistant">
                            <div className="chat-bubble"><RefreshCw className="spinner-sm" /> Thinking...</div>
                        </div>
                    )}
                </div>
                <div className="chat-input">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about your finances..."
                    />
                    <button onClick={handleSend} disabled={isLoading || !chatInput.trim()} className="btn-primary">
                        <Send />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatAssistant;
