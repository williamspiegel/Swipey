import {useQuery} from 'react-query';
import axios from 'axios';
import {useContext, useState} from 'react';
import {DataProvider} from 'recyclerlistview';
import AuthContext from '../context/AuthContext';

export default function useSub() {
  const {tok, logout, isLoggedIn} = useContext(AuthContext);
  const [dataProvider, setDataProvider] = useState(
    new DataProvider((r1, r2) => {
      return r1.data.id !== r2.data.id;
    }),
  );
  const {
    data: subData,
    isSuccess: subSuccess,
    status,
  } = useQuery(
    'subData' + tok,
    () => {
      return axios({
        method: 'get',
        url: 'https://oauth.reddit.com/r/all/hot?g=US&after&limit=100',
        headers: {
          Authorization: `bearer ${tok}`, // ${loggedInAuthToken}`,
          'User-Agent': 'Swipey for Reddit',
        },
      })
        .then((ret) => {
          setDataProvider(dataProvider.cloneWithRows(ret.data.data.children));
          console.log('dataProvider set');
          return ret;
        })
        .catch((err) => console.log('sub fetch error:  ', err));
    },
    {enabled: !!tok},
  );
  const {
    data: subsDat,
    isSuccess: subsSuccess,
    status: subsStatus,
  } = useQuery(
    'subs' + tok,
    () => {
      return axios({
        method: 'get',
        url: 'https://oauth.reddit.com/subreddits/mine/subscriber',
        headers: {
          Authorization: `bearer ${tok}`,
          'User-Agent': 'Swipey for Reddit',
        },
      });
    },
    {enabled: !!isLoggedIn},
  );
  // console.log('subData:   ', subData);
  // console.log('subsDat:   ', subsStatus);
  (status == 'error' || subsStatus == 'error') && logout();
  return [subData, subsDat, subSuccess, subsSuccess, dataProvider];
}
