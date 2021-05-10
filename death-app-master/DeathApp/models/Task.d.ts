interface Task {
    uuid: string; // The uuid for this instance of a Task
    userId: string;
    displayText: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'PENDING' | 'COMPLETE';
    subTasks: string[]; // List of Task ids. Q: Would a parentId also be helpful?
    dueDate: Date | null; 
    note: string | null; // User-generated notes.
    category: 'ONBOARDING' | 'FIRST_STEPS' | 'GRIEF_AND_SELF_CARE' | 'FUNERAL_AND_CEREMONIES' | 'LEGAL_AND_FINANCIAL' | 'LIFE_ADMIN';
    level: 1 | 2; // For now, 1 corresponds to task and 2 corresponds to subtask 
    taskTemplateId: string | null; // What taskTemplateId was used to generate this task? 
    isDeleted: boolean;
}

interface TaskTemplate {
    id: string; // The globally unique id of this template. This is not the same as the Task id
    isDefault: boolean; // Should this task be added for every user by default?
    displayText: string;
    timeToComplete: number | null; // Days Q: Do we need more granular time periods or is days fine?
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    subTasks: string[]; // List of TaskTemplate ids.
    category: 'ONBOARDING' | 'FIRST_STEPS' | 'GRIEF_AND_SELF_CARE' | 'FUNERAL_AND_CEREMONIES' | 'LEGAL_AND_FINANCIAL' | 'LIFE_ADMIN';
    level: 1 | 2;
    extraInfo: string;
}

type TaskUpsert = Task

/**
 * How do we map questions to tasks?
 * - Questions have one or more TaskTemplate id associated with them
 * - Entities also have one or more TaskTemplate id associated with them
 * - TaskTemplate gets turned into a Task
 * - How do we add conditional logic to this? Ex: If true, add task. If false do not add task.
 * - The triggerValue indicates for which answer(s) a task should be added
 */
