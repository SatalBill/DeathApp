import React, {useState} from 'react';
import {Text, TextInput, Platform, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {PillButtonOff, PillButtonOn, PrimaryButton, SecondaryButton, GhostButton} from './Button';
import {styles} from '../styles/common';
import DateTimePicker from '@react-native-community/datetimepicker';
import CheckBox from '@react-native-community/checkbox';

interface TextProps {
  question?: QuestionText;
  displayText: string;
  currentValue: string;
  placeholderText: string;
  subText?: string;
  callback: (input: any) => void;
}

interface NumberProps {
  question: QuestionNumber;
  currentValue: string;
  setNumber: (input: string) => void;
}

interface DateProps {
  question: QuestionDate;
  currentValue: Date;
  setDate: (selectedDate: Date) => void;
}

interface MultiSelectProps {
  question: QuestionMultiSelect;
  selectedItems: Set<number>;
  setSelectedItems: (items: Set<number>) => void;
}

interface SingleSelectProps {
  question: QuestionSingleSelect;
  selectedItem: number;
  setSelectedItem: (items: number | null) => void;
}

interface BooleanProps {
  question: QuestionBoolean;
  setIsTrue: (isTrue: boolean) => void;
  currentValue?: boolean;
}

interface QuestionListProps {
  userId: string;
  questions: Question[];
  answers: Map<string, Answer>;
  onChangeAnswer: (userId: string, questionId: string, value: any) => void;
  // The following properties exist only for the AllQuestions list
  setAddModalVisible?: (entityTemplateId: string) => void;
  setEditModalVisible?: (entityAnswerId: string) => void;
  entityTemplates?: EntityTemplate[];
  entityAnswers?: Map<string, EntityAnswer>;
}

// TODO this is maybe a weird place for these enums to live
export enum QuestionType {
  string = 'STRING',
  number = 'NUMBER',
  date = 'DATE',
  boolean = 'BOOLEAN',
  singleSelect = 'SINGLE_SELECT',
  multiSelect = 'MULTI_SELECT',
}

export const QuestionTextInput: React.FC<TextProps> = (props: TextProps) => (
  <>
      <TextInput
        style={{...styles.textInput, marginBottom: 6}}
        autoCapitalize="none"
        onChangeText={(text) => props.callback(text)}
        placeholder={props.placeholderText}
        value={props.currentValue}
      />
      {props.subText && 
        <Text
          style={{
            fontSize: 11,
            color: '#444444',
            textAlign: 'left',
            marginBottom: 24,
          }}>
          {props.subText}
        </Text>
      }
  </>
)

export const QuestionText: React.FC<TextProps> = (props: TextProps) => {
  const {displayText} = props;
  return (
    <View style={{marginBottom: 24}}>
      <Text style={styles.textInputLabel}>
        {displayText}
      </Text>
      <QuestionTextInput {...props} />
    </View>
  );
};

export const QuestionNumberInput: React.FC<NumberProps> = (props: NumberProps) => (
  <TextInput
      style={{...styles.textInput, marginBottom: 6}}
      autoCapitalize="none"
      onChangeText={(val) => props.setNumber(val)}
      keyboardType={"numeric"}
      value={props.currentValue}
    />
);

// TODO support decimals or integers
// TODO validate that input is valid number
export const QuestionNumber: React.FC<NumberProps> = (props: NumberProps) => {
  const {question} = props;
  return (
    <View style={{marginBottom: 24}}>
      <Text style={styles.textInputLabel} >
        {question.displayText}
      </Text>
      <QuestionNumberInput { ...props } />
    </View>
  );
};

//alpha date picker

export const QuestionDate: React.FC<DateProps> = (props: DateProps) => {
  const {question, currentValue, setDate} = props;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const onDateChange = (event: any, selectedDate: any) => {
    // TODO fix types
    const currentDate = selectedDate || currentValue;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };  



  //remove primary button
  //have a text input field
  //icon inside input -> if can't do that, have it next to it, which would function as the primary button does now
  //see if there is any documentation on how to skip that intermediate step
  return (
    <View style={{marginBottom: 24}}>
      <Text style={styles.textInputLabel}>
        {question.displayText}
      </Text>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center', 
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 4,
        width: '100%',
        maxHeight: 48, 
        minHeight: 48,
        marginBottom: 8,
        marginTop: 8,
        paddingLeft: 12,
        }}>
          {/* <TextInput
            style={{fontFamily: 'DMSans-Medium',fontSize: 18,}}
            placeholder="MM/DD/YYYY"
            onChangeText={(searchString) => {}}
          /> */}
          <Icon.Button style={{

          }}
            name="calendar"
            size={25}
            backgroundColor="transparent"
            color="#11b4c3"
            onPress={() => setShowDatePicker(!showDatePicker)}/>
              {showDatePicker && (
                <DateTimePicker
                  style={{width: '100%'}}
                  testID="dateTimePicker"
                  value={currentValue ? currentValue : new Date()}
                  mode={'date'}
                  is24Hour={false}
                  display="default"
                  onChange={onDateChange}
                />
                )}
      </View>
    </View>
  );
};

