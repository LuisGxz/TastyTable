export const UserRole = { Diner: 'diner', Owner: 'owner' } as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ReservationStatus = {
  Confirmed: 'confirmed',
  Cancelled: 'cancelled',
  Completed: 'completed',
} as const;
export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];

/** Warm gradient placeholders standing in for food photography (mockup f-1…f-4). */
export const PhotoStyle = ['f-1', 'f-2', 'f-3', 'f-4'] as const;
export type PhotoStyle = (typeof PhotoStyle)[number];
