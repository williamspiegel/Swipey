import * as WebBrowser from 'expo-web-browser';
import {useQuery, useQueryClient} from 'react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {makeRedirectUri, ResponseType, useAuthRequest} from 'expo-auth-session';
import React, {useEffect, useState} from 'react';

WebBrowser.maybeCompleteAuthSession();
const config: any = {
  method: 'post',
  url:
    'https://www.reddit.com/api/v1/access_token?grant_type=https://oauth.reddit.com/grants/installed_client&device_id=DO_NOT_TRACK_THIS_DEVICE',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: 'Basic cjNfUlBRNVRIMmJJREE6',
  },
};

const discovery = {
  authorizationEndpoint: 'https://www.reddit.com/api/v1/authorize.compact',
  tokenEndpoint: 'https://www.reddit.com/api/v1/access_token',
};
export default function useAuth() {
  const queryClient = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tok, setTok] = useState('');

  //console.log('utok:   ', utok);
  const {data: anon} = useQuery('anon', () => {
    return AsyncStorage.getItem('userToken').then((val: any) => {
      if (val) {
        setIsLoggedIn(true);
        setTok(val);
      } else {
        axios(config).then((res) => {
          setIsLoggedIn(false);
          setTok(res.data.access_token);
        });
      }
    });
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: 'r3_RPQ5TH2bIDA',
      scopes: [
        'identity',
        'creddits',
        'edit',
        'flair',
        'history',
        'livemanage',
        'modconfig',
        'modcontributors',
        'modflair',
        'modlog',
        'modmail',
        'modothers',
        'modposts',
        'modself',
        'modtraffic',
        'modwiki',
        'mysubreddits',
        'privatemessages',
        'read',
        'report',
        'save',
        'structuredstyles',
        'submit',
        'subscribe',
        'vote',
        'wikiedit',
        'wikiread',
      ],
      // For usage in managed apps using the proxy
      redirectUri: makeRedirectUri({
        // For usage in bare and standalone
        native: 'com.swipeyreddit://redirect',
      }),
    },
    discovery,
  );
  const logout = () => {
    AsyncStorage.removeItem('userToken');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const {access_token} = response.params;
      console.log('login is successful: new access token: ', access_token);
      queryClient.invalidateQueries();
      AsyncStorage.setItem('userToken', access_token).then(() =>
        console.log('access token successfully stored'),
      );
      setIsLoggedIn(true);
      setTok(access_token);
      return;
    }
    AsyncStorage.getItem('userToken').then((val) => {
      console.log('got user token:  ', val);
      queryClient.invalidateQueries();
      if (val === null) {
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
        setTok(val);
      }
    });
  }, [queryClient, response]);

  return [isLoggedIn, promptAsync, logout, tok];
}
