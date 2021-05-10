export enum Priority {
  High = 'HIGH',
  Medium = 'MEDIUM',
  Low = 'LOW',
}

export const priorityToDisplayText = (priority: Priority): string => {
  switch(priority) {
    case Priority.High:
      return 'High';
    case Priority.Medium:
      return 'Medium';
    case Priority.Low:
      return 'Low';
    default:
      console.warn(`Unsupported priority ${priority}`);
      return "";
  }
}