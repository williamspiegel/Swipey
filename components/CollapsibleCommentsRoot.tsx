import axios from 'axios';
import React, {useReducer} from 'react';
import {View} from 'react-native';
import {useQuery, useQueryClient} from 'react-query';
import CollapsibleComments from './CollapsibleComments';
import {List} from 'react-content-loader/native';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import CollapsibleCommentsStateInit from './CollapsibleCommentsStateInit';

export default function CollapsibleCommentsRoot({
  item,
  token,
  index,
  currentIndex,
}) {
  //const queryClient = useQueryClient();

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

  return currentIndex < index - 1 || currentIndex > index + 1 || isLoading ? (
    <>
      <List viewBox={`25 0 100 80`} speed={0.6} backgroundColor={'#9e9e9e'} />
      <List viewBox={`25 0 100 80`} speed={0.6} backgroundColor={'#9e9e9e'} />
      <List viewBox={`25 0 100 80`} speed={0.6} backgroundColor={'#9e9e9e'} />
    </>
  ) : (
    <View
      collapsable
      style={{padding: 10, paddingLeft: 0, paddingRight: 0, paddingBottom: 80}}>
      <CollapsibleCommentsStateInit comments={comments} />
    </View>
  );
}
