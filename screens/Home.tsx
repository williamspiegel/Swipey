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
import VideoPlayer from 'expo-video-player';
import {Divider, Icon, Text} from 'react-native-elements';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import {Audio, Video} from 'expo-av';
import Markdown, {hasParents} from 'react-native-markdown-display';
import ImageViewer from 'react-native-image-zoom-viewer';

import CollapsibleCommentsRoot from '../components/CollapsibleCommentsRoot';

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

  const [imgVisible, setimgVisible] = useState(false);
  const [currentUri, setcurrentUri] = useState({
    uri: '',
    s: {
      y: 960,
      x: 1280,
      u: '',
    },
  });

  const contentDisplay = (item: any) => {
    let imgMet = item?.data?.preview?.images[0].source;
    if (item?.data?.post_hint === 'image') {
      return (
        <Image
          resizeMode={'contain'}
          style={{
            width: widthPercentageToDP(100),
            height: (widthPercentageToDP(100) * imgMet.height) / imgMet.width,
          }}
          source={{uri: item.data.url}}
        />
      );
    } else if (item?.data?.is_self === true) {
      return (
        <View style={{padding: 10}}>
          <Markdown>{he.unescape(item?.data?.selftext)}</Markdown>
        </View>
      );
    } else if (item?.data?.is_gallery === true) {
      let meta = item?.data?.media_metadata;
      let gallery = item?.data?.gallery_data?.items?.reduce((acc, c) => {
        acc.push({
          uri:
            'https://i.redd.it/' +
            c.media_id +
            (meta[`${c.media_id}`].m === 'image/jpg' ? '.jpg' : '.png'),
          s: meta[`${c.media_id}`].s,
        });
        return acc;
      }, []);
      //console.log('gallery struct:   ', gallery[0].uri);
      // setcurrentUri(gallery[0]);
      return (
        <>
          <Image
            style={{
              width: widthPercentageToDP(100),
              height:
                (widthPercentageToDP(100) * gallery[0].s.y) / gallery[0].s.x,
            }}
            resizeMode={'contain'}
            source={{uri: `${gallery[0].uri}`}}
          />
          <Modal visible={imgVisible} transparent={true}>
            <ImageViewer
              imageUrls={gallery}
              enableSwipeDown
              swipeDownThreshold={50}
              enablePreload
              onSwipeDown={() => {
                setimgVisible(false);
              }}
              onChange={(i?: number) => {
                if (i) {
                  setcurrentUri(gallery[i]);
                }
              }}
            />
          </Modal>
        </>
      );
    } else if (item?.data?.post_hint === 'link') {
      return <Text>insert link post</Text>;
    } else if (item?.data?.secure_media?.reddit_video?.fallback_url) {
      let vid = item.data.secure_media.reddit_video.fallback_url;
      let re = /(DASH_).*(\.mp4)/;
      let audioURL = vid.replace(re, '!audio!');
      return (
        <View style={styles.container}>
          <VideoPlayer
            videoProps={{
              shouldPlay: false,
              resizeMode: Video.RESIZE_MODE_CONTAIN,
              source: {
                uri: vid,
              },
            }}
            showFullscreenButton
            width={widthPercentageToDP(100)}
            height={(widthPercentageToDP(100) * 9) / 16}
            inFullscreen={true}
          />
        </View>
      );
    } else if (item?.data?.media_embed?.content) {
      <View style={styles.container}>
        <WebView
          scrollEnabled={false}
          allowsFullscreenVideo
          originWhitelist={['*']}
          source={{
            uri: he
              .unescape(item.data.media_embed.content)
              .match(/src="(?<src>[^\"]*)"/)?.groups['src'],
          }}
          style={styles.loginWebView}
        />
        ;
      </View>;
    } //else if (true) {
    // }
    else {
      return <Text>Content not Found</Text>;
    }
  };
  //const [snapFocusIndex, setsnapFocusIndex] = useState(0);
  const _renderItem = (item: any, index: number) => {
    console.log(`current item at index ${index}:   `, item);
    return (
      <ScrollView
        directionalLockEnabled
        style={{
          paddingTop: 40,
          height: heightPercentageToDP(100),
          width: widthPercentageToDP(100),
        }}>
        <View style={{padding: 10, flexDirection: 'row'}}>
          <Image
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
          <Text style={{fontSize: 15, paddingLeft: 5, fontWeight: 'bold'}}>
            {item?.data?.subreddit_name_prefixed}
          </Text>
        </View>
        <Text h4 style={{padding: 10, fontWeight: 'bold'}}>
          {item?.data?.title}
        </Text>
        {contentDisplay(item)}
        <View
          style={{
            flex: 1,
            height: heightPercentageToDP(4),
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Pressable style={{flex: 0.6}}>
            <Icon name={'gift'} type={'material-community'} />
          </Pressable>
          <Pressable style={{flex: 0.6}}>
            <Icon name={'share'} type={'material-community'} />
          </Pressable>
          <Pressable style={{flex: 1}}>
            <Icon name={'comment'} type={'material-community'} />
          </Pressable>
          <Pressable style={{flex: 0.6}}>
            <Icon name={'arrow-up-bold'} type={'material-community'} />
          </Pressable>
          <Pressable style={{flex: 0.6}}>
            <Icon name={'arrow-down-bold'} type={'material-community'} />
          </Pressable>
        </View>

        <CollapsibleCommentsRoot token={anonTok} item={item} index={index} />
      </ScrollView>
    );
  };

  return (
    <>
      {isFetched && (
        <FlatList
          pinchGestureEnabled={false}
          disableScrollViewPanResponder
          directionalLockEnabled
          onViewableItemsChanged={(info) =>
            console.log('Viewable first item:   ', info.viewableitems?.[0])
          }
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
          keyExtractor={({item}) => item?.data?.name}
          renderItem={({item, index}) => _renderItem(item, index)}
        />
      )}
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    width: widthPercentageToDP(100),
    height: (widthPercentageToDP(100) * 9) / 16,
  },
  loginWebView: {
    flex: 1,
  },
});
export default Home;
