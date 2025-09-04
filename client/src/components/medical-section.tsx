import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDownIcon } from "lucide-react";

interface MedicalSectionProps {
  id: string;
  title: string;
  children: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  "data-testid"?: string;
}

export default function MedicalSection({
  id,
  title,
  children,
  isExpanded,
  onToggle,
  "data-testid": testId,
}: MedicalSectionProps) {
  return (
    <section id={id} className="bg-card border border-border rounded-lg" data-testid={testId}>
      <div className="p-6 border-b border-border">
        <button
          className="flex items-center justify-between w-full text-left"
          onClick={onToggle}
          data-testid={`button-toggle-${id}`}
        >
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
          <ChevronDownIcon
            className={`w-5 h-5 transition-transform ${
              isExpanded ? "transform rotate-0" : "transform -rotate-90"
            }`}
          />
        </button>
      </div>
      <div
        className={`section-content ${isExpanded ? "expanded" : ""}`}
        data-testid={`content-${id}`}
      >
        <div className="p-6">{children}</div>
      </div>
    </section>
  );
}
