import React, {useContext} from 'react';
import {SafeAreaView, ScrollView, Text, View, Image, TouchableOpacity} from 'react-native';
import {GhostButton} from './Button';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../App';
import {store} from '../AppContext';
import {TodaysQuestions} from './TodaysQuestions';
import {styles} from '../styles/common';
import {getRibbonColorFromPriority} from './MyPath';
import Icon from 'react-native-vector-icons/FontAwesome';
import {getTasksForCurrentUser} from '../selectors/tasksSelector';
import { Footer } from './Footer';
import { DefaultBanner } from './Banner';
import { Category } from './Category';

type HomeScreenNavigationProp = StackNavigationProp<StackParamList,'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const Home: React.FC<Props> = (props: Props) => {
  const {navigate} = props.navigation;
  const { navigation } = props;
  const globalState = useContext(store);
  const {user} = globalState; 
  if (!user) {
    return null;
  }
  const tasks = getTasksForCurrentUser(user.id, globalState.tasks);

  const userName = user.name;
  const customMessage = "Hi, " + userName + ". We're here to make sure nothing falls through the cracks — and keep you from feeling overwhelmed.";
  const genericMessage = "We're here to make sure nothing falls through the cracks — and keep you from feeling overwhelmed.";

  function setMessage() {
    if (userName) {
      return customMessage;
    } else {
      return genericMessage;
    }
  }

  // TODO: update this sorting logic when the enums are added
  const tasksToDisplay = [...tasks]
    .sort((a, b) => {
      if (a.priority === 'HIGH') {
        if (b.priority === 'HIGH') return 0;
        else return -1;
      } else if (b.priority === 'HIGH') return 1;
      else if (a.priority === 'MEDIUM') {
        if (b.priority === 'MEDIUM') return 0;
        else return -1;
      } else if (b.priority === 'MEDIUM') return 1;
      return 0;
    })
    .sort((a, b) => {
      if (a.status === 'PENDING') {
        if (b.status === 'PENDING') return 0;
        else return -1;
      } else if (b.status === 'PENDING') return 1;
      else return 0;
    })
    .filter((t) => t.level === 1)
    .splice(0, 2);

  return (
    <>
    <SafeAreaView style={{flex: 1}}>
      <ScrollView>
        <DefaultBanner
          title={setMessage()}
          subtitle=""
        ></DefaultBanner>
        <View style={{ marginTop: 0, marginLeft: 18, marginRight: 18 }}>
          <Text
            style={{
              textTransform: "uppercase",
              color: "#444",
              fontSize: 13,
              fontWeight: "600",
            }}
          >Today's Questions</Text>
          <Text
            style={{
              color: "#444",
              fontFamily: "DMSans-Regular",
              fontSize: 16,
              marginTop: 8,
              marginBottom: 8
            }}
          >
            We'll ask you a few important questions each day so we can provide you with the right tasks at the right time.
          </Text>
          <View>
            <TodaysQuestions />
            <View style={{
              display: 'flex',
              flexDirection: 'row', 
              alignItems: 'center',
              marginTop: 18, 
              marginBottom: 18
            }}>
              <GhostButton
                onPress={() => navigate('AllQuestions')}
                title="Go to all questions"
                fontSize={18}
              />
              <Icon
                name="arrow-circle-right"
                size={18}
                backgroundColor="transparent"
                color="#11b4c3" />
            </View>
          </View>
          <View>
            <Text style={styles.homepageHeader}>Upcoming Tasks</Text>
            {tasksToDisplay.map((t) => (
              <TaskRow
                key={t.uuid}
                displayText={t.displayText}
                numSubTasks={t.subTasks.length}
                priority={t.priority}
              />
            ))}
            <View style={{
              display: 'flex',
              flexDirection: 'row', 
              alignItems: 'center',
              marginTop: 18, 
              marginBottom: 18
            }}>
            <GhostButton
              onPress={() => navigate('MyPath')}
              title="Go to all tasks"
              fontSize={18}
            />
            <Icon
                name="arrow-circle-right"
                size={18}
                backgroundColor="transparent"
                color="#11b4c3" />
            </View>
          </View>
          <View>
          <Text style={styles.homepageHeader}>Resources</Text>
          <Text
          style={{
              color: "#444",
              fontFamily: "DMSans-Regular",
              fontSize: 16,
              marginTop: 8,
          }}>
            Essays and articles to dive into when you're ready. Swipe right to explore.
          </Text>
          <SafeAreaView
            style={{
              display: "flex",
              flexWrap: "nowrap",
              flexDirection: "row",
              justifyContent: "space-between",
              flex: 1,
              marginTop: 16,
            }}
          >
            <ScrollView 
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              contentContainerStyle={{
                width: `${100 * 2.6}%` // 2.75 scrolling intervals
              }}
            >
            <TouchableOpacity 
              onPress={() => navigation.navigate('ResourcesList', { category: Category.firstSteps })}
              style={[styles.gridItem, {backgroundColor: "#384b85"}]}
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
            <TouchableOpacity 
              onPress={() => navigation.navigate('ResourcesList', { category: Category.funeralAndCeremonies })}
              style={[styles.gridItem, {backgroundColor: "#11b4c3"}]}
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
            <TouchableOpacity 
              onPress={() => navigation.navigate('ResourcesList', { category: Category.griefAndSelfCare })}
              style={[styles.gridItem, {backgroundColor: "#cde7ee"}]}
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
            <TouchableOpacity 
              onPress={() => navigation.navigate('ResourcesList', { category: Category.admin })}
              style={[styles.gridItem, {backgroundColor: "#055a73"}]}
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
            <TouchableOpacity 
              onPress={() => navigation.navigate('ResourcesList', { category: Category.legalAndFinancial })}
              style={[styles.gridItem, {backgroundColor: "#cde7ee"}]}
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
        </ScrollView>
          </SafeAreaView>
        </View>
          <View style={{
              display: 'flex',
              flexDirection: 'row', 
              alignItems: 'center',
              marginTop: 18, 
              marginBottom: 18
            }}>
            <GhostButton
              onPress={() => navigate('ResourcesLanding')}
              title="See All Resources"
              fontSize={18}
            />
            <Icon
              name="arrow-circle-right"
              size={18}
              backgroundColor="transparent"
              color="#11b4c3" />
            </View>
          </View>
      </ScrollView>
    </SafeAreaView>
    <Footer navigate={navigate} />
    </>
  );
};

interface TaskRowProps {
  displayText: string;
  numSubTasks: number;
  priority: string;
}
const TaskRow: React.FC<TaskRowProps> = (props: TaskRowProps) => {
  const {displayText, numSubTasks, priority} = props;

  return (
    <View
      style={{
        marginVertical: 8,
        borderColor: '#f0f1f4',
        borderRadius: 4,
        borderWidth: 2,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'row',
      }}>
      <View
        style={{
          margin: 12,
          backgroundColor: getRibbonColorFromPriority(priority),
          width: 4,
          borderRadius: 4,
        }}></View>
      <View
        style={{display: 'flex', flexDirection: 'column', marginVertical: 8}}>
        <Text style={{fontSize: 16, fontFamily: 'DMSans-Medium'}}>{displayText}</Text>
        <Text
          style={{
            color: '#777777',
            fontSize: 11,
          }}>{`${numSubTasks} Subtasks`}</Text>
      </View>
    </View>
  );
};
