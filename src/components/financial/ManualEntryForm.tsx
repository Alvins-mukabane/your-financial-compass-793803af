import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type EntryType = "asset" | "liability";

interface AssetEntry {
  name: string;
  type: string;
  value: number;
  cashflow: number;
  description?: string;
}

interface LiabilityEntry {
  name: string;
  type: string;
  balance: number;
  payment: number;
  description?: string;
}

const assetTypes = [
  { value: "stock", label: "📈 Stock" },
  { value: "real_estate", label: "🏠 Real Estate" },
  { value: "business", label: "🏢 Business" },
  { value: "savings", label: "🏦 Savings" },
  { value: "bond", label: "📜 Bond" },
  { value: "other", label: "💎 Other" },
];

const liabilityTypes = [
  { value: "mortgage", label: "🏠 Mortgage" },
  { value: "car_loan", label: "🚗 Car Loan" },
  { value: "credit_card", label: "💳 Credit Card" },
  { value: "student_loan", label: "🎓 Student Loan" },
  { value: "personal_loan", label: "🏦 Personal Loan" },
  { value: "other", label: "📋 Other" },
];

interface ManualEntryFormProps {
  onAddAsset: (asset: AssetEntry) => void;
  onAddLiability: (liability: LiabilityEntry) => void;
}

export default function ManualEntryForm({ onAddAsset, onAddLiability }: ManualEntryFormProps) {
  const [open, setOpen] = useState(false);
  const [entryType, setEntryType] = useState<EntryType>("asset");
  const [name, setName] = useState("");
  const [type, setType] = useState("stock");
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setName("");
    setType(entryType === "asset" ? "stock" : "mortgage");
    setValue1("");
    setValue2("");
    setDescription("");
  };

  const handleSubmit = () => {
    if (!name || !value1) return;
    if (entryType === "asset") {
      onAddAsset({
        name,
        type,
        value: Number(value1),
        cashflow: Number(value2) || 0,
        description: description || undefined,
      });
    } else {
      onAddLiability({
        name,
        type,
        balance: Number(value1),
        payment: Number(value2) || 0,
        description: description || undefined,
      });
    }
    reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors w-full justify-center"
      >
        <Plus className="w-4 h-4" />
        Add Asset or Liability Manually
      </button>
    );
  }

  const types = entryType === "asset" ? assetTypes : liabilityTypes;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Add Entry</h3>
        <button onClick={() => { setOpen(false); reset(); }} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2">
        {(["asset", "liability"] as EntryType[]).map((t) => (
          <button
            key={t}
            onClick={() => { setEntryType(t); setType(t === "asset" ? "stock" : "mortgage"); }}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
              entryType === t
                ? t === "asset" ? "bg-primary/12 text-primary" : "bg-destructive/12 text-destructive"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {t === "asset" ? "Asset" : "Liability"}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        <Input placeholder="Name (e.g. Rental Property)" value={name} onChange={(e) => setName(e.target.value)} />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {types.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder={entryType === "asset" ? "Value ($)" : "Balance ($)"}
            value={value1}
            onChange={(e) => setValue1(e.target.value)}
          />
          <Input
            type="number"
            placeholder={entryType === "asset" ? "Monthly Cash Flow ($)" : "Monthly Payment ($)"}
            value={value2}
            onChange={(e) => setValue2(e.target.value)}
          />
        </div>
        <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!name || !value1}
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        Add {entryType === "asset" ? "Asset" : "Liability"}
      </button>
    </div>
  );
}