export const QuestionMultiSelectInput: React.FC<MultiSelectProps> = (props: MultiSelectProps) => (
  <>
      {props.question.options.map((o) => {
        return (
          <View
            key={o.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              marginTop: 8,
              marginBottom: 3,
              padding: 15,
              backgroundColor: '#fff',
              borderWidth: 2,
              borderColor: '#d8d8d8',
              borderRadius: 2,
            }}>
              <CheckBox
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], justifyContent: 'center'}}
                disabled={false}
                boxType={'square'}
                value={props.selectedItems ? props.selectedItems.has(o.id) : false}
                tintColor={'#777777'}
                onFillColor={'#11b4c3'}
                onCheckColor={'#fff'}
                onTintColor={'#11b4c3'}
                onAnimationType={'fade'}
                offAnimationType={'fade'}
                onValueChange={(isChecked) => {
                  const newItems = new Set(props.selectedItems);
                  if (isChecked) {
                    newItems.add(o.id);
                  } else {
                    newItems.delete(o.id);
                  }
                  props.setSelectedItems(newItems);
                }}
              />
              <Text
                style={{
                  marginLeft: 12,
                  fontSize: 18,
                  fontFamily: 'DMSans-Regular',
                  color: '#444444',
                }}>
                {' '}
                {o.name}
              </Text>
          </View>
        );
      })}  
    </>
);

export const QuestionMultiSelect: React.FC<MultiSelectProps> = (
  props: MultiSelectProps,
) => {
  const {question} = props;
  return (
    <View style={{marginBottom: 24}}> 
      <Text style={styles.textInputLabel}>
        {question.displayText}
      </Text>
      {question.subText ? <Text style={{
        fontFamily: 'DMSans-Regular',
        fontSize: 12, 
        lineHeight: 15, 
        color: '#444444'}}>
        {question.subText}
      </Text> : null}
      <QuestionMultiSelectInput { ...props } />
    </View>
  );
};

const QuestionSingleSelectInput: React.FC<SingleSelectProps> = (props: SingleSelectProps) => (
<>
  {props.question.options.map((o) => {
        return (
          <View
            key={o.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              marginTop: 8,
              marginBottom: 3,
              padding: 15,
              backgroundColor: '#fff',
              borderWidth: 2,
              borderColor: '#d8d8d8',
              borderRadius: 2,
            }}>
            <CheckBox
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]}}
              disabled={false}
              boxType={'square'}
              value={props.selectedItem === o.id}
              tintColor={'#777777'}
              onFillColor={'#11b4c3'}
              onCheckColor={'#fff'}
              onTintColor={'#11b4c3'}
              onAnimationType={'fade'}
              offAnimationType={'fade'}
              onValueChange={(isChecked) => {
              props.setSelectedItem(isChecked ? o.id : null);
            }}
            />
            <Text
              style={{
                marginLeft: 12,
                fontSize: 18,
                fontFamily: 'DMSans-Regular',
                color: '#444444',
              }}>
              {' '}
              {o.name}
            </Text>
          </View>
        );
      })}
  </>
);

export const QuestionSingleSelect: React.FC<SingleSelectProps> = (
  props: SingleSelectProps,
) => {
  const {question} = props;
  return (
    <View style={{marginBottom: 24}}>
      <Text style={{fontSize: 14, textAlign: 'left', width: '90%'}}>
        {question.displayText}
      </Text>
      <Text style={{fontSize: 11, textAlign: 'left', width: '90%'}}>
        {question.subText}
      </Text>
      <QuestionSingleSelectInput { ...props } />
    </View>
  );
};

