import AuthProvider from '../../components/authProvider';
import { Nav } from '../../components/nav'
import { Loading } from '../../components/loading';
import { useThemeContext } from '../../context/ThemeContext';
import GameSettings from '../../components/preguntatlon/createPreguntatlon';
import GamesRoomView from '../../components/preguntatlon/gamesRoom';
import { getRoomInfo } from '../../firebase/firebase'

import preguntatlon from '../../img/preguntatlon.png'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import '../../css/lobby.css'

export default function PreguntatlonLobbyView() {

    const { contextTheme } = useThemeContext();
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState({});
    const [state, setState] = useState(0);

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

    if (state !== 2) {
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
        <div className={`${contextTheme} general`}>
            <Nav />
            <div className="page">
                <div className={`${contextTheme}`}>

                    <div className={`${contextTheme} logoContLobby`}>
                        <img src={preguntatlon} className="logoGameDashBoard" alt="" />
                    </div>

                    <h5 className="blockTittle">Quiero poner las reglas</h5>

                    <div className="blockBody">
                        <>
                            {['Crear Sala'].map((placement, idx) => (
                                <GameSettings key={idx} user={currentUser} placement={placement} name={placement} />
                            ))}
                        </>
                    </div>

                    <div className="rooms">
                        <h5 className="blockTittle">Salas</h5>
                        <GamesRoomView user={currentUser} />
                    </div>
                </div>
            </div>
        </div>
    );
}