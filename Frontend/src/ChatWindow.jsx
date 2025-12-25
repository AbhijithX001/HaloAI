import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
    const {
        prompt, setPrompt, 
        reply, setReply, 
        currThreadId, 
        setPrevChats, 
        setNewChat,
        darkMode, setDarkMode,
        sidebarOpen, setSidebarOpen
    } = useContext(MyContext);
    
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState(null);
    const [charCount, setCharCount] = useState(0);

    const getReply = async () => {
        if (!prompt.trim()) return;
        
        setLoading(true);
        setNewChat(false);
        setError(null);

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: prompt,
                threadId: currThreadId
            })
        };

        try {
            const response = await fetch("http://localhost:8080/api/chat", options);
            
            if (!response.ok) {
                throw new Error('Failed to get response from server');
            }
            
            const res = await response.json();
            setReply(res.reply);
        } catch(err) {
            console.error("Error:", err);
            setError("Failed to get response. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    }

    // Append new chat to prevChats
    useEffect(() => {
        if(prompt && reply) {
            setPrevChats(prevChats => (
                [...prevChats, {
                    role: "user",
                    content: prompt
                },{
                    role: "assistant",
                    content: reply
                }]
            ));
            setCharCount(0);
        }
        setPrompt("");
    }, [reply]);

    // Update character count
    useEffect(() => {
        setCharCount(prompt.length);
    }, [prompt]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isOpen && !e.target.closest('.userIconDiv') && !e.target.closest('.dropDown')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    }

    const toggleTheme = () => {
        setDarkMode(!darkMode);
        setIsOpen(false);
    }

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            getReply();
        }
    }

    return (
        <div className="chatWindow">
            <div className="navbar">
                <div className="navLeft">
                    <button className="menuBtn" onClick={toggleSidebar}>
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <span className="appTitle">
                        <i className="fa-solid fa-circle-dot"></i> Halo AI
                    </span>
                </div>
                
                <div className="navRight">
                    <button className="themeToggle" onClick={toggleTheme} title="Toggle theme">
                        <i className={`fa-solid fa-${darkMode ? 'sun' : 'moon'}`}></i>
                    </button>
                    <div className="userIconDiv" onClick={handleProfileClick}>
                        <span className="userIcon">
                            <i className="fa-solid fa-user"></i>
                        </span>
                    </div>
                </div>
            </div>

            {isOpen && 
                <div className="dropDown">
                    <div className="dropDownItem" onClick={toggleTheme}>
                        <i className={`fa-solid fa-${darkMode ? 'sun' : 'moon'}`}></i> 
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </div>
                    <div className="dropDownItem">
                        <i className="fa-solid fa-gear"></i> Settings
                    </div>
                    <div className="dropDownItem">
                        <i className="fa-solid fa-circle-info"></i> About
                    </div>
                </div>
            }

            <Chat />

            {loading && (
                <div className="loadingContainer">
                    <ScaleLoader color={darkMode ? "#6366f1" : "#4f46e5"} loading={loading} />
                    <p className="loadingText">Thinking...</p>
                </div>
            )}

            {error && (
                <div className="errorMessage">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            )}
            
            <div className="chatInput">
                <div className="inputBox">
                    <textarea 
                        placeholder="Ask me anything..." 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyPress}
                        rows="1"
                        disabled={loading}
                    />
                    <div className="inputActions">
                        {charCount > 0 && (
                            <span className="charCount">{charCount}</span>
                        )}
                        <button 
                            id="submit" 
                            onClick={getReply}
                            disabled={loading || !prompt.trim()}
                            title="Send message"
                        >
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
                <p className="info">
                    <i className="fa-solid fa-shield-halved"></i>
                    Halo AI may produce inaccurate information. Verify important details.
                </p>
            </div>
        </div>
    )
}

export default ChatWindow;