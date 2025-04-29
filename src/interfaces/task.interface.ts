export interface Task {
    id: string;
    name: string;
    description: string;
    time: string;  
    priority: 'low' | 'medium' | 'high';
    courierId: string;  
    users?: { 
        full_name: string; 
    } | null;
    due_date?: string | null;
}
  