export const QuestionBoolean: React.FC<BooleanProps> = (
  props: BooleanProps,
) => {
  return (
    <View style={{marginBottom: 24}}>
      <Text style={styles.textInputLabel}>
        {props.question.displayText}
      </Text>
      <QuestionBooleanInput {...props} />
    </View>
  );
};

export const QuestionBooleanInput: React.FC<BooleanProps> = (
  props: BooleanProps,
) => {
  const {setIsTrue, currentValue} = props;
  return (
    <View style={{
      display: 'flex', 
      flexDirection: 'row', 
      justifyContent: 'center', 
      marginTop: 10, 
      marginBottom:24, 
      marginLeft: -20 
    }}>
      {currentValue !== undefined && currentValue ? (
        <PillButtonOn title="Yes" onPress={() => {}} />
      ) : (
        <PillButtonOff
          key="yes"
          onPress={() => setIsTrue(true)}
          title={'Yes'}
        />
      )}
      {currentValue !== undefined && !currentValue ? (
        <PillButtonOn title="No" onPress={() => {}} />
      ) : (
        <PillButtonOff
          key="no"
          onPress={() => setIsTrue(false)}
          title={'No'}
        />
      )}
    </View>
  );
};


export const QuestionList: React.FC<QuestionListProps> = (
  props: QuestionListProps,
) => {
  const {
    questions, 
    answers, 
    onChangeAnswer, 
    userId,
    setAddModalVisible,
    setEditModalVisible,
    entityTemplates,
    entityAnswers,
  } = props;

  return (
    <>
      {questions.map((q: Question) => {
        const currentAnswer = answers.has(q.id) && answers.get(q.id);
        const currentValue = currentAnswer?.value;
        switch (q.type) {
          case QuestionType.string:
            return (
              <QuestionText 
                key={q.id}
                displayText={q.displayText}
                callback={(text) => onChangeAnswer(userId, q.id, text)}
                currentValue={currentValue}
                subText={q.subText}
                placeholderText={q.placeholderText}
              />
            );
          case QuestionType.date:
            return (
              <QuestionDate
                key={q.id}
                question={q}
                setDate={(newDate) => onChangeAnswer(userId, q.id, newDate)}
                currentValue={currentValue}
              />
            );
          case QuestionType.multiSelect:
            return (
              <QuestionMultiSelect
                key={q.id}
                question={q}
                selectedItems={currentValue}
                setSelectedItems={(items) =>
                  onChangeAnswer(userId, q.id, items)
                }
              />
            );
          case QuestionType.singleSelect:
            return (
              <QuestionSingleSelect
                key={q.id}
                question={q}
                selectedItem={currentValue}
                setSelectedItem={(item) => onChangeAnswer(userId, q.id, item)}
              />
            );
          case QuestionType.boolean:
              /**
             * For each boolean question in the question list, check if there is a triggerEntity
             * If yes and the question answer matches show the card objects and the + button
             * If no, don't show the card objects or the plus button
            */
            // The triggerValue is also always true at the moment, but later we also check if it matches triggerValue
            const shouldShowEntityContent = q.triggerEntities && q.triggerEntities.length > 0
              && answers.has(q.id);

            // For now there will only ever be one triggerEntity, despite the value type being a list
            const entityTemplate = shouldShowEntityContent
              && entityTemplates.find((et) => et.id === q.triggerEntities[0].templateId);

            const entityAnswerContent: React.ReactNode[] = [];

            // Look for all entries in the entityAnswers map for the given templateId
            // This data structure kinda sucks for this, consider adjusting it
            if (shouldShowEntityContent && entityTemplate) {
              entityAnswers.forEach((ea: EntityAnswer, i) => {
                if (ea.templateId === entityTemplate.id) {
                  entityAnswerContent.push(
                    <View style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        marginTop: 8,
                        marginBottom: 8,
                        padding: 18,
                        backgroundColor: 'white',
                        borderRadius: 4,
                        borderColor: '#d8d8d8',
                        borderWidth: 2,
                    }}
                        key={ea.uuid} >
                        <View style={{ width: '90%'}}>
                          <Text style={{ 
                            fontSize: 18,
                            fontFamily: 'DMSans-Medium',
                            fontWeight: 'bold',
                            color: '#2b2928'
                            }}>{`${ea.name}`}</Text>
                            <Text style={{ 
                            fontSize: 14,
                            fontFamily: 'DMSans-Medium',
                            color: "#777777"
                            }}>
                            {`${entityTemplate.name}`}
                            </Text>
                        </View> 
                        <TouchableOpacity onPress={() => setEditModalVisible(ea.uuid)}>
                          <Icon
                            name="edit"
                            size={24}
                            backgroundColor="transparent"
                            color="#055a73" />
                        </TouchableOpacity>   
                    </View>
                  );
                }
              });
            }
            
            return (
              <View key={q.id}>
                <QuestionBoolean
                  question={q}
                  setIsTrue={(isTrue) => onChangeAnswer(userId, q.id, isTrue)}
                  currentValue={currentValue}
                />
                {shouldShowEntityContent && entityTemplate && 
                <>
                  <View>
                    {entityAnswerContent}
                  </View>
                  <View style={{
                    display: 'flex',
                    flexDirection: 'row', 
                    alignItems: 'center',
                    marginBottom: 18
                  }}>
                    <GhostButton
                        title={`Add new ${entityTemplate?.name}`}
                        onPress={() => setAddModalVisible(entityTemplate?.id)}
                        fontSize={18}
                    />
                    <Icon 
                      name="plus"
                      size={18}
                      backgroundColor="transparent"
                      color="#11b4c3"
                    />
                  </View>
                </>
              }
              </View>
            );
          case QuestionType.number:
            return (
              <QuestionNumber
                key={q.id}
                question={q}
                setNumber={(num) => onChangeAnswer(userId, q.id, num)}
                currentValue={currentValue}
              />
            );
        }
      })}
    </>
  );
};


