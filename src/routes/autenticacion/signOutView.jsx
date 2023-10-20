import { Loading } from '../../components/loading'
import AuthProvider from '../../components/authProvider';
import { useNavigate } from 'react-router-dom';
import { logOut } from '../../firebase/firebase';

export default function SignOutView() {
  const navigate = useNavigate();
  
  async function handleUserLoggedIn(user) { await logOut(); };
  function handleUserNotRegistered(user) { navigate("/login");   window.location.reload(); };
  function handleUserNotLoggedIn() { navigate("/login");   window.location.reload(); };

  return (
    <AuthProvider
      onUserLoggedIn={handleUserLoggedIn}
      onUserNotRegistered={handleUserNotRegistered}
      onUserNotLoggedIn={handleUserNotLoggedIn}>
      <Loading></Loading>
    </AuthProvider>
  );
}