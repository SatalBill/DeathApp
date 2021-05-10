import json

def questions(event, context):
    # TODO pull these out into an S3 bucket
    questions = [
        {"id":1,"isDefault":True,"displayText":"Deceased's name","placeholderText":"First name","type":"STRING","subText":"These questions are to help us make the path as personalized and custom to your needs as possible.","category":"ONBOARDING"},
        {"id":2,"isDefault":True,"displayText":"Date of death","type":"DATE","category":"ONBOARDING"},
        {"id":3,"isDefault":True,"displayText":"This person was your","type":"SINGLE_SELECT","subText":"We'll provide you with resources specific to your relationship with the deceased.","category":"ONBOARDING","options":[{"id":1,"name":"My spouse"},{"id":2,"name":"My parent"},{"id":3,"name":"My child"},{"id":4,"name":"Other family member"},{"id":5,"name":"Friend"},{"id":6,"name":"Peer"},{"id":7,"name":"Other"}],"triggerTasks":[{"templateId":2,"triggerValue":2}]},
        {"id":4,"isDefault":True,"displayText":"What would you like help with?","type":"MULTI_SELECT","options":[{"id":1,"name":"Immediate next steps"},{"id":2,"name":"Funeral and memorial services"},{"id":3,"name":"Financial"},{"id":4,"name":"Legal"},{"id":5,"name":"Administrative"}],"category":"ONBOARDING","triggerTasks":[{"templateId":3,"triggerValue":[3,4]}]},
        {"id":5,"isDefault":True,"displayText":"Will there be a funeral?","type":"BOOLEAN","category":"FUNERAL"},
        {"id":6,"isDefault":True,"displayText":"Was the deceased an organ donor?","type":"BOOLEAN","category":"NEXT_STEPS","triggerTasks":[{"templateId":1,"triggerValue":True}]},
        {"id":7,"isDefault":True,"displayText":"Was the deceased a veteran?","type":"BOOLEAN","category":"NEXT_STEPS","triggerTasks":[{"templateId":7,"triggerValue":True}],"triggerQuestions":[{"questionId":8,"triggerValue":True}]},
        {"id":8,"isDefault":False,"displayText":"Was the deceased eligible to be buried in Arlington?","type":"BOOLEAN","category":"NEXT_STEPS","triggerTasks":[{"templateId":8,"triggerValue":True}]},
        {"id":9,"isDefault":False,"displayText":"Are there any outstanding bills?","type":"BOOLEAN","category":"NEXT_STEPS","triggerTasks":[{"templateId":8,"triggerValue":True}],"triggerQuestions":[],"triggerEntities":[{"entityTemplateId":1,"triggerValue":True}]},
        {"id":10,"isDefault":False,"displayText":"What is the title of the bill?","type":"STRING","category":"FINANCIAL","placeholderText":"Bill title"},
        {"id":11,"isDefault":False,"displayText":"What is the outstanding balance?","type":"NUMBER","category":"FINANCIAL"},
        {"id":12,"isDefault":False,"displayText":"When is the payment due?","type":"DATE","category":"FINANCIAL"},
        {"id":13,"isDefault":False,"displayText":"What is the bank name?","type":"STRING","category":"FINANCIAL","placeholderText":"Bank name"},
        {"id":14,"isDefault":False,"displayText":"What is the balance?","type":"STRING","category":"FINANCIAL","placeholderText":"Balance"},
        {"id":15,"isDefault":False,"displayText":"What type of account is this?","type":"SINGLE_SELECT","category":"FINANCIAL","options":[{"id":1,"name":"CHECKING"},{"id":2,"name":"SAVINGS"}]}
    ]

    response = {
        "statusCode": 200,
        "body": json.dumps(questions)
    }

    return response


def task_templates(event, context):
    # TODO pull these out into an S3 bucket
    task_templates = [
        {"id":1,"isDefault":False,"displayText":"Inform hospital staff that the deceased is an organ donor","timeToComplete":1,"priority":"HIGH","subTasks":[],"category":"NEXT_STEPS","level":1},
        {"id":2,"isDefault":False,"displayText":"Inform the rest of the family of your parent's passing","timeToComplete":7,"priority":"HIGH","subTasks":[5,6],"category":"NEXT_STEPS","level":1},
        {"id":3,"isDefault":False,"displayText":"Find or obtain the deceased's Last Will and Testament","timeToComplete":7,"priority":"HIGH","subTasks":[],"category":"LEGAL","level":1},
        {"id":4,"isDefault":True,"displayText":"Get a certified copy of the death certificate","timeToComplete":7,"priority":"HIGH","subTasks":[],"category":"NEXT_STEPS","level":1},
        {"id":5,"isDefault":False,"displayText":"Inform your children about your parent's passing","timeToComplete":7,"priority":"HIGH","subTasks":[],"category":"NEXT_STEPS","level":2},
        {"id":6,"isDefault":False,"displayText":"Inform your siblings about your parent's passing","timeToComplete":7,"priority":"HIGH","subTasks":[],"category":"NEXT_STEPS","level":2},
        {"id":7,"isDefault":False,"displayText":"Apply for veterans benefits.","timeToComplete":30,"priority":"MEDIUM","subTasks":[],"category":"FINANCIAL","level":1},
        {"id":8,"isDefault":False,"displayText":"Notify Arlington National Cemetery that the deceased will be buried there.","timeToComplete":7,"priority":"HIGH","subTasks":[],"category":"FINANCIAL","level":1},
        {"id":9,"isDefault":False,"displayText":"Pay the outstanding balance","timeToComplete":7,"priority":"HIGH","subTasks":[],"category":"FINANCIAL","level":1},
        {"id":10,"isDefault":False,"displayText":"Close the account","timeToComplete":60,"priority":"HIGH","subTasks":[],"category":"FINANCIAL","level":1}]

    response = {
        "statusCode": 200,
        "body": json.dumps(task_templates)
    }

    return response


def entity_templates(event, context):
    # TODO pull these out into an S3 bucket
    entity_templates = [
        {"id":1,"name":"Bill","questions":[11,12],"triggerTasks":[]},
        {"id":2,"name":"Bank account","questions":[13,14,15],"triggerTasks":[{"templateId":10,"triggerValue":True}]}
    ]

    response = {
        "statusCode": 200,
        "body": json.dumps(entity_templates)
    }

    return response