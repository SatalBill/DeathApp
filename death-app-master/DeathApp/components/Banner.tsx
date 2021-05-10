import React from 'react';
import {Text, View} from 'react-native';
import {styles} from '../styles/common';

interface Props {
  title: string;
  subtitle: string;
  fontSize?: number;
}

export const DefaultBanner: React.FC<Props> = (props: Props) => {
  const { title, subtitle, fontSize} = props;
  return (
    <View style={{
      backgroundColor: '#384b85',
      marginBottom: 18,
      paddingVertical: 36,
      paddingHorizontal: 24
    }}
    >
      <Text
        style={{
          fontFamily: 'DMSans-Medium',
          fontSize: fontSize || 18,
          lineHeight: 24,
          color: '#fff',
          textAlign: 'center'
        }}>
        {title}
      </Text>
      <Text
        style={{
          fontFamily: 'DMSans-Regular',
          fontSize: fontSize || 16,
          lineHeight: 21,
          color: '#fff',
          textAlign: 'center',
          marginTop: 8
        }}>
        {subtitle}
      </Text>
    </View>
  )
};