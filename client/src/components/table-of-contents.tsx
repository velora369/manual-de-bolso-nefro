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
    let observer: IntersectionObserver | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    // Add a small delay to ensure DOM is fully rendered
    timeoutId = setTimeout(() => {
      const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -35% 0px",
        threshold: 0
      };

      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        // Use requestAnimationFrame to avoid DOM manipulation conflicts
        requestAnimationFrame(() => {
          let currentActiveSection = "";
          
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target && entry.target.id) {
              currentActiveSection = entry.target.id;
            }
          });

          if (currentActiveSection) {
            setActiveSection(currentActiveSection);
          }
        });
      };

      observer = new IntersectionObserver(observerCallback, observerOptions);

      // Observe all sections with safety checks
      sections.forEach((section) => {
        if (section && section.id) {
          const element = document.getElementById(section.id);
          if (element && element.isConnected && observer) {
            try {
              observer.observe(element);
            } catch (e) {
              console.warn(`Failed to observe element with id: ${section.id}`, e);
            }
          }
        }
      });
    }, 100);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (observer) {
        try {
          observer.disconnect();
        } catch (e) {
          console.warn('Error disconnecting observer:', e);
        }
      }
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
