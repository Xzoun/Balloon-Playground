import { useEffect } from 'react';
import { auth, existsUid, getUserInfo, createNewUser } from '../firebase/firebase'
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import { useThemeContext } from '../context/ThemeContext';

export default function AuthProvider({ children, onUserLoggedIn, onUserNotLoggedIn, onUserNotRegistered }) {
    const navigate = useNavigate();
    const { setContextTheme } = useThemeContext();

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');

        if (storedTheme) {
            setContextTheme(storedTheme);
        }

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const exists = await existsUid(user.uid);
                if (exists) {
                    const userInfo = await getUserInfo(user.uid);
                    if (userInfo && userInfo.processCompleted) {
                        onUserLoggedIn(userInfo);
                    } else {
                        onUserNotRegistered(userInfo);
                    }
                } else {
                    await createNewUser({
                        uid: user.uid,
                        displayName: user.displayName,
                        email: user.email,
                        profilePicture: "",
                        username: '',
                        processCompleted: false,
                        state: "",
                        currentGame: "",
                        stats: {
                            tittle: "Iniciado",
                            wins: 0,
                            defeats: 0,
                            trofies: "",
                            achievments: "",
                        }
                    });
                    onUserNotRegistered(user);
                }

            } else {
                onUserNotLoggedIn();
            }
        })
    }, [navigate, onUserLoggedIn, onUserNotLoggedIn, onUserNotRegistered, setContextTheme]);

    return <div>{children}</div>
}