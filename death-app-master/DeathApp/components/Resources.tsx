import {StackNavigationProp} from '@react-navigation/stack';
import React, { useContext, useState, useEffect } from 'react';
import {View, TouchableOpacity, Text, StyleSheet, Image} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {StackParamList} from '../App';
import { Footer } from './Footer';
import { posts } from './all_posts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../AppContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Post } from './Post';
import { Category, categoryToDisplayText } from './Category';


// TODO read the posts from a file (probably use react-native-fs) instead of hard-coding strings

type ResourcesListNavigationProp = StackNavigationProp<StackParamList, 'ResourcesList'>;

interface ResourcesListProps {
  navigation: ResourcesListNavigationProp;
  route: any;
}

export const ResourcesList: React.FC<ResourcesListProps> = (props: ResourcesListProps) => {
  const { navigation, route } = props;
  const { category, isBookmarkView } = route.params;

  const globalState = useContext(store);
  const { user } = globalState;
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [currentPost, setCurrentPost] = useState<string | null>();

  if (!user) {
      return null;
  }

  useEffect(() => {
      getBookmarks().then((b) => {
          if (b) {
              setBookmarks(new Set([...b]));
          }
      })
  }, []);

  const getBookmarks = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(`@resources.bookmarks.${user.id}`)
        return jsonValue != null ? JSON.parse(jsonValue) : [];
      } catch(e) {
        console.error(`Couldn't get bookmarks for user! ${e}`);
      }
  };

    
  const saveBookmarks = async (bookmarks: Set<string>) => {
      try {
          const jsonValue = JSON.stringify([ ...bookmarks ]);
          await AsyncStorage.setItem(`@resources.bookmarks.${user.id}`, jsonValue)
      } catch (e) {
          console.error(`Couldn't save bookmark! ${e}`);
      }
  };

  const onChangeChecked = (isChecked: boolean, postId: string) => {
    const newBookmarks = new Set(bookmarks);
    if (isChecked) {
        newBookmarks.add(postId);
    } else {
        newBookmarks.delete(postId);
    }

    // This is dumb and clunky wheee
    saveBookmarks(newBookmarks)
        .then(() => {
            setBookmarks(newBookmarks);
        })
        .catch((e) => {});

  }


  const postToDisplay = posts.find((p) => p.id === currentPost);

  if (postToDisplay) {
      return (
          <Post 
            navigation={navigation}
            post={postToDisplay} 
            bookmarks={bookmarks} 
            onChangeChecked={onChangeChecked}
            setCurrentPost={setCurrentPost}
            />
      )
  }

  let filteredPosts = posts;
  if (category) {
    filteredPosts = posts.filter((p) => p.category === category);
  } 
  if (isBookmarkView) {
    filteredPosts = posts.filter((p) => bookmarks.has(p.id));
  }
  
  return (
    <>
        <ScrollView style={{
                height: "100%",
                backgroundColor: "white"
                }}>
                <View style={{ 
                    backgroundColor: "#384b85",
                    padding: 24,
                }}>
                    <Text
                        style={{
                            color: "white",
                            fontFamily: 'DM Sans',
                            fontSize: 18,
                            marginBottom: 18,
                            textAlign: 'center',
                        }}
                    >Find articles to help you on your journey. Browse by category and bookmark your favorites to reference later.</Text>
                    <TouchableOpacity 
                        onPress={() => {navigation.navigate('ResourcesList', { isBookmarkView: true, category: null })}}
                        style={{
                            flexDirection: "row",
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Text
                            style={{
                                fontWeight: "bold",
                                color: "white",
                                fontFamily: 'DM Sans',
                                fontSize: 18
                            }}
                        >Go to my Bookmarks </Text>
                        <FontAwesome
                            name="arrow-circle-right"
                            size={18}
                            backgroundColor="transparent"
                            color="#11b4c3" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress = {() => navigation.navigate('ResourcesLanding')}
                    style={{ 
                        marginTop: 18,
                        marginLeft: 8,
                        marginRight: 8,
                    }}
                >
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 18,
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
                        }}>Back to all categories</Text>
                    </View>
                </TouchableOpacity>
                {category && 
                <Text style={{
                    marginLeft: 18,
                    marginRight: 18,
                    marginBottom: 18,
                    color: "#2b2928",
                    fontSize: 28,
                    fontFamily: "Lora"
                }}>
                    {categoryToDisplayText(category)}
                </Text>
                }
                {isBookmarkView && 
                <Text style={{
                    marginLeft: 18,
                    marginRight: 18,
                    marginBottom: 18,
                    color: "#2b2928",
                    fontSize: 28,
                    fontFamily: "Lora"
                }}>
                    {"Bookmarks"}
                </Text>
                }
                <View
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingLeft: 18, 
                    paddingRight: 18,
                }}>
                    {filteredPosts.map((p) => {
                        return (
                        <View 
                            key={p.id}
                            style={{ 
                                marginLeft: 18, 
                                marginRight: 18,
                                marginBottom: 18,
                                width: "100%", 
                                borderColor: "#f0f1f4", 
                                borderWidth: 2,
                                borderRadius: 4,
                            }}>
                            <TouchableOpacity 
                                style={{ 
                                    padding: 18
                                }}
                                key={p.id}
                                onPress = {() => setCurrentPost(p.id)}>
                                <View>
                                    <Text style={{ 
                                        fontFamily: 'DMSans-Medium',
                                        fontSize: 19,
                                        paddingBottom: 8,
                                    }}>{p.title}</Text>
                                
                                <View style={{ 
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    }}>
                                    <Text style={{
                                        fontFamily: 'DM Sans',
                                        color: '#777777',
                                    }}>Article by {p.author}</Text>
                                    { bookmarks.has(p.id) ? 
                                        <TouchableOpacity onPress = {() => onChangeChecked(false, p.id)}>
                                            <FontAwesome
                                            name="bookmark"
                                            backgroundColor="transparent"
                                            color="#11b4c3"
                                            size={26}
                                            padding={4}
                                        /> 
                                        </TouchableOpacity>
                                        : 
                                        <TouchableOpacity onPress = {() => onChangeChecked(true, p.id)}>
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
                                </View>
                            </TouchableOpacity>
                        </View>
                        );
                    })}
                    
                </View>
            </ScrollView>
        <Footer navigate={props.navigation.navigate} />
    </>
  );
};

