import AuthProvider from '../components/authProvider';
import { Nav } from '../components/nav'
import { Loading } from '../components/loading';
import { useThemeContext } from '../context/ThemeContext'

import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { getRoomInfo, joinRoom, isRoomAvailable, upDateUser } from '../firebase/firebase';
import preguntatlon from '../img/preguntatlon.png'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import '../css/dashBoard.css';

export default function DashBoardView() {
    const { contextTheme } = useThemeContext();
    const navigate = useNavigate();

    const [currentUSer, setCurrentUser] = useState({});
    const [state, setState] = useState(0);
    const [sala, setSala] = useState("");

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

    function handleInputSala(e) {
        const inputValue = e.target.value;
        const cleanedValue = inputValue.replace(/(\r\n|\n|\r| )/gm, '');
        setSala(cleanedValue);
    }

    async function handleIngresarASala() {
        try {
            const roomState = await isRoomAvailable(sala);
            if (roomState) {
                await joinRoom(currentUSer, sala);
                const salaInfo = await getRoomInfo(sala);

                const tmp = { ...currentUSer };
                tmp.currentGame = sala;

                await upDateUser(tmp);

                navigate("/" + salaInfo.game + "/" + sala);
            } else {
                const delay = 1500;
                if (roomState === null) {

                    setTimeout(() => {
                        setState(2)
                    }, delay);

                    setState(6);
                } else {

                    setTimeout(() => {
                        setState(2)
                    }, delay);

                    setState(7);
                }
            }
        } catch (error) {
            console.error(error);
        }

    }

    function handlePreguntatlon() {
        navigate("/preguntatlon")
    }

    const handleKeyUp = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleIngresarASala();
        }
    };

    if (state !== 2 && state !== 7 && state !== 6) {
        return (
            <AuthProvider
                onUserLoggedIn={handleUserLoggedIn}
                onUserNotRegistered={handleUserNotRegistered}
                onUserNotLoggedIn={handleUserNotLoggedIn}>
                <Loading></Loading>
            </AuthProvider>
        )
    }

    return (
        <div className={`${contextTheme} general`}>
            <Nav></Nav>
            <div className="page">

                <div className="blockContainer">
                    <h5 className="blockTittle">Me invitaron!</h5>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <div className="blockBody">
                            <Form.Control type="text" className="inputDashBoard" placeholder="Codigo de sala" onKeyUp={handleKeyUp} onChange={handleInputSala} />
                            <button className={`${contextTheme} generalButtons`} onClick={handleIngresarASala}>Ingresar</button>
                        </div>
                    </Form.Group>
                </div>

                <div className="blockContainer">
                    <h5 className="blockTittle">Preguntatlón ¿? ¡!</h5>

                    <div className="games" onClick={handlePreguntatlon}>
                        <div className="logGameContDashBoard">
                            <img className="logoGameDashBoard" src={preguntatlon} alt="" />
                        </div>
                        <p className="gameDescription">En Preguntatlón los participantes se enfrentarán a preguntas en campos que
                            abarcan desde ciencias y literatura hasta gaming y cultura pop. Los equipos
                            competirán en un frenético sprint de sabiduría, respondiendo preguntas y
                            resolviendo acertijos para avanzar en el camino hacia la victoria.</p>
                    </div>
                </div>

                <div className="blockContainer" >
                    <h5 className="blockTittle">Ta Te Ti</h5>

                    <div className="games">
                        <p className="gameDescription">Revive la emoción del clásico juego "Tres en línea" en una experiencia como
                            ninguna otra. Juega contra amigos y jugadores de todo el mundo en partidas
                            rápidas y estratégicas. ¡Coloca tus fichas, planea tu estrategia y busca la
                            victoria en este emocionante juego de lógica! ¿Tienes lo necesario para conseguir
                            la victoria?</p>
                        <button className={`${contextTheme} generalButtons`}>Crear Sala</button>
                    </div>
                </div>

            </div>
            {state === 7 ? <>
                {[
                    'danger'
                ].map((variant) => (
                    <Alert key={variant} variant={variant} className="alert">
                        Lo sentimos, la sala esta llena. </Alert>
                ))}
            </> : ""}
            {state === 6 ? <>
                {[
                    'danger'
                ].map((variant) => (
                    <Alert key={variant} variant={variant} className="alert">
                        Ingrese un código de sala válido. </Alert>
                ))}
            </> : ""}
        </div>
    );
}