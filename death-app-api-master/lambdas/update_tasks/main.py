import json
import pymysql
import sys
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# TODO these should be in AWS Secrets Manager
# TODO change these once moved to Secrets Manager
rds_host = "granate-1.ckupwnepheih.us-east-1.rds.amazonaws.com"
db_username = "admin"
db_password = "yQiKFIARmVRLLIIA"
db_name = "granate"

upsert_query = "REPLACE INTO task (uuid, user_id, display_text, priority, status, sub_tasks, due_date, note, category, level, task_template_id, is_deleted) values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"

try:
    conn = pymysql.connect(host=rds_host, user=db_username, passwd=db_password, db=db_name, connect_timeout=5)
except pymysql.MySQLError as e:
    logger.error(e)


def handler(event, context):
    """
    Insert or update tasks in the DB
    Request body has the following format:
    {
        tasks: {
            uuid: string,
            userId: string,
            displayText: string,
            priority: string, // Enum HIGH, MEDIUM, LOW 
            status: string, // Enum PENDING, COMPLETE
            subTasks: number[], // List of Task ids.
            dueDate: Date | null, 
            note: string | null,
            category: string, // Enum: NEXT_STEPS, FUNERAL, LEGAL, FINANCIAL, ADMIN, ONBOARDING
            level: 1 | 2, // For now, 1 corresponds to task and 2 corresponds to subtask 
            taskTemplateId: number, 
            isDeleted: boolean,
        }[],
    }
    """

    logger.info(f'Processing event {event}')

    tasks = json.loads(event['body']).get('tasks', None)
    
    logger.info(f'Attempting to insert tasks {tasks}')

    # TODO include validation that we only update tasks with userId matching  
    # the userId in the path param

    try: 
        with conn.cursor() as cur:
            for task in tasks:
                cur.execute(upsert_query, (
                    task['uuid'], 
                    task['userId'], 
                    task['displayText'],
                    task['priority'],
                    task['status'],
                    task['subTasks'],
                    task['dueDate'],
                    task['note'],
                    task['category'],
                    task['level'],
                    task['taskTemplateId'],
                    task['isDeleted']
                ))
            
            conn.commit()

            logger.info(f'Successfully inserted tasks into the db')
            response = {
                "statusCode": 200
            }

    except pymysql.Error as e:
        logger.error(f'Error inserting tasks into the db {e}')
        response = {
            "statusCode": 400,
            "body": "Error attempting to save tasks in the db"
        }

    return response
