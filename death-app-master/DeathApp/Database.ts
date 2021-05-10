import SQLite from "react-native-sqlite-storage";
import { DatabaseInitialization } from "./DatabaseInitialization";
import { QuestionType } from "./components/Questions";

export interface Database {
  // Read
  getAllQuestions(): Promise<Question[]>;
  getAllAnswers(): Promise<Answer[]>;
  getAllTasks(): Promise<Task[]>;
  getAllTaskTemplates(): Promise<TaskTemplate[]>;
  getAllEntityTemplates(): Promise<EntityTemplate[]>;
  getAllEntityAnswers(): Promise<EntityAnswer[]>;
  // Update
  updateAnswer(answer: Answer, questionType: QuestionType): Promise<void>;
  updateQuestion(question: Question): Promise<void>;
  updateTask(task: TaskUpsert): Promise<void>;
  updateTaskTemplate(taskTemplate: TaskTemplate): Promise<void>;
  updateEntityTemplate(entityTemplate: EntityTemplate): Promise<void>;
  updateEntityAnswer(entityAnswer: EntityAnswer): Promise<void>;
}

let databaseInstance: SQLite.SQLiteDatabase | undefined;

// Get an array of all the answers in the db
// This func does not parse the answer values, they are just raw db values
async function getAllAnswers(): Promise<Answer[]> {
    return getDatabase()
    .then((db) =>
      db.executeSql(`select * from Answer;`),
    )
    .then(([results]) => {
        if (results === undefined) {
          return [];
        }
        const count = results.rows.length;
        const answers: Answer[] = [];
        for (let i = 0; i < count; i++) {
          const row = results.rows.item(i);
          const { uuid, user_id, question_id, value } = row;
          answers.push({ uuid, userId: user_id, questionId: question_id, value });
        }
        return answers;
      });
}

// Get an array of all the questions in the db
// TODO what kind of filtering am I going to want to do on these? Maybe none while the list is small
async function getAllQuestions(): Promise<Question[]> {
    return getDatabase()
    .then((db) =>
      db.executeSql(`select * from Question;`),
    )
    .then(([results]) => {
        if (results === undefined) {
          return [];
        }
        const count = results.rows.length;
        const questions: Question[] = [];
        for (let i = 0; i < count; i++) {
          const row = results.rows.item(i);
          const { 
            id, 
            is_default,
            display_text, 
            type, 
            category, 
            options, 
            placeholder_text, 
            sub_text, 
            trigger_tasks,
            trigger_questions,
            trigger_entities,
            extra_info,
          } = row;
          let question: Question;
          switch(type) {
            case QuestionType.multiSelect:
            case QuestionType.singleSelect:
              question = { 
                id, 
                isDefault: is_default ? true : false,
                type, 
                category, 
                options: JSON.parse(options), 
                displayText: display_text, 
                triggerTasks: JSON.parse(trigger_tasks),
                triggerEntities: JSON.parse(trigger_entities),
                triggerQuestions: JSON.parse(trigger_questions), 
                subText: sub_text,
                extraInfo: extra_info,
              };
              break;
            case QuestionType.boolean:
              question = { 
                id, 
                isDefault: is_default ? true : false,
                type, 
                category, 
                displayText: display_text, 
                triggerTasks: JSON.parse(trigger_tasks),
                triggerEntities: JSON.parse(trigger_entities),
                triggerQuestions: JSON.parse(trigger_questions), 
                extraInfo: extra_info,
              };
              break;
            case QuestionType.string:
              question = { 
                id, 
                isDefault: is_default ? true : false,
                type, 
                category, 
                displayText: display_text, 
                placeholderText: placeholder_text,
                extraInfo: extra_info,
              };
              break;
            default:
              question = { 
                id, 
                isDefault: is_default ? true : false,
                type, 
                category, 
                displayText: display_text,
                extraInfo: extra_info,
              };
              break;
          }
          questions.push(question);
        }
        return questions;
      });
}

