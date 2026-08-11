"use client";

import { Button, Label, Modal, TextInput, Select } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { RiSettings4Line } from "react-icons/ri";

const DEFAULT_STRUCTURE = {
  grossSalary: { calculationType: "fixed" },
  basicSalary: { calculationType: "onGross", percentage: 50 },
  da: { enabled: false, percentage: 0 },
  overtime: { enabled: false, slotMinutes: 30, multiplier: 1.5 },
  otherAllowance: { enabled: false, percentage: 0 },
  hra: { enabled: false, calculateOn: "basic", percentage: 0 },
  conveyance: { enabled: false, mode: "input", percentage: 0 },
  specialAllowance: { enabled: false },
  pf: { enabled: false, calculateOn: "basic", rate: 12, wageCeiling: 15000 },
  esi: { enabled: false, rate: 0.75, wageCeiling: 21000 },
  pTax: { enabled: false },
  lwf: {
    enabled: false,
    calculateOn: "gross",
    wageCeiling: 15000,
    fixedAmount: 25,
  },
  bonus: { mode: "manual", rules: [] },
};

// Merge saved data over defaults so missing keys (new fields, old records) never crash the form
function mergeWithDefaults(data = {}) {
  const merged = structuredClone(DEFAULT_STRUCTURE);
  for (const key of Object.keys(merged)) {
    if (data[key] && typeof merged[key] === "object") {
      merged[key] = { ...merged[key], ...data[key] };
    } else if (data[key] !== undefined) {
      merged[key] = data[key];
    }
  }
  return merged;
}