// TODO condense the display logic here with the logic from QuestionList above
// TOOD The display of all of the question types work in the Today's Questions block,
// but they don't look beautiful yet
export const getQuestionBody = (
  question: Question,
  onChangeAnswer: (value: any) => void,
  currentValue?: any,
) => {
  switch (question.type) {
    case QuestionType.string:
      return (
        <View style={{ marginTop: 18, marginBottom: 18, display: 'flex', width: '75%' }} >
          <QuestionTextInput
            displayText={question.displayText}
            callback={(text) => onChangeAnswer(text)}
            currentValue={currentValue}
            subText={question.subText}
            placeholderText={question.placeholderText}
          />
        </View>
      );    
      case QuestionType.date: 
        return (
          <View style={{ marginTop: 18, marginBottom: 18, display: 'flex', width: '80%' }} >
            <QuestionDate
            question={question}
            setDate={(newDate) => onChangeAnswer(newDate)}
            currentValue={currentValue}
          />
          </View>
        );
      case QuestionType.multiSelect: 
        return (
          <View style={{ marginTop: 18, marginBottom: 18, display: 'flex', width: '80%' }} >
            <QuestionMultiSelectInput
              question={question}
              selectedItems={currentValue}
              setSelectedItems={(items) => onChangeAnswer(items)}
            />
          </View>
        );
      case QuestionType.singleSelect:
        return (
          <View style={{ marginTop: 18, marginBottom: 18, display: 'flex', width: '80%' }} >
            <QuestionSingleSelectInput
              question={question}
              selectedItem={currentValue}
              setSelectedItem={(item) => onChangeAnswer(item)}
            />
          </View>
        );
      case QuestionType.boolean:
        return (
          <View style={{ marginTop: 18, marginBottom: 18, display: 'flex', width: '80%' }} >
            <QuestionBooleanInput
              question={question}
              setIsTrue={(isTrue) => onChangeAnswer(isTrue)}
              currentValue={currentValue}
            />
          </View>
        );
      case QuestionType.number:
        return (
          <View style={{ marginTop: 18, marginBottom: 18, display: 'flex', width: '75%' }} >
            <QuestionNumberInput
              question={question}
              setNumber={(num) => onChangeAnswer(num)}
              currentValue={currentValue}
            />
          </View>
        );
  }
};
