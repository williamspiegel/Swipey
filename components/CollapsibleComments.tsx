import React, {FC} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';

import {Icon} from 'react-native-elements';
import Markdown from 'react-native-markdown-display';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';

const CollapsibleComments: FC = React.memo(
  ({children, isCollapsed, setIsCollapsed}: any) => {
    //console.log('collapsibleComments entered');

    const _commentMap = (item: {
      data: {
        id: any;
        replies: {data: {children: any}};
        body: any;
        author: any;
        score: any;
      };
      kind: any;
    }) => {
      //   console.log(
      //     `isCollapsed for : ${item?.data?.id} `,
      //     state?.[item?.data?.id],
      //   );

      return (
        <Comment
          id={item?.data?.id}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          // isCollapsed={
          //   state?.[item?.data?.id + item?.data?.author]?.collapsed
          // }
          // isUpvoted={
          //   state?.[item?.data?.id + item?.data?.author]?.upvoted
          // }
          // isDownvoted={
          //   state?.[item?.data?.id + item?.data?.author]?.downvoted
          // }
          data={item?.data}
          children={item?.data?.replies?.data?.children}
          body={item?.data?.body}
          userName={item?.data?.author}
          votes={item?.data?.score}
          kind={item?.kind}
        />
      );
    };

    const InnerCollapsibleComments = React.memo(({children}: any) => {
      return (
        <>
          {children &&
            children.map((e: any) => {
              // console.log('current item:   ', e);
              return _commentMap(e);
            })}
        </>
      );
    });

    const Comment = React.memo(
      ({
        body,
        votes,
        id,
        userName,
        isCollapsed,
        setIsCollapsed,
        children,
        kind,
        data,
      }: // isUpvoted,
      // isDownvoted,
      // isCollapsed,

      //  id,
      any) => {
        // const {data: commenter, isFetched} = useQuery(userName, () =>
        //   axios.get(`https://www.reddit.com/user/${userName}/about.json`),
        // );
        //console.log('commenter:   ', commenter);

        if (isCollapsed[id] != null && isCollapsed[id]) {
          return (
            <Pressable
              style={{
                borderRadius: 100,
                backgroundColor: '#9e9e9e',
                alignItems: 'flex-start',
                flexDirection: 'row',
                paddingLeft: 10,
                paddingTop: 5,
              }}
              onPress={() => {
                setIsCollapsed((prevState: any) => {
                  let prev = {...prevState};
                  prev[id] = false;
                  return prev;
                });
              }}
              delayLongPress={200}
              onLongPress={() => {
                Vibration.vibrate(1);

                setIsCollapsed((prevState: any) => {
                  let prev = {...prevState};
                  prev[id] = false;
                  return prev;
                });
              }}>
              <Text style={{flex: 2, fontWeight: 'bold'}} numberOfLines={1}>
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
        } else if (kind !== 'more') {
          return (
            <>
              <Pressable
                collapsable
                //  onPress={() => setIsCollapsed(true)}
                delayLongPress={200}
                onLongPress={() => {
                  Vibration.vibrate(1);
                  setIsCollapsed((prevState: any) => {
                    let prev = {...prevState};
                    prev[id] = true;
                    return prev;
                  });
                }}>
                <View
                  collapsable
                  style={[
                    isCollapsed[id] !== null && isCollapsed[id] === true
                      ? styles.isCollapsed
                      : styles.notCollapsed,
                  ]}>
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
                      <Icon
                        name={'arrow-down-bold'}
                        type={'material-community'}
                      />
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
                          : Number.parseFloat(String(votes / 1000)).toFixed(1) +
                            'k'}
                      </Text>
                    </View>
                    <Pressable
                      collapsable
                      style={{paddingLeft: widthPercentageToDP(5)}}>
                      <Icon
                        name={'arrow-up-bold'}
                        type={'material-community'}
                      />
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
                        borderRadius: 100,
                        backgroundColor: 'rgb(200,200,200)',
                        position: 'absolute',
                        right: 0,
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                      }}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={{
                          fontWeight: 'bold',
                          paddingLeft: 5,
                          paddingRight: 5,
                          alignSelf: 'center',
                        }}>
                        {userName}
                      </Text>
                    </View>
                  </View>

                  <InnerCollapsibleComments children={children} />
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

    const _commentRender = ({item}: any) => {
      //   console.log(
      //     `isCollapsed for : ${item?.data?.id} `,
      //     state?.[item?.data?.id],
      //   );

      return (
        <Comment
          id={item?.data?.id}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          // isCollapsed={
          //   state?.[item?.data?.id + item?.data?.author]?.collapsed
          // }
          // isUpvoted={
          //   state?.[item?.data?.id + item?.data?.author]?.upvoted
          // }
          // isDownvoted={
          //   state?.[item?.data?.id + item?.data?.author]?.downvoted
          // }
          data={item?.data}
          children={item?.data?.replies?.data?.children}
          body={item?.data?.body}
          userName={item?.data?.author}
          votes={item?.data?.score}
          kind={item?.kind}
        />
      );
    };
    return (
      <>
        {children && (
          <FlatList
            collapsable
            removeClippedSubviews={true}
            //  windowSize={11}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            data={children}
            keyExtractor={(item) => item.data.id + item?.data?.author}
            renderItem={_commentRender}
          />
        )}
      </>
    );
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
    borderLeftWidth: 4,
    borderTopWidth: 1,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingLeft: 5,
    marginLeft: 1,
  },
});

export default CollapsibleComments;
