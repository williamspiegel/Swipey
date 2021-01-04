import he from 'he';
import React, {useState} from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import ImageViewer from 'react-native-image-zoom-viewer';
import Markdown from 'react-native-markdown-display';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import VideoPlayer from 'expo-video-player';
import {Audio, Video} from 'expo-av';
import WebView from 'react-native-webview';
const ContentDisplay = React.memo(({item}: any) => {
  const [imgVisible, setimgVisible] = useState(false);
  const [currentUri, setcurrentUri] = useState({
    uri: '',
    s: {
      y: 960,
      x: 1280,
      u: '',
    },
  });
  let imgMet = item?.data?.preview?.images[0].source;
  if (item?.data?.post_hint === 'image') {
    return (
      <FastImage
        resizeMode={'contain'}
        style={{
          width: widthPercentageToDP(100),
          height:
            (widthPercentageToDP(100) * imgMet.height || 1) / imgMet.width || 1,
        }}
        source={{uri: item.data.url, priority: FastImage.priority.high}}
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
        <FastImage
          style={{
            width: widthPercentageToDP(100),
            height:
              (widthPercentageToDP(100) * gallery[0].s.y) / gallery[0].s.x,
          }}
          resizeMode={'contain'}
          source={{
            uri: `${gallery[0].uri}`,
            priority: FastImage.priority.high,
          }}
        />
        <Modal collapsable visible={imgVisible} transparent={true}>
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
    // let re = /(DASH_).*(\.mp4)/;
    // let audioURL = vid.replace(re, '!audio!');
    return (
      <View collapsable style={styles.container}>
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
    <View collapsable style={styles.container}>
      {/* <WebView
        scrollEnabled={false}
        allowsFullscreenVideo
        originWhitelist={['*']}
        source={{
          uri:
            he
              ?.unescape(item?.data?.media_embed?.content)
              ?.match(/src=\\*"([^"]*)"/)?.groups[0] ||
            'https://styles.redditmedia.com/t5_6/styles/communityIcon_a8uzjit9bwr21.png',
        }}
        style={{flex: 1}}
      /> */}
    </View>;
  } //else if (true) {
  // }
  else {
    return <Text>Content not Found</Text>;
  }
});
export default ContentDisplay;
const styles = StyleSheet.create({
  container: {
    width: widthPercentageToDP(100),
    height: (widthPercentageToDP(100) * 9) / 16,
  },
  loginWebView: {
    flex: 1,
  },
});
