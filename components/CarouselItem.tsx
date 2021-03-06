import React, {useContext} from 'react';
import {useQuery} from 'react-query';
import axios from 'axios';
import {Pressable, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import {Avatar, Icon, Text} from 'react-native-elements';
import he from 'he';
import ContentDisplay from './ContentDisplay';
import ContentRoot from './ContentRoot';
import AuthContext from '../context/AuthContext';
import useVote from '../hooks/useVote';

export default function CarouselItem({item, index}: any) {
  const {tok} = useContext(AuthContext);
  const [upvote, downvote, vote] = useVote(item?.data?.name);
  const {data: subAbout} = useQuery(
    'subAbout' + tok + item?.data?.subreddit, //getTok(),
    () =>
      axios({
        method: 'get',
        url: `https://oauth.reddit.com/r/${item?.data?.subreddit}/about`,
        headers: {
          Authorization: `bearer ${tok}`, //|| loggedInAuthToken
          'User-Agent': 'Swipey for Reddit',
        },
      }),
    {enabled: !!tok}, //isLoggedIn ||
  );
  // console.log(`current item at index ${index?.data?.all_awardings}`);
  //  console.log('index:    ', index);

  const header = () => (
    <>
      <View collapsable style={{padding: 10, flexDirection: 'row'}}>
        {subAbout?.data?.data?.community_icon ||
        subAbout?.data?.data?.icon_img ? (
          <FastImage
            style={{
              height: widthPercentageToDP(7),
              width: widthPercentageToDP(7),
              borderRadius: 100,
            }}
            source={{
              uri: subAbout?.data?.data?.community_icon
                ? subAbout?.data?.data?.community_icon.match(/.*\.(png|jpg)/)[0]
                : subAbout?.data?.data?.icon_img,
            }}
            resizeMode={'contain'}
          />
        ) : (
          <Avatar
            containerStyle={{
              height: widthPercentageToDP(7),
              width: widthPercentageToDP(7),
              borderRadius: 100,
            }}
            title={subAbout?.data?.data?.title}
          />
        )}
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
          margin: 10,
          fontWeight: 'bold',
        }}>
        {item?.data?.title}
      </Text>

      <ContentDisplay item={item} />

      <View
        collapsable
        style={{
          height: heightPercentageToDP(5),
          flexDirection: 'row',
          alignItems: 'center',
          borderTopWidth: 1,
          borderColor: 'grey',
        }}>
        <Pressable style={{flex: 1}}>
          <Icon
            size={widthPercentageToDP(6)}
            name={'gift'}
            type={'material-community'}
          />
        </Pressable>
        <Pressable style={{flex: 1}}>
          <Icon
            size={widthPercentageToDP(6)}
            name={'share'}
            type={'material-community'}
          />
        </Pressable>
        <Pressable style={{flex: 1}}>
          <Icon
            size={widthPercentageToDP(6)}
            name={'comment'}
            type={'material-community'}
          />
        </Pressable>
        {/*@ts-ignore*/}
        <Pressable onPress={upvote} collapsable style={{flex: 1}}>
          <Icon
            size={widthPercentageToDP(7)}
            name={'arrow-up-bold'}
            type={'material-community'}
            color={vote === 1 ? 'orange' : 'black'}
          />
        </Pressable>
        <View collapsable>
          <Text adjustsFontSizeToFit numberOfLines={1} ellipsizeMode={'clip'}>
            {item?.data?.score < 1000
              ? item?.data?.score //@ts-ignore
              : Number.parseFloat(item?.data?.score / 1000).toFixed(1) + 'k'}
          </Text>
        </View>
        {/*@ts-ignore*/}
        <Pressable onPress={downvote} collapsable style={{flex: 1}}>
          <Icon
            size={widthPercentageToDP(7)}
            name={'arrow-down-bold'}
            type={'material-community'}
            color={vote === -1 ? 'blue' : 'black'}
          />
        </Pressable>
      </View>
    </>
  );
  return <ContentRoot item={item} index={index} header={header} />;
}
