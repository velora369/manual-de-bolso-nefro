import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccordionListProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  itemCount?: number;
  "data-testid"?: string;
}

export default function AccordionList({
  title,
  children,
  defaultExpanded = false,
  itemCount,
  "data-testid": testId,
}: AccordionListProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border border-border rounded-lg bg-card" data-testid={testId}>
      <Button
        variant="ghost"
        onClick={toggleExpanded}
        className="w-full justify-between p-4 h-auto text-left hover:bg-secondary/50"
        data-testid={`button-toggle-${testId}`}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground">{title}</h3>
          {itemCount && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {itemCount} itens
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{isExpanded ? "Esconder" : "Ver detalhes"}</span>
          {isExpanded ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </div>
      </Button>
      
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-border" data-testid={`content-${testId}`}>
          {children}
        </div>
      )}
    </div>
  );
}