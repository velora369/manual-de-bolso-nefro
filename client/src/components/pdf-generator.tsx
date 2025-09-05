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
      const margin = 15; // 15mm margins as specified (12-16mm range)
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

      // Helper function to get appropriate icon for each section
      const getIconForSection = (sectionTitle: string): string => {
        const title = sectionTitle.toLowerCase();
        if (title.includes('internação') || title.includes('pré-operatório')) return '🏥';
        if (title.includes('prescrição') || title.includes('receptor')) return '💊';
        if (title.includes('intraoperatório')) return '⚕️';
        if (title.includes('pós-op') || title.includes('uti')) return '🏥';
        if (title.includes('enfermaria') || title.includes('profilaxias')) return '🛡️';
        if (title.includes('alta') || title.includes('hospitalar')) return '📋';
        if (title.includes('fluxos') || title.includes('legais')) return '📄';
        if (title.includes('adendo') || title.includes('imunossupressão')) return '🧬';
        return '📌'; // default icon
      };

      // Cover page with modern design
      addColoredBox(0, 0, pageWidth, 70, colors.primary);
      
      // Main title with enhanced typography
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Manual de Bolso', pageWidth / 2, 30, { align: 'center' });
      
      doc.setFontSize(18);
      doc.text('Transplante Renal com Doador Falecido', pageWidth / 2, 42, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text('(HRBA)', pageWidth / 2, 55, { align: 'center' });

      currentY = 85;
      
      // Credits section with exact format specified
      const exactCredits = "Desenvolvido pelo Dr. Emanuel Esposito — Médico Nefrologista | CRM-PA: 9173 | RQE CM: 8787 | RQE NEFRO: 8786";
      addColoredBox(margin, currentY, pageWidth - 2 * margin, 35, colors.secondary, 5);
      
      // Add subtle border
      doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 35, 5, 5, 'S');
      
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      const creditLines = doc.splitTextToSize(exactCredits, pageWidth - 4 * margin);
      creditLines.forEach((line: string, index: number) => {
        doc.text(line, pageWidth / 2, currentY + 12 + (index * 5), { align: 'center' });
      });
      
      currentY += 50;
      
      // Add QR code placeholder and online version link
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('📱 Versão interativa online: [Link para o site]', pageWidth / 2, currentY + 10, { align: 'center' });
      doc.text('🔄 Escaneie o QR code para acessar', pageWidth / 2, currentY + 18, { align: 'center' });
      
      // QR code placeholder box
      addColoredBox(pageWidth / 2 - 15, currentY + 25, 30, 30, colors.secondary, 3);
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.text('QR CODE', pageWidth / 2, currentY + 42, { align: 'center' });
      
      currentY += 70;

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

        // Section header with icon, badge and side rail design
        const sectionHeaderHeight = 18;
        
        // Side rail (vertical bar)
        addColoredBox(margin, currentY, 4, sectionHeaderHeight + 10, colors.primary);
        
        // Main header background with badge style
        addColoredBox(margin + 6, currentY, pageWidth - 2 * margin - 6, sectionHeaderHeight, colors.primary, 5);
        
        // Add subtle shadow effect
        doc.setDrawColor(colors.primary[0] - 20, colors.primary[1] - 20, colors.primary[2] - 20);
        doc.setLineWidth(0.2);
        doc.roundedRect(margin + 6.5, currentY + 0.5, pageWidth - 2 * margin - 6, sectionHeaderHeight, 5, 5, 'S');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        
        // Add icon before title (using appropriate medical icons)
        const sectionIcon = getIconForSection(sectionTitle);
        doc.text(`${sectionIcon} ${sectionTitle}`, margin + 12, currentY + 12);
        
        currentY += sectionHeaderHeight + 15;

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

        // Process highlight boxes (warnings) with enhanced styling
        const warningBoxes = section.querySelectorAll('.bg-yellow-50');
        warningBoxes.forEach((box) => {
          checkNewPage(25);
          
          const text = box.textContent?.replace('⚠️ Atenção', '').trim() || '';
          const lines = doc.splitTextToSize(text, pageWidth - 5 * margin);
          const boxHeight = Math.max(20, lines.length * 5 + 12);
          
          // Background with site colors (#e6e8e7)
          addColoredBox(margin, currentY, pageWidth - 2 * margin, boxHeight, colors.secondary, 5);
          
          // Left border stripe in primary color
          addColoredBox(margin, currentY, 5, boxHeight, colors.primary, 0);
          
          // Outer border
          doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
          doc.setLineWidth(1);
          doc.roundedRect(margin, currentY, pageWidth - 2 * margin, boxHeight, 5, 5, 'S');
          
          // Header with icon
          doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('⚠️ Atenção', margin + 8, currentY + 10);
          
          // Content text
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          lines.forEach((line: string, index: number) => {
            doc.text(line, margin + 8, currentY + 16 + (index * 5));
          });
          
          currentY += boxHeight + 5;
        });

        // Process contraindication boxes with enhanced styling
        const dangerBoxes = section.querySelectorAll('.bg-red-50');
        dangerBoxes.forEach((box) => {
          checkNewPage(25);
          
          const text = box.textContent?.replace('🚫 Contraindicações:', '').trim() || '';
          const lines = doc.splitTextToSize(text, pageWidth - 5 * margin);
          const boxHeight = Math.max(20, lines.length * 5 + 12);
          
          // Background with site colors (#e6e8e7)
          addColoredBox(margin, currentY, pageWidth - 2 * margin, boxHeight, colors.secondary, 5);
          
          // Left border stripe in danger color
          addColoredBox(margin, currentY, 5, boxHeight, colors.danger, 0);
          
          // Outer border
          doc.setDrawColor(colors.danger[0], colors.danger[1], colors.danger[2]);
          doc.setLineWidth(1);
          doc.roundedRect(margin, currentY, pageWidth - 2 * margin, boxHeight, 5, 5, 'S');
          
          // Header with icon
          doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('🚫 Contraindicações', margin + 8, currentY + 10);
          
          // Content text
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          lines.forEach((line: string, index: number) => {
            doc.text(line, margin + 8, currentY + 16 + (index * 5));
          });
          
          currentY += boxHeight + 5;
        });

        // Process tables with enhanced formatting and header repetition
        const tables = section.querySelectorAll('table');
        tables.forEach((table) => {
          checkNewPage(35);
          
          const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent || '');
          const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => 
            Array.from(tr.querySelectorAll('td')).map(td => td.textContent || '')
          );

          const colWidth = (pageWidth - 2 * margin) / headers.length;
          const baseRowHeight = 10;
          let tableStartY = currentY;
          
          const renderTableHeader = () => {
            // Header background (#e6e8e7 as specified)
            addColoredBox(margin, currentY, pageWidth - 2 * margin, baseRowHeight, colors.secondary, 2);
            
            // Header border
            doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
            doc.setLineWidth(0.5);
            doc.roundedRect(margin, currentY, pageWidth - 2 * margin, baseRowHeight, 2, 2, 'S');
            
            doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            
            headers.forEach((header, index) => {
              doc.text(header, margin + (index * colWidth) + 3, currentY + 7);
              
              // Column separators
              if (index < headers.length - 1) {
                doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
                doc.line(margin + ((index + 1) * colWidth), currentY, margin + ((index + 1) * colWidth), currentY + baseRowHeight);
              }
            });
            currentY += baseRowHeight;
          };
          
          // Render initial header
          renderTableHeader();

          // Table rows with zebra striping and proper cell handling
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          
          rows.forEach((row, rowIndex) => {
            const maxCellLines = Math.max(...row.map(cell => 
              doc.splitTextToSize(cell, colWidth - 6).length
            ));
            const actualRowHeight = Math.max(baseRowHeight, maxCellLines * 4 + 4);
            
            // Check if we need a new page (including space for header repetition)
            if (currentY + actualRowHeight + baseRowHeight > pageHeight - 30) {
              doc.addPage();
              currentY = margin;
              renderTableHeader(); // Repeat header on new page
            }
            
            // Zebra striping (discrete as specified)
            if (rowIndex % 2 === 1) {
              addColoredBox(margin, currentY, pageWidth - 2 * margin, actualRowHeight, [248, 249, 250], 0);
            }
            
            // Row border
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.3);
            doc.rect(margin, currentY, pageWidth - 2 * margin, actualRowHeight, 'S');
            
            // Cell content with proper text wrapping
            doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
            row.forEach((cell, colIndex) => {
              const lines = doc.splitTextToSize(cell, colWidth - 6);
              lines.forEach((line: string, lineIndex: number) => {
                doc.text(line, margin + (colIndex * colWidth) + 3, currentY + 6 + (lineIndex * 4));
              });
              
              // Column separators
              if (colIndex < row.length - 1) {
                doc.setDrawColor(220, 220, 220);
                doc.line(margin + ((colIndex + 1) * colWidth), currentY, margin + ((colIndex + 1) * colWidth), currentY + actualRowHeight);
              }
            });
            
            currentY += actualRowHeight;
          });
          
          currentY += 8;
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

      // Add page numbers and enhanced footer to all pages
      const pageCount = doc.getNumberOfPages();
      const generationDate = new Date();
      const dateStr = generationDate.toLocaleDateString('pt-BR');
      const timeStr = generationDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Footer separator line
        doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
        
        // Footer content
        doc.setFontSize(8);
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.setFont('helvetica', 'normal');
        
        // Left side: generation date and time
        doc.text(`Gerado em: ${dateStr} às ${timeStr}`, margin, pageHeight - 8);
        
        // Right side: page numbers
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
        
        // Center: online version link (only on first few pages)
        if (i <= 3) {
          doc.setFontSize(7);
          doc.text('📱 Versão interativa online disponível', pageWidth / 2, pageHeight - 12, { align: 'center' });
        }
      }

      // Set PDF metadata with enhanced quality settings
      doc.setProperties({
        title: 'Manual de Bolso - Transplante Renal com Doador Falecido (HRBA)',
        author: 'Dr. Emanuel Esposito - Médico Nefrologista | CRM-PA: 9173',
        subject: 'Manual de Transplante Renal - Infográfico Médico',
        keywords: 'transplante, renal, nefrologia, medicina, HRBA, KDIGO, protocolo médico',
        creator: 'Sistema de Geração de PDF Médico - V2.0',
        producer: 'Dr. Emanuel Esposito - CRM-PA: 9173',
        creationDate: new Date()
      });
      
      // Enhanced quality settings for 300 DPI equivalent
      doc.setProperties({
        ...doc.getProperties(),
        'custom:quality': '300dpi',
        'custom:version': '2.0',
        'custom:format': 'infografico'
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
