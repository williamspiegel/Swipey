import React, {useCallback, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {useQuery, useQueryClient} from 'react-query';
import axios from 'axios';
import he from 'he';
import WebView from 'react-native-webview';

import {Card, Divider, Icon, Text} from 'react-native-elements';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';

import Markdown, {hasParents} from 'react-native-markdown-display';
import ImageViewer from 'react-native-image-zoom-viewer';

import CollapsibleCommentsRoot from '../components/CollapsibleCommentsRoot';
import FastImage from 'react-native-fast-image';
import ContentDisplay from '../components/ContentDisplay';

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
  const {data: anon} = useQuery('anon', () => axios(config));
  const anonTok = anon?.data?.access_token;
  //console.log('token:   ', anonTok);
  const {data: subData, isFetched} = useQuery(
    'subData' + anonTok,
    () =>
      axios({
        method: 'get',
        url: 'https://oauth.reddit.com/r/dankmemes/hot?g=US&after&limit=100',
        headers: {
          Authorization: `bearer ${anonTok}`,
          'User-Agent': 'Swipey for Reddit',
        },
      }),
    {enabled: !!anonTok},
  );
  const {data: subAbout} = useQuery(
    'subAbout' + anonTok,
    () =>
      axios({
        method: 'get',
        url: 'https://oauth.reddit.com/r/dankmemes/about',
        headers: {
          Authorization: `bearer ${anonTok}`,
          'User-Agent': 'Swipey for Reddit',
        },
      }),
    {enabled: !!anonTok},
  );

  const [snapFocusIndex, setsnapFocusIndex] = useState(0);
  const _renderItem = (item: any, index: number) => {
    // console.log(`current item at index ${index}:   `, item);
    return (
      <ScrollView
        collapsable
        directionalLockEnabled
        style={{
          paddingTop: 40,
          height: heightPercentageToDP(100),
          width: widthPercentageToDP(100),
        }}>
        <View collapsable style={{padding: 10, flexDirection: 'row', flex: 1}}>
          <FastImage
            style={{
              height: widthPercentageToDP(7),
              width: widthPercentageToDP(7),
              borderRadius: 100,
            }}
            source={{
              uri: subAbout?.data?.data?.community_icon.match(
                /.*\.(png|jpg)/,
              )[0],
            }}
            resizeMode={'contain'}
          />
          <View>
            <Text style={{fontSize: 15, paddingLeft: 5, fontWeight: 'bold'}}>
              {item?.data?.subreddit_name_prefixed}
            </Text>

            <Text style={{paddingLeft: 5}}>
              by{'   '}
              {item?.data?.author}
            </Text>
          </View>
        </View>

        <Text
          h4
          style={{
            flexDirection: 'row-reverse',
            padding: 10,
            fontWeight: 'bold',
          }}>
          {item?.data?.title}
        </Text>
        <ContentDisplay item={item} />
        <View
          collapsable
          style={{
            flex: 1,
            height: heightPercentageToDP(4),
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: heightPercentageToDP(1),
          }}>
          <Pressable style={{flex: 1}}>
            <Icon
              size={widthPercentageToDP(7)}
              name={'gift'}
              type={'material-community'}
            />
          </Pressable>
          <Pressable style={{flex: 1}}>
            <Icon
              size={widthPercentageToDP(7)}
              name={'share'}
              type={'material-community'}
            />
          </Pressable>
          <Pressable style={{flex: 2}}>
            <Icon
              size={widthPercentageToDP(7)}
              name={'comment'}
              type={'material-community'}
            />
          </Pressable>
          <Pressable collapsable style={{flex: 1}}>
            <Icon
              size={widthPercentageToDP(8)}
              name={'arrow-up-bold'}
              type={'material-community'}
            />
          </Pressable>
          <View collapsable>
            <Text adjustsFontSizeToFit numberOfLines={1} ellipsizeMode={'clip'}>
              {item?.data?.score < 1000
                ? item?.data?.score
                : Number.parseFloat(item?.data?.score / 1000).toFixed(1) + 'k'}
            </Text>
          </View>

          <Pressable collapsable style={{flex: 1}}>
            <Icon
              size={widthPercentageToDP(8)}
              name={'arrow-down-bold'}
              type={'material-community'}
            />
          </Pressable>
        </View>

        <CollapsibleCommentsRoot
          currentIndex={snapFocusIndex}
          token={anonTok}
          item={item}
          index={index}
        />
      </ScrollView>
    );
  };

  return (
    <>
      {isFetched && (
        <>
          <FlatList
            collapsable
            onMomentumScrollEnd={(event) => {
              let ret = setsnapFocusIndex(
                Math.round(
                  event.nativeEvent.contentOffset.x / widthPercentageToDP(100),
                ),
              );
              // console.log('triggered index:   ', widthPercentageToDP(100));
              return ret;
            }}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            windowSize={5}
            pinchGestureEnabled={false}
            disableScrollViewPanResponder
            directionalLockEnabled
            nestedScrollEnabled
            disableIntervalMomentum
            alwaysBounceHorizontal={false}
            alwaysBounceVertical={false}
            bounces={false}
            bouncesZoom={false}
            pagingEnabled={true}
            removeClippedSubviews={true}
            decelerationRate="fast"
            //  decelerationRate={Platform.OS === 'ios' ? 0 : 0.985}
            snapToInterval={widthPercentageToDP(100)}
            snapToAlignment={'center'}
            horizontal={true}
            data={subData?.data?.data?.children}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            // keyExtractor={({item}) => item?.data?.id}
            renderItem={({item, index}) => _renderItem(item, index)}
          />
          <View
            style={{
              borderRadius: 20,
              width: widthPercentageToDP(100),
              height: heightPercentageToDP(8),
              backgroundColor: 'gray',
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
            }}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 5,
                height: heightPercentageToDP(4),
                width: widthPercentageToDP(75),
                borderRadius: 100,
                backgroundColor: 'white',
              }}>
              <Text>Comment here...</Text>
            </View>
          </View>
        </>
      )}
    </>
  );
};

export default Home;
