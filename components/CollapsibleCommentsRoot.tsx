import axios from 'axios';
import React, {useState} from 'react';
import {View} from 'react-native';
import {useQuery} from 'react-query';
import CollapsibleComments from './CollapsibleComments';
import {List} from 'react-content-loader/native';

export default function CollapsibleCommentsRoot({item, token}: any) {
  //index
  //const queryClient = useQueryClient();
  const [isCollapsed, setIsCollapsed] = useState({});
  const {data: comments, isLoading} = useQuery(
    ['comments', token, item?.data?.permalink],
    () =>
      axios({
        method: 'get',
        url: 'https://oauth.reddit.com' + item.data.permalink,
        headers: {
          Authorization: `bearer ${token}`,
          'User-Agent': 'Swipey for Reddit',
        },
      }),
    {enabled: !!token && !!item?.data?.permalink},
  );

  if (isLoading) {
    return (
      <>
        <List viewBox={`25 0 100 80`} speed={0.6} backgroundColor={'#9e9e9e'} />
        <List viewBox={`25 0 100 80`} speed={0.6} backgroundColor={'#9e9e9e'} />
        <List viewBox={`25 0 100 80`} speed={0.6} backgroundColor={'#9e9e9e'} />
      </>
    );
  } else {
    return (
      <View
        collapsable
        style={{
          padding: 10,
          paddingLeft: 0,
          paddingRight: 0,
          paddingBottom: 80,
        }}>
        <CollapsibleComments
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          children={comments?.data[1]?.data?.children}
        />
      </View>
    );
  }
}
