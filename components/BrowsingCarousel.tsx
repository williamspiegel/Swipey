import React, {useRef} from 'react';
import Carousel from 'react-native-snap-carousel';
import {View} from 'react-native';
import {Text} from 'react-native-elements';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const BrowsingCarousel = ({redditData}) => {
  const carouselRef: any = useRef('');
  const _renderItem = ({item}: any) => {
    return (
      <View style={{backgroundColor: 'blue'}}>
        <Text>{item.title}</Text>
      </View>
    );
  };

  return (
    <Carousel
      ref={carouselRef}
      data={[{title: 'peen'}, {title: 'vageen'}]}
      layout="stack"
      layoutCardOffset={50}
      inactiveSlideOpacity={1}
      renderItem={_renderItem}
      sliderHeight={hp(100)}
      itemHeight={hp(100)}
      sliderWidth={wp(100)}
      itemWidth={wp(100)}
    />
  );
};

export default BrowsingCarousel;
