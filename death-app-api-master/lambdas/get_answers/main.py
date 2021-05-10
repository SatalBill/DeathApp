import json
import pymysql
import sys
import logging
from requests import Response
from requests.exceptions import RequestException

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# TODO these should be in AWS Secrets Manager
# TODO change these once moved to Secrets Manager
rds_host = "granate-1.ckupwnepheih.us-east-1.rds.amazonaws.com"
db_username = "admin"
db_password = "yQiKFIARmVRLLIIA"
db_name = "granate"

select_query = 'SELECT * FROM answer WHERE user_id=%s';

def handler(event, context):
    user_id = event.get('pathParameters', {}).get('userId', None)

    if not user_id:
        return {
            "statusCode": 404 # TODO make this a real 404 response
        }
    
    try:
        conn = pymysql.connect(host=rds_host, user=db_username, passwd=db_password, db=db_name, connect_timeout=5)
        logger.info("Connection to RDS MySQL instance succeeded")
    except pymysql.MySQLError as e:
        logger.error(e)
        return RequestException()

    try: 
        with conn.cursor() as cur:
            cur.execute(select_query, user_id)
            rows = cur.fetchall()

            logger.info(f'Fetched answers from the db {rows}')
            answers = []
            for row in rows:
                uuid, user_id, question_id, value = row
                answer = {
                    "uuid": uuid,
                    "userId": user_id,
                    "questionId": question_id,
                    "value": value
                }
                answers.append(answer)

            response = {
                "statusCode": 200,
                "body": json.dumps(answers)
            }

    except pymysql.Error as e:
        logger.error(f'Error attempting to fetch answers from the db for user {user_id}: {e}')
        response = {
            "statusCode": 400,
            "body": f"Error attempting to fetch answers from the db for user"
        }

    return response
