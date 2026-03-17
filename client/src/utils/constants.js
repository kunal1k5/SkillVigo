/**
 * Constants - Application-wide constants
 * 
 * Includes:
 * - API endpoints
 * - Status values
 * - Categories
 * - Roles
 * - Error messages
 */

export const ROLES = {
  PROVIDER: 'provider',
  SEEKER: 'seeker',
  ADMIN: 'admin',
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUNDED: 'refunded',
};

export const SKILL_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};

export const CATEGORIES = [
  'Programming',
  'Design',
  'Music',
  'Languages',
  'Business',
  'Fitness',
  'Arts',
  'Other',
];
