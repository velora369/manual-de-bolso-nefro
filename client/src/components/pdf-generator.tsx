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

      // Define colors matching the site
      const colors = {
        primary: [119, 157, 134], // #779d86 - Verde acinzentado
        secondary: [230, 232, 231], // #e6e8e7 - Cinza claro
        white: [255, 255, 255], // #ffffff - Branco
        text: [51, 51, 51], // Texto principal
        warning: [245, 158, 11], // Para avisos
        danger: [239, 68, 68] // Para contraindicações
      };

      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let currentY = margin;

      // Helper function to add colored background
      const addColoredBox = (x: number, y: number, width: number, height: number, color: number[], radius = 0) => {
        doc.setFillColor(color[0], color[1], color[2]);
        if (radius > 0) {
          doc.roundedRect(x, y, width, height, radius, radius, 'F');
        } else {
          doc.rect(x, y, width, height, 'F');
        }
      };

      // Helper function to check if new page is needed
      const checkNewPage = (neededHeight: number = 20) => {
        if (currentY + neededHeight > pageHeight - 30) {
          doc.addPage();
          currentY = margin;
          return true;
        }
        return false;
      };

      // Helper function to add section separator
      const addSectionSeparator = () => {
        const separatorY = currentY + 5;
        doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.setLineWidth(0.5);
        doc.line(margin, separatorY, pageWidth - margin, separatorY);
        currentY += 15;
      };

      // Cover page with background
      addColoredBox(0, 0, pageWidth, 60, colors.primary);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Manual de Bolso', pageWidth / 2, 25, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text('Transplante Renal com Doador Falecido', pageWidth / 2, 35, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text('(HRBA)', pageWidth / 2, 45, { align: 'center' });

      currentY = 80;
      
      // Credits section
      addColoredBox(margin, currentY, pageWidth - 2 * margin, 25, colors.secondary, 3);
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const creditLines = doc.splitTextToSize(credits, pageWidth - 4 * margin);
      creditLines.forEach((line: string, index: number) => {
        doc.text(line, pageWidth / 2, currentY + 8 + (index * 5), { align: 'center' });
      });
      
      currentY += 40;

      // Table of contents with styled header
      checkNewPage(60);
      addColoredBox(margin, currentY, pageWidth - 2 * margin, 12, colors.primary, 3);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Índice', margin + 5, currentY + 8);
      currentY += 20;

      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const tocItems = [
        { title: 'Internação & Pré-operatório', page: 3 },
        { title: 'Prescrição Inicial (Receptor)', page: 4 },
        { title: 'Intraoperatório', page: 5 },
        { title: 'Pós-op UTI (48–72h)', page: 6 },
        { title: 'Enfermaria (D2–D7) + Profilaxias', page: 7 },
        { title: 'Alta Hospitalar (D7–D10)', page: 8 },
        { title: 'Fluxos Legais (CET-PA/SNT)', page: 9 },
        { title: 'Adendo – Imunossupressão (IS)', page: 10 }
      ];

      tocItems.forEach((item, index) => {
        checkNewPage();
        
        // Add bullet point
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.circle(margin + 2, currentY - 1, 1, 'F');
        
        doc.text(`${item.title}`, margin + 8, currentY);
        
        // Add dotted line and page number
        const titleWidth = doc.getTextWidth(`${item.title}`) + 15;
        const dots = '.'.repeat(Math.floor((pageWidth - margin - titleWidth - 20) / 2));
        doc.text(dots, margin + titleWidth, currentY);
        doc.text(`${item.page}`, pageWidth - margin, currentY, { align: 'right' });
        
        currentY += 8;
      });

      // Start content pages
      let pageCounter = 3;

      // Process each section
      const sections = document.querySelectorAll('section[id]');
      sections.forEach((section) => {
        if (section.id === 'capa') return;
        
        const sectionTitle = section.querySelector('h2')?.textContent;
        if (!sectionTitle) return;

        doc.addPage();
        currentY = margin;

        // Section header with background
        addColoredBox(margin, currentY, pageWidth - 2 * margin, 15, colors.primary, 3);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(sectionTitle, margin + 5, currentY + 10);
        currentY += 25;

        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

        // Process lists
        const lists = section.querySelectorAll('ul');
        lists.forEach((list) => {
          const items = list.querySelectorAll('li');
          items.forEach((item) => {
            checkNewPage();
            
            // Add bullet point
            doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
            doc.circle(margin + 2, currentY - 1, 1, 'F');
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const text = item.textContent || '';
            const lines = doc.splitTextToSize(text, pageWidth - 3 * margin);
            
            lines.forEach((line: string, index: number) => {
              if (index > 0) checkNewPage();
              doc.text(line, margin + 8, currentY + (index * 5));
            });
            
            currentY += Math.max(lines.length * 5, 8);
          });
          currentY += 5;
        });

        // Process highlight boxes (warnings, contraindications)
        const warningBoxes = section.querySelectorAll('.bg-yellow-50');
        warningBoxes.forEach((box) => {
          checkNewPage(20);
          
          addColoredBox(margin, currentY, pageWidth - 2 * margin, 15, [255, 251, 235], 3);
          doc.setDrawColor(245, 158, 11);
          doc.setLineWidth(1);
          doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 15, 3, 3, 'S');
          
          doc.setTextColor(180, 83, 9);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('⚠️ Atenção', margin + 5, currentY + 8);
          
          doc.setTextColor(161, 98, 7);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          const text = box.textContent?.replace('⚠️ Atenção', '').trim() || '';
          const lines = doc.splitTextToSize(text, pageWidth - 4 * margin);
          lines.forEach((line: string, index: number) => {
            doc.text(line, margin + 5, currentY + 12 + (index * 4));
          });
          
          currentY += Math.max(15, lines.length * 4 + 8);
        });

        // Process contraindication boxes
        const dangerBoxes = section.querySelectorAll('.bg-red-50');
        dangerBoxes.forEach((box) => {
          checkNewPage(20);
          
          addColoredBox(margin, currentY, pageWidth - 2 * margin, 15, [254, 242, 242], 3);
          doc.setDrawColor(239, 68, 68);
          doc.setLineWidth(1);
          doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 15, 3, 3, 'S');
          
          doc.setTextColor(185, 28, 28);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('🚫 Contraindicações', margin + 5, currentY + 8);
          
          doc.setTextColor(153, 27, 27);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          const text = box.textContent?.replace('🚫 Contraindicações:', '').trim() || '';
          const lines = doc.splitTextToSize(text, pageWidth - 4 * margin);
          lines.forEach((line: string, index: number) => {
            doc.text(line, margin + 5, currentY + 12 + (index * 4));
          });
          
          currentY += Math.max(15, lines.length * 4 + 8);
        });

        // Process tables
        const tables = section.querySelectorAll('table');
        tables.forEach((table) => {
          checkNewPage(30);
          
          const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent || '');
          const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => 
            Array.from(tr.querySelectorAll('td')).map(td => td.textContent || '')
          );

          const colWidth = (pageWidth - 2 * margin) / headers.length;
          const rowHeight = 8;

          // Table header
          addColoredBox(margin, currentY, pageWidth - 2 * margin, rowHeight, colors.primary);
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          
          headers.forEach((header, index) => {
            doc.text(header, margin + (index * colWidth) + 2, currentY + 5);
          });
          currentY += rowHeight;

          // Table rows
          doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          
          rows.forEach((row, rowIndex) => {
            checkNewPage(rowHeight);
            
            // Alternate row colors (zebra)
            if (rowIndex % 2 === 1) {
              addColoredBox(margin, currentY, pageWidth - 2 * margin, rowHeight, colors.secondary);
            }
            
            row.forEach((cell, colIndex) => {
              const lines = doc.splitTextToSize(cell, colWidth - 4);
              lines.forEach((line: string, lineIndex: number) => {
                doc.text(line, margin + (colIndex * colWidth) + 2, currentY + 5 + (lineIndex * 3));
              });
            });
            
            currentY += Math.max(rowHeight, Math.max(...row.map(cell => 
              doc.splitTextToSize(cell, colWidth - 4).length
            )) * 3);
          });
          
          currentY += 10;
        });

        addSectionSeparator();
      });

      // References page
      doc.addPage();
      currentY = margin;
      
      addColoredBox(margin, currentY, pageWidth - 2 * margin, 12, colors.primary, 3);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Referências', margin + 5, currentY + 8);
      currentY += 20;

      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const references = 'KDIGO (2020); Sociedade Brasileira de Nefrologia (SBN); Associação Brasileira de Transplante de Órgãos (ABTO); Registro Brasileiro de Transplantes (RBT).';
      const refLines = doc.splitTextToSize(references, pageWidth - 2 * margin);
      refLines.forEach((line: string, index: number) => {
        doc.text(line, margin, currentY + (index * 6));
      });
      currentY += refLines.length * 6 + 15;

      // Note box
      addColoredBox(margin, currentY, pageWidth - 2 * margin, 15, colors.secondary, 3);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Nota:', margin + 5, currentY + 8);
      doc.setFont('helvetica', 'normal');
      doc.text('Material de apoio rápido; não substitui protocolos institucionais.', margin + 20, currentY + 8);

      // Add page numbers and footer to all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, pageHeight - 10);
        
        if (i <= 2) {
          // Add QR code placeholder and link on cover and TOC pages
          doc.setFontSize(8);
          doc.text('Versão online disponível em: [URL do site]', margin, pageHeight - 20);
        }
      }

      // Set PDF metadata
      doc.setProperties({
        title: title,
        author: 'Dr. Emanuel Esposito - Médico Nefrologista',
        subject: 'Manual de Transplante Renal',
        keywords: 'transplante, renal, nefrologia, medicina',
        creator: 'Sistema de Geração de PDF Médico'
      });

      // Save the PDF
      doc.save('manual-transplante-renal-completo.pdf');

      toast({
        title: "PDF gerado com sucesso!",
        description: "Download iniciado. O PDF mantém o visual e hierarquia do site.",
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
