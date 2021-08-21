import React, {useContext, useMemo, useRef, useState} from 'react';
//import {LargeList} from 'react-native-largelist-v3';
import {Pressable, View} from 'react-native';
//import WebView from 'react-native-webview';
import {Icon, Text} from 'react-native-elements';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';

//import ImageViewer from 'react-native-image-zoom-viewer';
import BottomSheet from '@gorhom/bottom-sheet';
import BottomContent from '../utils/enums';
import {LayoutProvider, RecyclerListView} from 'recyclerlistview';
import CarouselItem from '../components/CarouselItem';
import useSub from '../hooks/useSub';
import AuthContext from '../context/AuthContext';

const fullWidth = widthPercentageToDP(100);
const Home = () => {
  const [selectedSubImg, setSelectedSubImg] = useState('');
  const {isLoggedIn, promptAsync} = useContext(AuthContext);
  const [subData, subsDat, subSuccess, subsSuccess, dataProvider] = useSub();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [bottomContent, setbottomContent] = useState(BottomContent.Subs);

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
    return <CarouselItem type={type} item={item} index={index} />;
  };

  const bottomSheetDisplay = () => {
    if (bottomContent === BottomContent.Subs) {
      subsSuccess && console.log('my subs:   ', subsDat?.data);
      return subsSuccess ? (
        <Text>works: {subsDat?.data?.children}</Text>
      ) : (
        // <BottomSheetFlatList/>
        <Text>doesn't work</Text>
      );
    } else {
      return <Text>doesn't work</Text>;
    }
  };
  const snapPoints = useMemo(() => [-50, '25%', '50%', '100%'], []);

  return (
    <>
      {subSuccess && subData?.data?.data?.children && (
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
              removeClippedSubviews: true,
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
              {/*{selectedSubImg !== '' ? (*/}
              {/*  <FastImage*/}
              {/*    style={{*/}
              {/*      height: widthPercentageToDP(10),*/}
              {/*      width: widthPercentageToDP(10),*/}
              {/*      borderRadius: 100,*/}
              {/*    }}*/}
              {/*    source={{*/}
              {/*      uri: selectedSubImg,*/}
              {/*    }}*/}
              {/*    resizeMode={'contain'}*/}
              {/*  />*/}
              {/*) : (*/}
              {/*  <Text>r/all</Text>*/}
              {/*)}*/}
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
