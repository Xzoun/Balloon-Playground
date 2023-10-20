import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getRoomInfo, listenForGameRoomChanges } from '../../firebase/firebase'

import BoardView from '../../components/preguntatlon/boardView'
import { Loading } from '../../components/loading';
import ChatInGameView from '../../components/inGameChatRoom';

import { useThemeContext } from '../../context/ThemeContext';
import AuthProvider from '../../components/authProvider';
import preguntatlon from '../../img/preguntatlon.png'
import Alert from 'react-bootstrap/Alert';

import '../../css/game.css'

export default function PreguntatlonGameRoomView() {
    const navigate = useNavigate();

    const { contextTheme } = useThemeContext();
    const params = useParams();

    const [currentUser, setCurrentUser] = useState();
    const [players, setPlayers] = useState(2);
    const [loadedPlayers, setLoadedPlayers] = useState(1);
    const [sala, setSala] = useState("");
    const [state, setState] = useState("");
    const [reLoad, setReLoad] = useState(0);
    const [alert, setAlert] = useState(0);

    async function handleUserLoggedIn(user) {
        setCurrentUser(user);

        if (user.currentGame !== "") {
            const currentGameInfo = await getRoomInfo(user.currentGame);
            navigate("/" + currentGameInfo.game + "/" + user.currentGame);
        }

    };

    function handleUserNotRegistered(user) { navigate("/login") };
    function handleUserNotLoggedIn() { navigate("/login") };

    useEffect(() => {
        listenForGameRoomChanges(params.uid, (hasChanges) => {
            if (hasChanges) {
                setReLoad(prevCount => prevCount + 1);
            }
        });
    }, [params.uid]);

    useEffect(() => {
        async function getRoomSettings() {
            const uid = params.uid;

            setSala(uid);
            try {
                const roomInfo = await getRoomInfo(uid);

                setLoadedPlayers(roomInfo.playersSettings.playersIn.length);
                setPlayers(roomInfo.playersSettings.players);                

            } catch (error) {
                console.error(error);
            }
        }

        getRoomSettings();

    }, [reLoad,params.uid])

    useEffect(() => {

        if (loadedPlayers === players) {
            setState(2);
        } else {
            setState(6);
        }

    }, [loadedPlayers, players]);

    const handleCopy = () => {
        navigator.clipboard.writeText(sala);
        const delay = 1500;

        setTimeout(() => {
            setAlert(0)
        }, delay);
        setAlert(1);
    };

    if (state !== 2 && state !== 6) {
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
        <div className={`${contextTheme} pageOutOfNav`}>

            {state === 6 ? <>
                {(
                    <>
                        <div className="blockContainer" data-bs-theme="dark">
                            <h5 className="blockTittle">Código de la sala</h5>
                            <div className="copiarCodigo">
                                <h3 onClick={handleCopy}> {sala} </h3>
                                <p className="copiar">Copiar!</p>
                            </div>
                        </div>
                        <div className="blockContainer">
                            <h4 className='mt-3 mb-3 blockBody'>{`Jugadores ${loadedPlayers}/${players}`}</h4>
                        </div>
                        <div className="blockBody">
                            <div className={`${contextTheme} logoContInGame`}>
                                <img src={preguntatlon} className="logoInGame" alt="" />
                            </div>
                        </div>
                    </>
                )} </> : <BoardView user={currentUser} room={sala} />
            }

            <ChatInGameView user={currentUser} sala={sala} />
            {alert === 1 ? <>
                {[
                    'success'
                ].map((variant) => (
                    <Alert key={variant} variant={variant} className="alert">
                        Codigo Copiado</Alert>
                ))} </> : ""}

        </div>
    )
}