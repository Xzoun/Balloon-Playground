import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import AuthProvider from './authProvider';
import { Loading } from './loading';
import '../css/opening.css';
import { useThemeContext } from '../context/ThemeContext';

const OpeningComponent = () => {
    const navigate = useNavigate();

    const { contextTheme } = useThemeContext();
    const [state, setState] = useState(0);

    function handleUserLoggedIn(user) { navigate("/games") };
    function handleUserNotRegistered(user) { navigate("/login") };
    function handleUserNotLoggedIn() { navigate("/login") };


    useEffect(() => {

        const delay2 = 2000;
        const delay3 = 4500;
        const delay = 8000;

        const timer2 = setTimeout(() => {
            setState(1)
        }, delay2);

        const timer3 = setTimeout(() => {
            setState(2)
        }, delay3);

        const timer = setTimeout(() => {
            setState(3)
        }, delay);

        return () => {
            clearTimeout(timer);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    if (state === 0) {
        return (
            <div className={`${contextTheme} flexOpening`}>
                <div className='logoAppFlex'>
                    <div className="logoContainer">
                        <div className="logoImageEffect"></div>
                    </div>
                    <h3 className="center hidden">Balloon Playground</h3>
                </div>
            </div>
        )
    }

    if (state === 1) {
        return (
            <div className={`${contextTheme} flexOpening`}>
                <div className="logoAppFlex">
                    <div className="logoContainer">
                        <div className="logoImage"></div>
                    </div>
                    <h3 className="center fadeIn">Balloon Playground</h3>
                </div>

                <div className="leoLogoContainer fadeIn hidden" >
                    <div className="leoLogo"></div>
                </div>
            </div>
        )
    }

    if (state === 2) {
        return (
            <div className={`${contextTheme} flexOpening`}>

                <div className="logoAppFlex">
                    <div className="logoContainer">
                        <div className="logoImage"></div>
                    </div>
                    <h3 className="center fadeIn">Balloon Playground</h3>
                </div>
                <div className="leoLogoContainer" >
                    <div className="leoLogo fadeIn"></div>
                </div>
            </div>
        )
    }

    if (state === 3) {
        return (
            <AuthProvider onUserLoggedIn={handleUserLoggedIn}
                onUserNotRegistered={handleUserNotRegistered}
                onUserNotLoggedIn={handleUserNotLoggedIn}>
                <Loading></Loading>
            </AuthProvider >
        )
    };
}
export default OpeningComponent;