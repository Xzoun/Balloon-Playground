import React, { useState, useEffect, useRef } from 'react';
import { editRoomInfo, getRoomInfo, listenForGameRoomChanges } from '../firebase/firebase'

import { useThemeContext } from '../context/ThemeContext';
import Form from 'react-bootstrap/Form';
import chat from '../img/message.png';
export default function ChatInGameView({ user, sala }) {

    const { contextTheme } = useThemeContext();
    const [state, setState] = useState(0);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messegesDiv = useRef(null);
    const [room, setRoom] = useState({});
    const [reLoad, setReLoad] = useState(0);

    const handleSendMessage = async () => {

        if (newMessage.trim() !== '') {

            const messageObj = {
                id: Date.now(),
                sender: user,
                message: newMessage
            };

            const updatedGame = {
                ...room,
                messeges: { ...room.messeges, [Date.now()]: messageObj }
            };

            await editRoomInfo(sala, updatedGame);

            setNewMessage('');
        }

    };

    function handleToggleChat() {
        if (state === 0) {
            setState(1);
        } else if (state === 1) {
            setState(0);
        }
    }

    const handleNewMessageChange = event => {
        setNewMessage(event.target.value);
    };

    const handleKeyUp = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendMessage();
        }
    };

    useEffect(() => {
        listenForGameRoomChanges(sala, (hasChanges) => {
            if (hasChanges) {
                setReLoad(prevCount => prevCount + 1);
            }
        });
    }, [sala]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getRoomInfo(sala);
                if (data !== null) {
                    setRoom(data);

                    const messageArray = Object.values(data.messeges || {});

                    setMessages(messageArray);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, [reLoad, sala]);

    useEffect(() => {

        if (messegesDiv.current) {
            messegesDiv.current.scrollTop = messegesDiv.current.scrollHeight;
        }

    }, [messages, state]);

    return (
        <div className={`chatWindowMiniFixed`}>
            {state === 1 ? <>
                <div className="chatWindowMini">
                    <div ref={messegesDiv} className="messagesMiniChat">
                        <ol>
                            {messages.map((messageX) => (
                                <div className="messageChatDiv" key={messageX.id}>
                                    <p>{messageX.sender.username}:</p>
                                    <p className="message">{messageX.message}</p>
                                </div>
                            ))}
                        </ol>
                    </div>
                </div>
            </> : ("")}
            <div className="nuevoMensajeMiniChat">
                <img className="chatLogo" src={chat} alt="" onClick={handleToggleChat} />
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
    )
}