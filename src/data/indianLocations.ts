export const INDIAN_LOCATIONS = {
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra'],
} as const;

export type IndianState = keyof typeof INDIAN_LOCATIONS;
export const INDIAN_STATES = Object.keys(INDIAN_LOCATIONS) as IndianState[];

export function citiesForState(state: string): readonly string[] {
  return INDIAN_STATES.includes(state as IndianState)
    ? INDIAN_LOCATIONS[state as IndianState]
    : [];
}
