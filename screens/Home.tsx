import React, {useCallback, useMemo, useRef, useState} from 'react';
//import {LargeList} from 'react-native-largelist-v3';
import Carousel from 'react-native-snap-carousel';
import {
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {useQueries, useQuery, useQueryClient} from 'react-query';
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
import BottomSheet, {useBottomSheet} from '@gorhom/bottom-sheet';
import BottomContent from '../utils/enums';
import {makeRedirectUri, ResponseType, useAuthRequest} from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import {OptimizedFlatList} from 'react-native-optimized-flatlist';
import {RecyclerListView, DataProvider, LayoutProvider} from 'recyclerlistview';
import ViewPager from '@react-native-community/viewpager';
WebBrowser.maybeCompleteAuthSession();

const config: any = {
  method: 'post',
  url:
    'https://www.reddit.com/api/v1/access_token?grant_type=https://oauth.reddit.com/grants/installed_client&device_id=DO_NOT_TRACK_THIS_DEVICE',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: 'Basic cjNfUlBRNVRIMmJJREE6',
  },
};
const configUser: any = {
  method: 'post',
  url:
    'https://www.reddit.com/api/v1/access_token?grant_type=https://oauth.reddit.com/grants/installed_client&device_id=DO_NOT_TRACK_THIS_DEVICE',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: 'Basic cjNfUlBRNVRIMmJJREE6',
  },
};

const discovery = {
  authorizationEndpoint: 'https://www.reddit.com/api/v1/authorize.compact',
  tokenEndpoint: 'https://www.reddit.com/api/v1/access_token',
};

