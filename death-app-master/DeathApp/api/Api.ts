const baseUrl = "https://1z8gtsldma.execute-api.us-east-1.amazonaws.com";
const stage = 'dev' // TODO get stage from react native config


export const Api = {
    getAllQuestions: async (): Promise<any> => {
        try {
            const response = await fetch(`${baseUrl}/${stage}/questions`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        }
        catch (error) {
            console.error(error);
        }
    },
    getAllTaskTemplates: async (): Promise<any> => {
        try {
            const response = await fetch(`${baseUrl}/${stage}/task-templates`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        }
        catch (error) {
            console.error(error);
        }
    },
    getAllEntityTemplates: async (): Promise<any> => {
        try {
            const response = await fetch(`${baseUrl}/${stage}/entity-templates`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        }
        catch (error) {
            console.error(error);
        }
    },
    updateTasks: async (task: Task): Promise<any> => {
        /*
        // TODO debug cloudfront 400 error
        try {
            const response = await fetch(`${baseUrl}/${stage}/tasks/user/${task.userId}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({tasks: [task]})
            });
            console.log(response);
            return await response.json();
        } catch (error) {
            console.error(error);
        }*/
    }
};
