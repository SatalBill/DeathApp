export const getTasksForCurrentUser = (userId: string, tasks: Task[]): Task[] => {
    return tasks.filter((t) => t.userId === userId);
};
