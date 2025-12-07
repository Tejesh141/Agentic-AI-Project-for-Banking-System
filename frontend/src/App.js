import React, { useState, useEffect, useRef } from 'react';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isLoading, setIsLoading] = useState(false);
  const [currentState, setCurrentState] = useState('GREET');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [showHistory, setShowHistory] = useState(false);
  const [savedChats, setSavedChats] = useState([]);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    // Load saved preferences
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    const savedChatsData = JSON.parse(localStorage.getItem('savedChats') || '[]');
    
    setDarkMode(savedDarkMode);
    setFontSize(savedFontSize);
    setSavedChats(savedChatsData);
    
    // Initialize conversation
    sendMessage('start', {});
    
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
    
    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (type, text, data = {}) => {
    setMessages(prev => [...prev, { type, text, data, timestamp: Date.now() }]);
    
    // Auto-speak bot messages
    if (type === 'bot' && synthRef.current) {
      speakText(text);
    }
  };

  const sendMessage = async (message, context = {}) => {
    if (!message.trim() && message !== 'start') return;

    if (message !== 'start') {
      addMessage('user', message);
    }
    
    setIsLoading(true);
    setInput('');

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId, 
          message: message === 'start' ? 'Hello' : message,
          context 
        })
      });

      const result = await response.json();
      
      addMessage('bot', result.message, result);
      setCurrentState(result.state);

      // Handle automatic actions
      if (result.action === 'VERIFY_KYC') {
        setTimeout(() => sendMessage('verify', {}), 1500);
      } else if (result.action === 'UNDERWRITE') {
        setTimeout(() => sendMessage('underwrite', {}), 1500);
      } else if (result.action === 'GENERATE_SANCTION' && result.sanctionLetter) {
        setTimeout(() => {
          downloadSanctionLetter(result.sanctionLetter.filename);
        }, 2000);
      }

    } catch (error) {
      addMessage('bot', '✗ ERROR: Sorry, there was an error processing your request. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    
    // Handle salary input for SALARY_UPLOAD state
    if (currentState === 'SALARY_UPLOAD') {
      const salary = parseInt(message.replace(/[^\d]/g, ''));
      if (salary && salary > 0) {
        await sendMessage(message, { salary });
      } else {
        addMessage('bot', 'Please enter a valid salary amount.');
      }
    } else {
      await sendMessage(message);
    }
  };

  const downloadSanctionLetter = (filename) => {
    const link = document.createElement('a');
    link.href = `${API_BASE}/sanction/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addMessage('bot', '✓ SUCCESS: Your sanction letter has been downloaded successfully.');
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentState('GREET');
    setInput('');
    setUploadedFile(null);
    stopSpeaking();
    sendMessage('start', {});
  };
  
  const saveChat = () => {
    const chatData = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      messages: messages,
      state: currentState
    };
    const updated = [...savedChats, chatData];
    setSavedChats(updated);
    localStorage.setItem('savedChats', JSON.stringify(updated));
    addMessage('bot', '✓ Chat saved successfully.');
  };
  
  const loadChat = (chatData) => {
    setMessages(chatData.messages);
    setCurrentState(chatData.state);
    setShowHistory(false);
  };
  
  const deleteChat = (id) => {
    const updated = savedChats.filter(chat => chat.id !== id);
    setSavedChats(updated);
    localStorage.setItem('savedChats', JSON.stringify(updated));
  };
  
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };
  
  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
  };
  
  const exportChat = () => {
    const chatText = messages.map(m => `[${m.type.toUpperCase()}] ${m.text}`).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat_${Date.now()}.txt`;
    link.click();
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addMessage('bot', '✓ Message copied to clipboard.');
  };
  
  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };
  
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const speakText = (text) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[^a-zA-Z0-9\s,.!?]/g, ''));
      utterance.lang = 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      synthRef.current.speak(utterance);
    }
  };
  
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };
  
  const handleFileUpload = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      setUploadedFile({ ...result, type });
      addMessage('user', `↑ Uploaded ${type}: ${file.name}`);
      addMessage('bot', `✓ File uploaded successfully. File ID: ${result.fileId}`);
    } catch (error) {
      addMessage('bot', '✗ ERROR: Failed to upload file. Please try again.');
    }
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file, 'image');
    }
  };
  
  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, 'document');
    }
  };

  const getPlaceholder = () => {
    switch (currentState) {
      case 'COLLECT_AMOUNT':
        return 'Enter loan amount (e.g., 500000)';
      case 'COLLECT_TENURE':
        return 'Enter tenure in months (e.g., 24)';
      case 'COLLECT_PURPOSE':
        return 'Enter loan purpose';
      case 'COLLECT_PHONE':
        return 'Enter 10-digit mobile number';
      case 'SALARY_UPLOAD':
        return 'Enter monthly salary (e.g., 50000)';
      case 'CLOSED':
        return 'Chat ended';
      default:
        return 'Type your message...';
    }
  };

  const getFontSizeClass = () => {
    switch(fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-rose-50 via-red-50 to-pink-100'} ${getFontSizeClass()}`}>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white bg-opacity-95 backdrop-blur-sm'} rounded-t-2xl shadow-lg overflow-hidden`} style={!darkMode ? {backgroundImage: "url('data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='financial-pattern' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cg fill='%23e5e7eb' opacity='0.3'%3E%3Cpath d='M10 10h15v10h-15z'/%3E%3Ccircle cx='50' cy='20' r='8'/%3E%3Cpath d='M70 15h10v15h-10z'/%3E%3Cpath d='M30 40h8v12h-8z'/%3E%3Ccircle cx='80' cy='50' r='6'/%3E%3Cpath d='M15 60h12v8h-12z'/%3E%3Ccircle cx='60' cy='70' r='7'/%3E%3Cpath d='M85 75h8v10h-8z'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23financial-pattern)'/%3E%3C/svg%3E')", backgroundSize: '100px 100px'} : {}}>
            <div className="bg-gradient-to-r from-rose-700 via-red-700 to-pink-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Tata Capital</h1>
                  <p className="text-rose-100 mt-1">AI-Powered Loan Assistant</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={toggleDarkMode} className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 text-sm">
                    {darkMode ? '☀ Light' : '☾ Dark'}
                  </button>
                  <button onClick={saveChat} className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 text-sm">
                    ★ Save
                  </button>
                  <button onClick={() => setShowHistory(!showHistory)} className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 text-sm">
                    ☷ History
                  </button>
                  <button onClick={exportChat} className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 text-sm">
                    ↓ Export
                  </button>
                  <div className="text-right">
                    <div className="text-xs bg-white/20 px-3 py-1 rounded-full">
                      Session: {sessionId.slice(-8)}
                    </div>
                    <div className="text-xs mt-1">
                      State: <span className="font-semibold">{currentState}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* History Sidebar */}
            {showHistory && (
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50 bg-opacity-90'} p-4 border-b`} style={!darkMode ? {backgroundImage: "url('data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='financial-pattern' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cg fill='%23e5e7eb' opacity='0.3'%3E%3Cpath d='M10 10h15v10h-15z'/%3E%3Ccircle cx='50' cy='20' r='8'/%3E%3Cpath d='M70 15h10v15h-10z'/%3E%3Cpath d='M30 40h8v12h-8z'/%3E%3Ccircle cx='80' cy='50' r='6'/%3E%3Cpath d='M15 60h12v8h-12z'/%3E%3Ccircle cx='60' cy='70' r='7'/%3E%3Cpath d='M85 75h8v10h-8z'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23financial-pattern)'/%3E%3C/svg%3E')", backgroundSize: '100px 100px'} : {}}>
                <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Saved Chats</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {savedChats.length === 0 ? (
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No saved chats</p>
                  ) : (
                    savedChats.map(chat => (
                      <div key={chat.id} className={`flex justify-between items-center p-2 ${darkMode ? 'bg-gray-600' : 'bg-white'} rounded`}>
                        <button onClick={() => loadChat(chat)} className={`text-sm flex-1 text-left ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {new Date(chat.timestamp).toLocaleString()}
                        </button>
                        <button onClick={() => deleteChat(chat.id)} className="text-red-500 text-xs px-2">
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {/* Font Size Controls */}
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50 bg-opacity-90'} p-2 border-b flex justify-center gap-2`} style={!darkMode ? {backgroundImage: "url('data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='financial-pattern' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cg fill='%23e5e7eb' opacity='0.3'%3E%3Cpath d='M10 10h15v10h-15z'/%3E%3Ccircle cx='50' cy='20' r='8'/%3E%3Cpath d='M70 15h10v15h-10z'/%3E%3Cpath d='M30 40h8v12h-8z'/%3E%3Ccircle cx='80' cy='50' r='6'/%3E%3Cpath d='M15 60h12v8h-12z'/%3E%3Ccircle cx='60' cy='70' r='7'/%3E%3Cpath d='M85 75h8v10h-8z'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23financial-pattern)'/%3E%3C/svg%3E')", backgroundSize: '100px 100px'} : {}}>
              <button onClick={() => changeFontSize('small')} className={`px-3 py-1 rounded ${fontSize === 'small' ? 'bg-rose-600 text-white' : darkMode ? 'bg-gray-600 text-white' : 'bg-white'}`}>Small</button>
              <button onClick={() => changeFontSize('medium')} className={`px-3 py-1 rounded ${fontSize === 'medium' ? 'bg-rose-600 text-white' : darkMode ? 'bg-gray-600 text-white' : 'bg-white'}`}>Medium</button>
              <button onClick={() => changeFontSize('large')} className={`px-3 py-1 rounded ${fontSize === 'large' ? 'bg-rose-600 text-white' : darkMode ? 'bg-gray-600 text-white' : 'bg-white'}`}>Large</button>
            </div>
            
            {/* Chat Messages */}
            <div className={`h-[500px] overflow-y-auto p-6 space-y-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className={`text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <p className="text-lg">Initializing conversation...</p>
                  </div>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} group`}>
                  <div className={`max-w-[75%] ${msg.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`px-4 py-3 rounded-2xl whitespace-pre-line shadow-md relative ${
                      msg.type === 'user' 
                        ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-br-none' 
                        : darkMode ? 'bg-gray-700 text-white rounded-bl-none border border-gray-600' : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                    }`}>
                      {msg.text}
                      <button 
                        onClick={() => copyToClipboard(msg.text)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 px-2 py-1 bg-black/20 rounded text-xs"
                      >
                        Copy
                      </button>
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1 px-2 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} px-4 py-3 rounded-2xl rounded-bl-none shadow-md border`}>
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className={`border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white bg-opacity-95'} p-4`} style={!darkMode ? {backgroundImage: "url('data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='financial-pattern' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cg fill='%23e5e7eb' opacity='0.3'%3E%3Cpath d='M10 10h15v10h-15z'/%3E%3Ccircle cx='50' cy='20' r='8'/%3E%3Cpath d='M70 15h10v15h-10z'/%3E%3Cpath d='M30 40h8v12h-8z'/%3E%3Ccircle cx='80' cy='50' r='6'/%3E%3Cpath d='M15 60h12v8h-12z'/%3E%3Ccircle cx='60' cy='70' r='7'/%3E%3Cpath d='M85 75h8v10h-8z'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23financial-pattern)'/%3E%3C/svg%3E')", backgroundSize: '100px 100px'} : {}}>
              {currentState !== 'CLOSED' ? (
                <div className="space-y-3">
                  {/* File Upload Section */}
                  {(currentState === 'SALARY_UPLOAD' || showFileUpload) && (
                    <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="file"
                        ref={imageInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleDocumentUpload}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                      />
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        className="flex-1 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 text-sm font-medium"
                      >
                        □ Upload Image
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
                      >
                        ■ Upload Document
                      </button>
                    </div>
                  )}
                  
                  {uploadedFile && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                      File uploaded: {uploadedFile.filename}
                    </div>
                  )}
                  
                  {/* Main Input */}
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={getPlaceholder()}
                      disabled={isLoading}
                      className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                    />
                    
                    {/* Voice Controls */}
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isLoading}
                      className={`px-4 py-3 rounded-xl font-semibold shadow-md transition-all ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      } disabled:opacity-50`}
                      title={isRecording ? 'Stop Recording' : 'Start Voice Input'}
                    >
                      {isRecording ? '■ Stop' : '● Mic'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={isSpeaking ? stopSpeaking : () => speakText(messages[messages.length - 1]?.text || '')}
                      disabled={isLoading || messages.length === 0}
                      className={`px-4 py-3 rounded-xl font-semibold shadow-md transition-all ${
                        isSpeaking 
                          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      } disabled:opacity-50`}
                      title={isSpeaking ? 'Stop Speaking' : 'Speak Last Message'}
                    >
                      {isSpeaking ? '■ Mute' : '▶ Speak'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowFileUpload(!showFileUpload)}
                      className="px-4 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow-md transition-all"
                      title="Toggle File Upload"
                    >
                      ≡ Files
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="bg-gradient-to-r from-rose-600 to-red-600 text-white px-8 py-3 rounded-xl hover:from-rose-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md"
                    >
                      {isLoading ? '⟳' : '→ Send'}
                    </button>
                  </form>
                </div>
              ) : (
                <button
                  onClick={resetChat}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-semibold shadow-md"
                >
                  ↻ Start New Application
                </button>
              )}
            </div>
          </div>

          {/* Voice & File Status */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white bg-opacity-95'} rounded-xl shadow-md p-4 mt-6`} style={!darkMode ? {backgroundImage: "url('data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='financial-pattern' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cg fill='%23e5e7eb' opacity='0.3'%3E%3Cpath d='M10 10h15v10h-15z'/%3E%3Ccircle cx='50' cy='20' r='8'/%3E%3Cpath d='M70 15h10v15h-10z'/%3E%3Cpath d='M30 40h8v12h-8z'/%3E%3Ccircle cx='80' cy='50' r='6'/%3E%3Cpath d='M15 60h12v8h-12z'/%3E%3Ccircle cx='60' cy='70' r='7'/%3E%3Cpath d='M85 75h8v10h-8z'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23financial-pattern)'/%3E%3C/svg%3E')", backgroundSize: '100px 100px'} : {}}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-rose-50 rounded-lg">
                <div className="text-2xl font-bold text-rose-600">{isRecording ? 'ON' : 'OFF'}</div>
                <div className="text-xs text-gray-600">Voice Input</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{isSpeaking ? 'ON' : 'OFF'}</div>
                <div className="text-xs text-gray-600">Text-to-Speech</div>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">{uploadedFile ? 'YES' : 'NO'}</div>
                <div className="text-xs text-gray-600">File Uploaded</div>
              </div>
              <div className="p-3 bg-rose-50 rounded-lg">
                <div className="text-2xl font-bold text-rose-600">{messages.length}</div>
                <div className="text-xs text-gray-600">Messages</div>
              </div>
            </div>
          </div>
          
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Demo Numbers */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white bg-opacity-95'} rounded-xl shadow-md p-4 border-l-4 border-rose-600`} style={!darkMode ? {backgroundImage: "url('data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='financial-pattern' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cg fill='%23e5e7eb' opacity='0.3'%3E%3Cpath d='M10 10h15v10h-15z'/%3E%3Ccircle cx='50' cy='20' r='8'/%3E%3Cpath d='M70 15h10v15h-10z'/%3E%3Cpath d='M30 40h8v12h-8z'/%3E%3Ccircle cx='80' cy='50' r='6'/%3E%3Cpath d='M15 60h12v8h-12z'/%3E%3Ccircle cx='60' cy='70' r='7'/%3E%3Cpath d='M85 75h8v10h-8z'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23financial-pattern)'/%3E%3C/svg%3E')", backgroundSize: '100px 100px'} : {}}>
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                Demo Numbers
              </h3>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                <div className={`font-mono ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-2 rounded`}>9876543210</div>
                <div className={`font-mono ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-2 rounded`}>8765432109</div>
                <div className={`font-mono ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-2 rounded`}>7654321098</div>
              </div>
            </div>

            {/* Features */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white bg-opacity-95'} rounded-xl shadow-md p-4 border-l-4 border-red-600`} style={!darkMode ? {backgroundImage: "url('data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='financial-pattern' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cg fill='%23e5e7eb' opacity='0.3'%3E%3Cpath d='M10 10h15v10h-15z'/%3E%3Ccircle cx='50' cy='20' r='8'/%3E%3Cpath d='M70 15h10v15h-10z'/%3E%3Cpath d='M30 40h8v12h-8z'/%3E%3Ccircle cx='80' cy='50' r='6'/%3E%3Cpath d='M15 60h12v8h-12z'/%3E%3Ccircle cx='60' cy='70' r='7'/%3E%3Cpath d='M85 75h8v10h-8z'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23financial-pattern)'/%3E%3C/svg%3E')", backgroundSize: '100px 100px'} : {}}>
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                Features
              </h3>
              <ul className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                <li>• Voice Assistant (Speech-to-Text)</li>
                <li>• Text-to-Speech</li>
                <li>• Image & File Upload</li>
                <li>• Dark Mode</li>
                <li>• Chat History & Export</li>
              </ul>
            </div>

            {/* Test Scenarios */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white bg-opacity-95'} rounded-xl shadow-md p-4 border-l-4 border-pink-600`} style={!darkMode ? {backgroundImage: "url('data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='financial-pattern' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cg fill='%23e5e7eb' opacity='0.3'%3E%3Cpath d='M10 10h15v10h-15z'/%3E%3Ccircle cx='50' cy='20' r='8'/%3E%3Cpath d='M70 15h10v15h-10z'/%3E%3Cpath d='M30 40h8v12h-8z'/%3E%3Ccircle cx='80' cy='50' r='6'/%3E%3Cpath d='M15 60h12v8h-12z'/%3E%3Ccircle cx='60' cy='70' r='7'/%3E%3Cpath d='M85 75h8v10h-8z'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23financial-pattern)'/%3E%3C/svg%3E')", backgroundSize: '100px 100px'} : {}}>
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                Test Scenarios
              </h3>
              <ul className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                <li>• Instant Approval</li>
                <li>• Salary Verification</li>
                <li>• Low Credit Reject</li>
                <li>• High Amount Reject</li>
              </ul>
            </div>
          </div>

          {/* Underwriting Rules */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white bg-opacity-95'} rounded-xl shadow-md p-6 mt-6`} style={!darkMode ? {backgroundImage: "url('data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='financial-pattern' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cg fill='%23e5e7eb' opacity='0.3'%3E%3Cpath d='M10 10h15v10h-15z'/%3E%3Ccircle cx='50' cy='20' r='8'/%3E%3Cpath d='M70 15h10v15h-10z'/%3E%3Cpath d='M30 40h8v12h-8z'/%3E%3Ccircle cx='80' cy='50' r='6'/%3E%3Cpath d='M15 60h12v8h-12z'/%3E%3Ccircle cx='60' cy='70' r='7'/%3E%3Cpath d='M85 75h8v10h-8z'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23financial-pattern)'/%3E%3C/svg%3E')", backgroundSize: '100px 100px'} : {}}>
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3 text-lg`}>
              Underwriting Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className={`${darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} p-3 rounded-lg border`}>
                <div className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-800'} mb-1`}>Rejection Rules</div>
                <ul className={`${darkMode ? 'text-red-300' : 'text-red-700'} space-y-1`}>
                  <li>• Credit Score &lt; 700</li>
                  <li>• Amount &gt; 2× Pre-approved Limit</li>
                  <li>• EMI &gt; 50% of Salary</li>
                </ul>
              </div>
              <div className={`${darkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} p-3 rounded-lg border`}>
                <div className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-800'} mb-1`}>Approval Rules</div>
                <ul className={`${darkMode ? 'text-green-300' : 'text-green-700'} space-y-1`}>
                  <li>• Credit Score ≥ 700</li>
                  <li>• Amount ≤ Pre-approved (Instant)</li>
                  <li>• Amount ≤ 2× Limit + Salary Check</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`text-center mt-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
            <p>Secure | Fast | Reliable</p>
            <p className="mt-1">Powered by Agentic AI | Tata Capital © 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
