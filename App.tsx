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
import {StatusBar} from 'react-native';
import {ThemeProvider} from 'react-native-elements';
import {QueryClient, QueryClientProvider} from 'react-query';
import Home from './screens/Home';

declare const global: {HermesInternal: null | {}};
const theme = {
  Button: {
    raised: true,
  },
};
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <StatusBar barStyle="dark-content" />
        <Home />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
