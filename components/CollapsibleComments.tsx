import axios from 'axios';
import React, {useState} from 'react';
import {
  Pressable,
  View,
  Text,
  FlatList,
  Vibration,
  StyleSheet,
  Image,
} from 'react-native';

import {Icon} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Markdown from 'react-native-markdown-display';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import {useQuery} from 'react-query';
const CollapsibleComments = React.memo(
  ({children, layer, state, dispatch}: any) => {
    return (
      <>
        {children && (
          <FlatList
            collapsable
            removeClippedSubviews={true}
            //  windowSize={11}
            initialNumToRender={3}
            maxToRenderPerBatch={5}
            scrollEnabled={false}
            data={children}
            keyExtractor={(item) => item.data.id + item?.data?.author}
            renderItem={({item}: any) => {
              //   console.log(
              //     `isCollapsed for : ${item?.data?.id} `,
              //     state?.[item?.data?.id],
              //   );
              return (
                <Comment
                  state={state}
                  id={item?.data?.id}
                  dispatch={dispatch}
                  isCollapsed={
                    state?.[item?.data?.id + item?.data?.author]?.collapsed
                  }
                  isUpvoted={
                    state?.[item?.data?.id + item?.data?.author]?.upvoted
                  }
                  isDownvoted={
                    state?.[item?.data?.id + item?.data?.author]?.downvoted
                  }
                  data={item?.data}
                  children={item?.data?.replies?.data?.children}
                  layer={layer + 1}
                  body={item?.data?.body}
                  userName={item?.data?.author}
                  votes={item?.data?.score}
                  kind={item?.kind}
                />
              );
            }}
          />
        )}
      </>
    );
  },
);

const Comment = React.memo(
  ({
    body,
    votes,

    userName,
    layer,
    children,
    kind,
    data,
    isUpvoted,
    isDownvoted,
    isCollapsed,
    dispatch,
    id,
    state,
  }: any) => {
    const {data: commenter, isFetched} = useQuery(userName, () =>
      axios.get(`https://www.reddit.com/user/${userName}/about.json`),
    );
    //console.log('commenter:   ', commenter);
    if (isCollapsed) {
      return (
        <Pressable
          style={{
            borderRadius: 100,
            backgroundColor: '#9e9e9e',
            alignItems: 'flex-start',
            flexDirection: 'row',
          }}
          onPress={() => dispatch({type: 'collapse', commentID: id + userName})}
          delayLongPress={200}
          onLongPress={() => {
            Vibration.vibrate(1);
            dispatch({type: 'toggleCollapse', commentID: id + userName});
          }}>
          <FastImage
            style={{
              borderRadius: 100,
              width: widthPercentageToDP(5),
              height: widthPercentageToDP(5),
            }}
            source={{
              uri: isFetched
                ? commenter?.data?.data?.snoovatar_img
                : 'https://www.redditstatic.com/avatars/avatar_default_17_46A508.png',

              priority: FastImage.priority.low,
            }}
          />

          <Text
            style={{flex: 2}}
            style={{fontWeight: 'bold'}}
            numberOfLines={1}>
            {userName}
          </Text>
          <Text
            style={{flex: 5, paddingLeft: 10}}
            numberOfLines={1}
            ellipsizeMode={'tail'}>
            {body}
          </Text>

          <Icon
            style={{flex: 1}}
            name={'chevron-down'}
            type={'material-community'}
          />
        </Pressable>
      );
    } else if (
      !isCollapsed ||
      kind !== 'more' ||
      !children ||
      children !== []
    ) {
      return (
        <>
          <Pressable
            collapsable
            onPress={() =>
              dispatch({type: 'collapse', commentID: id + userName})
            }
            delayLongPress={200}
            onLongPress={() => {
              Vibration.vibrate(1);
              dispatch({type: 'toggleCollapse', commentID: id + userName});
            }}>
            <View
              collapsable
              style={[isCollapsed ? styles.isCollapsed : styles.notCollapsed]}>
              <View style={{padding: 10, paddingTop: 3, paddingBottom: 0}}>
                <Markdown>{body}</Markdown>
              </View>
              <View
                collapsable
                style={{
                  flex: 1,
                  height: heightPercentageToDP(4),
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                }}>
                <Pressable collapsable>
                  <Icon name={'arrow-down-bold'} type={'material-community'} />
                </Pressable>
                <View
                  collapsable
                  style={{
                    alignItems: 'center',
                    width: widthPercentageToDP(7),
                  }}>
                  <Text numberOfLines={1} ellipsizeMode={'clip'}>
                    {votes < 1000
                      ? votes
                      : Number.parseFloat(votes / 1000).toFixed(1) + 'k'}
                  </Text>
                </View>
                <Pressable
                  collapsable
                  style={{paddingLeft: widthPercentageToDP(5)}}>
                  <Icon name={'arrow-up-bold'} type={'material-community'} />
                </Pressable>
                <Pressable
                  collapsable
                  style={{paddingLeft: widthPercentageToDP(3)}}>
                  <Icon name={'reply'} type={'material-community'} />
                </Pressable>
                <Pressable
                  collapsable
                  style={{paddingLeft: widthPercentageToDP(1)}}>
                  <Icon name={'gift'} type={'material-community'} />
                </Pressable>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                  }}>
                  <FastImage
                    style={{
                      backgroundColor: 'gray',
                      borderRadius: 100,
                      width: widthPercentageToDP(8),
                      height: widthPercentageToDP(8),
                    }}
                    source={{
                      uri: isFetched
                        ? commenter?.data?.data?.snoovatar_img
                        : 'https://www.redditstatic.com/avatars/avatar_default_17_46A508.png',

                      priority: FastImage.priority.low,
                    }}
                  />
                  <Text
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{
                      fontWeight: 'bold',
                      paddingLeft: 10,
                      paddingRight: 3,
                      alignSelf: 'center',
                    }}>
                    {userName}
                  </Text>
                </View>
              </View>
              {!isCollapsed && (
                <CollapsibleComments
                  layer={layer}
                  children={children}
                  state={state}
                  dispatch={dispatch}
                />
              )}
            </View>
          </Pressable>
        </>
      );
    } else {
      return (
        <Text
          style={{
            color: 'blue',
            fontWeight: 'bold',
            padding: 10,
          }}>
          View More ({data?.count})
        </Text>
      );
    }
  },
);

const styles = StyleSheet.create({
  isCollapsed: {
    borderColor: 'grey',
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingLeft: 10,
    marginLeft: 2,
  },
  notCollapsed: {
    borderColor: 'grey',
    borderLeftWidth: 5,
    borderTopWidth: 1,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingLeft: 5,
    marginLeft: 2,
  },
});

export default CollapsibleComments;
