export const getEntityAnswersForCurrentUser = (userId: string, entityAnswers: Map<string, EntityAnswer>): Map<string, EntityAnswer> => {
    const entityAnswersMap = new Map();

    entityAnswers.forEach((ea) => {
        if (ea.userId === userId) {
            entityAnswersMap.set(ea.uuid, ea);
        }
    });

    return entityAnswersMap;
}