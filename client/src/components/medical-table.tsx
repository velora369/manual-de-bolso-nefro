import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";

interface Column {
  key: string;
  header: string;
}

interface MedicalTableProps {
  data: Record<string, any>[];
  columns: Column[];
  tableId: string;
  highlightLastRow?: boolean;
  "data-testid"?: string;
}

export default function MedicalTable({
  data,
  columns,
  tableId,
  highlightLastRow = false,
  "data-testid": testId,
}: MedicalTableProps) {
  const exportToCSV = () => {
    const csvContent = [
      columns.map(col => `"${col.header}"`).join(','),
      ...data.map(row =>
        columns.map(col => `"${row[col.key] || ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${tableId}_dados.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div data-testid={testId}>
      <div className="overflow-x-auto">
        <table className="w-full medical-table" data-testid={`table-${tableId}`}>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  className={`text-left p-3 ${
                    index === 0 ? "rounded-tl-md" : ""
                  } ${index === columns.length - 1 ? "rounded-tr-md" : ""}`}
                  data-testid={`header-${column.key}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-background">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${
                  rowIndex % 2 === 1 ? "bg-secondary/50" : ""
                } ${
                  highlightLastRow && rowIndex === data.length - 1 ? "text-danger-red" : ""
                }`}
                data-testid={`row-${rowIndex}`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`p-3 ${
                      column.key === columns[0].key ? "font-medium" : ""
                    }`}
                    data-testid={`cell-${column.key}-${rowIndex}`}
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Button
          onClick={exportToCSV}
          variant="secondary"
          size="sm"
          className="hover:bg-secondary/80"
          data-testid={`button-export-${tableId}`}
        >
          <DownloadIcon className="w-4 h-4 mr-1" />
          Baixar CSV
        </Button>
      </div>
    </div>
  );
}