// Get an array of all the tasks in the db
async function getAllTasks(): Promise<Task[]> {
  return getDatabase()
  .then((db) =>
    db.executeSql(`select * from Task;`),
  )
  .then(([results]) => {
      if (results === undefined) {
        return [];
      }
      const count = results.rows.length;
      const tasks: Task[] = [];
      for (let i = 0; i < count; i++) {
        const row = results.rows.item(i);
        const { uuid, user_id, display_text, due_date, priority, sub_tasks, status, note, category, level, task_template_id, is_deleted } = row;
        tasks.push({ 
          uuid, 
          userId: user_id, 
          displayText: display_text, 
          dueDate: due_date ? new Date(due_date) : null, 
          priority, 
          subTasks: JSON.parse(sub_tasks), 
          status, 
          note,
          category, 
          level,
          taskTemplateId: task_template_id,
          isDeleted: is_deleted ? true : false,
        });
      }
      return tasks;
    });
}

// Get an array of all the task templates in the db
async function getAllTaskTemplates(): Promise<TaskTemplate[]> {
  return getDatabase()
  .then((db) =>
    db.executeSql(`select * from TaskTemplate;`),
  )
  .then(([results]) => {
      if (results === undefined) {
        return [];
      }
      const count = results.rows.length;
      const taskTemplates: TaskTemplate[] = [];
      for (let i = 0; i < count; i++) {
        const row = results.rows.item(i);
        const { 
          id, 
          is_default, 
          display_text, 
          time_to_complete, 
          priority, 
          sub_tasks, 
          category, 
          level,
          extra_info,
        } = row;
        taskTemplates.push({ 
          id,  
          isDefault: is_default ? true : false,
          displayText: display_text, 
          timeToComplete: time_to_complete,
          priority, 
          subTasks: JSON.parse(sub_tasks), 
          category, 
          level,
          extraInfo: extra_info,
        });
        
      }
      return taskTemplates;
    });
}

// Get an array of all the entity templates in the db
async function getAllEntityTemplates(): Promise<EntityTemplate[]> {
  return getDatabase()
  .then((db) =>
    db.executeSql(`select * from EntityTemplate;`),
  )
  .then(([results]) => {
      if (results === undefined) {
        return [];
      }
      const count = results.rows.length;
      const entityTemplates: EntityTemplate[] = [];
      for (let i = 0; i < count; i++) {
        const row = results.rows.item(i);
        const { id, name, questions, trigger_tasks, extra_info } = row; 
        entityTemplates.push({ 
          id,
          name,
          questions: JSON.parse(questions),
          triggerTasks: JSON.parse(trigger_tasks),
          extraInfo: extra_info,
        });
      }
      return entityTemplates;
    });
}

// Get an array of all the entity answers in the db
async function getAllEntityAnswers(): Promise<EntityAnswer[]> {
  return getDatabase()
  .then((db) =>
    db.executeSql(`select * from EntityAnswer;`),
  )
  .then(([results]) => {
      if (results === undefined) {
        return [];
      }
      const count = results.rows.length;
      const entityAnswers: EntityAnswer[] = [];
      for (let i = 0; i < count; i++) {
        const row = results.rows.item(i);
        const { uuid, user_id, template_id, name, answers, is_deleted } = row;
        entityAnswers.push({ 
          uuid,
          userId: user_id,
          templateId: template_id,
          name,
          answers: JSON.parse(answers),
          isDeleted: is_deleted ? true : false,
        });
      }
      return entityAnswers;
    });
}

const updateAnswerQuery = 'replace into Answer (uuid, user_id, question_id, value) values (?, ?, ?, ?);'