function notify(type, message) {
  toast[type](message, {
    position: "bottom-right",
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
}

const NUMERIC_FIELD_PATHS = [
  ["basicSalary", "percentage"],
  ["da", "percentage"],
  ["otherAllowance", "percentage"],
  ["hra", "percentage"],
  ["conveyance", "percentage"],
  ["pf", "rate"],
  ["pf", "wageCeiling"],
  ["overtime", "multiplier"],
  ["overtime", "slotMinutes"],
  ["esi", "rate"],
  ["esi", "wageCeiling"],
  ["lwf", "wageCeiling"],
  ["lwf", "fixedAmount"],
  ["bonus_rate", null],
];

function sanitizeNumbersForSubmit(form) {
  const sanitized = structuredClone(form);
  NUMERIC_FIELD_PATHS.forEach(([section, field]) => {
    if (field === null) {
      sanitized[section] = Number(sanitized[section]) || 0;
    } else {
      sanitized[section][field] = Number(sanitized[section][field]) || 0;
    }
  });

  if (sanitized.bonus.mode === "auto") {
    sanitized.bonus.rules = sanitized.bonus.rules.map((rule) => ({
      lastMonth: Number(rule.lastMonth) || 1,
      lastYear: Number(rule.lastYear) || new Date().getFullYear(),
      backMonths: Number(rule.backMonths) || 1,
      minTenureMonths: Number(rule.minTenureMonths) || 0,
      percentage: Number(rule.percentage) || 0,
    }));
  } else {
    sanitized.bonus.rules = [];
  }

  return sanitized;
}

// Calculates Special Allowance as remaining % after Basic, DA, HRA, Other
// Allowance (all normalized to % of Gross, since calculateOn bases differ).
// NOTE: Conveyance is intentionally NOT subtracted here anymore — it's
// independent of Special Allowance's split (matches the backend formula:
// Special = Gross - Basic - DA - HRA - OtherAllowance, no conveyance term).
function computeSpecialAllowancePercent(form) {
  const basicPct = Number(form.basicSalary.percentage) || 0;

  const daPct = form.da.enabled
    ? (Number(form.da.percentage) || 0) * (basicPct / 100)
    : 0;

  let hraBasePct = 0;
  if (form.hra.calculateOn === "basic") hraBasePct = basicPct;
  else if (form.hra.calculateOn === "gross") hraBasePct = 100;
  else if (form.hra.calculateOn === "basicPlusDa")
    hraBasePct = basicPct + daPct;

  const hraPct = form.hra.enabled
    ? (Number(form.hra.percentage) || 0) * (hraBasePct / 100)
    : 0;

  // Special = Gross - Basic - DA - HRA (Other Allowance এখানে subtract হয় না)
  const specialPct = 100 - basicPct - daPct - hraPct;
  return {
    basicPct,
    daPct,
    hraPct,
    specialPct: Math.max(specialPct, 0),
  };
}

// Reusable section wrapper — header row with title + checkbox, and a
// subtle left-border accent that lights up when the section is enabled.
// Pass `toggle={null}` for sections that are always active (no enable/disable).
function Section({ title, description, toggle, checked, onToggle, children }) {
  const isToggleable = toggle !== null;
  const isActive = isToggleable ? checked : true;

  return (
    <div
      className={`rounded-lg border transition-colors ${
        isActive
          ? "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
          : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40"
      }`}
    >
      <div className="flex items-start justify-between gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {isToggleable && (
          <label className="flex items-center gap-2 shrink-0 cursor-pointer select-none pt-0.5">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onToggle(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Enabled
            </span>
          </label>
        )}
      </div>

      {isActive && children && <div className="px-4 py-3">{children}</div>}
    </div>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <Label
        htmlFor={htmlFor}
        value={label}
        className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300"
      />
      {children}
    </div>
  );
}

function emptyBonusRule() {
  const now = new Date();
  return {
    lastMonth: now.getMonth() + 1,
    lastYear: now.getFullYear(),
    backMonths: 10,
    minTenureMonths: 0,
    percentage: 8.33,
  };
}

function BonusRulesEditor({ rules, onChange }) {
  function updateRule(index, field, value) {
    const next = rules.map((rule, i) =>
      i === index ? { ...rule, [field]: value } : rule,
    );
    onChange(next);
  }

  function updateRuleNumeric(index, field, rawValue) {
    if (rawValue !== "" && !/^\d*\.?\d*$/.test(rawValue)) return;
    updateRule(index, field, rawValue);
  }

  function addRule() {
    onChange([...rules, emptyBonusRule()]);
  }

  function removeRule(index) {
    onChange(rules.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {rules.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          No bonus rule added yet. Add one to define how the bonus is
          calculated.
        </p>
      )}

      {rules.map((rule, index) => (
        <div
          key={index}
          className="rounded-md border border-gray-200 dark:border-gray-700 p-3 space-y-2"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Field label="Last month" htmlFor={`ruleMonth-${index}`}>
              <Select
                id={`ruleMonth-${index}`}
                value={rule.lastMonth}
                onChange={(e) =>
                  updateRule(index, "lastMonth", Number(e.target.value))
                }
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleString("en-US", {
                      month: "long",
                    })}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Last year" htmlFor={`ruleYear-${index}`}>
              <TextInput
                id={`ruleYear-${index}`}
                type="text"
                inputMode="numeric"
                value={rule.lastYear}
                onChange={(e) =>
                  updateRuleNumeric(index, "lastYear", e.target.value)
                }
              />
            </Field>

            <Field label="Back months" htmlFor={`ruleBack-${index}`}>
              <TextInput
                id={`ruleBack-${index}`}
                type="text"
                inputMode="numeric"
                value={rule.backMonths}
                onChange={(e) =>
                  updateRuleNumeric(index, "backMonths", e.target.value)
                }
              />
            </Field>

            <Field label="Min tenure (months)" htmlFor={`ruleTenure-${index}`}>
              <TextInput
                id={`ruleTenure-${index}`}
                type="text"
                inputMode="numeric"
                value={rule.minTenureMonths}
                onChange={(e) =>
                  updateRuleNumeric(index, "minTenureMonths", e.target.value)
                }
              />
            </Field>

            <Field label="Percentage (%)" htmlFor={`rulePct-${index}`}>
              <TextInput
                id={`rulePct-${index}`}
                type="text"
                inputMode="decimal"
                value={rule.percentage}
                onChange={(e) =>
                  updateRuleNumeric(index, "percentage", e.target.value)
                }
              />
            </Field>
          </div>

          <Button size="xs" color="failure" onClick={() => removeRule(index)}>
            Remove rule
          </Button>
        </div>
      ))}

      <Button size="xs" color="light" onClick={addRule}>
        + Add bonus rule
      </Button>
    </div>
  );
}

