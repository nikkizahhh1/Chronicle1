// User types
export interface User {
  user_id: string;
  email: string;
  quiz_results?: QuizResults;
  created_at: string;
}

export interface QuizResults {
  interests: string[];
}

// Trip types
export interface Trip {
  trip_id: string;
  user_id: string;
  type: 'location' | 'roadtrip';
  destination: string;
  start_date: string;
  end_date: string;
  preferences: TripPreferences;
  status: 'planned' | 'in_progress' | 'completed';
  itinerary: DayItinerary[];
  created_at: string;
  updated_at: string;
}

export interface TripPreferences {
  budget: number;
  activity_intensity: 1 | 2 | 3 | 4 | 5;
  solo_or_group: 'solo' | 'group';
  categories?: string[];
  include_gas?: boolean;
  scenic_route?: boolean;
}

export interface DayItinerary {
  day: number;
  date: string;
  activities: Activity[];
  totalCostUSD: number;
  transportMode?: 'walk' | 'subway' | 'taxi' | 'car' | 'none';
}

export interface Activity {
  name: string;
  type: string;
  durationHours: number;
  costUSD: number;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// POI types
export interface POI {
  poi_id: string;
  name: string;
  city: string;
  country: string;
  category: string;
  description: string;
  budget_level: 'low' | 'medium' | 'high';
  activity_intensity: 'low' | 'medium' | 'high';
  coordinates: {
    lat: number;
    lng: number;
  };
  popularity: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
