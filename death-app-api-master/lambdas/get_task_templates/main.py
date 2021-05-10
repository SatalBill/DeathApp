import json


def handler(event, context):
    # TODO pull these out into an S3 bucket
    task_templates = json.loads(open('lambdas/get_task_templates/task_templates.json').read())

    response = {
        "statusCode": 200,
        "body": json.dumps(task_templates)
    }

    return response
