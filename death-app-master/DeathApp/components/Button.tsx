import React from 'react';
import {TouchableOpacity, Text} from 'react-native';

interface Props {
    title: string;
    onPress: () => any;
    fontSize?: number;
    paddingHorizontal?: number;
  }

  export const PrimaryButton: React.FC<Props> = (props: Props) => {
    const { title, onPress, fontSize} = props;
    return (
        <TouchableOpacity
        onPress={onPress}
        style={{
        minHeight: 48,
        minWidth: 100,
        borderRadius: 100,
        paddingVertical: 10,
        paddingHorizontal: 24,
        backgroundColor: '#055a73',
        borderColor: '#055a73',
        borderWidth: 2,
        }}>
        <Text
        style={{
            fontFamily: 'DMSans-Bold',
            fontSize: fontSize || 18,
            color: '#fff',
            alignSelf: 'center',
        }}>
        {title}
        </Text>
    </TouchableOpacity>
    )
}; 

export const GhostButton: React.FC<Props> = (props: Props) => {
    const { title, onPress, fontSize, paddingHorizontal} = props;
    return (
    <TouchableOpacity
        onPress={onPress}
        style={{
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: paddingHorizontal || 12,
        }}>
        <Text
        style={{
            fontFamily: 'DMSans-Medium',
            fontSize: fontSize || 14,
            color: '#055a73',
            alignSelf: 'center',
        }}>
        {title}
        </Text>
    </TouchableOpacity>
    );
};

export const SecondaryButton: React.FC<Props> = (props: Props) => {
    const { title, onPress, fontSize} = props;
    return (
    <TouchableOpacity
        onPress={onPress}
        style={{
        minHeight: 48,
        minWidth: 100,
        borderRadius: 100,
        paddingVertical: 10,
        paddingHorizontal: 24,
        backgroundColor: 'transparent',
        borderColor: '#055a73',
        borderWidth: 2,
        }}>
        <Text
        style={{
            fontFamily: 'DMSans-Bold',
            fontSize: fontSize || 18,
            fontWeight: "600",
            color: '#055a73',
            alignSelf: 'center',
        }}>
        {title}
        </Text>
    </TouchableOpacity>
    )
};

export const PillButtonOff: React.FC<Props> = (props: Props) => {
    const { title, onPress, fontSize} = props;
    return (
    <TouchableOpacity
        onPress={onPress}
        style={{
            maxHeight: 50,
            minWidth: 65,
            borderRadius: 100,
            paddingVertical: 7.5,
            paddingHorizontal: 16,
            marginBottom: 24, 
            marginHorizontal: 20, 
            backgroundColor: 'transparent',
            borderColor: '#055a73',
            borderWidth: 2,
        }}>
        <Text
        style={{
            fontFamily: 'DMSans-Bold',
            fontSize: fontSize || 14,
            color: '#055a73',
            alignSelf: 'center',
        }}>
        {title}
        </Text>
    </TouchableOpacity>
    )
};

export const PillButtonOn: React.FC<Props> = (props: Props) => {
    const { title, onPress, fontSize} = props;
    return (
    <TouchableOpacity
        onPress={onPress}
        style={{
            maxHeight: 50,
            minWidth: 65,
            borderRadius: 100,
            paddingVertical: 7.5,
            paddingHorizontal: 16,
            marginBottom: 24, 
            marginHorizontal: 20, 
            backgroundColor: '#cde7ee',
            borderColor: '#055a73',
            borderWidth: 2,
        }}>
        <Text
        style={{
            fontFamily: 'DMSans-Bold',
            fontSize: fontSize || 14,
            color: '#055a73',
            alignSelf: 'center',
        }}>
        {title}
        </Text>
    </TouchableOpacity>
    )
};

export const CancelButton: React.FC<Props> = (props: Props) => {
    const { title, onPress, fontSize} = props;
    return (
    <TouchableOpacity
        onPress={onPress}
        style={{
        paddingVertical: 10,
        paddingHorizontal: 24,
        marginHorizontal: 12,
        backgroundColor: 'transparent',
        }}>
        <Text
        style={{
            fontFamily: 'DMSans-Bold',
            fontSize: fontSize || 18,
            color: '#ae2b0a',
            alignSelf: 'center',
            textDecorationLine: 'underline',
            textDecorationColor: '#ae2b0a',
        }}>
        {title}
        </Text>
    </TouchableOpacity>
    )
};
