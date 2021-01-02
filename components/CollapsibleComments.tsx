import React, {useState} from 'react';
import {
  Pressable,
  View,
  Text,
  SectionList,
  FlatList,
  Vibration,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import {Icon} from 'react-native-elements';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';

function Comment({body, layer, children}: any) {
  const [isCollapsed, setisCollapsed] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setisCollapsed(false)}
        onLongPress={() => {
          setisCollapsed(!isCollapsed);
          Vibration.vibrate(1);
        }}>
        <View
          style={{
            borderColor: 'grey',
            borderLeftWidth: 2,
            borderTopWidth: 2,
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            marginLeft: 10,
          }}>
          <Collapsible collapsedHeight={20} collapsed={isCollapsed}>
            <Text style={{marginLeft: 5 * layer}}>{body}</Text>
            <View
              style={{
                flex: 1,
                height: heightPercentageToDP(4),
                flexDirection: 'row-reverse',
                alignItems: 'center',
              }}>
              <Pressable style={{paddingLeft: widthPercentageToDP(1)}}>
                <Icon name={'arrow-down-bold'} type={'material-community'} />
              </Pressable>
              <Pressable style={{paddingLeft: widthPercentageToDP(5)}}>
                <Icon name={'arrow-up-bold'} type={'material-community'} />
              </Pressable>
              <Pressable style={{paddingLeft: widthPercentageToDP(3)}}>
                <Icon name={'reply'} type={'material-community'} />
              </Pressable>
              <Pressable style={{paddingLeft: widthPercentageToDP(1)}}>
                <Icon name={'gift'} type={'material-community'} />
              </Pressable>
            </View>
            <CollapsibleComments layer={layer} children={children} />
          </Collapsible>
        </View>
      </Pressable>
    </>
  );
}

export default function CollapsibleComments({children, layer}: any) {
  return (
    <>
      {children && (
        <FlatList
          initialNumToRender={3}
          maxToRenderPerBatch={2}
          scrollEnabled={false}
          data={children}
          keyExtractor={(item, index) => item?.data?.id + index}
          renderItem={({item}: any) => {
            return (
              <Comment
                children={item?.data?.replies?.data?.children}
                layer={layer + 1}
                body={item?.data?.body}
              />
            );
          }}
        />
      )}
    </>
  );
}
