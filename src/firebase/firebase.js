import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage, uploadBytes, getDownloadURL, ref as storageRef } from "firebase/storage";
import { getDatabase, ref, push, get, set, update, onChildAdded, onChildChanged } from "firebase/database";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_APIKEY,
    authDomain: process.env.REACT_APP_AUTHDOMAIN,
    projectId: process.env.REACT_APP_PROJECTID,
    databaseURL: process.env.REACT_APP_DATABASEURL,
    storageBucket: process.env.REACT_APP_STORAGEBUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
    appId: process.env.REACT_APP_APPID,
    measurementId: process.env.REACT_APP_MEASUREMENTID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);
/* --------------------- Base de Datos --------------------- */

/* ----------- Usuario ----------- */

export async function existsUsername(username) {
    try {
        const userRef = ref(db, "users");
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const users = snapshot.val();
            for (const key in users) {
                if (users[key].username === username) {
                    return true;
                }
            }
        }
    } catch (error) {
        console.error('Error al verificar la existencia del nombre de usuario:', error);
        return false;
    }
}

export async function getUserData(username) {
    try {
        const userRef = ref(db, "users");
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const users = snapshot.val();
            for (const key in users) {
                if (users[key].username === username) {
                    return users[key];
                }
            }
        }
    } catch (error) {
        console.error('Error al verificar la existencia del nombre de usuario:', error);
        return null;
    }
}

export async function existsUid(uid) {
    try {
        const userRef = ref(db, "users");
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const users = snapshot.val();
            for (const key in users) {
                if (users[key].uid === uid) {
                    return true;
                }
            }
        }
    } catch (error) {
        console.error('Error al verificar la existencia del usuario:', error);
        return false;
    }
};

export async function getUserInfo(uid) {
    try {
        const userRef = ref(db, "users");
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const users = snapshot.val();
            for (const key in users) {
                if (users[key].uid === uid) {
                    return users[key];
                }
            }
        }
        return null;
    } catch (error) {
        console.error('Error al verificar la existencia del usuario:', error);
        return null;
    }
}


export async function createNewUser(userData) {
    try {
        const { uid, ...userDetails } = userData;
        userDetails.uid = uid;

        const db = getDatabase();
        const userRef = ref(db, `users/${uid}`);
        await set(userRef, userDetails);
    } catch (error) {
        console.error('Error al crear un nuevo usuario:', error);
    }
};

export async function upDateUser(userData) {
    try {
        const updatedUserData = {
            displayName: userData.displayName,
            email: userData.email,
            processCompleted: userData.processCompleted,
            profilePicture: "images/" + userData.uid,
            username: userData.username,
            state: userData.state,
            currentGame: userData.currentGame,
        };
        const userRef = ref(db, "users/" + userData.uid);
        await update(userRef, updatedUserData);
    } catch (error) {
        console.error('Error al actualizar los datos del usuario:', error);
    }
}

export async function logOut() {
    await auth.signOut();
}

/* ----------- Chats ----------- */
export async function createNewChat(usuario, usuario2) {
    const chatsRef = ref(db, 'chats');
    try {
        const snapshot = await get(chatsRef);

        if (snapshot.exists()) {
            const chats = snapshot.val();

            for (const chatId in chats) {
                const chat = chats[chatId];
                if (
                    (chat.user1.uid === usuario.uid && chat.user2.uid === usuario2.uid) ||
                    (chat.user1.uid === usuario2.uid && chat.user2.uid === usuario.uid)
                ) {
                    return false;
                }
            }
        }

        const newChatRef = push(chatsRef);
        const newChatId = newChatRef.key;

        await set(ref(db, `chats/${newChatId}`), {
            user1: usuario,
            user2: usuario2,
            messages: [{
                sender: { username: "Playground" },
                id: 0,
                message: 'Saluda! Di Hola.',
                timestamp: Date.now()
            }]
        });

        return newChatId;
    } catch (error) {
        console.error('Error creating new chat:', error);
        throw error;
    }
}

