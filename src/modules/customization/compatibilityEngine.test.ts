import { describe, it, expect } from 'vitest';
import {
  createDefaultDesignSelections,
  applyOptionSelection,
  validateDesignSelections,
  duplicateDesign
} from './compatibilityEngine';
import {
  INITIAL_GARMENT_TYPE,
  INITIAL_FABRICS,
  INITIAL_OPTIONS,
  INITIAL_COMPATIBILITY_RULES
} from '../../lib/storage/mockData';

describe('Customization & Compatibility Engine', () => {
  const options = INITIAL_OPTIONS;
  const rules = INITIAL_COMPATIBILITY_RULES;
  const fabricId = INITIAL_FABRICS[0].id;

  it('generates a valid initial default design selection set', () => {
    const defaultDesign = createDefaultDesignSelections(
      INITIAL_GARMENT_TYPE.id,
      fabricId,
      options
    );

    expect(defaultDesign.garmentTypeId).toBe(INITIAL_GARMENT_TYPE.id);
    expect(defaultDesign.fabricId).toBe(fabricId);
    expect(defaultDesign.selections.collar).toBeDefined();
    expect(defaultDesign.selections.cuff).toBeDefined();
    expect(defaultDesign.selections.sleeve).toBeDefined();
    expect(defaultDesign.selections.buttons).toBeDefined();

    const validation = validateDesignSelections(defaultDesign.selections, options, rules);
    expect(validation.isValid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });

  it('preserves unrelated selections when modifying a single option', () => {
    const initial = createDefaultDesignSelections(INITIAL_GARMENT_TYPE.id, fabricId, options);
    const initialButtons = initial.selections.buttons;
    const initialCuff = initial.selections.cuff;

    // Switch collar from spread to band
    const bandCollar = options.find((o) => o.code === 'collar_band')!;
    const transition = applyOptionSelection(initial, 'collar', bandCollar.id, options, rules);

    expect(transition.errors.length).toBe(0);
    expect(transition.newState.selections.collar).toBe(bandCollar.id);
    expect(transition.newState.selections.buttons).toBe(initialButtons);
    expect(transition.newState.selections.cuff).toBe(initialCuff);
    expect(transition.newState.version).toBe(initial.version + 1);
  });

  it('auto-resolves forced defaults (short sleeves forces no cuff)', () => {
    const initial = createDefaultDesignSelections(INITIAL_GARMENT_TYPE.id, fabricId, options);
    const shortSleeve = options.find((o) => o.code === 'sleeve_short')!;
    const noCuff = options.find((o) => o.code === 'cuff_none')!;

    const transition = applyOptionSelection(initial, 'sleeve', shortSleeve.id, options, rules);

    expect(transition.errors.length).toBe(0);
    expect(transition.newState.selections.sleeve).toBe(shortSleeve.id);
    expect(transition.newState.selections.cuff).toBe(noCuff.id);
    expect(transition.appliedAutoCorrections.length).toBe(1);
    expect(transition.appliedAutoCorrections[0].newOptionId).toBe(noCuff.id);
  });

  it('strictly rejects incompatible option combinations and keeps previous state intact', () => {
    const initial = createDefaultDesignSelections(INITIAL_GARMENT_TYPE.id, fabricId, options);
    const shortSleeve = options.find((o) => o.code === 'sleeve_short')!;
    const frenchCuff = options.find((o) => o.code === 'cuff_french')!;

    // First apply short sleeve
    const withShortSleeve = applyOptionSelection(initial, 'sleeve', shortSleeve.id, options, rules).newState;

    // Now attempt to set French cuff on short sleeve
    const invalidTransition = applyOptionSelection(
      withShortSleeve,
      'cuff',
      frenchCuff.id,
      options,
      rules
    );

    expect(invalidTransition.errors.length).toBeGreaterThan(0);
    expect(invalidTransition.errors[0]).toContain('French double cuffs require full length sleeves');
    // Ensure state was not mutated to the invalid combination
    expect(invalidTransition.newState.selections.cuff).toBe(withShortSleeve.selections.cuff);
  });

  it('duplicates designs with independent versioning', () => {
    const initial = createDefaultDesignSelections(INITIAL_GARMENT_TYPE.id, fabricId, options);
    const duplicated = duplicateDesign(initial, INITIAL_FABRICS[1].id);

    expect(duplicated.garmentTypeId).toBe(initial.garmentTypeId);
    expect(duplicated.fabricId).toBe(INITIAL_FABRICS[1].id);
    expect(duplicated.version).toBe(1);
    expect(duplicated.selections).toEqual(initial.selections);
  });
});
