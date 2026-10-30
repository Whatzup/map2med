export interface FlowServiceItem {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  unit: string;
  category: 'injections' | 'wound' | 'vitals' | 'lab' | 'physio' | 'elder';
  imageType: string;
  duration?: string;
  description?: string;
}

export interface FlowCartItem {
  service: FlowServiceItem;
  quantity: number;
}

export interface FlowSpecialist {
  name: string;
  role: string;
  rating: number;
  reviewCount: number;
  experience: string;
  phone: string;
  avatarUrl: string;
  vehicle: string;
  plateNumber: string;
  distance: string;
  etaMinutes: number;
}

export interface FlowServiceProgressItem {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'in_progress' | 'completed';
  timeEstimate?: string;
}

export interface FlowChatMessage {
  id: string;
  sender: 'specialist' | 'user' | 'system';
  text: string;
  timestamp: string;
}

export type ScreenId = 1 | 2 | 3 | 4 | 5;

// Compatibility aliases for flow components
export type ServiceItem = FlowServiceItem;
export type CartItem = FlowCartItem;
export type Specialist = FlowSpecialist;
export type ServiceProgressItem = FlowServiceProgressItem;
export type ChatMessage = FlowChatMessage;
