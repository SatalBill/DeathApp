import React from 'react';
import Markdown from 'react-native-markdown-display';
import {ScrollView} from 'react-native-gesture-handler';
import {View, Text, TouchableOpacity} from 'react-native';
import {Footer} from './Footer';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


interface Props {
    navigation: any;
    post: any; // TODO
    onChangeChecked: (isChecked: boolean, postId: string) => void; 
    bookmarks: Set<string>;
    setCurrentPost: (postId: string | null) => void;
}
export const Post = (props: Props) => {
    const { 
        post, 
        onChangeChecked, 
        bookmarks,
        setCurrentPost,
    } = props;

    const isBookmarked = bookmarks && bookmarks.has(post.id);

    return (
        <>
        <ScrollView style={{
                height: "100%",
                backgroundColor: "white",
                }}>
            <TouchableOpacity onPress = {() => setCurrentPost(null)}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 18,
                    marginLeft: 8,
                    marginRight: 8,
                }}>
                    <FontAwesome 
                        name="chevron-left"
                        backgroundColor="transparent"
                        color="#055a73"
                        size={16}
                    /> 
                    <Text style={{
                        marginLeft: 8,
                        fontSize: 21,
                        color: "#055a73",
                        fontFamily: 'DMSans-Medium',
                        textDecorationLine: 'underline',
                    }}>Back to Articles</Text>
                </View>
            </TouchableOpacity>
            <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginTop: 18,
                marginLeft: 18,
                marginRight: 18,
                }}>
                <Text style={{
                    fontFamily: 'DMSans-Medium',
                    marginRight: 8,
                }}
                >
                    Bookmark this article: 
                </Text>
            {isBookmarked ? 
                <TouchableOpacity onPress = {() => onChangeChecked(false, post.id)}>
                    <FontAwesome
                    name="bookmark"
                    backgroundColor="transparent"
                    color="#11b4c3"
                    size={26}
                    padding={4}
                /> 
                </TouchableOpacity>
                : 
                <TouchableOpacity onPress = {() => onChangeChecked(true, post.id)}>
                    <FontAwesome
                        name="bookmark-o"
                        backgroundColor="transparent"
                        color="#11b4c3"
                        size={26}
                        padding={4}
                    />
                </TouchableOpacity>
            }
            </View>
            <Markdown
                style={{ 
                    body: {
                        margin: 18,
                        color: "#333",
                        lineHeight: 24,
                        fontSize: 16,
                    }
                }}
                >
                {post.copy}
            </Markdown>
        </ScrollView>
        <Footer navigate={props.navigation.navigate} />
    </>
    )
};
