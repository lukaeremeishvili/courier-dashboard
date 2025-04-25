export interface Task {
    id: string;
    name: string;
    description: string;
    time: string;  
    priority: 'low' | 'medium' | 'high';
    courierId: string;  
  }
  