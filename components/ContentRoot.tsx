import axios from 'axios';
import React, {useState} from 'react';
import {useQuery} from 'react-query';
import CollapsibleComments from './CollapsibleComments';

export default function ContentRoot({item, token, header}: any) {
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

  return (
    <>
      <CollapsibleComments
        isLoading={isLoading}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        children={comments?.data[1]?.data?.children}
        header={header}
      />
    </>
  );
}
