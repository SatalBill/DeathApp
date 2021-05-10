import { QuestionType } from '../components/Questions';
import { Category } from '../components/Category';

// TODO Can we use reselect here?
export const getDisplayQuestions = (questions: Question[], answers: Map<string, Answer>): Question[] => {
    // Show only default questions and questions that have been triggered by a qualifying answer
    // TODO consider memoizing this?
    let displayQuestions: Question[] = [];
    const questionsByCategory = getQuestionsByCategory(questions, answers);
    questionsByCategory.forEach((q) => {
        // Add this question to the display list if it is default
        if (q.isDefault) {
            displayQuestions.push({ ...q });
        }

        // Add any other questions that have been triggered by the answer to this quetsion
        // TODO make sure this works for multi-select and single-select
        if (q.type === QuestionType.boolean && q.triggerQuestions && q.triggerQuestions.length > 0) {
        // Get the answer to the current question if one exists
        const answer = answers.get(q.id);
        if (answer !== undefined) {
            // If the answer matches one of the trigger answers, show the question
            q.triggerQuestions.forEach((tq) => {
                if (tq.triggerValue == answer.value) {
                    // Find the question in the all questions list and add it to the display list
                    const questionToAdd = questions.find((q) => q.id === tq.questionId);
                    if (questionToAdd) {
                        displayQuestions.push({ ...questionToAdd });
                    }
                }
            })
        }
        }
    });

    return displayQuestions;
}


const category_question_id = "FGW753"

const getQuestionsByCategory = (questions: Question[], answers: Map<string, Answer>): Question[] => {
    // This is super janky, but oh well. We'll need to re-work how category selection works.
    // For now, questionId FGW753 is the special case question which determines category selection
    const answer = answers.get(category_question_id);

    if (answer) {
        // The answer to this particular question will be a list of option ids
        const val = answer.value as Set<number>;
        const categories_to_include = new Set<Category>([Category.onboarding]);

        // This would be cleaner if the ids of the options mapped to the enum values
        // TODO consider if it's worth changing the ids or if it's worth changing
        // the enum values to just be numbers under the hood.
        if (val.has(1)) {
            categories_to_include.add(Category.firstSteps);
        }
        if (val.has(2)) {
            categories_to_include.add(Category.funeralAndCeremonies);
        }
        if (val.has(3)) {
            categories_to_include.add(Category.griefAndSelfCare);
        }
        if (val.has(4)) {
            categories_to_include.add(Category.admin);
        }
        if (val.has(5)) {
            categories_to_include.add(Category.legalAndFinancial);
        }
        // TODO It's annoying that TS can't figure out that the question category string
        // values match the underlying enum values
        return questions.filter((q) => categories_to_include.has(q.category));
    } else {
        // If they haven't answered the question yet, for now just show the onboarding questions
        // TODO: Verify this assumption with product
        return questions.filter((q) => q.category === Category.onboarding);;
    }

}
