export const getAnswersForCurrentUser = (userId: string, answers: Map<string, Answer>): Map<string, Answer> => {
    const answersMap = new Map();

    answers.forEach((a) => {
        if (a.userId === userId) {
            answersMap.set(a.questionId, a);
        }
    });

    return answersMap;
}