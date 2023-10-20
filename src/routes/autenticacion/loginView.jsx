import { useState } from 'react';
import { auth } from '../../firebase/firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import AuthProvider from '../../components/authProvider';
import { Loading } from '../../components/loading';
import { useThemeContext } from '../../context/ThemeContext';
import '../../css/registro.css';

import googleLogo from '../../img/googleLogo.png';
import LeBenitez from '../../img/LeBenitez.png';
import logo from '../../img/logo.png';

export default function LoginView() {
    const { contextTheme } = useThemeContext();
    const navigate = useNavigate();
    const [currentUSer, setCurrentUser] = useState(null);

    /*  --- 0: Inicializado --- 1: Loading --- 2: Login Completo 
    --- 3: Login pero Sin Registro --- 4: no hay nadie logeado 
    --- 5: Usuario duplicado --- 6: Registro Exitoso!*/

    const [state, setCurrentState] = useState(0);
    
    async function handleOnClick() {
        const googleProvider = new GoogleAuthProvider();
        await signInWithGoogle(googleProvider);

        async function signInWithGoogle(googleProvider) {
            try {
                const res = await signInWithPopup(auth, googleProvider);
            } catch (error) {
                console.error(error);
            }
        }
    };

    function handleUserLoggedIn(user) { navigate("/games") };
    function handleUserNotRegistered(user) { navigate("/createProfile") };
    function handleUserNotLoggedIn() { setCurrentState(4) };

    if (state === 4) {

        return (
            <div className={`${contextTheme} autenticar`}>
                <h2 className="headLine">Bienvenido</h2>
                <div className="onlyOption mt-5 mb-5">
                    <h4 className="mb-2 mt-5">Debes autenticarte para continuar</h4>
                    <button className={`${contextTheme} mb-5 mt-2 generalButtons`} onClick={handleOnClick}>Loggin With Google</button>
                </div>
                <div className="mt-5 logosCont" >
                    <div className="logoAuth"><img className="logoAuth" src={googleLogo} alt="App Logo" /> </div>
                    <div className="logoAuth"><img className="logoAuth" src={LeBenitez} alt="Leo Logo" /></div>
                    <div className="logoAuth"><img className="logoAuth" src={logo} alt="Google Logo" /></div>
                </div>
            </ div>
        )
    }

    return (
        <AuthProvider
            onUserLoggedIn={handleUserLoggedIn}
            onUserNotRegistered={handleUserNotRegistered}
            onUserNotLoggedIn={handleUserNotLoggedIn}>
            <Loading></Loading>
        </AuthProvider>

    )


}