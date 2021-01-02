import React, {useCallback, useRef} from 'react';
import {
  Image,
  MaskedViewBase,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {QueryObserverResult, useQuery, useQueryClient} from 'react-query';
import axios from 'axios';
import he from 'he';
import WebView from 'react-native-webview';
import VideoPlayer from 'expo-video-player';
import {Divider, Icon, Text} from 'react-native-elements';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import Carousel from 'react-native-snap-carousel';
import {Audio, Video} from 'expo-av';
import Markdown, {hasParents} from 'react-native-markdown-display';
import ImageViewer from 'react-native-image-zoom-viewer';
import CollapsibleComments from '../components/CollapsibleComments';
import CollapsibleCommentsRoot from '../components/CollapsibleCommentsRoot';
import Swiper from 'react-native-swiper';
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
  return (
    <HomeHelper
      anonTok={anonTok}
      subData={subData}
      subAbout={subAbout}
      isFetched={isFetched}
    />
  );
};
export class HomeHelper extends React.PureComponent {
  constructor(props: any) {
    super(props);
    this.state = {
      pages: [{}, {}, {}],
      imgVisible: false,
      currentUri: {
        uri: '',
        s: {
          y: 960,
          x: 1280,
          u: '',
        },
      },
      pageKey: 1,
      totalIndex: 0,
    };
  }

  //children[0].data.media.oembed.html
  // console.log(
  //   'lolwut:   ',
  //   he
  //     .unescape(
  //       '&lt;iframe width="356" height="200" src="https://www.youtube.com/embed/zdVgek9JJdI?feature=oembed&amp;enablejsapi=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen&gt;&lt;/iframe&gt;',
  //     )
  //     .match(/src="(?<src>[^\"]*)"/)?.groups['src'],
  // );

  contentDisplay(item: any) {
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
              backgroundColor: 'green',
            }}
            resizeMode={'contain'}
            source={{uri: `${gallery[0].uri}`}}
          />
          <Modal visible={this.state.imgVisible} transparent={true}>
            <ImageViewer
              imageUrls={gallery}
              enableSwipeDown
              swipeDownThreshold={50}
              enablePreload
              onSwipeDown={() => {
                this.setState({imgVisible: false});
              }}
              onChange={(i?: number) => {
                if (i) {
                  this.setState({currentUri: gallery[i]});
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
  }
  //const [snapFocusIndex, setsnapFocusIndex] = useState(0);
  _renderItem(item: any, index: number) {
    console.log(`current item at index ${index}:   `, item);
    return (
      <ScrollView style={{paddingTop: 40, flex: 1}}>
        <View style={{padding: 10, flexDirection: 'row'}}>
          <Image
            style={{
              height: widthPercentageToDP(7),
              width: widthPercentageToDP(7),
              backgroundColor: 'green',
              borderRadius: 100,
            }}
            source={{
              uri: this.props.subAbout?.data?.data?.community_icon.match(
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
        {this.contentDisplay(item)}
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

        <CollapsibleCommentsRoot
          currentIndex={this.state.totalIndex}
          token={this.props.anonTok}
          item={item}
          index={index}
        />
      </ScrollView>
    );
  }

  //console.log('sub data:   ', this.props.subData);
  onPageChanged(idx: number) {
    this.setState({totalIndex: idx});
    let data = this.props.subData?.data?.data?.children;
    if (idx === 2) {
      const newPages = this.state.pages?.map(
        ({index}: any) => data?.[index + 1],
      );
      this.setState({pages: newPages});
      this.setState({pageKey: (this.state.pageKey + 1) % 2});
    } else if (idx === 0) {
      const newPages = this.state.pages?.map(
        ({index}: any) => data?.[index - 1],
      );
      this.setState({pages: newPages});
      this.setState({pageKey: (this.state.pageKey + 1) % 2});
    }
  }

  render() {
    return (
      <>
        {this.props.isFetched && (
          // <Carousel
          //   scrollEnabled={true}
          //   ref={carouselRef}
          //   data={this.props.subData?.data?.data?.children}
          //   renderItem={_renderItem}
          //   inactiveSlideOpacity={1}
          //   sliderWidth={widthPercentageToDP(100)}
          //   itemWidth={widthPercentageToDP(100)}
          //   inactiveSlideScale={1}
          //   maxToRenderPerBatch={3}
          //   initialNumToRender={3}
          //   onSnapToItem={(slideIndex) => setsnapFocusIndex(slideIndex)}
          //   callbackOffsetMargin={5}
          //   enableMomentum={false}
          //   containerCustomStyle={{flex: 1}}
          //   slideStyle={{flex: 1}}
          // />
          <Swiper
            loop={true}
            onIndexChanged={(index) => this.onPageChanged(index)}>
            {this.state.pages.map((item, idx) => {
              //console.log('pages:   ', this.state.pages);
              // console.log('item and idx:   ' + item + '   ' + idx);
              // console.log('curr item:   ', item);
              console.log('idx:  ', idx);
              return this._renderItem(item, idx);
            })}
          </Swiper>
        )}
      </>
    );
  }
}
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
