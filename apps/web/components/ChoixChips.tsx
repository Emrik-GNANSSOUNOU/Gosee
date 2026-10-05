"use client";

interface ChoixChipsProps<T extends string> {
  legend: string;
  options: Record<T, string>;
  selected: T[];
  multiple?: boolean;
  onChange: (selected: T[]) => void;
}

export function ChoixChips<T extends string>({
  legend,
  options,
  selected,
  multiple = false,
  onChange,
}: ChoixChipsProps<T>) {
  function toggle(value: T) {
    if (!multiple) {
      onChange([value]);
      return;
    }
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  }

  return (
    <fieldset className="mt-5">
      <legend className="text-sm font-semibold text-neutral-900">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {(Object.keys(options) as T[]).map((value) => {
          const active = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(value)}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-white text-neutral-800 ring-1 ring-neutral-200 hover:ring-orange-300"
              }`}
            >
              {options[value]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
