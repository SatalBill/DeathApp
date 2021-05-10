interface Answer {
    uuid: string; // This isn't strictly-speaking necessary since these will be unique on (userId, questionId)
    userId: string; // references User.id
    questionId: string; // references Question.id
    value: any; // The answer to the question. This can be any of the types allowed by Question.type
}
