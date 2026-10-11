import React, { useState, useEffect } from 'react';
import {
  BodyMeasurements,
  BodyProfile,
  DisplayUnit,
  FitPreference
} from '../../types';
import {
  inchesToMm,
  mmToInches,
  lbsToKg,
  kgToLbs
} from './units';
import {
  BodyMeasurementsZodSchema,
  checkMeasurementConsistency,
  ConsistencyWarning
} from './validator';
import { AlertCircle, AlertTriangle, CheckCircle2, Save, Ruler } from 'lucide-react';

interface MeasurementsFormProps {
  initialMeasurements: BodyMeasurements;
  activeProfile: BodyProfile;
  onSave: (measurements: BodyMeasurements, profile: BodyProfile) => Promise<void>;
}

export const MeasurementsForm: React.FC<MeasurementsFormProps> = ({
  initialMeasurements,
  activeProfile,
  onSave
}) => {
  const [unit, setUnit] = useState<DisplayUnit>(activeProfile.preferredUnit || 'metric');
  const [fit, setFit] = useState<FitPreference>(activeProfile.fitPreference || 'regular');
  const [profileName, setProfileName] = useState<string>(activeProfile.profileName);

  // Form values in display unit
  const [formValues, setFormValues] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consistencyWarnings, setConsistencyWarnings] = useState<ConsistencyWarning[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Populate form on load or unit switch
  useEffect(() => {
    if (unit === 'imperial') {
      setFormValues({
        height: mmToInches(initialMeasurements.heightMm),
        weight: kgToLbs(initialMeasurements.weightKg),
        neckCirc: mmToInches(initialMeasurements.neckCircMm),
        chestCirc: mmToInches(initialMeasurements.chestCircMm),
        waistCirc: mmToInches(initialMeasurements.waistCircMm),
        hipCirc: mmToInches(initialMeasurements.hipCircMm),
        shoulderWidth: mmToInches(initialMeasurements.shoulderWidthMm),
        sleeveLength: mmToInches(initialMeasurements.sleeveLengthMm),
        bicepCirc: mmToInches(initialMeasurements.bicepCircMm),
        wristCirc: mmToInches(initialMeasurements.wristCircMm),
        shirtLength: mmToInches(initialMeasurements.shirtLengthMm)
      });
    } else {
      setFormValues({
        height: Math.round(initialMeasurements.heightMm / 10), // cm
        weight: initialMeasurements.weightKg,
        neckCirc: Number((initialMeasurements.neckCircMm / 10).toFixed(1)),
        chestCirc: Number((initialMeasurements.chestCircMm / 10).toFixed(1)),
        waistCirc: Number((initialMeasurements.waistCircMm / 10).toFixed(1)),
        hipCirc: Number((initialMeasurements.hipCircMm / 10).toFixed(1)),
        shoulderWidth: Number((initialMeasurements.shoulderWidthMm / 10).toFixed(1)),
        sleeveLength: Number((initialMeasurements.sleeveLengthMm / 10).toFixed(1)),
        bicepCirc: Number((initialMeasurements.bicepCircMm / 10).toFixed(1)),
        wristCirc: Number((initialMeasurements.wristCircMm / 10).toFixed(1)),
        shirtLength: Number((initialMeasurements.shirtLengthMm / 10).toFixed(1))
      });
    }
  }, [unit, initialMeasurements]);

  // Convert current form values to internal canonical representation (mm and kg)
  const getCanonicalMeasurements = (): BodyMeasurements => {
    if (unit === 'imperial') {
      return {
        ...initialMeasurements,
        heightMm: inchesToMm(formValues.height || 0),
        weightKg: lbsToKg(formValues.weight || 0),
        neckCircMm: inchesToMm(formValues.neckCirc || 0),
        chestCircMm: inchesToMm(formValues.chestCirc || 0),
        waistCircMm: inchesToMm(formValues.waistCirc || 0),
        hipCircMm: inchesToMm(formValues.hipCirc || 0),
        shoulderWidthMm: inchesToMm(formValues.shoulderWidth || 0),
        sleeveLengthMm: inchesToMm(formValues.sleeveLength || 0),
        bicepCircMm: inchesToMm(formValues.bicepCirc || 0),
        wristCircMm: inchesToMm(formValues.wristCirc || 0),
        shirtLengthMm: inchesToMm(formValues.shirtLength || 0)
      };
    } else {
      return {
        ...initialMeasurements,
        heightMm: Math.round((formValues.height || 0) * 10),
        weightKg: formValues.weight || 0,
        neckCircMm: Math.round((formValues.neckCirc || 0) * 10),
        chestCircMm: Math.round((formValues.chestCirc || 0) * 10),
        waistCircMm: Math.round((formValues.waistCirc || 0) * 10),
        hipCircMm: Math.round((formValues.hipCirc || 0) * 10),
        shoulderWidthMm: Math.round((formValues.shoulderWidth || 0) * 10),
        sleeveLengthMm: Math.round((formValues.sleeveLength || 0) * 10),
        bicepCircMm: Math.round((formValues.bicepCirc || 0) * 10),
        wristCircMm: Math.round((formValues.wristCirc || 0) * 10),
        shirtLengthMm: Math.round((formValues.shirtLength || 0) * 10)
      };
    }
  };

  const handleInputChange = (field: string, rawVal: string) => {
    const num = parseFloat(rawVal);
    setFormValues((prev) => ({ ...prev, [field]: isNaN(num) ? 0 : num }));
    setSaveSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const canonical = getCanonicalMeasurements();

    // 1. Zod schema validation
    const result = BodyMeasurementsZodSchema.safeParse(canonical);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldKey = issue.path[0] as string;
        fieldErrors[fieldKey] = issue.message;
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    // 2. Consistency checks
    const warnings = checkMeasurementConsistency(canonical);
    setConsistencyWarnings(warnings);

    // If there is any hard error in consistency checks, stop
    const hasHardError = warnings.some((w) => w.severity === 'error');
    if (hasHardError) {
      setIsSubmitting(false);
      return;
    }

    // 3. Save profile and measurements
    await onSave(canonical, {
      ...activeProfile,
      profileName,
      fitPreference: fit,
      preferredUnit: unit
    });

    setIsSubmitting(false);
    setSaveSuccess(true);
  };

  const fields: Array<{ key: string; label: string; canonicalKey: keyof BodyMeasurements; desc: string }> = [
    { key: 'height', label: 'Height', canonicalKey: 'heightMm', desc: 'Full standing height without shoes' },
    { key: 'weight', label: 'Weight', canonicalKey: 'weightKg', desc: 'Current body weight' },
    { key: 'neckCirc', label: 'Neck Circumference', canonicalKey: 'neckCircMm', desc: 'Around neck base where collar buttons' },
    { key: 'chestCirc', label: 'Chest Circumference', canonicalKey: 'chestCircMm', desc: 'Around fullest part under armpits' },
    { key: 'waistCirc', label: 'Waist Circumference', canonicalKey: 'waistCircMm', desc: 'Around natural waistline / navel level' },
    { key: 'hipCirc', label: 'Hip Circumference', canonicalKey: 'hipCircMm', desc: 'Around widest part of hips and seat' },
    { key: 'shoulderWidth', label: 'Shoulder Width', canonicalKey: 'shoulderWidthMm', desc: 'From left shoulder bone to right' },
    { key: 'sleeveLength', label: 'Sleeve Length', canonicalKey: 'sleeveLengthMm', desc: 'Shoulder point down to wrist bone' },
    { key: 'bicepCirc', label: 'Bicep Circumference', canonicalKey: 'bicepCircMm', desc: 'Widest circumference of upper arm' },
    { key: 'wristCirc', label: 'Wrist Circumference', canonicalKey: 'wristCircMm', desc: 'Around wrist bone where cuff sits' },
    { key: 'shirtLength', label: 'Shirt Length', canonicalKey: 'shirtLengthMm', desc: 'Base of neck down to desired hem length' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Ruler className="w-5 h-5 text-sky-400" />
            Body Measurement Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            All lengths are preserved internally in precision millimetres. Separate from finished shirt dimensions.
          </p>
        </div>

        {/* Unit Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setUnit('metric')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              unit === 'metric'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Metric (cm / kg)
          </button>
          <button
            type="button"
            onClick={() => setUnit('imperial')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              unit === 'imperial'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Imperial (in / lbs)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Profile Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Body Profile Label
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Default Fit Preference (Ease)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['slim', 'regular', 'relaxed'] as FitPreference[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFit(f)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg capitalize border transition ${
                    fit === f
                      ? 'bg-sky-500/20 border-sky-500 text-sky-400 font-semibold'
                      : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {f} Fit
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Consistency Check Alerts */}
        {consistencyWarnings.length > 0 && (
          <div className="space-y-2">
            {consistencyWarnings.map((w, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${
                  w.severity === 'error'
                    ? 'bg-red-950/40 border-red-800 text-red-200'
                    : 'bg-amber-950/40 border-amber-800 text-amber-200'
                }`}
              >
                {w.severity === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="block font-semibold">
                    {w.severity === 'error' ? 'Tape Measurement Inconsistency' : 'Tailor Flag'}
                  </strong>
                  {w.message}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 11 Anatomical Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {fields.map(({ key, label, canonicalKey, desc }) => {
            const hasError = errors[canonicalKey];
            const unitLabel =
              key === 'weight'
                ? unit === 'imperial' ? 'lbs' : 'kg'
                : unit === 'imperial' ? 'inches' : 'cm';

            return (
              <div
                key={key}
                className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-200">
                    {label}
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {unitLabel}
                  </span>
                </div>
                <input
                  type="number"
                  step={key === 'weight' || unit === 'imperial' ? '0.1' : '1'}
                  value={formValues[key] || ''}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition ${
                    hasError
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-slate-700 focus:border-sky-500'
                  }`}
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1" title={desc}>
                  {desc}
                </p>
                {hasError && (
                  <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {hasError}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div>
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Measurements validated and saved (Version updated).
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg transition"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Validating...' : 'Save & Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};