type ResourcesLandingNavigationProp = StackNavigationProp<StackParamList, 'ResourcesLanding'>;

interface ResourcesLandingProps {
    navigation: ResourcesLandingNavigationProp;
}

export const ResourcesLanding: React.FC<ResourcesLandingProps> = (props: ResourcesLandingProps) => {
    const { navigation } = props;

    return (
        <>
            <ScrollView style={{ flexDirection: 'column' }}>
            <View style={{ 
                    backgroundColor: "#384b85",
                    padding: 24,
                }}>
                    <Text
                        style={{
                            color: "white",
                            fontFamily: 'DM Sans',
                            fontSize: 18,
                            marginBottom: 18,
                            textAlign: 'center',
                        }}
                    >Find articles to help you on your journey. Browse by category and bookmark your favorites to reference later.</Text>
                    <TouchableOpacity 
                        onPress={() => {navigation.navigate('ResourcesList', { isBookmarkView: true, category: null })}}
                        style={{
                            flexDirection: "row",
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Text
                            style={{
                                fontWeight: "bold",
                                color: "white",
                                fontFamily: 'DM Sans',
                                fontSize: 18
                            }}
                        >Go to my Bookmarks </Text>
                        <FontAwesome
                            name="arrow-circle-right"
                            size={18}
                            backgroundColor="transparent"
                            color="#11b4c3" />
                    </TouchableOpacity>
                </View>
                <View style={{
                    display: "flex",
                    flexWrap: "wrap",
                    flexDirection: "row",
                    justifyContent: "space-around",
                    flex: 1,
                    margin: 18,
                }}>
                    <TouchableOpacity onPress={() => navigation.navigate('ResourcesList', { category: Category.firstSteps, isBookmarkView: false })}
                        style={{ 
                            ...styles.gridItem,
                            backgroundColor: "#055a73",
                        }}
                    >
                        <Image
                            style={{
                            width: 27,
                            height: 39,
                            }}
                            source={require('../assets/images/first-steps-light.png')}
                        />
                        <Text style={styles.gridItemTextWhite}>{'First steps'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('ResourcesList', { category: Category.funeralAndCeremonies, isBookmarkView: false })}
                        style={{ 
                            ...styles.gridItem,
                            backgroundColor: "#11b4c3",
                        }}
                    >
                        <Image
                            style={{
                            width: 37,
                            height: 36,
                            }}
                            source={require('../assets/images/funeral-dark.png')}
                        />
                        <Text style={styles.gridItemTextDark}>{'Funeral & Ceremonies'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('ResourcesList', { category: Category.griefAndSelfCare, isBookmarkView: false })}
                        style={{ 
                            ...styles.gridItem,
                            backgroundColor: "#cde7ee",
                        }}
                    >
                        <Image
                            style={{
                            width: 39,
                            height: 35,
                            }}
                            source={require('../assets/images/grief-dark.png')}
                        />
                        <Text style={styles.gridItemTextDark}>{'Grief & Self Care'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('ResourcesList', { category: Category.admin, isBookmarkView: false })}
                        style={{ 
                            ...styles.gridItem,
                            backgroundColor: "#055a73",
                        }}
                    >
                        <Image
                            style={{
                            width: 35,
                            height: 33,
                            }}
                            source={require('../assets/images/life-admin-light.png')}
                        />
                        <Text style={styles.gridItemTextWhite}>{'Life Admin'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('ResourcesList', { category: Category.legalAndFinancial, isBookmarkView: false })}
                        style={{ 
                            ...styles.gridItem,
                            backgroundColor: "#cde7ee",
                        }}
                    >
                        <Image
                            style={{
                            width: 39,
                            height: 40,
                            }}
                            source={require('../assets/images/legal-dark.png')}
                        />
                        <Text style={styles.gridItemTextDark}>{'Legal & Financial'}</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
            <Footer navigate={navigation.navigate} />
        </>
    );
};

const styles = StyleSheet.create({
    gridItem: {
        width: 168,
        height: 154,
        backgroundColor: "#055a73",
        borderRadius: 4,
        margin: 8,
        alignItems: "flex-start",
        fontFamily: "DMSans-Medium",
        padding: 24,
    },
    gridItemText: {
        textAlign: "center",
        fontSize: 18, 
        fontWeight: "bold",
        marginTop: 12,
    },
    gridItemTextDark: {
        color: "#2b2928",
        textAlign: "left",
        fontSize: 18, 
        fontWeight: "bold",
        marginTop: 16,
      },
      gridItemTextWhite: {
        color: "#fff",
        textAlign: "left",
        fontSize: 18, 
        fontWeight: "bold",
        marginTop: 16,
      }
});