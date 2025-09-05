import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableIcon, LayoutGridIcon } from "lucide-react";
import MedicalTable from "./medical-table";

interface Column {
  key: string;
  header: string;
}

interface MedicalDataViewerProps {
  data: Record<string, any>[];
  columns: Column[];
  tableId: string;
  highlightLastRow?: boolean;
  "data-testid"?: string;
}

export default function MedicalDataViewer({
  data,
  columns,
  tableId,
  highlightLastRow = false,
  "data-testid": testId,
}: MedicalDataViewerProps) {
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid={`cards-${tableId}`}>
      {data.map((row, index) => (
        <Card 
          key={index} 
          className={`p-4 ${
            highlightLastRow && index === data.length - 1 ? "border-red-200 bg-red-50" : ""
          }`}
          data-testid={`card-${index}`}
        >
          {columns.map((column) => (
            <div key={column.key} className="mb-3 last:mb-0">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {column.header}
              </div>
              <div className={`text-sm ${
                column.key === columns[0].key ? "font-medium text-primary" : "text-foreground"
              } ${highlightLastRow && index === data.length - 1 ? "text-red-700" : ""}`}>
                {row[column.key]}
              </div>
            </div>
          ))}
          {highlightLastRow && index === data.length - 1 && (
            <Badge variant="destructive" className="mt-2">
              Contraindicação
            </Badge>
          )}
        </Card>
      ))}
    </div>
  );

  return (
    <div data-testid={testId}>
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground">Visualização:</span>
        <div className="flex rounded-lg border border-border p-1">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="h-8 px-3"
            data-testid={`button-table-view-${tableId}`}
          >
            <TableIcon className="w-4 h-4 mr-1" />
            Tabela
          </Button>
          <Button
            variant={viewMode === "cards" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cards")}
            className="h-8 px-3"
            data-testid={`button-cards-view-${tableId}`}
          >
            <LayoutGridIcon className="w-4 h-4 mr-1" />
            Cartões
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <MedicalTable
          data={data}
          columns={columns}
          tableId={tableId}
          highlightLastRow={highlightLastRow}
          data-testid={`table-view-${tableId}`}
        />
      ) : (
        renderCards()
      )}
    </div>
  );
}