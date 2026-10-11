import {
  CustomizationOption,
  OptionCategory,
  OptionCompatibilityRule,
  DesignSelectionState
} from '../../types';

export interface CompatibilityValidationResult {
  isValid: boolean;
  errors: Array<{
    category: OptionCategory;
    optionId: string;
    conflictingOptionId?: string;
    message: string;
  }>;
}

export interface OptionTransitionResult {
  newState: DesignSelectionState;
  appliedAutoCorrections: Array<{
    category: OptionCategory;
    previousOptionId: string;
    newOptionId: string;
    reason: string;
  }>;
  errors: string[];
}

/**
 * Validates a design selection state against all active compatibility rules.
 */
export function validateDesignSelections(
  selections: Record<OptionCategory, string>,
  options: CustomizationOption[],
  rules: OptionCompatibilityRule[]
): CompatibilityValidationResult {
  const errors: CompatibilityValidationResult['errors'] = [];
  const selectedOptionIds = new Set(Object.values(selections));
  const optionMap = new Map<string, CustomizationOption>(options.map((o) => [o.id, o]));

  for (const rule of rules) {
    if (rule.ruleType === 'incompatible') {
      // Both options cannot be selected simultaneously
      if (selectedOptionIds.has(rule.optionAId) && selectedOptionIds.has(rule.optionBId)) {
        const optA = optionMap.get(rule.optionAId);
        const optB = optionMap.get(rule.optionBId);
        errors.push({
          category: optA?.category || 'collar',
          optionId: rule.optionAId,
          conflictingOptionId: rule.optionBId,
          message: rule.reason || `Option "${optA?.name}" is incompatible with "${optB?.name}".`
        });
      }
    } else if (rule.ruleType === 'requires') {
      // If Option A is selected, Option B MUST be selected
      if (selectedOptionIds.has(rule.optionAId) && !selectedOptionIds.has(rule.optionBId)) {
        const optA = optionMap.get(rule.optionAId);
        const optB = optionMap.get(rule.optionBId);
        errors.push({
          category: optA?.category || 'collar',
          optionId: rule.optionAId,
          conflictingOptionId: rule.optionBId,
          message: rule.reason || `Option "${optA?.name}" requires "${optB?.name}".`
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Applies a user option selection while preserving all unrelated selections
 * and evaluating any automatic default-forcing rules or rejecting hard conflicts.
 */
export function applyOptionSelection(
  currentState: DesignSelectionState,
  category: OptionCategory,
  targetOptionId: string,
  options: CustomizationOption[],
  rules: OptionCompatibilityRule[]
): OptionTransitionResult {
  const optionMap = new Map<string, CustomizationOption>(options.map((o) => [o.id, o]));
  const targetOption = optionMap.get(targetOptionId);

  if (!targetOption) {
    return {
      newState: currentState,
      appliedAutoCorrections: [],
      errors: [`Option ${targetOptionId} not found in catalog.`]
    };
  }

  // Clone current selections
  const updatedSelections: Record<OptionCategory, string> = {
    ...currentState.selections,
    [category]: targetOptionId
  };

  const appliedAutoCorrections: OptionTransitionResult['appliedAutoCorrections'] = [];

  // Check forces_default rules
  for (const rule of rules) {
    if (rule.ruleType === 'forces_default' && rule.optionAId === targetOptionId) {
      const forcedOption = optionMap.get(rule.optionBId);
      if (forcedOption) {
        const previousId = updatedSelections[forcedOption.category];
        if (previousId !== forcedOption.id) {
          updatedSelections[forcedOption.category] = forcedOption.id;
          appliedAutoCorrections.push({
            category: forcedOption.category,
            previousOptionId: previousId,
            newOptionId: forcedOption.id,
            reason: rule.reason
          });
        }
      }
    }
  }

  // Validate resulting combination
  const validation = validateDesignSelections(updatedSelections, options, rules);

  if (!validation.isValid) {
    return {
      newState: currentState, // Keep previous state untouched on hard rejection
      appliedAutoCorrections: [],
      errors: validation.errors.map((e) => e.message)
    };
  }

  return {
    newState: {
      ...currentState,
      selections: updatedSelections,
      version: currentState.version + 1
    },
    appliedAutoCorrections,
    errors: []
  };
}

/**
 * Creates a default design selection state for a garment type using active catalog defaults.
 */
export function createDefaultDesignSelections(
  garmentTypeId: string,
  fabricId: string,
  options: CustomizationOption[]
): DesignSelectionState {
  const selections: Partial<Record<OptionCategory, string>> = {};

  const categories: OptionCategory[] = [
    'collar',
    'cuff',
    'sleeve',
    'placket',
    'pocket',
    'buttons',
    'back_pleat',
    'hem'
  ];

  for (const cat of categories) {
    const catOptions = options.filter((o) => o.category === cat && o.isActive);
    const defaultOpt = catOptions.find((o) => o.isDefault) || catOptions[0];
    if (defaultOpt) {
      selections[cat] = defaultOpt.id;
    }
  }

  return {
    garmentTypeId,
    fabricId,
    selections: selections as Record<OptionCategory, string>,
    version: 1
  };
}

/**
 * Clones a design into a new version or duplicated design.
 */
export function duplicateDesign(
  source: DesignSelectionState,
  newFabricId?: string
): DesignSelectionState {
  return {
    garmentTypeId: source.garmentTypeId,
    fabricId: newFabricId || source.fabricId,
    selections: { ...source.selections },
    version: 1
  };
}
