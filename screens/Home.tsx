import React from 'react';
import {Text, View} from 'react-native';
import {QueryObserverResult, useQuery, useQueryClient} from 'react-query';
import axios from 'axios';
import ReactPlayer from 'react-player';
import WebView from 'react-native-webview';
const config: any = {
  method: 'post',
  url:
    'https://www.reddit.com/api/v1/access_token?grant_type=https://oauth.reddit.com/grants/installed_client&device_id=DO_NOT_TRACK_THIS_DEVICE',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: 'Basic cjNfUlBRNVRIMmJJREE6',
  },
};

const Home = () => {
  const queryClient = useQueryClient();
  const {data: anonymous} = useQuery('anonymous', () => {
    axios(config)
      .then(function (response: {data: any}) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error: any) {
        console.log(error);
      });
  });

  const {data: subData} = useQuery(
    'subData' + anonymous?.access_token,
    () => {
      axios({
        method: 'get',
        url: 'https://oauth.reddit.com/r/all/hot?g=US&after&limit=100',
        headers: {
          Authorization: `bearer ${anonymous?.access_token}`,
          'User-Agent': 'Swipey for Reddit',
        },
      })
        .then(function (response) {
          console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    {enabled: anonymous?.access_token},
  );

  return <>{/*<WebView source={{html: ExampleData}} />*/}</>;
};

export default Home;
