import React from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { View, TouchableOpacity, Text } from 'react-native';

export interface FooterProps {
    navigate: any;
} 
export const Footer = (props: FooterProps) => (
    <View style ={{
      display: 'flex',
      flexDirection: 'row', 
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 12,
      paddingBottom: 36,
      backgroundColor: "#055a73",
    }}>
      <TouchableOpacity onPress={() => props.navigate('Home')}>
        <View style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingRight: 16
        }}>
          <AntDesign 
            name="home"
            backgroundColor="transparent"
            color="white"
            size={26}
            padding={4}
          />
          <Text style = {{ color: "white" }}>Home</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => props.navigate('MyPath')}>
        <View style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingLeft: 16,
          paddingRight: 16,
        }}>
          <AntDesign
            name="bars"
            backgroundColor="transparent"
            color="white"
            size={26}
            padding={4}
          />
          <Text style = {{ color: "white" }}>My Path</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => props.navigate('Profile')}>
        <View style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingLeft: 16,
          paddingRight: 16,
        }}>
          <FontAwesome
            name="user-o"
            backgroundColor="transparent"
            color="white"
            size={26}
            padding={4}
          />
          <Text style = {{ color: "white" }}>My Profile</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => props.navigate('ResourcesLanding')}>
        <View style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingLeft: 16,
        }}>
          <AntDesign 
            name="filetext1"
            backgroundColor="transparent"
            color="white"
            size={26}
            padding={4}
          />
          <Text style = {{ color: "white" }}>Resources</Text>
        </View>
      </TouchableOpacity>
  </View>
  );