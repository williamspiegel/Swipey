import {useQuery} from 'react-query';
import axios from 'axios';
import {useState} from 'react';
import {DataProvider} from 'recyclerlistview';

export default function useSub(tok, isLoggedIn) {
  const [dataProvider, setDataProvider] = useState(
    new DataProvider((r1, r2) => {
      return r1.data.id !== r2.data.id;
    }),
  );
  const {data: subData, isSuccess: subSuccess} = useQuery(
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
  return [subData, subSuccess, dataProvider];
}
