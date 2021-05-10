interface InitialLoadAction {
  type: 'INITIAL_LOAD';
  user: User;
}

interface LogInAction {
  type: 'LOG_IN';
  uid: string;
  email: string | null;
  name: string | null;
}

interface LogOutAction {
  type: 'LOG_OUT';
}

interface UpdateAnswersAction {
  type: 'UPDATE_ANSWERS';
  answers: Map<string, Answer>;
}

interface UpdateTasksAction {
  type: 'UPDATE_TASKS';
  tasks: Task[];
}

interface EditTaskAction {
  type: 'EDIT_TASK';
  taskUuid: string;
}

interface EditTaskSavedAction {
  type: 'EDIT_TASK_SAVED';
  task: Task;
}

interface UpdateTaskTemplatesAction {
  type: 'UPDATE_TASK_TEMPLATES';
  taskTemplates: TaskTemplate[];
}

interface UpdateEntityAnswersAction {
  type: 'UPDATE_ENTITY_ANSWERS';
  entityAnswers: EntityAnswer[];
}

interface EditProfile {
  type: 'EDIT_PROFILE';
  name: string;
  email: string;
}

interface DatabaseLoaded {
  type: 'DB_LOADED';
  isDbLoaded: boolean;
}

type Action =
  | InitialLoadAction
  | LogInAction
  | LogOutAction
  | UpdateAnswersAction
  | UpdateTasksAction
  | EditTaskAction
  | EditTaskSavedAction
  | EditProfile
  | UpdateTaskTemplatesAction
  | UpdateEntityAnswersAction
  | DatabaseLoaded
  ;