export default function EditStructure({ data = {} }) {
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(() => mergeWithDefaults(data));
  const router = useRouter();

  function onCloseModal() {
    setOpenModal(false);
    setForm(mergeWithDefaults(data)); // reset unsaved edits on close
  }

  // Generic setter for nested fields: update("hra", "percentage", 10)
  function update(section, field, value) {
    setForm((prev) => ({
      ...prev,
      [section]: field === null ? value : { ...prev[section], [field]: value },
    }));
  }

  // ================================================================
  // Numeric input handler — keeps the RAW STRING in state instead of
  // immediately coercing with Number(). This is the actual fix:
  // Number("") === 0 was forcing the field back to "0" on every
  // backspace, which fought React's controlled-input re-render and
  // made it impossible to clear + retype a different value smoothly.
  // Conversion to a real Number only happens right before submit
  // (see sanitizeNumbersForSubmit).
  // ================================================================
  function updateNumeric(section, field, rawValue) {
    // Allow empty string (mid-edit) and reject non-numeric junk chars,
    // but otherwise keep exactly what the user typed (including "0",
    // "1.", trailing decimals, etc.) so typing never gets fought.
    if (rawValue !== "" && !/^\d*\.?\d*$/.test(rawValue)) return;
    update(section, field, rawValue);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = sanitizeNumbersForSubmit(form);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/structure/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        },
      );

      if (response.ok) {
        notify("success", "Salary Structure updated successfully!");
        setOpenModal(false);
        router.refresh();
      } else {
        const error = await response.json();
        if (error.errors?.length) {
          error.errors.forEach((err) => notify("error", err.message));
        } else {
          notify("error", error.message || "Something went wrong.");
        }
      }
    } catch (error) {
      notify("error", error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button color="info" onClick={() => setOpenModal(true)}>
        <RiSettings4Line className="mr-2 h-4 w-4" />
        Edit Structure
      </Button>

      <Modal show={openModal} size="2xl" onClose={onCloseModal}>
        <Modal.Header>
          <span className="text-base font-semibold">Salary Structure</span>
        </Modal.Header>

        <Modal.Body className="bg-gray-50 dark:bg-gray-900">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ---------- GROSS SALARY ---------- */}
            <Section
              title="Gross Salary"
              description="How the total payable amount is determined"
              toggle={null}
            >
              <Field label="Calculation method" htmlFor="grossCalcType">
                <Select
                  id="grossCalcType"
                  value={form.grossSalary.calculationType}
                  onChange={(e) =>
                    update("grossSalary", "calculationType", e.target.value)
                  }
                  required
                >
                  <option value="fixed">Fixed monthly salary</option>
                  <option value="perDay">No of days * Rate</option>
                </Select>
              </Field>
            </Section>

            {/* ---------- BASIC SALARY ---------- */}
            <Section
              title="Basic Salary"
              description="Base component used to calculate other allowances"
              toggle={null}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Calculation method" htmlFor="basicCalcType">
                  <Select
                    id="basicCalcType"
                    value={form.basicSalary.calculationType}
                    onChange={(e) =>
                      update("basicSalary", "calculationType", e.target.value)
                    }
                    required
                  >
                    <option value="onGross">On Gross Salary</option>
                    <option value="onTotalSalary">On Total Salary</option>
                  </Select>
                </Field>
                <Field label="Basic salary (%)" htmlFor="basicPct">
                  <TextInput
                    id="basicPct"
                    type="text"
                    inputMode="decimal"
                    value={form.basicSalary.percentage}
                    onChange={(e) =>
                      updateNumeric("basicSalary", "percentage", e.target.value)
                    }
                    required
                  />
                </Field>
              </div>
            </Section>

            {/* ---------- DA ---------- */}
            <Section
              title="DA — Dearness Allowance"
              description="Cost-of-living adjustment on top of basic salary"
              toggle
              checked={form.da.enabled}
              onToggle={(v) => update("da", "enabled", v)}
            >
              <Field label="DA (% of basic)" htmlFor="daPct">
                <TextInput
                  id="daPct"
                  type="text"
                  inputMode="decimal"
                  value={form.da.percentage}
                  onChange={(e) =>
                    updateNumeric("da", "percentage", e.target.value)
                  }
                  required
                />
              </Field>
            </Section>

            {/* ---------- HRA ---------- */}
            <Section
              title="HRA — House Rent Allowance"
              toggle
              checked={form.hra.enabled}
              onToggle={(v) => update("hra", "enabled", v)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Calculate on" htmlFor="hraCalcOn">
                  <Select
                    id="hraCalcOn"
                    value={form.hra.calculateOn}
                    onChange={(e) =>
                      update("hra", "calculateOn", e.target.value)
                    }
                    required
                  >
                    <option value="basic">Basic</option>
                    <option value="gross">Gross salary</option>
                    <option value="basicPlusDa">Basic + DA</option>
                  </Select>
                </Field>
                <Field label="HRA (%)" htmlFor="hraPct">
                  <TextInput
                    id="hraPct"
                    type="text"
                    inputMode="decimal"
                    value={form.hra.percentage}
                    onChange={(e) =>
                      updateNumeric("hra", "percentage", e.target.value)
                    }
                    required
                  />
                </Field>
              </div>
            </Section>

            {/* ---------- SPECIAL ALLOWANCE ---------- */}
            <Section
              title="Special Allowance"
              toggle
              checked={form.specialAllowance.enabled}
              onToggle={(v) => update("specialAllowance", "enabled", v)}
            >
              {(() => {
                const { specialPct } = computeSpecialAllowancePercent(form);
                return (
                  <div className="space-y-2">
                    <p className="rounded-md bg-gray-100 dark:bg-gray-700 px-3 py-2 text-xs text-gray-600 dark:text-gray-300">
                      Auto-calculated: Gross − Basic − DA − HRA
                    </p>
                    <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-600 px-3 py-2 text-xs text-gray-600 dark:text-gray-300"></div>
                  </div>
                );
              })()}
            </Section>

            {/* ---------- CONVEYANCE ---------- */}
            <Section
              title="Conveyance Allowance"
              description="Independent of Special Allowance — does not affect its split"
              toggle
              checked={form.conveyance.enabled}
              onToggle={(v) => update("conveyance", "enabled", v)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Mode" htmlFor="conveyanceMode">
                  <Select
                    id="conveyanceMode"
                    value={form.conveyance.mode}
                    onChange={(e) =>
                      update("conveyance", "mode", e.target.value)
                    }
                    required
                  >
                    <option value="input">Manual amount per staff</option>
                    <option value="readonly">Auto — % of gross</option>
                  </Select>
                </Field>
                {form.conveyance.mode === "readonly" && (
                  <Field label="Conveyance (%)" htmlFor="conveyancePct">
                    <TextInput
                      id="conveyancePct"
                      type="text"
                      inputMode="decimal"
                      value={form.conveyance.percentage}
                      onChange={(e) =>
                        updateNumeric(
                          "conveyance",
                          "percentage",
                          e.target.value,
                        )
                      }
                      required
                    />
                  </Field>
                )}
              </div>
            </Section>

            {/* ---------- OTHER ALLOWANCE ---------- */}
            <Section
              title="Other Allowance"
              description="Additional allowance on top of basic salary"
              toggle
              checked={form.otherAllowance.enabled}
              onToggle={(v) => update("otherAllowance", "enabled", v)}
            >
              <Field
                label="Other Allowance (% of basic)"
                htmlFor="otherAllowancePct"
              >
                <TextInput
                  id="otherAllowancePct"
                  type="text"
                  inputMode="decimal"
                  value={form.otherAllowance.percentage}
                  onChange={(e) =>
                    updateNumeric(
                      "otherAllowance",
                      "percentage",
                      e.target.value,
                    )
                  }
                  required
                />
              </Field>
            </Section>

            {/* ---------- PF ---------- */}
            <Section
              title="PF — Provident Fund"
              toggle
              checked={form.pf.enabled}
              onToggle={(v) => update("pf", "enabled", v)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Calculate on" htmlFor="pfCalcOn">
                  <Select
                    id="pfCalcOn"
                    value={form.pf.calculateOn}
                    onChange={(e) =>
                      update("pf", "calculateOn", e.target.value)
                    }
                    required
                  >
                    <option value="basic">Basic</option>
                    <option value="basicPlusDa">Basic + DA</option>
                  </Select>
                </Field>
                <Field label="PF rate (%)" htmlFor="pfRate">
                  <TextInput
                    id="pfRate"
                    type="text"
                    inputMode="decimal"
                    value={form.pf.rate}
                    onChange={(e) =>
                      updateNumeric("pf", "rate", e.target.value)
                    }
                    required
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Wage ceiling (₹)" htmlFor="pfCeiling">
                    <TextInput
                      id="pfCeiling"
                      type="text"
                      inputMode="decimal"
                      value={form.pf.wageCeiling}
                      onChange={(e) =>
                        updateNumeric("pf", "wageCeiling", e.target.value)
                      }
                      required
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* ---------- ESI ---------- */}
            <Section
              title="ESI"
              toggle
              checked={form.esi.enabled}
              onToggle={(v) => update("esi", "enabled", v)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="ESI rate (%)" htmlFor="esiRate">
                  <TextInput
                    id="esiRate"
                    type="text"
                    inputMode="decimal"
                    value={form.esi.rate}
                    onChange={(e) =>
                      updateNumeric("esi", "rate", e.target.value)
                    }
                    required
                  />
                </Field>
                <Field label="Applicable if salary ≤ (₹)" htmlFor="esiCeiling">
                  <TextInput
                    id="esiCeiling"
                    type="text"
                    inputMode="decimal"
                    value={form.esi.wageCeiling}
                    onChange={(e) =>
                      updateNumeric("esi", "wageCeiling", e.target.value)
                    }
                    required
                  />
                </Field>
              </div>
            </Section>

            {/* ---------- PTAX ---------- */}
            <Section
              title="Professional Tax (PTax)"
              toggle
              checked={form.pTax.enabled}
              onToggle={(v) => update("pTax", "enabled", v)}
            >
              <p className="rounded-md bg-gray-100 dark:bg-gray-700 px-3 py-2 text-xs text-gray-600 dark:text-gray-300">
                Auto-calculated by slab: ₹0 (&lt;10,000) · ₹110 (&lt;15,001) ·
                ₹130 (&lt;25,001) · ₹150 (&lt;40,001) · ₹200 (above)
              </p>
            </Section>

            {/* ---------- LWF ---------- */}
            <Section
              title="LWF — Labour Welfare Fund"
              description="Flat rupee deduction (not a percentage), applicable if the chosen base is within the wage ceiling"
              toggle
              checked={form.lwf.enabled}
              onToggle={(v) => update("lwf", "enabled", v)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Depends on" htmlFor="lwfCalcOn">
                  <Select
                    id="lwfCalcOn"
                    value={form.lwf.calculateOn}
                    onChange={(e) =>
                      update("lwf", "calculateOn", e.target.value)
                    }
                    required
                  >
                    <option value="gross">Gross Salary</option>
                    <option value="basic">Basic</option>
                    <option value="basicPlusDa">Basic + DA</option>
                    <option value="actualSalary">Actual Monthly Salary</option>
                  </Select>
                </Field>
                <Field label="Applicable if value ≤ (₹)" htmlFor="lwfCeiling">
                  <TextInput
                    id="lwfCeiling"
                    type="text"
                    inputMode="decimal"
                    value={form.lwf.wageCeiling}
                    onChange={(e) =>
                      updateNumeric("lwf", "wageCeiling", e.target.value)
                    }
                    required
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Fixed deduction amount (₹)" htmlFor="lwfAmount">
                    <TextInput
                      id="lwfAmount"
                      type="text"
                      inputMode="decimal"
                      value={form.lwf.fixedAmount}
                      onChange={(e) =>
                        updateNumeric("lwf", "fixedAmount", e.target.value)
                      }
                      required
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* ---------- OVERTIME ---------- */}
            <Section
              title="Overtime"
              toggle
              checked={form.overtime.enabled}
              onToggle={(v) => update("overtime", "enabled", v)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Slot duration" htmlFor="otSlot">
                  <div className="flex items-center gap-2">
                    <TextInput
                      id="otSlot"
                      type="text"
                      inputMode="decimal"
                      value={form.overtime.slotMinutes}
                      onChange={(e) =>
                        updateNumeric("overtime", "slotMinutes", e.target.value)
                      }
                      required
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      minutes
                    </span>
                  </div>
                </Field>
                <Field label="Divisor (multiplier)" htmlFor="otMultiplier">
                  <TextInput
                    id="otMultiplier"
                    type="text"
                    inputMode="decimal"
                    value={form.overtime.multiplier}
                    onChange={(e) =>
                      updateNumeric("overtime", "multiplier", e.target.value)
                    }
                    required
                  />
                </Field>
              </div>
              <p className="mt-2 rounded-md bg-gray-100 dark:bg-gray-700 px-3 py-2 text-xs text-gray-600 dark:text-gray-300">
                Formula: (Monthly Salary × No. of Slots) ÷ (Days in Month ×{" "}
                {form.overtime.multiplier || 1.5})
              </p>
            </Section>

            {/* ---------- BONUS ---------- */}
            <Section
              title="Bonus"
              description="Manual entry per staff, or auto-calculated from past net salaries"
              toggle={null}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Field label="Mode" htmlFor="bonusMode">
                  <Select
                    id="bonusMode"
                    value={form.bonus.mode}
                    onChange={(e) => update("bonus", "mode", e.target.value)}
                    required
                  >
                    <option value="manual">
                      Manual — enter amount per staff
                    </option>
                    <option value="auto">
                      Auto — calculate from past salaries
                    </option>
                  </Select>
                </Field>
              </div>

              {form.bonus.mode === "auto" && (
                <BonusRulesEditor
                  rules={form.bonus.rules}
                  onChange={(rules) => update("bonus", "rules", rules)}
                />
              )}
            </Section>

            <div className="sticky bottom-0 -mx-6 -mb-6 border-t border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-800">
              <Button
                type="submit"
                color="success"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}