const Home = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const carouselRef = useRef();
  const [bottomContent, setbottomContent] = useState(BottomContent.Subs);
  const queryClient = useQueryClient();
  const {data: userTok, isSuccess: userSuccess} = useQuery('userTok', () => {
    return AsyncStorage.getItem('userToken').then((val) => {
      return val ? val : axios(config);
    });
  });
  const utok = userTok?.data?.access_token;
  //console.log('utok:   ', utok);
  const {data: anon, isFetched: anonFetched} = useQuery(
    'anon',
    () => {
      return AsyncStorage.getItem('userToken').then((val) => {
        return val ? val : axios(config);
      });
    },
    {enabled: !!!utok},
  );

  const loginCallback = () => useQuery('userLogin');
  const anonTok = anon?.data?.access_token;
  //console.log('token:   ', anonTok);
  const isLoggedIn = () => !!utok;
  const getTok = () => (userSuccess ? utok : anonTok);
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: 'r3_RPQ5TH2bIDA',
      scopes: [
        'identity',
        'creddits',
        'edit',
        'flair',
        'history',
        'livemanage',
        'modconfig',
        'modcontributors',
        'modflair',
        'modlog',
        'modmail',
        'modothers',
        'modposts',
        'modself',
        'modtraffic',
        'modwiki',
        'mysubreddits',
        'privatemessages',
        'read',
        'report',
        'save',
        'structuredstyles',
        'submit',
        'subscribe',
        'vote',
        'wikiedit',
        'wikiread',
      ],
      // For usage in managed apps using the proxy
      redirectUri: makeRedirectUri({
        // For usage in bare and standalone
        native: 'com.swipeyreddit://redirect',
      }),
    },
    discovery,
  );
  React.useEffect(() => {
    if (response?.type === 'success') {
      console.log('cum');
      const {access_token} = response.params;
      AsyncStorage.setItem('userTok', access_token);
      queryClient.invalidateQueries();
    }
  }, [response]);
  const {data: subData, isSuccess: subSuccess} = useQuery(
    'subData' + getTok(),
    () => {
      console.log('sup nibba we in:  ', getTok(), utok);
      return axios({
        method: 'get',
        url: 'https://oauth.reddit.com/r/dankmemes/hot?g=US&after&limit=100',
        headers: {
          Authorization: `bearer ${getTok()}`,
          'User-Agent': 'Swipey for Reddit',
        },
      });
    },
    {enabled: !!anonTok || isLoggedIn()},
  );
  const {data: subAbout, isSuccess: subFetched} = useQuery(
    'subAbout' + getTok(),
    () =>
      axios({
        method: 'get',
        url: 'https://oauth.reddit.com/r/dankmemes/about',
        headers: {
          Authorization: `bearer ${getTok()}`,
          'User-Agent': 'Swipey for Reddit',
        },
      }),
    {enabled: !!anonTok || isLoggedIn()},
  );
  const _layoutProvider = new LayoutProvider(
    () => {
      return 0;
    },
    (type, dim) => {
      dim.height = heightPercentageToDP(100);
      dim.width = widthPercentageToDP(100);
    },
  );
  const [snapFocusIndex, setsnapFocusIndex] = useState(0);
  const _renderItem = (item: any, index: number) => {
    // console.log(`current item at index ${index?.data?.all_awardings}`);
    console.log('index:    ', index);
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
          {item?.data?.all_awardings?.slice(0, 100).map((i) => {
            return (
              <FastImage
                style={{
                  height: widthPercentageToDP(5),
                  width: widthPercentageToDP(5),
                  borderRadius: 100,
                }}
                source={{
                  uri: he.unescape(i.resized_icons[1].url),
                }}
                resizeMode={'contain'}
              />
            );
          })}
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
  const {data: subsDat, isSuccess: subsSuccess} = useQuery(
    'subs' + getTok(),
    () => {
      // console.log('sup nibba we in:  ', getTok(), utok);
      return axios({
        method: 'get',
        url: 'https://oauth.reddit.com/subreddits/mine/subscriber',
        headers: {
          Authorization: `bearer ${getTok()}`,
          'User-Agent': 'Swipey for Reddit',
        },
      });
    },
    {enabled: isLoggedIn()},
  );
  const bottomSheetDisplay = () => {
    // let uuid =
    //   Math.random().toString(36).substring(2, 15) +
    //   Math.random().toString(36).substring(2, 15);
    // const loginUri = he.escape(
    //   //`https://www.reddit.com/api/v1/authorize?client_id=r3_RPQ5TH2bIDA&response_type=code&state=${uuid}&redirect_uri=http://localhost:65010/authorize_callback&duration=permanent&scope=account creddits edit flair history identity livemanage modconfig modcontributors modflair modlog modmail modothers modposts modself modtraffic modwiki mysubreddits privatemessages read report save structuredstyles submit subscribe vote wikiedit wikiread`,
    //   `https://www.reddit.com/api/v1/authorize.compact?client_id=r3_RPQ5TH2bIDA&response_type=code&state=${uuid}&redirect_uri=com.swipeyreddit://oauth2redirect/reddit&duration=permanent&scope=account creddits edit flair history identity livemanage modconfig modcontributors modflair modlog modmail modothers modposts modself modtraffic modwiki mysubreddits privatemessages read report save structuredstyles submit subscribe vote wikiedit wikiread`,
    // );
    // const _onNavigationStateChange = (event) => {
    //   console.log('webview event:   ', event);
    //   // return (
    //   //   <>
    //   //     <WebView
    //   //       scrollEnabled={false}
    //   //       originWhitelist={['*']}
    //   //       // onNavigationStateChange={_onNavigationStateChange}
    //   //       source={{
    //   //         uri: loginUri,
    //   //       }}
    //   //       style={{flex: 1, backgroundColor: 'green'}}
    //   //     />
    //   //   </>
    //   // );
    // };
    if (bottomContent === BottomContent.Subs) {
      subsSuccess && console.log('my subs:   ', subsDat?.data);
      return subsSuccess ? (
        <Text>daddy yes we in: {subsDat?.data?.children}</Text>
      ) : (
        <Text>daddy no</Text>
      );
    } else {
      return <Text>daddy no</Text>;
    }
  };
  const snapPoints = useMemo(() => [-50, '25%', '50%', '100%'], []);
  // const {expand} = useBottomSheet();
  // console.log('sub pls:   ', subData?.data, subSuccess, subFetched);
  let dataProvider = new DataProvider((r1, r2) => {
    return r1.data.id !== r2.data.id;
  });

  return (
    <>
      {subSuccess && subFetched && subData?.data?.data?.children && (
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
            // getItemLayout={(data, index) => {
            //   return {
            //     length: widthPercentageToDP(100),
            //     offset: widthPercentageToDP(100) * index,
            //     index,
            //   };
            // }}
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
            // keyExtractor={({item, index}) => `${item?.data?.id}${index}`}
            renderItem={({item, index}) => _renderItem(item, index)}
          />
          {/* 
          <RecyclerListView
            scrollViewProps={{
              showsHorizontalScrollIndicator: false,
              showsVerticalScrollIndicator: false,
              // windowSize: 5,
              pinchGestureEnabled: false,
              disableScrollViewPanResponder: true,
              directionalLockEnabled: true,
              nestedScrollEnabled: true,
              disableIntervalMomentum: true,
              alwaysBounceHorizontal: false,
              alwaysBounceVertical: false,
              bounces: false,
              bouncesZoom: false,
              pagingEnabled: true,
              //   removeClippedSubviews: true,
              decelerationRate: 'fast',
              //  decelerationRate:{Platform.OS === 'ios' ? 0 : 0.985}
              snapToInterval: widthPercentageToDP(100),
              snapToAlignment: 'center',
              horizontal: true,
            }}
            isHorizontal
            layoutProvider={_layoutProvider}
            dataProvider={dataProvider.cloneWithRows(
              subData.data.data.children,
            )}
            rowRenderer={(item, index) => _renderItem(item, index)}
          /> */}

          <View
            style={{
              flexDirection: 'row',
              borderRadius: 20,
              width: widthPercentageToDP(100),
              height: heightPercentageToDP(8),
              backgroundColor: 'gray',
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
            }}>
            {/* <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 5,
                height: heightPercentageToDP(4),
                width: widthPercentageToDP(75),
                borderRadius: 100,
                backgroundColor: 'white',
              }}>
              <Text>Comment here...</Text>
            </View> */}
            <Pressable style={{flex: 2}}>
              <Icon
                size={widthPercentageToDP(7)}
                name={'comment'}
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
            <Pressable
              onPress={() => {
                if (isLoggedIn()) {
                  setbottomContent(BottomContent.Subs);
                  bottomSheetRef.current?.snapTo(1);
                } else {
                  promptAsync();
                }
              }}
              style={{flex: 2, alignItems: 'center'}}>
              <FastImage
                style={{
                  height: widthPercentageToDP(10),
                  width: widthPercentageToDP(10),
                  borderRadius: 100,
                }}
                source={{
                  uri: subAbout?.data?.data?.community_icon.match(
                    /.*\.(png|jpg)/,
                  )[0],
                }}
                resizeMode={'contain'}
              />
            </Pressable>
          </View>
          <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={snapPoints}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'blue',
              }}>
              {bottomSheetDisplay()}
            </View>
          </BottomSheet>
        </>
      )}
    </>
  );
};

export default Home;
