import { Nav } from '../components/nav'
import { Loading } from '../components/loading';
import { useThemeContext } from '../context/ThemeContext';
import AuthProvider from '../components/authProvider';

import { useNavigate, Link } from 'react-router-dom';
import React, { useState } from 'react';

import { setUserProfilePic, getProfilePicUrl, upDateUser, existsUsername, getRoomInfo } from '../firebase/firebase';

import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

export default function EditProfileView() {
  const navigate = useNavigate();

  const [currentUSer, setCurrentUser] = useState({});
  const [state, setState] = useState(0);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [username, setUsername] = useState("");
  const [changedState, setnewState] = useState("");
  const { contextTheme, setContextTheme } = useThemeContext();

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

  async function handleUploadFile(e) {
    const files = e.target.files;
    const fileReader = new FileReader();

    if (fileReader && files && files.length > 0) {
      fileReader.readAsArrayBuffer(files[0]);

      fileReader.onload = async function () {
        const imgData = fileReader.result;
        const res = await setUserProfilePic(currentUSer.uid, imgData);

        if (res) {
          const tmpUser = { ...currentUSer };
          tmpUser.profilePicture = res.metadata.fullPath;

          await upDateUser(tmpUser);
          setCurrentUser({ ...tmpUser });

          const url = await getProfilePicUrl(tmpUser.profilePicture)
          setProfilePicUrl(url);
          ShowAlert(true);
        }
      }
    }
  };

  function handleInputUsername(e) {
    setUsername(e.target.value);
  }

  function handleInputState(e) {
    setnewState(e.target.value);
  }

  function ShowAlert(goodAlert) {
    const delay = 1500;

    setTimeout(() => {
      setState(2)
    }, delay);

    if (goodAlert) {
      setState(6);
    } else {
      setState(5);
    }
  }

  async function handleChangeUsername() {
    if (username !== "") {
      const exists = await existsUsername(username);
      if (exists) {
        ShowAlert(false);
      } else {
        const tmp = { ...currentUSer };
        tmp.username = username;

        upDateUser(tmp);
        setUsername("");
        ShowAlert(true);
      }
    }
  };

  async function handleChangeState() {
    if (changedState !== "") {
      const tmp = { ...currentUSer };
      tmp.state = changedState;

      await upDateUser(tmp);
      setnewState("");
      ShowAlert(true);
    }
  }

  function handleColor(color) {
    setContextTheme(color);
    localStorage.setItem('theme', color);
  }

  const handleKeyUp = (event) => {
    if (event.key === 'Enter') {
      handleChangeUsername();
    }
  };

  const handleKeyUpState = (event) => {
    if (event.key === 'Enter') {
      handleChangeState();
    }
  };

  if (state !== 2 && state !== 6 && state !== 5) {
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

        <div className="blockContainer" data-bs-theme="dark">
          <h5 className="blockTittle">Color</h5>

          <div className="colorsCont">
            <button className="redTheme themeChanger" onClick={() => handleColor('redTheme')}></button>
            <button className="pinkTheme themeChanger" onClick={() => handleColor('pinkTheme')}></button>
            <button className="greenTheme themeChanger" onClick={() => handleColor('greenTheme')}></button>
            <button className="blueTheme themeChanger" onClick={() => handleColor('blueTheme')}></button>
            <button className="yellowTheme themeChanger" onClick={() => handleColor('yellowTheme')}></button>
            <button className="orangeTheme themeChanger" onClick={() => handleColor('orangeTheme')}></button>
            <button className="blackTheme themeChanger" onClick={() => handleColor('blackTheme')}></button>
            <button className="whiteTheme themeChanger" onClick={() => handleColor('whiteTheme')}></button>
          </div>

        </div>

        <div className="blockContainer">
          <h5 className="blockTittle">Editar nombre de usuario</h5>
          <div className="blockBody">
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Ingrese su nuevo username</Form.Label>
              <div className="cargarUsername">
                <Form.Control type="text" placeholder="username1234" data-bs-theme="dark" value={username} onKeyUp={handleKeyUp} onChange={handleInputUsername} />
                <button className={`${contextTheme} generalButtons`} onClick={handleChangeUsername}>Cargar</button>
              </div>
            </Form.Group>
          </div>
        </div>

        <div className="blockContainer" data-bs-theme="dark">
          <h5 className="blockTittle" >Editar Foto</h5>
          <div className="profilePicCont">
            <img className="profilePic mb-3 center" src={profilePicUrl} alt="" width={200} />
            <Form.Group controlId="formFile" className="mb-3 upLoadPic center" onChange={handleUploadFile}>
              <Form.Control type="file" />
            </Form.Group>
          </div>
        </div>

        <div className="blockContainer">
          <h5 className="blockTittle">Editar estado</h5>
          <div className="blockBody">
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Ingrese su nuevo estado</Form.Label>
              <div className="changeState">
                <textarea className="inputNewState" type="text" placeholder="Que el privilegio no te nuble la empatía." data-bs-theme="dark" value={changedState} onKeyUp={handleKeyUpState} onChange={handleInputState} />
                <button className={`${contextTheme} generalButtons`} onClick={handleChangeState}>Cargar</button>
              </div>
            </Form.Group>
          </div>
        </div>

        <div className="blockContainer">
          <div className="blockBody">
            <Link className={`${contextTheme} generalButtons link`} to="/signOut">Cerrar Sesión</Link>
          </div>
        </div>

        {state === 5 ? <>
          {[
            'danger'
          ].map((variant) => (
            <Alert key={variant} variant={variant} className="alert">
              Lo sentimos, usuario no disponible. Probá con otro!</Alert>
          ))}
        </> : ""}

        {state === 6 ?
          <>
            {[
              'success'
            ].map((variant) => (
              <Alert key={variant} variant={variant} className="alert">
                Modificacion Exitosa!</Alert>
            ))}
          </>
          : ""}
      </div>
    </div>
  );
}