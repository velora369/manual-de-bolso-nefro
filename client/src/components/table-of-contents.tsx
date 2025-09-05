import { useState, useEffect } from "react";
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
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -35% 0px",
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      let currentActiveSection = "";
      
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          currentActiveSection = entry.target.id;
        }
      });

      if (currentActiveSection) {
        setActiveSection(currentActiveSection);
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sections]);

  return (
    <Card className="p-6" data-testid={testId}>
      <h2 className="text-lg font-semibold mb-4 text-primary" data-testid="text-toc-title">
        Índice
      </h2>
      <nav className="space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            className={`block w-full text-left text-sm py-2 px-3 rounded-md transition-all duration-200 ${
              activeSection === section.id
                ? "bg-primary text-primary-foreground font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
            data-testid={`link-toc-${section.id}`}
          >
            {activeSection === section.id && (
              <span className="inline-block w-2 h-2 bg-current rounded-full mr-2" />
            )}
            {section.title}
          </button>
        ))}
      </nav>
    </Card>
  );
}
