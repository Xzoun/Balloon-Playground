import React, { useState, useEffect } from 'react';
import { getChatsList, getProfilePicUrl, getUserInfo } from '../firebase/firebase'


export default function ChatsListView({ username, onChatSelect, hasNewMessage, hasNewChat }) {
    const [chatsList, setChatsList] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const chatsFull = await getChatsList(username.uid);

                const chats = await Promise.all(chatsFull.map(async (chat) => {
                    const { user1, user2, messages } = chat;
                    let user = {};

                    if (username.uid === user1.uid) {
                        user = user2;
                    } else {
                        user = user1;
                    }

                    const upDatedUser = await getUserInfo(user.uid);

                    const url = await getProfilePicUrl(user.profilePicture);

                    const ultimoMensaje = messages[messages.length - 1];

                    return {
                        key: upDatedUser,
                        url: url,
                        ultimoMensaje: ultimoMensaje
                    };
                }));

                setChatsList(chats);

            } catch (error) {
                console.error('Error fetching chat list:', error);
            }
        };

        fetchData();
    }, [onChatSelect, hasNewMessage, hasNewChat, username]);

    return (
        <div className="chatList">
            {chatsList.map((chat) => (
                <div key={chat.key.uid} className="chatSelect" onClick={() => onChatSelect(chat.key)}>
                    <img src={chat.url} className="fotoChatList" alt="User Profile" />
                    <div className="chatNameList">
                        <h5>{chat.key.username}</h5>
                        <p className="lastMessage">{chat.ultimoMensaje.message}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}