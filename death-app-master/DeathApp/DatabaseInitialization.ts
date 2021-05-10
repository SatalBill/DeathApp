import SQLite from 'react-native-sqlite-storage';

// Question, Answer, and Task table
const createQuestionTableQuery =
  'create table if not exists Question(id text not null primary key, is_default integer, display_text text not null, type text not null, category text, options blob, trigger_tasks blob, trigger_questions blob, trigger_entities blob, sub_text text, placeholder_text text, extra_info text);';
const createAnswerTableQuery =
  'create table if not exists Answer(uuid text not null primary key, user_id text not null, question_id text not null, value blob, foreign key (question_id) references Question(id));';
const createTaskTableQuery =
  'create table if not exists Task(uuid text not null primary key, user_id text not null, display_text text not null, priority text not null, status text not null, sub_tasks blob, due_date text, note text, category text, level integer not null, task_template_id text, is_deleted integer);';
const createTaskTemplateTableQuery =
  'create table if not exists TaskTemplate(id text not null primary key, is_default integer, display_text text not null, time_to_complete integer, priority text, sub_tasks blob, category text, level integer, extra_info text);';

// Entity tables
const createEntityTemplateTableQuery =
  'create table if not exists EntityTemplate(id text not null primary key, name text not null, questions blob, trigger_tasks blob, extra_info text);';
const createEntityAnswerTableQuery = 
  'create table if not exists EntityAnswer(uuid text not null primary key, user_id text not null, template_id text not null, name text, answers blob, is_deleted integer);';


export class DatabaseInitialization {
  public updateDatabaseTables(database: SQLite.SQLiteDatabase): Promise<void> {
    let dbVersion: number = 0;

    // First: create tables if they do not already exist
    return database
      .transaction(this.createTables)
      .then(() => this.getDatabaseVersion(database))
      .then((version: number) => {
        dbVersion = version;
        console.log('Current database version is: ' + dbVersion);

        // Perform DB updates based on this version
        if (dbVersion < 1) {
          // Uncomment the next line, and include the referenced function below, to enable this
          // return database.transaction(this.preVersion1Inserts);
        }
        // otherwise,
        return;
      });
  }

  // Initial table setup
  private createTables(transaction: SQLite.Transaction) {
    // Uncomment the lines below if you have made DB changes and need to
    // drop and re-create the tables. We will do proper database versioning
    // following the v1 release.
    /* 
    transaction.executeSql('Drop table Task;');
    transaction.executeSql('Drop table EntityAnswer;');
    transaction.executeSql('Drop table Answer;');
    transaction.executeSql('Drop table Question;');
    transaction.executeSql('Drop table EntityTemplate;');
    transaction.executeSql('Drop table TaskTemplate;');
    */

    // Questions table
    transaction.executeSql(createQuestionTableQuery);
    
    // Answer table
    transaction.executeSql(createAnswerTableQuery);

    // Task table
    transaction.executeSql(createTaskTableQuery);

    // Task templates table
    transaction.executeSql(createTaskTemplateTableQuery);

    // Entity template table
    transaction.executeSql(createEntityTemplateTableQuery);

    // Entity answer table 
    transaction.executeSql(createEntityAnswerTableQuery);
   
    
    // Version table
    transaction.executeSql(
      'CREATE TABLE IF NOT EXISTS Version( ' +
        'version_id INTEGER PRIMARY KEY NOT NULL, ' +
        'version INTEGER' +
        ');',
    );
  }

  // Get the version of the database, as specified in the Version table
  private getDatabaseVersion(database: SQLite.SQLiteDatabase): Promise<number> {
    return database
      .executeSql('SELECT version FROM Version ORDER BY version DESC LIMIT 1;')
      .then(([results]) => {
        // return the DB version
        return 0; // TODO implement
      });
  }

  // This function should be called when the version of the db is < 1
  private preVersion1Inserts(transaction: SQLite.Transaction) {
      console.log("Running pre-version 1 DB inserts");
      // Make schema changes
      transaction.executeSql("ALTER TABLE ...");
      // Lastly, update the database version
      transaction.executeSql("INSERT INTO Version (version) VALUES (1);");
  }
}
