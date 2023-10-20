import { useState } from 'react';
import { getRoomInfo, existsUsername, getProfilePicUrl } from '../firebase/firebase'

import { useNavigate } from 'react-router-dom';

import AuthProvider from '../components/authProvider';
import { Loading } from '../components/loading';
import { Nav } from '../components/nav'
import { useThemeContext } from '../context/ThemeContext';

import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

export default function ProfileView() {
    const navigate = useNavigate();
    const { contextTheme } = useThemeContext();

    const [currentUser, setCurrentUser] = useState({});
    const [state, setState] = useState(0);
    const [username, setUsername] = useState("");
    const [profilePicUrl, setProfilePicUrl] = useState("");

    async function handleUserLoggedIn(user) {
        setCurrentUser(user);
        setState(2);

        if (user.currentGame !== "") {
            const currentGameInfo = await getRoomInfo(user.currentGame);
            navigate("/" + currentGameInfo.game + "/" + user.currentGame);
        }

        const url = await getProfilePicUrl(user.profilePicture);
        setProfilePicUrl(url);
    };

    function handleUserNotRegistered(user) { navigate("/login") };
    function handleUserNotLoggedIn() { navigate("/login") };


    function handleInputUsername(e) {
        setUsername(e.target.value);
    }

    const handleKeyUp = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            hanldeSearchUser();
        }
    };

    async function hanldeSearchUser() {

        const delay = 2000;

        if (username !== "") {
            const exists = await existsUsername(username);
            if (exists) {
                navigate(`/u/${username}`);
            } else {
                setState(5);
                setTimeout(() => {
                    setState(2);
                }, delay);
            }
        }
    }

    if (state !== 2 && state !== 5) {
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
                    <h5 className="blockTittle">Explorar perfiles</h5>
                    <div className="blockBody">
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <div className="cargarUsername">
                                <Form.Control type="text" placeholder="Usuario" onKeyUp={handleKeyUp} onChange={handleInputUsername} />
                                <button className={`${contextTheme} generalButtons`} onClick={hanldeSearchUser}>Buscar</button>
                            </div>
                        </Form.Group>
                    </div>
                </div>
                <div className="blockContainer">
                    <h5 className="blockTittle">Usuario</h5>
                    <div className="profilePicCont">
                        <img className="profilePic mb-3" src={profilePicUrl} alt="" />
                        <div className="profileInfoCont">
                            <h5>{currentUser.username}</h5>
                            <h5>{currentUser.email}</h5>
                        </div>
                    </div>
                    <h5 className="blockBody">{currentUser.state}</h5>
                </div>
                <div className="blockContainer">
                    <h5 className="blockBody"> Título : {currentUser.stats.tittle}</h5>
                </div>
                <div className="blockContainer">
                    <div className="blockBody">
                        <div>
                            <h5>Victorias</h5>
                            <h5>{currentUser.stats.wins}</h5>
                        </div>
                        <div>
                            <h5>Derrotas</h5>
                            <h5>{currentUser.stats.defeats}</h5>
                        </div>
                    </div>
                </div>
                <div className="blockContainer">
                    <h5 className="blockBody"> Trofeos</h5>
                    <h5>{currentUser.stats.trofies}</h5>
                </div>
                <div className="blockContainer">
                    <h5 className="blockBody"> Logros</h5>
                    <h5>{currentUser.stats.achievments}</h5>
                </div>

                {state === 5 ? <>
                    {[
                        'danger'
                    ].map((variant) => (
                        <Alert key={variant} variant={variant} className="alert">
                            Usuario no encontrado. Intentalo otra vez!</Alert>
                    ))} </> : ""}

            </div>

        </div>
    )
}