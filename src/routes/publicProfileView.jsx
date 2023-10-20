import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { existsUsername, getProfilePicUrl, getUserData } from '../firebase/firebase'
import { Loading } from '../components/loading';
import { Nav } from '../components/nav'
import { useThemeContext } from '../context/ThemeContext';
import AuthProvider from '../components/authProvider';

export default function PublicProfileView() {
  const params = useParams();
  const navigate = useNavigate();

  const { contextTheme } = useThemeContext();

  const [state, setState] = useState(0);
  const [url, setUrl] = useState("");
  const [userInfo, setUserInfo] = useState({});

  function handleUserLoggedIn(user) { setState(2) };
  function handleUserNotRegistered(user) { navigate("/login") };
  function handleUserNotLoggedIn() { navigate("/login") };

  useEffect(() => {
    async function getProfile() {
      const username = params.username;

      try {
        const userExists = await existsUsername(username);

        if (userExists) {
          const userInfo = await getUserData(username);
          setUserInfo(userInfo);
          const url = await getProfilePicUrl(userInfo.profilePicture);
          setUrl(url);
        }

      } catch (error) {
        console.error(error);
      }
    }


    getProfile();
  }, [params.username])

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
          <h4 className="blockTittle">{userInfo.username}</h4>
          <div className="blockBody">
            <img className="photoPublic" src={url} alt="" />

          </div>
          <div className="blockBody">
            <h5>{userInfo.state}</h5>
          </div>
        </div>
        <div className="blockContainer">
          <h5 className="blockBody"> Título : {userInfo.stats.tittle}</h5>
        </div>
        <div className="blockContainer">
          <div className="blockBody">
            <div>
              <h5>Victorias</h5>
              <h5>{userInfo.stats.wins}</h5>
            </div>
            <div>
              <h5>Derrotas</h5>
              <h5>{userInfo.stats.defeats}</h5>
            </div>
          </div>
        </div>
        <div className="blockContainer">
          <h5 className="blockBody"> Trofeos</h5>
          <h5>{userInfo.stats.trofies}</h5>
        </div>
        <div className="blockContainer">
          <h5 className="blockBody"> Logros</h5>
          <h5>{userInfo.stats.achievments}</h5>
        </div>
      </div>

    </div>
  )
}