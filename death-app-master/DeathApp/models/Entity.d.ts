interface EntityTemplate {
    id: string;
    name: string; // Permanent template name
    questions: string[]; // List of questionIds. List order implies question order (Is that sufficient?)
    // TODO what should the triggerValue be? Should it be anything at all?
    triggerTasks: { templateId: string, triggerValue: boolean }[];
    extraInfo: string;
}

// Simpler entity concept?
// Does this capture all the info we need?
interface EntityAnswer {
    uuid: string;
    name: string; // User-generated name
    userId: string; // the user who submitted this entity answer
    answers: Answer[]; // questionId to Answer
    templateId: string; // template used to generate this EntityAnswer
    isDeleted: boolean;
}
