export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'assistant' | 'admin';
  avatar?: string;
  address?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface Assistant {
  _id: string;
  user: User;
  bio?: string;
  isApproved: boolean;
  isOnline: boolean;
  rating: number;
  totalRatings: number;
  totalEarnings: number;
  completedJobs: number;
  languages?: string[];
  experience?: string;
  location?: { city: string; area: string };
  createdAt: string;
}

export interface Booking {
  _id: string;
  customer: User;
  assistant?: User;
  location: {
    name: string;
    address: string;
    type: string;
    coordinates?: { lat: number; lng: number };
  };
  duration: number;
  status: 'pending' | 'accepted' | 'active' | 'completed' | 'cancelled' | 'rejected';
  startTime?: string;
  endTime?: string;
  scheduledAt: string;
  price: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: string;
  notes?: string;
  sosTriggered?: boolean;
  reviewGiven?: boolean;
  createdAt: string;
}

export interface Review {
  _id: string;
  booking: string;
  customer: User;
  assistant: string;
  rating: number;
  comment?: string;
  tags?: string[];
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  assistantProfile?: Assistant | null;
}
