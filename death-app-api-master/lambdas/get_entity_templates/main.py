import json


def handler(event, context):
    # TODO pull these out into an S3 bucket
    entity_templates = json.loads(open('lambdas/get_entity_templates/entity_templates.json').read())

    response = {
        "statusCode": 200,
        "body": json.dumps(entity_templates)
    }

    return response