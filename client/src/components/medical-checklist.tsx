import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckCircleIcon } from "lucide-react";

interface ChecklistItem {
  id: string;
  text: string;
  category?: string;
}

interface MedicalChecklistProps {
  title: string;
  items: ChecklistItem[];
  storageKey: string;
  "data-testid"?: string;
}

export default function MedicalChecklist({
  title,
  items,
  storageKey,
  "data-testid": testId,
}: MedicalChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(storageKey);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setCheckedItems(new Set(parsed));
      } catch (error) {
        console.error("Error loading checklist state:", error);
      }
    }
  }, [storageKey]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(checkedItems)));
  }, [checkedItems, storageKey]);

  const toggleItem = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
  };

  const completedCount = checkedItems.size;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isCompleted = completedCount === totalCount;

  const clearAll = () => {
    setCheckedItems(new Set());
  };

  const checkAll = () => {
    setCheckedItems(new Set(items.map(item => item.id)));
  };

  return (
    <Card className="p-6" data-testid={testId}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
          {isCompleted && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
          {title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={checkAll}
            className="text-xs text-primary hover:underline"
            data-testid={`button-check-all-${storageKey}`}
          >
            Marcar todos
          </button>
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:underline"
            data-testid={`button-clear-all-${storageKey}`}
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Progresso</span>
          <span>{completedCount} de {totalCount}</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start space-x-3 p-2 rounded-md hover:bg-secondary/50 transition-colors"
            data-testid={`checklist-item-${item.id}`}
          >
            <Checkbox
              id={item.id}
              checked={checkedItems.has(item.id)}
              onCheckedChange={() => toggleItem(item.id)}
              className="mt-0.5"
              data-testid={`checkbox-${item.id}`}
            />
            <label
              htmlFor={item.id}
              className={`text-sm cursor-pointer flex-1 ${
                checkedItems.has(item.id)
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {item.text}
              {item.category && (
                <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {item.category}
                </span>
              )}
            </label>
          </div>
        ))}
      </div>

      {isCompleted && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-center">
          <p className="text-sm text-green-800 font-medium">
            ✅ Checklist completo! Todos os itens foram verificados.
          </p>
        </div>
      )}
    </Card>
  );
}