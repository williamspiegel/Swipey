import React, {useRef, useState} from 'react';
import {
  Image,
  MaskedViewBase,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {QueryObserverResult, useQuery, useQueryClient} from 'react-query';
import axios from 'axios';
import he from 'he';
import WebView from 'react-native-webview';
import VideoPlayer from 'expo-video-player';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import Carousel from 'react-native-snap-carousel';
import {Audio, Video} from 'expo-av';
import Markdown from 'react-native-markdown-display';
import ImageViewer from 'react-native-image-zoom-viewer';
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
  const {data: subData, isFetched} = useQuery(
    'subData' + anonTok,
    () =>
      axios({
        method: 'get',
        url: 'https://oauth.reddit.com/r/dogelore/hot?g=US&after&limit=100',
        headers: {
          Authorization: `bearer ${anonTok}`,
          'User-Agent': 'Swipey for Reddit',
        },
      }),
    {enabled: !!anonTok},
  );

  //children[0].data.media.oembed.html
  // console.log(
  //   'lolwut:   ',
  //   he
  //     .unescape(
  //       '&lt;iframe width="356" height="200" src="https://www.youtube.com/embed/zdVgek9JJdI?feature=oembed&amp;enablejsapi=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen&gt;&lt;/iframe&gt;',
  //     )
  //     .match(/src="(?<src>[^\"]*)"/)?.groups['src'],
  // );
  const [imgVisible, setimgVisible] = useState(false);
  const [currentUri, setcurrentUri] = useState('');
  const contentDisplay = (item: any) => {
    if (item?.data?.post_hint === 'image') {
      return <Image style={{flex: 4}} source={{uri: item.data.url}} />;
    } else if (item?.data?.is_self === true) {
      return <Markdown>{he.unescape(item?.data?.selftext)}</Markdown>;
    } else if (item?.data?.is_gallery === true) {
      let meta = item?.data?.media_metadata;
      let gallery = item?.data?.gallery_data?.items?.reduce((acc, c) => {
        acc.push({
          url:
            'https://i.redd.it/' +
            c.media_id +
            (meta[`${c.media_id}`].m === 'image/jpg' ? '.jpg' : '.png'),
        });
        return acc;
      }, []);
      setcurrentUri(`${gallery[0].url}`);
      return (
        <>
          <Image source={{uri: currentUri}} />
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
      );
    } else if (item?.data?.media_embed?.content) {
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
      />;
    } //else if (true) {
    // }
    else {
      return <Text>Content not Found</Text>;
    }
  };
  const _renderItem = ({item, index}: any) => {
    console.log(`current item at index ${index}:   `, item);
    return (
      <ScrollView>
        <View style={styles.container}>
          <Text>{item?.data?.title}</Text>
          {contentDisplay(item)}
        </View>
        <View style={{flex: 1, backgroundColor: 'red'}}></View>
      </ScrollView>
    );
  };
  const carouselRef: any = useRef('');
  //console.log('sub data:   ', subData);
  return (
    <View style={{flex: 1, backgroundColor: 'blue'}}>
      {isFetched && (
        <Carousel
          ref={carouselRef}
          data={subData?.data?.data?.children}
          renderItem={_renderItem}
          layoutCardOffset={50}
          inactiveSlideOpacity={1}
          sliderHeight={heightPercentageToDP(100)}
          itemHeight={heightPercentageToDP(100)}
          sliderWidth={widthPercentageToDP(100)}
          itemWidth={widthPercentageToDP(100)}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    width: widthPercentageToDP(100),
    height: (widthPercentageToDP(100) * 9) / 16,
  },
  loginWebView: {
    flex: 1,
  },
});

export default Home;
