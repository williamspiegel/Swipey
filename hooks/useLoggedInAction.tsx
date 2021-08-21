import {useContext} from 'react';
import AuthContext from '../context/AuthContext';

export default function useLoggedInAction() {
  const {isLoggedIn, promptAsync} = useContext(AuthContext);
  return (action: Function) => {
    if (isLoggedIn) {
      action();
    } else {
      promptAsync();
    }
  };
}
