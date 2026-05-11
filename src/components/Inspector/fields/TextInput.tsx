import { cn } from "@/lib/utils";

interface TextInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: "text" | "number";
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  className,
  type = "text",
  unit,
  step,
  min,
  max,
}: TextInputProps) {
  return (
    <div className={cn("flex items-stretch overflow-hidden rounded border border-zinc-800 bg-zinc-950 focus-within:border-sky-500", className)}>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent px-2 py-1 text-xs text-zinc-100 outline-none placeholder:text-zinc-600"
      />
      {unit && (
        <span className="flex shrink-0 items-center border-l border-zinc-800 bg-zinc-900 px-2 text-[10px] text-zinc-500">
          {unit}
        </span>
      )}
    </div>
  );
}
