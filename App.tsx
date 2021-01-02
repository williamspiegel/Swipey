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
import {SafeAreaView, ScrollView, View, Text, StatusBar} from 'react-native';
const axios = require('axios');
import {ThemeProvider} from 'react-native-elements';
import BrowsingCarousel from './components/BrowsingCarousel';
import {QueryClient, QueryClientProvider, useQuery} from 'react-query';
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
