export interface State {
  user: User | null; // The current logged-in user
  answers: Map<string, Answer>; // questionId to Answer mapping
  tasks: Task[]; // List of all tasks (including subtasks)
  isDbLoaded: boolean;
  taskTemplates: TaskTemplate[]; // List of all templates for creating tasks
  entityAnswers: Map<string, EntityAnswer>; // Entity answer uuid to EntityAnswer mapping
  taskBeingEditedId: string | null; // uuid of the task currently being edited or null if one is not being edited
}

// TODO we'll probably need to split this out into separate reducers as global state grows
export const reducer = (state: State, action: Action) => {

    switch(action.type) {
        case 'LOG_IN': {
            const newState: State = { 
                ...state,
                user: {
                    id: action.uid,
                    email: action.email,
                    name: action.name,
                },
            }
            return newState;
        }
        case 'LOG_OUT':{
            const newState: State = {
                ...state,
                user: null,
            }
            return newState;
        }
        case 'DB_LOADED': {          
            const newState: State = {
                ...state,
                isDbLoaded: action.isDbLoaded,
            }
            return newState;
        }
        case 'UPDATE_ANSWERS': {
            const newAnswers = new Map([ ...state.answers, ...action.answers ]);
            const newState: State = {
                ...state,
                answers: newAnswers,
            }
            return newState;
        }
        case 'UPDATE_ENTITY_ANSWERS': {
            const newEntityAnswers = new Map(state.entityAnswers);
            action.entityAnswers.forEach((ea) => {
                newEntityAnswers.set(ea.uuid, ea);
            });
            const newState: State = {
                ...state,
                entityAnswers: newEntityAnswers,
            }
            return newState;
        }
        case 'UPDATE_TASKS': {
            const newTasks = [ ...state.tasks, ...action.tasks ];
            const newState: State = {
                ...state,
                tasks: newTasks,
            }
            return newState;
        }
        case 'UPDATE_TASK_TEMPLATES': {
            const newTaskTemplates = [ ...state.taskTemplates, ...action.taskTemplates ];
            const newState: State = {
                ...state,
                taskTemplates: newTaskTemplates,
            }
            return newState;
        }
        case 'EDIT_PROFILE': {
            const newState: State = {
              ...state,
              user: {
                id: state.user!.id,
                email: state.user!.email,
                name: action.name,
              },
            };
            return newState;
        }
        case 'EDIT_TASK': {
          const newState: State = {
            ...state,
            taskBeingEditedId: action.taskUuid,
          };
          return newState;
        }
        case 'EDIT_TASK_SAVED': {
          const taskBeingEditedIndex = state.tasks.findIndex((t) => t.uuid === action.task.uuid);
          const newTasks = [ ...state.tasks ];

      newTasks.splice(taskBeingEditedIndex, 1, {...action.task});
      const newState: State = {
        ...state,
        tasks: newTasks,
      };
      return newState;
    }
    default:
      throw new Error();
  }
};
