import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css'

import './css/App.css'
import './css/colors.css';
import './css/buttons.css';
import './css/mobile.css';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ThemeContextProvider } from './context/ThemeContext';

import LoginView from './routes/autenticacion/loginView';
import DashBoardView from './routes/dashBoardView';
import EditProfileView from './routes/editProfileView'
import SignOutView from './routes/autenticacion/signOutView';
import ChooseUsernameView from './routes/autenticacion/chooseUsernameView';
import PublicProfileView from './routes/publicProfileView'
import ProfileView from './routes/profileView';
import InboxView from './routes/inboxView'
import PreguntatlonLobbyView from './routes/games/preguntatlonLobbyView'
import PreguntatlonGameRoomView from './routes/games/preguntatlonGameRoomView'
import OpeningComponent from './components/opening';


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ThemeContextProvider>
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<OpeningComponent />} />
        <Route path="login" element={<LoginView />} />
        <Route path="games" element={<DashBoardView />} />
        <Route path="editProfile" element={<EditProfileView />} />
        <Route path="profile" element={<ProfileView />} />
        <Route path="inbox" element={<InboxView />} />
        <Route path="signOut" element={<SignOutView />} />
        <Route path="createProfile" element={<ChooseUsernameView />} />
        <Route path="u/:username" element={<PublicProfileView />} />
        <Route path="preguntatlon" element={<PreguntatlonLobbyView />} />
        <Route path="preguntatlon/:uid" element={<PreguntatlonGameRoomView />} />

      </Routes>
    </BrowserRouter>
  </ThemeContextProvider>
);