export const sendMessage = async (messageContent, user1, user2) => {
    const chatsRef = ref(db, 'chats');
    const matchingChats = [];

    try {
        const snapshot = await get(chatsRef);

        if (snapshot.exists()) {
            const chats = snapshot.val();

            for (const chatId in chats) {
                const chat = chats[chatId];
                if (
                    (chat.user1.uid === user1.uid && chat.user2.uid === user2.uid) ||
                    (chat.user1.uid === user2.uid && chat.user2.uid === user1.uid)

                ) {
                    const messagesRef = ref(db, `chats/${chatId}/messages`);

                    const newMessage = {
                        sender: user1,
                        id: chat.messages.length,
                        message: messageContent,
                        timestamp: Date.now(),
                    };

                    chat.messages.push(newMessage);
                    await set(messagesRef, chat.messages);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching chat list:', error);
        throw error;
    }
};

export async function loadChatMessages(user1, user2) {
    const chatsRef = ref(db, 'chats');

    try {
        const snapshot = await get(chatsRef);

        if (snapshot.exists()) {
            const chats = snapshot.val();

            for (const chatId in chats) {
                const chat = chats[chatId];
                if (
                    (chat.user1.uid === user1.uid && chat.user2.uid === user2.uid) ||
                    (chat.user1.uid === user2.uid && chat.user2.uid === user1.uid)

                ) {
                    return chat.messages;
                }
            }
        }
    } catch (error) {
        console.error('Error fetching chat list:', error);
        throw error;
    }
}

export async function getChatsList(uid) {
    const chatsRef = ref(db, 'chats');
    const matchingChats = [];

    try {
        const snapshot = await get(chatsRef);

        if (snapshot.exists()) {
            const chats = snapshot.val();

            for (const chatId in chats) {
                const chat = chats[chatId];
                if (uid === chat.user1.uid || uid === chat.user2.uid) {
                    matchingChats.push({ chatId, ...chat });
                }
            }
        }

        return matchingChats;
    } catch (error) {
        console.error('Error fetching chat list:', error);
        throw error;
    }
}

export async function listenForNewMessages(user, callback) {
    const chatsRef = ref(db, 'chats');

    try {
        const snapshot = await get(chatsRef);

        if (snapshot.exists()) {
            const chats = snapshot.val();

            for (const chatId in chats) {
                const chat = chats[chatId];

                if (chat.user1.uid === user.uid || chat.user2.uid === user.uid) {
                    const messagesRef = ref(db, `chats/${chatId}/messages`);

                    onChildAdded(messagesRef, () => {
                        callback(true, snapshot.val());
                    });

                }
            }
        }
    } catch (error) {
        console.error('Error fetching chat list:', error);
        throw error;
    }
}

export async function listenForChatNewChats(callback) {
    const chatsRef = ref(db, 'chats');

    try {
        onChildAdded(chatsRef, () => {
            callback(true);
        });
    } catch (error) {
        console.error('Error fetching chat list:', error);
        throw error;
    }
}
/* --------------------- Games --------------------- */
export async function createGameRoom(gameRoom) {
    const gameRoomRef = ref(db, 'gameRooms');
    try {
        const newGameRoomRef = push(gameRoomRef);

        await set(newGameRoomRef, gameRoom);

        return newGameRoomRef.key;
    } catch (error) {
        console.error('Error creating new chat:', error);
        throw error;
    }
}

export async function listenForGameListChanges(callback) {
    const chatsRef = ref(db, 'gameRooms');

    try {
        onChildAdded(chatsRef, () => {
            callback(true);
        });
    } catch (error) {
        console.error('Error fetching chat list:', error);
        throw error;
    }
}

/* --------------------- Preguntatlon --------------------- */

export async function listenForGameRoomChanges(uid, callback) {
    const chatsRef = ref(db, 'gameRooms', uid);

    try {
        onChildChanged(chatsRef, () => {
            callback(true);
        });
    } catch (error) {
        console.error('Error fetching chat list:', error);
        throw error;
    }
}

export async function getRoomInfo(uid) {
    const gameRoomRef = ref(db, `gameRooms/${uid}`);

    try {
        const snapshot = await get(gameRoomRef);
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting game room info:', error);
        throw error;
    }
}

export async function isRoomAvailable(uid) {
    const gameRoomRef = ref(db, `gameRooms/${uid}`);

    try {
        const snapshot = await get(gameRoomRef);
        if (snapshot.exists()) {
            const gameRoom = snapshot.val();
            const maxPlayers = gameRoom.playersSettings.players;
            const currentPlayers = gameRoom.playersSettings.playersIn.length;

            if (currentPlayers < maxPlayers && currentPlayers > 0) {
                return true;
            } else {
                return false;
            }
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting game room info:', error);
        throw error;
    }
}

export async function joinRoom(user, uid) {
    const gameRoomRef = ref(db, `gameRooms/${uid}`);

    const player = {
        uid: user.uid,
        username: user.username,
        trofies: 0,
        correct: 0,
        profilePicture: user.profilePicture,
        wrong: 0,
        active: true
    };

    try {
        const snapshot = await get(gameRoomRef);
        if (snapshot.exists()) {
            const gameRoom = snapshot.val();
            const maxPlayers = gameRoom.playersSettings.players;
            const currentPlayers = gameRoom.playersSettings.playersIn;

            if (currentPlayers.length < maxPlayers) {

                const updatedPlayers = [...currentPlayers, player];

                await update(gameRoomRef, {
                    playersSettings: {
                        ...gameRoom.playersSettings,
                        playersIn: updatedPlayers
                    }
                });

                return true;
            } else {
                return false;
            }
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting game room info:', error);
        throw error;
    }
}

export async function getAllRooms() {
    const gameRoomRef = ref(db, 'gameRooms');

    try {
        const snapshot = await get(gameRoomRef);

        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return null;
        }

    } catch (error) {
        console.error('Error getting game room info:', error);
        throw error;
    }
}

export async function editRoomInfo(uid, gameRoom) {
    const gameRoomRef = ref(db, `gameRooms/${uid}`);

    try {
        const snapshot = await get(gameRoomRef);
        if (snapshot.exists()) {

            await set(gameRoomRef, gameRoom);

        } else {
            throw new Error('Game room not found.');
        }

    } catch (error) {
        console.error('Error updating game room info:', error);
        throw error;
    }
}

export async function getQuestion(question) {
    const category = question[0];
    const subCategory = question[1];
    const questionId = question[2];

    const questionRef = ref(db, `questions/${category}/${subCategory}/preguntas/${questionId}`);
    try {
        const snapshot = await get(questionRef);
        if (snapshot.exists()) {
            return snapshot.val();

        } else {
            throw new Error('No existe esa pregunta!');
        }
    } catch (error) {
        console.error('Error getting teh question', error);
        throw error;
    }
}

export async function getOptions(question) {
    const category = question[0];
    const subCategory = question[1];
    const questionId = question[2];

    const questionRef = ref(db, `questions/${category}/${subCategory}/respuestas/${questionId}`);

    try {
        const snapshot = await get(questionRef);
        if (snapshot.exists()) {
            return snapshot.val();

        } else {
            throw new Error('No existe esa pregunta!');
        }
    } catch (error) {
        console.error('Error getting teh question', error);
        throw error;
    }
}

export async function currentQuestion(uid, question, getInfo = false) {
    const questionRef = ref(db, `gameRooms/board/${uid}/questions`);

    try {
        const snapshot = await get(questionRef);
        if (snapshot.exists()) {
            if (getInfo) {
                return snapshot.val();
            } else {
                await update(questionRef, question);
            }
        } else {
            await set(questionRef, question);
        }
    } catch (error) {
        console.error('Error updating/creating game room question:', error);
        throw error;
    }
}

export async function listenForNewQuestion(uid, callback) {
    const questionRef = ref(db, `gameRooms/board/${uid}/questions`);

    try {
        onChildAdded(questionRef, () => {
            callback(true);
        });
        onChildChanged(questionRef, () => {
            callback(true);
        });
    } catch (error) {
        console.error('Error updating/creating game room question:', error);
        throw error;
    }
}

export async function currentBoardState(uid, state, getInfo = false) {
    const stateRef = ref(db, `gameRooms/board/${uid}/state`);

    try {
        const snapshot = await get(stateRef);
        if (snapshot.exists()) {
            if (getInfo) {
                return snapshot.val();
            } else {
                await update(stateRef, state);
            }
        } else {
            await set(stateRef, state);
        }
    } catch (error) {
        console.error('Error updating/creating stateRoom question:', error);
        throw error;
    }
}

export async function listenForBoardState(uid, callback) {
    const stateRef = ref(db, `gameRooms/board/${uid}/state`);

    try {
        onChildAdded(stateRef, () => {
            callback(true);
        });
        onChildChanged(stateRef, () => {
            callback(true);
        });
    } catch (error) {
        console.error('Error updating/creating stateRoom question:', error);
        throw error;
    }
}

/* --------------------- Storage --------------------- */

export async function setUserProfilePic(uid, file) {
    try {
        const imageRef = storageRef(storage, "images/" + uid);
        const resUpload = await uploadBytes(imageRef, file);
        return resUpload;
    } catch (error) {
        console.error(error);
    }
}

export async function getProfilePicUrl(path) {
    if (path !== undefined && path !== "") {
        try {
            const imageRef = storageRef(storage, path);
            const url = await getDownloadURL(imageRef);
            return url;
        } catch (error) {
            console.error(error);
        }
    }
}
