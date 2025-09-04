import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileTextIcon, LoaderIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PDFGeneratorProps {
  title: string;
  credits: string;
  "data-testid"?: string;
}

export default function PDFGenerator({
  title,
  credits,
  "data-testid": testId,
}: PDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Import jsPDF dynamically to avoid SSR issues
      const { jsPDF } = await import("jspdf");
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let currentY = margin;

      // Cover page
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, currentY);
      currentY += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const creditLines = doc.splitTextToSize(credits, pageWidth - 2 * margin);
      doc.text(creditLines, margin, currentY);
      currentY += creditLines.length * 7 + 20;

      // Table of contents
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Índice', margin, currentY);
      currentY += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const tocItems = [
        'Internação & Pré-operatório',
        'Prescrição Inicial (Receptor)',
        'Intraoperatório',
        'Pós-op UTI (48–72h)',
        'Enfermaria (D2–D7) + Profilaxias',
        'Alta Hospitalar (D7–D10)',
        'Fluxos Legais (CET-PA/SNT)',
        'Adendo – Imunossupressão (IS)'
      ];

      tocItems.forEach((item, index) => {
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = margin;
        }
        doc.text(`${index + 1}. ${item}`, margin, currentY);
        currentY += 8;
      });

      // Add new page for content
      doc.addPage();
      currentY = margin;

      // Add sections content
      const sections = document.querySelectorAll('section[id]');
      sections.forEach((section) => {
        const sectionTitle = section.querySelector('h2')?.textContent;
        const sectionContent = section.querySelector('.section-content');
        
        if (sectionTitle && sectionContent && section.id !== 'capa') {
          // Check if we need a new page
          if (currentY > pageHeight - 50) {
            doc.addPage();
            currentY = margin;
          }

          // Section title
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(sectionTitle, margin, currentY);
          currentY += 12;

          // Section content
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          
          const contentText = sectionContent.textContent || '';
          const lines = doc.splitTextToSize(contentText, pageWidth - 2 * margin);
          
          lines.forEach((line: string) => {
            if (currentY > pageHeight - 20) {
              doc.addPage();
              currentY = margin;
            }
            doc.text(line, margin, currentY);
            currentY += 5;
          });
          
          currentY += 10; // Space between sections
        }
      });

      // Footer on last page
      doc.addPage();
      currentY = margin;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Referências', margin, currentY);
      currentY += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const references = 'KDIGO (2020); Sociedade Brasileira de Nefrologia (SBN); Associação Brasileira de Transplante de Órgãos (ABTO); Registro Brasileiro de Transplantes (RBT).';
      const refLines = doc.splitTextToSize(references, pageWidth - 2 * margin);
      doc.text(refLines, margin, currentY);
      currentY += refLines.length * 5 + 10;

      const note = 'Nota: Material de apoio rápido; não substitui protocolos institucionais.';
      const noteLines = doc.splitTextToSize(note, pageWidth - 2 * margin);
      doc.text(noteLines, margin, currentY);

      // Add page numbers
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 30, pageHeight - 10);
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, pageHeight - 10);
      }

      // Save the PDF
      doc.save('manual-transplante-renal.pdf');

      toast({
        title: "PDF gerado com sucesso!",
        description: "O download do arquivo foi iniciado automaticamente.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro durante a geração do PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      className="bg-accent text-accent-foreground hover:bg-accent/90"
      data-testid={testId}
    >
      {isGenerating ? (
        <>
          <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <FileTextIcon className="w-4 h-4 mr-2" />
          Gerar PDF
        </>
      )}
    </Button>
  );
}
