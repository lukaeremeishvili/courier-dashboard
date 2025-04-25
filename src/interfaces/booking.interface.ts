export interface Booking {
    id: string;
    userId: string; 
    courierId: string; 
    timeSlot: string;  
    status: 'confirmed' | 'pending' | 'canceled';  
  }
  