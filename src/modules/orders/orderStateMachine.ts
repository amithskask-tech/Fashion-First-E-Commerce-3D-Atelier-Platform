import { OrderStatus, UserRole } from '../../types';

// Finite State Machine definition of allowed transitions
export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['confirmed', 'cancelled'],
  confirmed: ['accepted_production', 'cancelled'],
  accepted_production: ['in_production', 'rejected'],
  in_production: ['quality_check'],
  quality_check: ['ready_dispatch', 'in_production'], // allows rework
  ready_dispatch: ['completed'],
  completed: [],
  cancelled: [],
  rejected: []
};

export interface TransitionCheck {
  canTransition: boolean;
  reason?: string;
}

/**
 * Validates whether a lifecycle status transition is permitted and authorized.
 */
export function validateStatusTransition(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus,
  userRole: UserRole
): TransitionCheck {
  if (currentStatus === targetStatus) {
    return { canTransition: false, reason: 'Order is already in this status.' };
  }

  const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(targetStatus)) {
    return {
      canTransition: false,
      reason: `Transition from "${currentStatus}" to "${targetStatus}" is not permitted in the production lifecycle.`
    };
  }

  // Permission checks: Customer can only cancel from 'draft' or 'confirmed'
  if (userRole === 'customer') {
    if (targetStatus === 'cancelled' && (currentStatus === 'draft' || currentStatus === 'confirmed')) {
      return { canTransition: true };
    }
    return {
      canTransition: false,
      reason: 'Only authorized factory and tailoring staff can modify production stage status.'
    };
  }

  // Staff and Admin are permitted for all valid state machine transitions
  return { canTransition: true };
}