async function updateAnswer(answer: Answer, questionType: QuestionType): Promise<void> {
    const { uuid, userId, questionId, value } = answer;
    // TODO pull this out into a separate method
    // Parse data types for entry into the DB
    // For Date convert to String (ISO format)
    // For Set convert to array then JSON stringify 
    // Booleans, Strings, and Numbers should be left as raw values
    let insertValue = value;
    switch(questionType) {
        case QuestionType.multiSelect:
            insertValue = JSON.stringify([ ...value ]);
            break;
        case QuestionType.date:
            insertValue = value.toISOString();
            break;
    }

    return getDatabase()
      .then((db) => db.executeSql(updateAnswerQuery, [uuid, userId, questionId, insertValue]))
      .then(([results]) => {
        const { insertId } = results;
        console.log(`[db] Added Answer with value: "${insertValue}"! InsertId: ${insertId}`);
  
        // TODO Queue database upload 
      });
}

const updateQuestionQuery = "replace into Question (id, is_default, display_text, type, category, options, trigger_tasks, trigger_questions, trigger_entities, sub_text, placeholder_text, extra_info) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

async function updateQuestion(question: Question): Promise<void> {
    const { id, isDefault, displayText, type, category, extraInfo } = question;
    let options : Option[];
    let triggerTasks : { templateId: string, triggerValue: any }[];
    let triggerQuestions : { questionId: string, triggerValue: any}[];
    let triggerEntities : { entityTemplateId: string, triggerValue: any }[];
    let subText : string;
    let placeholderText : string;

    if (question.type == QuestionType.multiSelect || question.type == QuestionType.singleSelect) {
      options = question.options;
      triggerTasks = question.triggerTasks;
      triggerQuestions = question.triggerQuestions;
      subText = question.subText || "";
    }
    if (question.type == QuestionType.boolean) {
      triggerTasks = question.triggerTasks;
      triggerQuestions = question.triggerQuestions;
      triggerEntities = question.triggerEntities;
    }
    if (question.type == QuestionType.string) {
      placeholderText = question.placeholderText || "";
    }
    return getDatabase()
      .then((db) => db.executeSql(
        updateQuestionQuery, [
          id, 
          isDefault,
          displayText, 
          type, 
          category, 
          options ? JSON.stringify(options) : JSON.stringify([]), 
          triggerTasks ? JSON.stringify(triggerTasks) : JSON.stringify([]),
          triggerQuestions ? JSON.stringify(triggerQuestions) : JSON.stringify([]),
          triggerEntities ? JSON.stringify(triggerEntities) : JSON.stringify([]),
          subText,
          placeholderText,
          extraInfo,
        ]))
      .then(([results]) => {
        const { insertId } = results;
        console.log(`[db] Added Question with displayText: "${displayText}"! InsertId: ${insertId}`);
  
        // TODO Queue database upload 
      })
      .catch((err) => {
        console.log(err);
      });
}

const updateTaskQuery = "replace into Task (uuid, user_id, display_text, priority, status, sub_tasks, due_date, note, category, level, task_template_id, is_deleted) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"

async function updateTask(task: TaskUpsert): Promise<void> {
  const {  
    uuid,
    userId, 
    displayText, 
    dueDate, 
    priority, 
    subTasks, 
    status, 
    note, 
    category, 
    level, 
    taskTemplateId,
    isDeleted, 
  } = task;

  return getDatabase()
    .then((db) => db.executeSql(
      updateTaskQuery, 
      [ 
        uuid,
        userId, 
        displayText, 
        priority, 
        status, 
        JSON.stringify(subTasks), 
        dueDate? dueDate.toISOString() : null, 
        note, 
        category, 
        level,
        taskTemplateId,
        isDeleted,
      ])
    )
    .then(([results]) => {
      const { insertId } = results;
      console.log(`[db] Added Task with displayText: "${displayText}"! InsertId: ${insertId}`);

      // TODO Queue database upload 
    });
}

const updateTaskTemplateQuery = 'replace into TaskTemplate(id, is_default, display_text, time_to_complete, priority, sub_tasks, category, level, extra_info) values (?, ?, ?, ?, ?, ?, ?, ?, ?);'

