import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

interface GlossaryTooltipProps {
  term: string;
  definition: string;
  children: React.ReactNode;
  "data-testid"?: string;
}

const glossaryTerms: Record<string, string> = {
  "crossmatch": "Teste de compatibilidade entre sangue do doador e receptor para verificar reações imunológicas",
  "DSA": "Donor-Specific Antibodies - Anticorpos específicos contra antígenos do doador",
  "PRA": "Panel Reactive Antibodies - Percentual de reatividade contra painel de doadores",
  "tacrolimo": "Medicamento imunossupressor que previne rejeição do transplante",
  "micofenolato": "Medicamento imunossupressor usado em combinação para prevenir rejeição",
  "thymoglobulina": "Anticorpo policlonal usado para indução imunossupressora",
  "TMP-SMX": "Sulfametoxazol-trimetoprima, antibiótico usado para profilaxia",
  "CMV": "Citomegalovírus - vírus que pode causar infecções em transplantados",
  "PCP": "Pneumonia por Pneumocystis carinii/jirovecii",
  "TFG": "Taxa de Filtração Glomerular - medida da função renal",
  "POCUS": "Point-of-Care Ultrasound - ultrassonografia à beira do leito",
  "SVD": "Sonda Vesical de Demora",
  "CVC": "Cateter Venoso Central",
  "TVP": "Trombose Venosa Profunda",
  "AINEs": "Anti-inflamatórios Não Esteroidais"
};

export default function GlossaryTooltip({
  term,
  definition,
  children,
  "data-testid": testId,
}: GlossaryTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Use provided definition or look up in glossary
  const tooltipDefinition = definition || glossaryTerms[term.toLowerCase()] || `Definição de ${term}`;

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <span
            className="relative cursor-help border-b border-dotted border-primary text-primary hover:border-solid hover:bg-primary/5 transition-all duration-200"
            data-testid={testId}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onTouchStart={() => setIsOpen(!isOpen)}
          >
            {children}
            <InfoIcon className="inline w-3 h-3 ml-1 opacity-60" />
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs p-3 text-sm bg-card border border-border shadow-lg"
          data-testid={`tooltip-${testId}`}
        >
          <div className="font-medium text-primary mb-1">{term}</div>
          <div className="text-muted-foreground">{tooltipDefinition}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper component to automatically wrap terms in text
export function AutoGlossary({ children }: { children: string }) {
  const text = children;
  let result = text;
  
  // List of terms to automatically wrap
  const autoTerms = Object.keys(glossaryTerms);
  
  autoTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = text.match(regex);
    
    if (matches) {
      matches.forEach(match => {
        result = result.replace(
          match,
          `<GlossaryTooltip term="${match}" definition="${glossaryTerms[term.toLowerCase()]}">${match}</GlossaryTooltip>`
        );
      });
    }
  });
  
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
}