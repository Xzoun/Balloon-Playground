import { useState, useEffect } from 'react';
import { getUserData, existsUsername, createNewChat, listenForNewMessages, listenForChatNewChats, getRoomInfo } from '../firebase/firebase'
import { useNavigate } from 'react-router-dom';

import AuthProvider from '../components/authProvider';
import { Loading } from '../components/loading';
import { Nav } from '../components/nav'
import ChatRoomView from '../components/chatRoom'
import { useThemeContext } from '../context/ThemeContext';
import ChatsListView from '../components/chatsList'
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

import '../css/inbox.css';

export default function InboxView() {
    const navigate = useNavigate();
    const { contextTheme } = useThemeContext();
    const [currentUser, setCurrentUser] = useState({});
    const [state, setState] = useState(0);

    const [username, setUsername] = useState("");
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState(0);
    const [newChat, setNewChat] = useState(0);

    async function handleUserLoggedIn(user) {   
        setCurrentUser(user);
        setState(2);

        if (user.currentGame !== "") {
            const currentGameInfo = await getRoomInfo(user.currentGame);
            navigate("/" + currentGameInfo.game + "/" + user.currentGame);
        }
        
    };
    function handleUserNotRegistered(user) { navigate("/login") };
    function handleUserNotLoggedIn() { navigate("/login") };

    function handleInputUsername(e) {
        setUsername(e.target.value);
        /* Logica de filtro de chats*/
    }

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        setUsername("");
    };

    async function handleBuscar() {
        const delay = 2000;
        if (username !== "") {
            const exists = await existsUsername(username);
            if (exists) {
                if (username !== currentUser.username) {
                    const user2Data = await getUserData(username);
                    await createNewChat(currentUser, user2Data);
                    setSelectedChat(user2Data);

                }
            } else {
                setState(5);
                setTimeout(() => {
                    setState(2)
                }, delay);
            }
        }
    }

    const handleKeyUp = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleBuscar();
        }
    };

    useEffect(() => {
        listenForChatNewChats((hasChanges) => {
            if (hasChanges) {
                setNewChat(prevCount => prevCount + 1);
            }
        });

    }, []);

    useEffect(() => {
        listenForNewMessages(currentUser, (hasChanges) => {
            if (hasChanges) {
                setNewMessage(prevCount => prevCount + 1);
            }
        });
    }, [newChat, currentUser])

    if (state !== 2 && state !== 5) {
        return (
            <AuthProvider
                onUserLoggedIn={handleUserLoggedIn}
                onUserNotRegistered={handleUserNotRegistered}
                onUserNotLoggedIn={handleUserNotLoggedIn}>
                <Loading />
            </AuthProvider>
        )
    }

    return (
        <div className={`${contextTheme} general`} id="inboxView">

            <Nav></Nav>
            <div className="page">

                <div className='inbox'>
                    <div>
                        <div className="contCreateChat">
                            <Form.Control className="inputCreateChat"
                                type="text" placeholder="Usuario"
                                onKeyUp={handleKeyUp}
                                value={username}
                                onChange={handleInputUsername} />
                            <button className={`${contextTheme} generalButtons`} onClick={handleBuscar}>Crear Chat</button>
                        </div>

                        <ChatsListView username={currentUser}
                            onChatSelect={handleChatSelect}
                            hasNewMessage={newMessage}
                            hasNewChat={newChat} />
                    </div>
                    <ChatRoomView username={currentUser}
                        selectedChat={selectedChat}
                        hasNewMessage={newMessage} />
                </div>

                {state === 5 ? <>
                    {[
                        'danger'
                    ].map((variant) => (
                        <Alert key={variant} variant={variant} className="alert">
                            Usuario no encontrado!</Alert>
                    ))} </> : ""}

            </div>

        </div>
    )
}