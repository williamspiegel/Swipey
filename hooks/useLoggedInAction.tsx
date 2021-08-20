import {useContext} from 'react';
import AuthContext from '../context/AuthContext';

function useLoggedInAction() {
  const [
    isLoggedIn,
    loggedInAuthToken,
    getTok,
    promptAsync,
    anonTok,
  ] = useContext(AuthContext);
  return (action: Function) => {
    if (isLoggedIn) {
      action();
    } else {
      promptAsync();
    }
  };
}
