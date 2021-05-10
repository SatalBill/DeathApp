import React, 
    {createContext, 
    useReducer, 
    useEffect, 
    Dispatch,
    } from 'react';
import { useDatabase } from './DatabaseContext';
import { openDatabase } from './Database';
import { State, reducer } from './reducers/appReducer';
import { Api } from './api/Api';


const initialState: State = {
    user: null,
    answers: new Map<string, Answer>(),
    isDbLoaded: false,
    tasks: [],
    taskTemplates: [],
    taskBeingEditedId: null,
    entityAnswers: new Map<string, EntityAnswer>(),
};

const store = createContext(initialState);

const {Provider} = store;

const StateProvider = (props: {children?: React.ReactNode}) => {
    useEffect(() => {
        openDatabase().then(() => {
            dispatch({ type: 'DB_LOADED', isDbLoaded: true });
        });
    }, []);

    // TODO this probably isn't the best place for this db stuff longer-term
    const database = useDatabase();

    function getAllTaskTemplates() {
        return database.getAllTaskTemplates().then((taskTemplates: TaskTemplate[]) => {
            dispatch({ type: 'UPDATE_TASK_TEMPLATES', taskTemplates });
        });
    }

    function getAllTasks() {
        return database.getAllTasks().then((tasks: Task[]) => {
            dispatch({ type: 'UPDATE_TASKS', tasks });
        });  
    }

    function getAllEntityAnswers() {
        return database.getAllEntityAnswers()
            .then((entityAnswers) => dispatch({ type: 'UPDATE_ENTITY_ANSWERS', entityAnswers }));
    }

    function getAllAnswers(dispatch: Dispatch<Action>) {
        return database.getAllAnswers()
            .then((answers: Answer[]) => {
                if (answers.length > 0) {
                    const dbAnswers = new Map<string, Answer>();
                    answers.forEach((a) => {
                        let parsedAnswer = a;
                        try {
                            // Attempt to convert a json stringified Set to a valid object
                            // TODO this will need to be updated when/if we support other object types
                            parsedAnswer = { ...a, value : new Set(JSON.parse(a.value)) };
                        }
                        catch(e) {
                            console.log(`Answer from DB is not valid JSON set, using raw value ${a}`)
                        }
                        dbAnswers.set(a.questionId, parsedAnswer);
                    });
                    dispatch({ type: 'UPDATE_ANSWERS', answers: dbAnswers });
                }
            });
    }

    function saveQuestions() {
        Api.getAllQuestions().then((questions: Question[]) => {
            Promise.all(questions.map((q: Question) => database.updateQuestion(q)))
                .then(() => console.log("Saved new questions!"));
        }); 
    }

    function saveTaskTemplates() {
        Api.getAllTaskTemplates().then((taskTemplates: TaskTemplate[]) => {
            // TODO support bulk inserts instead of issuing individual inserts
            Promise.all(taskTemplates.map(tt => database.updateTaskTemplate(tt)))
                .then(() => getAllTaskTemplates());
        });
    }

    function saveEntityTemplates() {
        Api.getAllEntityTemplates().then((entityTemplates: EntityTemplate[]) => {
            // TODO support bulk inserts instead of issuing individual inserts
            Promise.all(entityTemplates.map(et => database.updateEntityTemplate(et)))
                .then(() => console.log("Saved new entity templates!"));
        });
    }

    const [state, dispatch] = useReducer(reducer, { ...initialState });
    const { isDbLoaded } = state;

    useEffect(() => {
        if (isDbLoaded) {
            saveQuestions(); // Save any new questions that have been added since last load
        }
    }, [isDbLoaded]);

    useEffect(() => {
        if (isDbLoaded) {
            saveTaskTemplates(); // Save any new task templates that have been added since last load
        }
    }, [isDbLoaded]);

    useEffect(() => {
        if (isDbLoaded) {
            saveEntityTemplates(); // Save any new entity templates that have been added since last load
        }
    }, [isDbLoaded]);

    useEffect(() => {
        if (isDbLoaded) {
            getAllAnswers(dispatch); // Pull existing answers on first load
        }
    }, [isDbLoaded]);

    useEffect(() => {
        if (isDbLoaded) {
            getAllTasks(); // Pull existing tasks on first load
        }
    }, [isDbLoaded]);

    useEffect(() => {
        if (isDbLoaded) {
            getAllEntityAnswers(); // Pull existing entity answers
        }
    }, [isDbLoaded]);

  // TODO fix state + dispatch typings
  return <Provider value={{...state, dispatch}}>{props.children}</Provider>;
};

export {store, StateProvider};
