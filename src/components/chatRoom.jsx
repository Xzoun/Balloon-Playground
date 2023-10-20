import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, loadChatMessages, getUserInfo } from '../firebase/firebase'

import { useThemeContext } from '../context/ThemeContext';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';


export default function ChatRoomView({ username, selectedChat, hasNewMessage }) {
    const navigate = useNavigate();

    const { contextTheme } = useThemeContext();
    const [state, setState] = useState(0);
    const [messages, setMessages] = useState([]);
    const [user2Usernanme, setUser2Username] = useState("");
    const [newMessage, setNewMessage] = useState('');
    const messegesDiv = useRef(null);
    const handleSendMessage = async () => {

        if (newMessage.trim() !== '') {

            await sendMessage(newMessage, username, selectedChat);

            setNewMessage('');
        }

    };

    const handleNewMessageChange = event => {
        setNewMessage(event.target.value);
    };

    const handleKeyUp = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendMessage();
        }
    };

    function handleViewProfile() {
        navigate(`/u/${selectedChat.username} `)
    }

    useEffect(() => {
        const fetchData = async () => {

            if (selectedChat !== null) {
                setState(1);

                try {
                    const data = await loadChatMessages(username, selectedChat);
                    const updatedUser = await getUserInfo(selectedChat.uid);
                    setMessages(data);
                    setUser2Username(updatedUser.username);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
        }

        fetchData();
    }, [username, selectedChat, hasNewMessage]);

    useEffect(() => {

        if (messegesDiv.current) {
            messegesDiv.current.scrollTop = messegesDiv.current.scrollHeight;
        }

    }, [messages]);

    if (state === 0) {
        return (
            <div className={`${contextTheme} chatRoom`}>
                <h5 className="chatName">Chat Room</h5>
                <div className="chatWindow">
                    <div className="messages">
                        <ol>
                            <div className="messageChatDiv" >
                                <p>Playgroud:</p>
                                <p>Crea o selecciona un chat para conversar con alguien!</p>
                            </div>
                        </ol>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`${contextTheme} chatRoom`}>
            <div className="chatName">
                <button className={`${contextTheme} buttonNotButton`} onClick={handleViewProfile}>
                    <h5 >{user2Usernanme}</h5></button>
            </div>
            <div className="chatWindow">
                <div ref={messegesDiv} className="messages">
                    <ol>
                        {messages.length < 2 ? (
                            messages.map((messageX) => (
                                <div className="messageChatDiv" key={messageX.id}>
                                    <p>{messageX.sender.username}:</p>
                                    <p className="message">{messageX.message}</p>
                                </div>
                            ))
                        ) : (
                            messages.slice(1).map((messageX) => (
                                <div className="messageChatDiv" key={messageX.id}>
                                    <p>{messageX.sender.username}:</p>
                                    <p className="message">{messageX.message}</p>
                                </div>
                            ))
                        )}
                    </ol>
                </div>
                <div className="nuevoMensaje">
                    <Form.Control className="input inputChat"
                        type="text"
                        value={newMessage}
                        onChange={handleNewMessageChange}
                        placeholder="Type your message..."
                        onKeyUp={handleKeyUp}
                    />
                    <button className={`${contextTheme} generalButtons`} onClick={handleSendMessage}>Send</button>
                </div>
            </div>
        </div>
    )
}