async function updateTaskTemplate(taskTemplate: TaskTemplate): Promise<void> {
  const { 
    id, 
    isDefault,
    displayText, 
    timeToComplete,
    priority, 
    subTasks, 
    category, 
    level,  
    extraInfo,
  } = taskTemplate;

  return getDatabase()
    .then((db) => db.executeSql(
      updateTaskTemplateQuery, 
      [
        id, 
        isDefault,
        displayText, 
        timeToComplete,
        priority, 
        subTasks ? JSON.stringify(subTasks) : JSON.stringify([]),  
        category, 
        level,
        extraInfo
      ])
    )
    .then(([results]) => {
      const { insertId } = results;
      console.log(`[db] Added TaskTemplate with templateId: ${id} displayText: "${displayText}"! InsertId: ${insertId}`);

      // TODO Queue database upload 
    });
}

const updateEntityTemplateQuery = 'replace into EntityTemplate(id, name, questions, trigger_tasks, extra_info) values (?, ?, ?, ?, ?);'

async function updateEntityTemplate(entityTemplate: EntityTemplate): Promise<void> {
  const { 
    id, 
    name,
    questions, 
    triggerTasks,
    extraInfo,
  } = entityTemplate;

  return getDatabase()
    .then((db) => db.executeSql(
      updateEntityTemplateQuery, 
      [
        id,  
        name,
        JSON.stringify(questions),
        triggerTasks ? JSON.stringify(triggerTasks) : JSON.stringify([]),
        extraInfo,
      ])
    )
    .then(([results]) => {
      const { insertId } = results;
      console.log(`[db] Added EntityTemplate with templateId: ${id} and name: ${name}! InsertId: ${insertId}`);

      // TODO Queue database upload 
    });
}

const updateEntityAnswerQuery = 'replace into EntityAnswer(uuid, user_id, template_id, name, answers, is_deleted) values (?, ?, ?, ?, ?, ?);'

async function updateEntityAnswer(entityAnswer: EntityAnswer): Promise<void> {
  const { 
    uuid, 
    userId,
    templateId,
    name,
    answers,
    isDeleted,
  } = entityAnswer;

  return getDatabase()
    .then((db) => db.executeSql(
      updateEntityAnswerQuery, 
      [
        uuid,
        userId,
        templateId,  
        name,
        JSON.stringify(answers),
        isDeleted,
      ])
    )
    .then(([results]) => {
      const { insertId } = results;
      console.log(`[db] Added EntityAnswer with uuid: ${uuid} and name: ${name}! InsertId: ${insertId}`);

      // TODO Queue database upload 
    });
}

// helpers
async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (databaseInstance !== undefined) {
      return Promise.resolve(databaseInstance);
    }
    // otherwise: open the database first
    return openDatabase();
}
  
// Open a connection to the database
export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
    SQLite.DEBUG(true);
    SQLite.enablePromise(true);
  
    if (databaseInstance) {
      console.log("[db] Database is already open: returning the existing instance");
      return databaseInstance;
    }
  
    // Otherwise, create a new instance
    const db = await SQLite.openDatabase({
      name: "AppDatabase.db", // TODO database file name
      location: "default",
    });
    console.log("[db] Database open!");
  
    // Perform any database initialization or updates, if needed
    const databaseInitialization = new DatabaseInitialization();
    await databaseInitialization.updateDatabaseTables(db);
  
    databaseInstance = db;
    return db;
}
  
// Close the connection to the database
async function close(): Promise<void> {
    if (databaseInstance === undefined) {
      console.log("[db] No need to close DB again - it's already closed");
      return;
    }
    const status = await databaseInstance.close();
    console.log("[db] Database closed.");
    databaseInstance = undefined;
}

// Export the functions which fulfill the Database interface contract
export const sqliteDatabase: Database = {
    getAllQuestions,
    getAllAnswers,
    getAllTasks,
    getAllTaskTemplates,
    getAllEntityTemplates,
    getAllEntityAnswers,
    updateAnswer,
    updateQuestion,
    updateTask,
    updateTaskTemplate,
    updateEntityTemplate,
    updateEntityAnswer,
};
