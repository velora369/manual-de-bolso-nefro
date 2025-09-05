import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface Section {
  id: string;
  title: string;
}

interface NavigationHelperProps {
  sections: Section[];
  currentSection?: string;
  "data-testid"?: string;
}

export default function NavigationHelper({
  sections,
  currentSection,
  "data-testid": testId,
}: NavigationHelperProps) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getCurrentSectionIndex = () => {
    return sections.findIndex(section => section.id === currentSection);
  };

  const currentIndex = getCurrentSectionIndex();
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < sections.length - 1;
  const previousSection = hasPrevious ? sections[currentIndex - 1] : null;
  const nextSection = hasNext ? sections[currentIndex + 1] : null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2" data-testid={testId}>
      {/* Section Navigation */}
      {(hasPrevious || hasNext) && (
        <div className="flex flex-col gap-2">
          {hasPrevious && previousSection && (
            <Button
              onClick={() => scrollToSection(previousSection.id)}
              variant="secondary"
              size="sm"
              className="bg-card border border-border shadow-lg hover:shadow-xl transition-all group max-w-48"
              data-testid="button-previous-section"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              <div className="text-left min-w-0">
                <div className="text-xs text-muted-foreground">Anterior</div>
                <div className="text-xs font-medium truncate">{previousSection.title}</div>
              </div>
            </Button>
          )}
          
          {hasNext && nextSection && (
            <Button
              onClick={() => scrollToSection(nextSection.id)}
              variant="secondary"
              size="sm"
              className="bg-card border border-border shadow-lg hover:shadow-xl transition-all group max-w-48"
              data-testid="button-next-section"
            >
              <div className="text-right min-w-0">
                <div className="text-xs text-muted-foreground">Próximo</div>
                <div className="text-xs font-medium truncate">{nextSection.title}</div>
              </div>
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      )}

      {/* Back to Top */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          size="sm"
          className="bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all w-12 h-12 rounded-full p-0"
          data-testid="button-back-to-top"
        >
          <ArrowUpIcon className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}