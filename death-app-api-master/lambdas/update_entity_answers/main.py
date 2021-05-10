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

upsert_query = "REPLACE INTO entity_answer (uuid, user_id, template_id, name, answers, is_deleted) values(%s, %s, %s, %s, %s, %s)"

try:
    conn = pymysql.connect(host=rds_host, user=db_username, passwd=db_password, db=db_name, connect_timeout=5)
except pymysql.MySQLError as e:
    logger.error(e)

logger.info("Connection to RDS MySQL instance succeeded")


def handler(event, context):
    """
    Insert or update entity answers in the DB
    Request body has the following format:
    {
        entityAnswers: {
            uuid: string,
            userId: string,
            templateId: number,
            name: string,
            answers: list[dict], // list of Answer objects
            isDeleted: boolean,
        }[],
    }
    """

    logger.info(f'Processing event {event}')
    entity_answers = json.loads(event['body']).get('entityAnswers', None)

    # TODO include validation that we only update entity answers with userId matching  
    # the userId in the path param

    logger.info(f'Attempting to insert entity answers {entity_answers}')

    try: 
        with conn.cursor() as cur:
            for entity_answer in entity_answers:
                cur.execute(upsert_query, (
                    entity_answer['uuid'], 
                    entity_answer['userId'], 
                    entity_answer['templateId'],
                    entity_answer['name'],
                    entity_answer['answers'],
                    entity_answer['isDeleted']
                    )
                )
            
            conn.commit()

            logger.info(f'Successfully inserted entity answers into the db')
            response = {
                "statusCode": 200
            }

    except pymysql.Error as e:
        logger.error(f'Error inserting entity answers into the db {e}')
        response = {
            "statusCode": 400,
            "body": "Error attempting to save entity answers in the db"
        }

    return response
