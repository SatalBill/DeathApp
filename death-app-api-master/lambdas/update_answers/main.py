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

upsert_query = "REPLACE INTO answer (uuid, user_id, question_id, value) values(%s, %s, %s, %s)"

try:
    conn = pymysql.connect(host=rds_host, user=db_username, passwd=db_password, db=db_name, connect_timeout=5)
except pymysql.MySQLError as e:
    logger.error(e)

logger.info("Connection to RDS MySQL instance succeeded")

def handler(event, context):
    """
    Insert or update answers in the DB.
    Request body has the following format:
    {
        answers: {
            uuid: string; 
            userId: string; 
            questionId: number;
            value: any;
        }[],
    }
    """
    logger.info(f'Processing event {event}')

    answers = json.loads(event['body']).get('answers', None)
    logger.info(f'Attempting to insert answers {answers}')

    # TODO include validation that we only update answers with userId matching  
    # the userId in the path param

    if not answers:
        logger.info(f'No answers to save in the db') 
        return {
            "statusCode": 200
        }
    
    try: 
        with conn.cursor() as cur:
            for answer in answers:
                cur.execute(upsert_query, (answer['uuid'], answer['userId'], answer['questionId'], answer['value']))
            
            conn.commit()

            logger.info(f'Successfully inserted answers into the db')
            return {
                "statusCode": 200
            }

    except pymysql.Error as e:
        logger.error(f'Error inserting answers into the db {e}')
        return {
            "statusCode": 400,
            "body": "Error attempting to save answers in the db"
        }

