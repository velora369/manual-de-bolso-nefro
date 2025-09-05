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
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const downloadPDF = async () => {
    setIsDownloading(true);
    
    try {
      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = '/manual-transplante-renal-personalizado.pdf';
      link.download = 'Manual-de-Bolso-Transplante-Renal-Personalizado.pdf';
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download iniciado!",
        description: "O Manual de Bolso Personalizado está sendo baixado.",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Erro ao baixar PDF",
        description: "Ocorreu um erro durante o download. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={downloadPDF}
      disabled={isDownloading}
      className="bg-accent text-accent-foreground hover:bg-accent/90"
      data-testid={testId}
    >
      {isDownloading ? (
        <>
          <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
          Baixando...
        </>
      ) : (
        <>
          <FileTextIcon className="w-4 h-4 mr-2" />
          Baixar Manual de Bolso Personalizado
        </>
      )}
    </Button>
  );
}