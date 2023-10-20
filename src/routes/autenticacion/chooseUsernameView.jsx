import AuthProvider from '../../components/authProvider';
import { Loading } from '../../components/loading';
import { useThemeContext } from '../../context/ThemeContext';

import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { existsUsername, upDateUser, setUserProfilePic } from '../../firebase/firebase';

import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';


export default function ChooseUsernameView() {

  const { contextTheme } = useThemeContext();
  const navigate = useNavigate();

  const [currentUSer, setCurrentUser] = useState({});
  const [state, setState] = useState(0);
  const [username, setUsername] = useState("");
  const [textareaValue, setTextareaValue] = useState('');

  const profileDefaultPath = require("../../img/holder.jpg");

  function handleUserLoggedIn(user) { navigate("/games") };
  function handleUserNotRegistered(user) { setState(3); setCurrentUser(user) };
  function handleUserNotLoggedIn() { navigate("/login") };

  function handleInputUsername(e) {

    if (e.key === 'Enter' || e.which === 13) {
      e.preventDefault();
      handleContinue();
      setTextareaValue("");
    } else {
      const inputValue = e.target.value;
      const cleanedValue = inputValue.replace(/(\r\n|\n|\r| )/gm, '');
      setTextareaValue(cleanedValue);
      setUsername(cleanedValue);
    }
  }

  async function handleContinue() {

    if (username !== "") {
      setUsername(username.trim());
      const exists = await existsUsername(username);
      if (exists) {
        setState(5);
      } else {

        const response = await fetch(profileDefaultPath);
        const blob = await response.blob();
        
        const file = new File([blob], currentUSer.uid, { type: 'image/png' });
        const res = await setUserProfilePic(currentUSer.uid, file);

        if (res) {
          const tmpUser = { ...currentUSer };
          tmpUser.profilePicture = res.metadata.fullPath;
          tmpUser.username = username;
          tmpUser.processCompleted = true;

          await upDateUser(tmpUser);
          setCurrentUser({ ...tmpUser });

          setState(6);
        }
      }
    }
  };

  if (state === 3 || state === 5) {

    return (
      <div className={`${contextTheme} autenticar`}>
        <h2 className="headLine">Hola {currentUSer.displayName}</h2>
        <div className="onlyOption mt-5 mb-5">
          <h4 className="mb-3 mt-3"> Para finalizar el registro elegí un nombre de usuario!</h4>

          {state === 5 ? <>
            {[
              'danger'
            ].map((variant) => (
              <Alert key={variant} variant={variant} className="alert">
                Lo sentimos, usuario no disponible. Probá con otro!</Alert>
            ))} </> : ""}

          <FloatingLabel controlId="floatingTextarea" label="Nombre de usuario" className="mb-3 mt-3 labelUser ">
            <Form.Control value={textareaValue} onChange={handleInputUsername} onKeyUp={handleInputUsername} as="textarea" />
          </FloatingLabel>
          <button className={`${contextTheme} mb-5 mt-2 generalButtons`} onClick={handleContinue}>Cargar</button>
        </div>
      </div>
    );
  }

  if (state === 6) {
    return (
      <div className={`${contextTheme} autenticar`}>
        <div className="headLine" ></div>
        {[
          'success'
        ].map((variant) => (
          <Alert key={variant} variant={variant} className="alert">
            Registro Exitoso!</Alert>
        ))}
        <Link className={`${contextTheme} mb-5 mt-5 generalButtons link`} to="/games">Continuar</Link>
      </div >
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