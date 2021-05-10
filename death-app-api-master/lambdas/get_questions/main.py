import json


def handler(event, context):
    # TODO pull these out into an S3 bucket
    questions = json.loads(open('lambdas/get_questions/questions.json').read())

    response = {
        "statusCode": 200,
        "body": json.dumps(questions)
    }

    return response
    