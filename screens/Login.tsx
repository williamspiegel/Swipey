import React, {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';
import WebView from 'react-native-webview';

const Login = () => {
  //   const tokenReq = new XMLHttpRequest();
  let uuid =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const base = 'https://www.reddit.com/api/v1/access_token';
  const uri = `https://www.reddit.com/api/v1/authorize?client_id=r3_RPQ5TH2bIDA&response_type=code&state=${uuid}&redirect_uri=http%3A%2F%2Flocalhost%3A65010%2Fauthorize_callback&duration=permanent&scope=account%20creddits%20edit%20flair%20history%20identity%20livemanage%20modconfig%20modcontributors%20modflair%20modlog%20modmail%20modothers%20modposts%20modself%20modtraffic%20modwiki%20mysubreddits%20privatemessages%20read%20report%20save%20structuredstyles%20submit%20subscribe%20vote%20wikiedit%20wikiread
`;
  //
  //   let secret: string = '';
  //   const storeSecret: void = async () => {
  //     try {
  //       await AsyncStorage.setItem('secret', secret);
  //     } catch (e) {
  //       Alert.alert('You have been logged out.');
  //     }
  //   };
  //   useEffect(() => {});
  _onNavigationCompleted = (event) => {
    const {onNavigationCompleted} = this.props;
    onNavigationCompleted && onNavigationCompleted(event);
  };
  return (
    <>
      {' '}
      <WebView
        onNavigationStateChange={_onNavigationStateChange}
        source={{uri: uri}}
        style={{flex: 1}}
      />
    </>
  );
};

export default Login;
