import React, {useEffect, useMemo, useRef, useState} from 'react';
//import {LargeList} from 'react-native-largelist-v3';
import {Pressable, View} from 'react-native';
import {useQuery, useQueryClient} from 'react-query';
import axios from 'axios';
import he from 'he';
//import WebView from 'react-native-webview';
import {Icon, Text} from 'react-native-elements';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';

//import ImageViewer from 'react-native-image-zoom-viewer';
import ContentRoot from '../components/ContentRoot';
import FastImage from 'react-native-fast-image';
import ContentDisplay from '../components/ContentDisplay';
import BottomSheet from '@gorhom/bottom-sheet';
import BottomContent from '../utils/enums';
import {makeRedirectUri, ResponseType, useAuthRequest} from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import {OptimizedFlatList} from 'react-native-optimized-flatlist';
import {DataProvider, LayoutProvider, RecyclerListView} from 'recyclerlistview';

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
const fullWidth = widthPercentageToDP(100);
const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInAuthToken, setLoggedInAuthToken] = useState('');
  useEffect(() => {
    AsyncStorage.getItem('userToken').then((val) => {
      console.log('got user token:  ', val);
      queryClient.invalidateQueries();
      if (val === null) {
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
        setLoggedInAuthToken(val);
      }
    });
  }, []);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [bottomContent, setbottomContent] = useState(BottomContent.Subs);
  const queryClient = useQueryClient();
  const {data: userTok, isSuccess: userSuccess} = useQuery('userTok', () => {
    return AsyncStorage.getItem('userToken').then((val) => {
      if (val) {
        return val;
      } else {
        console.log('you are not logged in');
        return null;
      }
    });
  });
  const utok = userTok?.data?.access_token;
  //console.log('utok:   ', utok);
  const {data: anon} = useQuery(
    'anon',
    () => {
      return AsyncStorage.getItem('userToken').then((val: any) => {
        return val ? val : axios(config);
      });
    },
    {enabled: !!!utok},
  );

  //const loginCallback = () => useQuery('userLogin');
  const anonTok = anon?.data?.access_token;
  //console.log('token:   ', anonTok);

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
      const {access_token} = response.params;
      console.log('login is successful: new access token: ', access_token);
      queryClient.invalidateQueries();
      AsyncStorage.setItem('userToken', access_token).then(() =>
        console.log('access token successfully stored'),
      );
      setIsLoggedIn(true);
      setLoggedInAuthToken(access_token);
    }
  }, [response]);
  const [dataProvider, setDataProvider] = useState(
    new DataProvider((r1, r2) => {
      return r1.data.id !== r2.data.id;
    }),
  );

  const {data: subData, isSuccess: subSuccess} = useQuery(
    'subData' + loggedInAuthToken,
    () => {
      console.log('sup nibba we in:  ', loggedInAuthToken);
      return axios({
        method: 'get',
        url: 'https://oauth.reddit.com/r/dankmemes/hot?g=US&after&limit=100',
        headers: {
          Authorization: `bearer ${anonTok || loggedInAuthToken}`, // ${loggedInAuthToken}`,
          'User-Agent': 'Swipey for Reddit',
        },
      })
        .then((ret) => {
          setDataProvider(dataProvider.cloneWithRows(ret.data.data.children));
          console.log('dataProvider set');
          return ret;
        })
        .catch((err) => console.log('sub fetch error:  ', err));
    },
    {enabled: isLoggedIn || !!anonTok},
  );
  const {data: subAbout, isSuccess: subFetched} = useQuery(
    'subAbout' + getTok(),
    () =>
      axios({
        method: 'get',
        url: 'https://oauth.reddit.com/r/dankmemes/about',
        headers: {
          Authorization: `bearer ${anonTok || loggedInAuthToken}`,
          'User-Agent': 'Swipey for Reddit',
        },
      }),
    {enabled: isLoggedIn || !!anonTok},
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

  const _renderItem = (type: string, item: any, index: number) => {
    // console.log(`current item at index ${index?.data?.all_awardings}`);
    //  console.log('index:    ', index);
    const header = () => (
      <>
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
          {item?.data?.all_awardings?.slice(0, 100).map((i: any) => {
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
            height: heightPercentageToDP(6),
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
      </>
    );
    return (
      <ContentRoot
        token={anonTok || loggedInAuthToken}
        item={item}
        index={index}
        header={header}
      />
    );
  };
  const {data: subsDat, isSuccess: subsSuccess} = useQuery(
    'subs' + loggedInAuthToken,
    () => {
      return axios({
        method: 'get',
        url: 'https://oauth.reddit.com/subreddits/mine/subscriber',
        headers: {
          Authorization: `bearer ${anonTok || loggedInAuthToken}`,
          'User-Agent': 'Swipey for Reddit',
        },
      });
    },
    {enabled: isLoggedIn},
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
        // <BottomSheetFlatList/>
        <Text>daddy no</Text>
      );
    } else {
      return <Text>daddy no</Text>;
    }
  };
  const snapPoints = useMemo(() => [-50, '25%', '50%', '100%'], []);
  // const {expand} = useBottomSheet();
  // console.log('sub pls:   ', subData?.data, subSuccess, subFetched);
  // const _momentumFun = (event: any) => {
  //   snapFocusIndex.current = Math.round(
  //     event.nativeEvent.contentOffset.x / widthPercentageToDP(100),
  //   );

  // console.log('triggered index:   ', widthPercentageToDP(100));
  // };
  return (
    <>
      {console.log('rerender')}
      {subSuccess && subFetched && subData?.data?.data?.children && (
        <>
          <RecyclerListView
            scrollViewProps={{
              //  onMomentumScrollEnd: _momentumFun,
              showsHorizontalScrollIndicator: false,
              showsVerticalScrollIndicator: false,
              //windowSize: 10,
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
              // removeClippedSubviews: true,
              decelerationRate: 'fast',
              //decelerationRate:{Platform.OS === 'ios' ? 0 : 0.985},
              snapToInterval: fullWidth,
              // snapToAlignment: 'center',
              horizontal: true,
            }}
            isHorizontal
            //  renderAheadOffset={2}
            layoutProvider={_layoutProvider}
            dataProvider={dataProvider}
            rowRenderer={(type, data, index) => _renderItem(type, data, index)}
          />
          <View
            style={{
              flexDirection: 'row',
              borderRadius: 20,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              width: widthPercentageToDP(100),
              height: heightPercentageToDP(8),
              backgroundColor: 'gray',
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
            }}>
            <Pressable style={{flex: 2}}>
              <Icon
                onPress={() => promptAsync()}
                size={widthPercentageToDP(7)}
                name={'account-circle'}
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
                if (isLoggedIn) {
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
