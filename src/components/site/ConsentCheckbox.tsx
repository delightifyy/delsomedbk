import { Checkbox } from "@/components/ui/checkbox";

type ConsentCheckboxProps = {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  id?: string;
};

export const ConsentCheckbox = ({
  checked,
  onCheckedChange,
  id = "consent",
}: ConsentCheckboxProps) => {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className="mt-0.5"
        required
      />
      <label
        htmlFor={id}
        className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
      >
        I confirm that the information and documents provided are accurate and
        belong to me or my organization. I consent to DesolMed collecting,
        storing, and verifying these details for the purpose of reviewing my
        application, and I agree to the{" "}
        <a href="/terms" className="text-primary font-medium hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-primary font-medium hover:underline">
          Privacy Policy
        </a>
        .
      </label>
    </div>
  );
};
