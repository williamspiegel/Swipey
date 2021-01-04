import React, {useReducer} from 'react';
import CollapsibleComments from './CollapsibleComments';

function reducer(state, {type, commentID}: any) {
  console.log('dispatch:   ', type, commentID);
  let newState = {...state};
  if (!commentID) {
    return newState;
  }
  switch (type) {
    case 'upvote':
      newState[commentID].downvote = false;
      newState[commentID].upvote = true;
      return newState;
    case 'downvote':
      newState[commentID].downvote = true;
      newState[commentID].upvote = false;
      return newState;
    case 'collapse':
      newState[commentID].collapsed = false;
      return newState;
    case 'toggleCollapse':
      newState[commentID].collapsed = !newState[commentID].collapsed;
      return newState;

    default:
      return newState;
  }
}
function initCommentState(children: object[]) {
  if (!children) {
    return {};
  }

  return children.reduce((acc, curr) => {
    let accRec = initCommentState(curr.data.replies?.data?.children);
    // console.log('current acc:   ', accRec);
    let currId = curr.data.id + curr.data.author;
    // console.log('current ID:   ', curr.data.replies);
    accRec[currId || ''] = {
      upvote: false,
      downvote: false,
      collapsed: false,
      username: curr.data.author,
    };
    return {...acc, ...accRec};
  }, {});
}
export default function CollapsibleCommentsStateInit({comments}) {
  const [state, dispatch] = useReducer(
    reducer,
    initCommentState(comments?.data[1]?.data?.children),
  );

  //console.log('state output:   ', state);
  // console.log('curr total state:  ', state);
  //console.log('curr comments:  ', comments.data[1]);
  return (
    <CollapsibleComments
      state={state}
      dispatch={dispatch}
      layer={0}
      children={comments?.data[1]?.data?.children}
    />
  );
}
