import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { upDateUser, getAllRooms, listenForGameListChanges, isRoomAvailable, getRoomInfo, joinRoom } from '../../firebase/firebase'

import Alert from 'react-bootstrap/Alert';


export default function GamesRoomView({ user }) {
    const navigate = useNavigate();
    const [gameRooms, setGameRooms] = useState([]);
    const [reLoad, setReLoad] = useState(0);
    const [state, setState] = useState(2);

    useEffect(() => {
        listenForGameListChanges((hasChanges) => {
            if (hasChanges) {
                setReLoad(prevCount => prevCount + 1);
            }
        });

    }, []);

    useEffect(() => {
        const gameRoomsOn = async () => {
            try {
                const allGameRooms = await getAllRooms();
                const gameRoomsInfo = [];

                if (allGameRooms !== null) {
                    let roomNumber = 0;
                    for (const roomId in allGameRooms) {
                        const gameRoom = allGameRooms[roomId];
                        roomNumber++;
                        if (await isRoomAvailable(roomId)) {
                            if (gameRoom.game === "preguntatlon" && gameRoom.publicRoom) {   

                                const gameRoomInfo = {
                                    uid: roomId,
                                    categories: gameRoom.preferences.categories,
                                    players: gameRoom.playersSettings.players,
                                    sala: roomNumber,
                                    playersIn: gameRoom.playersSettings.playersIn.length
                                }
                                
                                gameRoomsInfo.push(gameRoomInfo);
                            }
                        }
                    }
                    setGameRooms(gameRoomsInfo);
                }

            } catch (error) {
                console.error('Error fetching game rooms:', error);
            }
        };

        gameRoomsOn();
    }, [reLoad]);

    async function handleJoin(sala) {
        try {
            const roomState = await isRoomAvailable(sala);
            if (roomState) {
                await joinRoom(user, sala);
                const salaInfo = await getRoomInfo(sala);

                const tmp = { ...user };
                tmp.currentGame = sala;

                await upDateUser(tmp);

                navigate("/" + salaInfo.game + "/" + sala);
            } else {
                const delay = 1500;
                
                setTimeout(() => {
                    setState(2)
                }, delay);

                setState(7);
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            {gameRooms.map((gameRoom) => (
                <div key={gameRoom.uid} className="salaName" onClick={() => handleJoin(gameRoom.uid)}>

                    <h4>{`Sala ${gameRoom.sala}`}</h4>
                    <h5>{`${gameRoom.categories} Categorías`}</h5>
                    <p>{`${gameRoom.playersIn}/${gameRoom.players} Jugadores`}</p>

                </div>
            ))}
            {state === 7 ? <>
                {[
                    'danger'
                ].map((variant) => (
                    <Alert key={variant} variant={variant} className="alert">
                        Lo sentimos, la sala esta llena. </Alert>
                ))}
            </> : ""}
        </>
    )
}