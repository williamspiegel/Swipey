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

declare const global: {HermesInternal: null | {}};
const theme = {
  Button: {
    raised: true,
  },
};
const queryClient = new QueryClient();

const App = () => {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <StatusBar barStyle="dark-content" />
          <SafeAreaView style={{flex: 1}}>
            <Home />
          </SafeAreaView>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default App;
