import { describe, it, expect } from 'vitest';
import {
  createDefaultDesignSelections,
  applyOptionSelection,
  validateDesignSelections,
  duplicateDesign
} from './compatibilityEngine';
import {
  SHIRT_GARMENT_TYPE,
  KURTA_GARMENT_TYPE,
  INITIAL_FABRICS,
  INITIAL_OPTIONS,
  INITIAL_COMPATIBILITY_RULES
} from '../../lib/storage/mockData';

describe('Customization & Compatibility Engine', () => {
  const options = INITIAL_OPTIONS;
  const rules = INITIAL_COMPATIBILITY_RULES;
  const shirtFabricId = INITIAL_FABRICS.find((f) => f.code === 'poplin_white')!.id;
  const kurtaFabricId = INITIAL_FABRICS.find((f) => f.code === 'kasavu_kerala')!.id;

  describe('Western Shirt Customization', () => {
    it('generates a valid initial default design selection set for dress shirts', () => {
      const defaultDesign = createDefaultDesignSelections(
        SHIRT_GARMENT_TYPE.id,
        shirtFabricId,
        options
      );

      expect(defaultDesign.garmentTypeId).toBe(SHIRT_GARMENT_TYPE.id);
      expect(defaultDesign.fabricId).toBe(shirtFabricId);
      expect(defaultDesign.selections.collar).toBeDefined();
      expect(defaultDesign.selections.cuff).toBeDefined();
      expect(defaultDesign.selections.sleeve).toBeDefined();
      expect(defaultDesign.selections.buttons).toBeDefined();

      const validation = validateDesignSelections(defaultDesign.selections, options, rules);
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('preserves unrelated selections when modifying a single option', () => {
      const initial = createDefaultDesignSelections(SHIRT_GARMENT_TYPE.id, shirtFabricId, options);
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
      const initial = createDefaultDesignSelections(SHIRT_GARMENT_TYPE.id, shirtFabricId, options);
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
      const initial = createDefaultDesignSelections(SHIRT_GARMENT_TYPE.id, shirtFabricId, options);
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
  });

  describe("Men's Kurta Customization", () => {
    it('generates a valid initial default design selection set for authentic Indian Kurtas', () => {
      const defaultDesign = createDefaultDesignSelections(
        KURTA_GARMENT_TYPE.id,
        kurtaFabricId,
        options
      );

      expect(defaultDesign.garmentTypeId).toBe(KURTA_GARMENT_TYPE.id);
      expect(defaultDesign.fabricId).toBe(kurtaFabricId);
      expect(defaultDesign.selections.silhouette).toBeDefined();
      expect(defaultDesign.selections.neckline).toBeDefined();
      expect(defaultDesign.selections.kurta_patti).toBeDefined();
      expect(defaultDesign.selections.sleeve).toBeDefined();
      expect(defaultDesign.selections.borders_zari).toBeDefined();
      expect(defaultDesign.selections.buttons).toBeDefined();
      expect(defaultDesign.selections.length_slits).toBeDefined();

      const validation = validateDesignSelections(defaultDesign.selections, options, rules);
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('allows switching from Mandarin collar to Nehru collar or collarless round neck', () => {
      const initial = createDefaultDesignSelections(KURTA_GARMENT_TYPE.id, kurtaFabricId, options);
      const roundNeck = options.find((o) => o.code === 'kurta_neck_round')!;

      const transition = applyOptionSelection(initial, 'neckline', roundNeck.id, options, rules);

      expect(transition.errors.length).toBe(0);
      expect(transition.newState.selections.neckline).toBe(roundNeck.id);
    });

    it('duplicates Kurta designs with new fabric without altering original selections', () => {
      const initial = createDefaultDesignSelections(KURTA_GARMENT_TYPE.id, kurtaFabricId, options);
      const silkFabric = INITIAL_FABRICS.find((f) => f.code === 'raw_silk_navy')!;
      const duplicated = duplicateDesign(initial, silkFabric.id);

      expect(duplicated.garmentTypeId).toBe(initial.garmentTypeId);
      expect(duplicated.fabricId).toBe(silkFabric.id);
      expect(duplicated.version).toBe(1);
      expect(duplicated.selections).toEqual(initial.selections);
    });
  });
});
