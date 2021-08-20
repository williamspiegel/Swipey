import {createContext} from 'react';

const AuthContext = createContext({
  isLoggedIn: false,
  promptAsync: () => {},
  logout: () => {},
  tok: '',
});
export default AuthContext;
