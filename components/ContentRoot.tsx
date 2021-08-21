import axios from 'axios';
import React, {useContext, useState} from 'react';
import {useQuery} from 'react-query';
import CollapsibleComments from './CollapsibleComments';
import AuthContext from '../context/AuthContext';

export default function ContentRoot({item, header}: any) {
  const {tok, logout} = useContext(AuthContext);
  const [isCollapsed, setIsCollapsed] = useState({});

  const {
    data: comments,
    isLoading,
    status,
  } = useQuery(
    ['comments', tok, item?.data?.permalink],
    () =>
      axios({
        method: 'get',
        url: 'https://oauth.reddit.com' + item.data.permalink,
        headers: {
          Authorization: `bearer ${tok}`,
          'User-Agent': 'Swipey for Reddit',
        },
      }),
    {enabled: !!tok && !!item?.data?.permalink},
  );
  console.log('comment token:   ', tok);
  status == 'error' && logout();
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
