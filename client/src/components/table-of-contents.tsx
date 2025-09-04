import { Card } from "@/components/ui/card";

interface Section {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  sections: Section[];
  onSectionClick: (sectionId: string) => void;
  "data-testid"?: string;
}

export default function TableOfContents({
  sections,
  onSectionClick,
  "data-testid": testId,
}: TableOfContentsProps) {
  return (
    <Card className="p-6 sticky top-48" data-testid={testId}>
      <h2 className="text-lg font-semibold mb-4 text-primary" data-testid="text-toc-title">
        Índice
      </h2>
      <nav className="space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            className="block w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
            data-testid={`link-toc-${section.id}`}
          >
            {section.title}
          </button>
        ))}
      </nav>
    </Card>
  );
}
