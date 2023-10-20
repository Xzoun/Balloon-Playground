import { useEffect, useState } from "react"
import { getRoomInfo, getProfilePicUrl, getQuestion, getOptions, currentQuestion, listenForNewQuestion } from '../../firebase/firebase'
import { useThemeContext } from '../../context/ThemeContext';
import noTrofies from '../../img/noTrofies.png'
import oneTrofie from '../../img/oneTrofie.png'
import twoTrofies from '../../img/twoTrofies.png'
import threeTrofies from '../../img/threeTrofies.png'
import Dado from './dado';
import Question from './question';

export default function BoardView({ user, room }) {

    const { contextTheme } = useThemeContext();

    const [trofies, setTrofies] = useState("");
    const [trofies2, setTrofies2] = useState("");
    const [trofies3, setTrofies3] = useState("");
    const [trofies4, setTrofies4] = useState("");

    const [player1, setPlayer1] = useState(null);
    const [player2, setPlayer2] = useState(null);
    const [player3, setPlayer3] = useState(null);
    const [player4, setPlayer4] = useState(null);

    const [profilePicUrl, setProfilePicUrl] = useState("");
    const [profilePic2Url, setProfilePic2Url] = useState("");
    const [profilePic3Url, setProfilePic3Url] = useState("");
    const [profilePic4Url, setProfilePic4Url] = useState("");

    const [capacity, setCapacity] = useState(0);
    const [state, setState] = useState(0);

    useEffect(() => {
        const delay = 5000;
        setState(1);

        setTimeout(() => {
            setState(2);
        }, delay);

    }, [])

    useEffect(() => {
        listenForNewQuestion(room, (hasChanges) => {
            if (hasChanges) {
                setState(3);
            }
        });

    }, [room]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const roomInfo = await getRoomInfo(room);

                setCapacity(roomInfo.playersSettings.players);
            } catch (error) {
                console.error(error);
            }
        }
        fetchData();
    }, [room])

    useEffect(() => {
        const fetchData = async () => {

            try {
                const roomInfo = await getRoomInfo(room);
                let cont = 0;

                if (user) {
                    const url = await getProfilePicUrl(user.profilePicture);
                    setProfilePicUrl(url);
                }

                for (const player in roomInfo.playersSettings.playersIn) {
                    const currentPlayer = roomInfo.playersSettings.playersIn[player];

                    if (user && currentPlayer.uid !== user.uid) {
                        if (cont === 0) {
                            setPlayer2(currentPlayer);
                            const url = await getProfilePicUrl(currentPlayer.profilePicture);
                            setProfilePic2Url(url);
                            switch (currentPlayer.trofies) {
                                case 0: setTrofies2(noTrofies); break;
                                case 1: setTrofies2(oneTrofie); break;
                                case 2: setTrofies2(twoTrofies); break;
                                case 3: setTrofies2(threeTrofies); break;
                                default:
                                    new Error("Trofeo no encontrado!");
                            }
                            cont++;
                        } else if (cont === 1 && capacity >= 3) {
                            setPlayer3(currentPlayer);
                            const url = await getProfilePicUrl(currentPlayer.profilePicture);
                            setProfilePic3Url(url);
                            cont++;
                            switch (currentPlayer.trofies) {
                                case 0: setTrofies3(noTrofies); break;
                                case 1: setTrofies3(oneTrofie); break;
                                case 2: setTrofies3(twoTrofies); break;
                                case 3: setTrofies3(threeTrofies); break;
                                default:
                                    new Error("Trofeo no encontrado!");
                            }
                        } else if (cont === 2 && capacity === 4) {
                            setPlayer4(currentPlayer);
                            const url = await getProfilePicUrl(currentPlayer.profilePicture);
                            setProfilePic4Url(url);
                            switch (currentPlayer.trofies) {
                                case 0: setTrofies4(noTrofies); break;
                                case 1: setTrofies4(oneTrofie); break;
                                case 2: setTrofies4(twoTrofies); break;
                                case 3: setTrofies4(threeTrofies); break;
                                default:
                                    new Error("Trofeo no encontrado!");
                            }
                        }
                    } else {
                        setPlayer1(currentPlayer);
                        switch (currentPlayer.trofies) {
                            case 0: setTrofies(noTrofies); break;
                            case 1: setTrofies(oneTrofie); break;
                            case 2: setTrofies(twoTrofies); break;
                            case 3: setTrofies(threeTrofies); break;
                            default:
                                new Error("Trofeo no encontrado!");
                        }
                    }
                }
            } catch (error) {
                console.error(error);
            }

        }

        fetchData();

    }, [room, user, state, capacity]);

    const onRollResult = (seeQuestion) => {
        if (seeQuestion) {
            setState(3);
        }
    };
    const onElectionResult = (election) => {

    };
    return (
        <>
            <div className={`${contextTheme} inGameView`}>
                <div className="fourPlayers">
                    <div className="playerStats">
                        <div className="player">
                            <img className="profile" src={profilePicUrl} alt="" />
                        </div>
                        <h4>{player1 && player1.username} </h4>
                        <img className="trofies" src={trofies} alt="" />
                    </div>
                    {capacity >= 3 && player3 &&
                        <div className="playerStats">
                            <div className="player">
                                <img className="profile" src={profilePic3Url} alt="" />
                            </div>
                            <h4>{player3.username}</h4>
                            <img className="trofies" src={trofies3} alt="" />
                        </div>
                    }
                </div>

                <div className="tableCont">
                    <div className="header">
                        <h3>Reglas</h3>
                        <h3>Rendirse</h3>
                    </div>

                    <div className="table">
                        {state === 1 ? <>
                            <h3>Consigue los 3 diplomas para ganar!</h3>
                        </> : ""}

                        {state === 2 && user && room ? <>
                            <Dado onRoll={onRollResult} user={user} room={room} />
                        </> : ""}

                        {state === 3 && user && room && currentQuestion ? <>
                            <Question onElection={onElectionResult} user={user} room={room} question={currentQuestion} />
                        </> : ""}

                    </div>

                </div>

                <div className="fourPlayers">
                    <div className="playerStats">
                        <div className="player">
                            <img className="profile" src={profilePic2Url} alt="" />
                        </div>
                        <h4>{player2 && player2.username}</h4>
                        <img className="trofies" src={trofies2} alt="" />
                    </div>
                    {capacity === 4 && player4 &&
                        <div className="playerStats">
                            <div className="player">
                                <img className="profile" src={profilePic4Url} alt="" />
                            </div>
                            <h4>{player4.username}</h4>
                            <img className="trofies" src={trofies4} alt="" />
                        </div>}
                </div>
            </div>

        </>
    )
}