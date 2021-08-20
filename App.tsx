/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import {ThemeProvider} from 'react-native-elements';
import {QueryClient, QueryClientProvider} from 'react-query';
import Home from './screens/Home';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AuthContext from './context/AuthContext';
import useAuth from './hooks/useAuth';

declare const global: {HermesInternal: null | {}};
const theme = {
  Button: {
    raised: true,
  },
};
const queryClient = new QueryClient();
const App = () => {
  /*[
  isLoggedIn,
  loggedInAuthToken,
  getTok,
  promptAsync,
  anonTok,
]*/
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{flex: 1}}>
          <QueryClientProvider client={queryClient}>
            <AuthHelper />
          </QueryClientProvider>
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const AuthHelper = () => {
  const [isLoggedIn, promptAsync, logout, tok] = useAuth();
  const authVals = {
    isLoggedIn: isLoggedIn,
    promptAsync: promptAsync,
    logout: logout,
    tok: tok,
  };
  return (
    // @ts-ignore
    <AuthContext.Provider value={authVals}>
      <Home />
    </AuthContext.Provider>
  );
};

export default App;
