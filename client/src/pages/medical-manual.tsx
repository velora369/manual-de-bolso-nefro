import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExpandIcon, Combine, FileTextIcon } from "lucide-react";
import SearchBar from "@/components/search-bar";
import TableOfContents from "@/components/table-of-contents";
import MedicalSection from "@/components/medical-section";
import MedicalDataViewer from "@/components/medical-data-viewer";
import MedicalChecklist from "@/components/medical-checklist";
import AccordionList from "@/components/accordion-list";
import GlossaryTooltip from "@/components/glossary-tooltip";
import NavigationHelper from "@/components/navigation-helper";
import PDFGenerator from "@/components/pdf-generator";

const sections = [
  { id: "capa", title: "Capa" },
  { id: "internacao", title: "Internação & Pré-operatório" },
  { id: "prescricao", title: "Prescrição Inicial (Receptor)" },
  { id: "intraoperatorio", title: "Intraoperatório" },
  { id: "pos-uti", title: "Pós-op UTI (48–72h)" },
  { id: "enfermaria", title: "Enfermaria (D2–D7) + Profilaxias" },
  { id: "alta", title: "Alta Hospitalar (D7–D10)" },
  { id: "fluxos", title: "Fluxos Legais (CET-PA/SNT)" },
  { id: "adendo", title: "Adendo – Imunossupressão (IS)" },
];

const prescricaoData = [
  { medicacao: "Metilprednisolona (Solumedrol)", esquema: "1000 mg EV antes da reperfusão" },
  { medicacao: "Tacrolimo", esquema: "0,1 mg/kg VO 12/12h – alvo precoce: 8–12 ng/mL" },
  { medicacao: "Micofenolato sódico", esquema: "360 mg VO 12/12h – 50% da dose plena se indução deplecional" },
  { medicacao: "Profilaxia para Strongyloides", esquema: "Albendazol 400 mg VO 1x/dia por 3 dias" },
  { medicacao: "Profilaxia gástrica/anti-H1", esquema: "Conforme protocolo" },
];

const posUtiData = [
  { aspecto: "Imunossupressão oral", conduta: "Tacrolimo 0,1 mg/kg 12/12h; Micofenolato 360 mg 12/12h; Prednisona 0,5 mg/kg/dia" },
  { aspecto: "Indução", conduta: "Thymoglobulina (rATG) 3 mg/kg EV (exceto MM zero). Se DSA: +1+1 mg/kg" },
  { aspecto: "Diluição e Infusão", conduta: "3 mg/kg em SF/SG5% 500 ml, BI 10h após estabilidade clínica" },
  { aspecto: "Pré-medicação", conduta: "Hidrocortisona 200 mg EV + Dipirona 2 ml EV + Cimetidina 150 mg EV + Difenidramina ou Loratadina 10 mg VO" },
  { aspecto: "Contraindicações", conduta: "Infecção ativa, febre, plaquetas <100.000, linfócitos <200/µL" },
];

const profilaxiaData = [
  { alvo: "Candida", esquema: "Nistatina suspensão ou Clotrimazol pastilhas", duracao: "1–3 meses" },
  { alvo: "PCP", esquema: "TMP-SMX (Bactrim) 400/80 mg 1 cp/dia", duracao: "6–12 meses" },
  { alvo: "CMV", esquema: "Valganciclovir VO (ajustar TFG) ou Ganciclovir EV (IgG-) metade da dose", duracao: "3–6 meses (≥6 em alto risco)" },
  { alvo: "TB latente", esquema: "Isoniazida 300 mg + Piridoxina", duracao: "6–9 meses" },
];

export default function MedicalManual() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map(s => s.id))
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isAllExpanded, setIsAllExpanded] = useState(true);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleAllSections = () => {
    if (isAllExpanded) {
      setExpandedSections(new Set());
      setIsAllExpanded(false);
    } else {
      setExpandedSections(new Set(sections.map(s => s.id)));
      setIsAllExpanded(true);
    }
  };

  const handleSearch = (term: string, results: Array<{ sectionId: string; sectionTitle: string; matchCount: number }>) => {
    setSearchTerm(term);
    if (term.length > 2 && results.length > 0) {
      // Expand sections that contain the search term
      const newExpanded = new Set(results.map(r => r.sectionId));
      setExpandedSections(newExpanded);
    } else if (term.length === 0) {
      // Reset to all expanded when search is cleared
      setExpandedSections(new Set(sections.map(s => s.id)));
    }
  };

  const scrollToSection = (sectionId: string) => {
    try {
      if (!sectionId) return;
      
      const element = document.getElementById(sectionId);
      if (element && element.isConnected) {
        // Use requestAnimationFrame to avoid DOM conflicts
        requestAnimationFrame(() => {
          try {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Expand the section if it's collapsed
            if (!expandedSections.has(sectionId)) {
              setExpandedSections(prev => new Set(Array.from(prev).concat(sectionId)));
            }
          } catch (e) {
            console.warn(`Error scrolling to section: ${sectionId}`, e);
          }
        });
      } else {
        console.warn(`Element with id "${sectionId}" not found or not connected to DOM`);
      }
    } catch (e) {
      console.error(`Error in scrollToSection: ${sectionId}`, e);
    }
  };

  useEffect(() => {
    const handlePrint = () => {
      // Expand all sections before printing
      const allSections = document.querySelectorAll('.section-content');
      allSections.forEach(section => {
        section.classList.add('expanded');
      });
    };

    window.addEventListener('beforeprint', handlePrint);
    return () => window.removeEventListener('beforeprint', handlePrint);
  }, []);

  return (
    <div className="bg-background text-foreground font-sans min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="title-main">
            Manual de Bolso – Transplante Renal com Doador Falecido (HRBA)
          </h1>
          <p className="text-sm md:text-base opacity-90" data-testid="text-credits">
            Desenvolvido pelo Dr. Emanuel Esposito — Médico Nefrologista | CRM-PA: 9173 | RQE CM: 8787 | RQE NEFRO: 8786
          </p>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-secondary border-b border-border no-print">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 max-w-md">
              <SearchBar onSearch={handleSearch} sections={sections} data-testid="search-input" />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={toggleAllSections}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
                data-testid="button-expand-all"
              >
                {isAllExpanded ? (
                  <>
                    <Combine className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Recolher Tudo</span>
                    <span className="sm:hidden sr-only">Recolher Tudo</span>
                  </>
                ) : (
                  <>
                    <ExpandIcon className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Expandir Tudo</span>
                    <span className="sm:hidden sr-only">Expandir Tudo</span>
                  </>
                )}
              </Button>
              <PDFGenerator 
                title="Manual de Bolso – Transplante Renal com Doador Falecido (HRBA)"
                credits="Desenvolvido pelo Dr. Emanuel Esposito — Médico Nefrologista | CRM-PA: 9173 | RQE CM: 8787 | RQE NEFRO: 8786"
                data-testid="button-generate-pdf"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Table of Contents */}
          <aside className="lg:col-span-1">
            <div className="no-print">
              <TableOfContents
                sections={sections}
                onSectionClick={scrollToSection}
                data-testid="toc-sidebar"
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {/* Cover Section */}
            <section id="capa" className="bg-card border border-border rounded-lg p-6" data-testid="section-capa">
              <div className="text-center">
                <div className="bg-primary text-primary-foreground rounded-lg p-8 mb-6">
                  <h2 className="text-3xl font-bold mb-4">Manual de Bolso</h2>
                  <h3 className="text-xl font-medium mb-2">Transplante Renal com Doador Falecido</h3>
                  <p className="text-lg">(HRBA)</p>
                </div>
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Material de apoio rápido para consulta por profissionais de saúde
                  </p>
                </div>
              </div>
            </section>

            {/* Internação & Pré-operatório */}
            <MedicalSection
              id="internacao"
              title="Internação & Pré-operatório"
              isExpanded={expandedSections.has("internacao")}
              onToggle={() => toggleSection("internacao")}
              data-testid="section-internacao"
            >
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>O paciente pré-selecionado pelo ranking é encaminhado ao Acolhimento para internação hospitalar pelo nefrologista de plantão na hemodiálise.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Confirmar tipagem ABO e crossmatch negativo.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Revisar pré-TX: sorologias, doppler, documentação.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Avaliar necessidade de diálise (K&gt;5,5) e peso seco.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Anamnese e exame físico do receptor, preferencialmente com POCUS multiorgânico.</span>
                </li>
              </ul>
              
              <div className="mt-6 bg-secondary p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-primary">Documentos necessários para internação:</h3>
                <p className="text-sm">AIH em 2 vias, Admissão médica/Plano terapêutico, formulário de internação de urgência, termo de aceite de rim de doador falecido, termo para procedimentos especiais, consentimento informado para hemocomponentes, solicitação de reserva de sangue, prescrição médica*, aviso cirúrgico.</p>
              </div>

              <div className="mt-6 bg-secondary p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-primary">Exames:</h3>
                <p className="text-sm">RX tórax, ECG, hemograma, coagulograma, eletrólitos, função renal/hepática, gasometria, β-HCG (mulher fértil), tipagem sanguínea.</p>
              </div>

              <div className="mt-6 bg-yellow-50 border-l-4 border-warning-yellow p-4 rounded">
                <h3 className="font-semibold mb-2 text-yellow-800">⚠️ Atenção - Prescrição médica:</h3>
                <p className="text-sm text-yellow-700">Atenção para reconciliação medicamentosa, especialmente antidepressivos, anticonvulsivantes, antiarrítmicos, medicações para asma, hormônios tiroidianos e insulina.</p>
              </div>

              <div className="mt-4">
                <p className="text-sm">• Preencher Folhão e reservar hemocomponentes.</p>
              </div>
            </MedicalSection>

            {/* Prescrição Inicial */}
            <MedicalSection
              id="prescricao"
              title="Prescrição Inicial (Receptor)"
              isExpanded={expandedSections.has("prescricao")}
              onToggle={() => toggleSection("prescricao")}
              data-testid="section-prescricao"
            >
              <MedicalDataViewer
                data={prescricaoData}
                columns={[
                  { key: "medicacao", header: "Medicação" },
                  { key: "esquema", header: "Esquema" }
                ]}
                tableId="prescricao"
                data-testid="table-prescricao"
              />
            </MedicalSection>

            {/* Intraoperatório */}
            <MedicalSection
              id="intraoperatorio"
              title="Intraoperatório"
              isExpanded={expandedSections.has("intraoperatorio")}
              onToggle={() => toggleSection("intraoperatorio")}
              data-testid="section-intraoperatorio"
            >
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Profilaxia antibiótica: Cefazolina 1 g EV 8/8h por 24 h.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Manter antibiótico do doador se já em uso.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>PAM 80–100 mmHg; volume guiado por clínica/GID/POCUS.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Metilprednisolona (Solumedrol) 1000 mg EV antes da abertura dos clamps.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Considerar manitol e furosemida.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Extubar em sala se possível.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Avisar Radiologia para doppler imediato do enxerto.</span>
                </li>
              </ul>
            </MedicalSection>

            {/* Pós-op UTI */}
            <MedicalSection
              id="pos-uti"
              title="Pós-op UTI (48–72h)"
              isExpanded={expandedSections.has("pos-uti")}
              onToggle={() => toggleSection("pos-uti")}
              data-testid="section-pos-uti"
            >
              <ul className="space-y-3 text-sm mb-6">
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Solicitar Doppler renal na chegada à UTI (protocolar HRBA).</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Hidratação: &gt;1000 ml/24h → repor ~50%; anúria/diurese &lt;500 ml/24h → evitar reposição cega.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Manter imunossupressão oral: Tacrolimo + Micofenolato + Prednisona.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Monitorizar tacrolimo 3×/semana até meta.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-3 mt-1">⚠️</span>
                  <span>Indicar diálise se: hipercalemia, sobrecarga volêmica, acidose grave, uremia sintomática, oligúria.</span>
                </li>
              </ul>

              <MedicalDataViewer
                data={posUtiData}
                columns={[
                  { key: "aspecto", header: "Aspecto" },
                  { key: "conduta", header: "Conduta" }
                ]}
                tableId="pos-uti"
                highlightLastRow={true}
                data-testid="table-pos-uti"
              />
            </MedicalSection>

            {/* Enfermaria */}
            <MedicalSection
              id="enfermaria"
              title="Enfermaria (D2–D7) + Profilaxias"
              isExpanded={expandedSections.has("enfermaria")}
              onToggle={() => toggleSection("enfermaria")}
              data-testid="section-enfermaria"
            >
              <ul className="space-y-3 text-sm mb-6">
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Hidratação venosa 2–3 L/dia se diurese adequada; migrar para VO a partir do D3.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Retirar SVD D5–D7; retirar dreno se débito &lt;70 ml/24 h; retirar CVC precocemente quando seguro.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Exames diários até D7; Tacrolimo 2-3×/semana.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Imunossupressão plena após indução: Tacrolimo 0,1–0.15 mg/kg 12/12h + Micofenolato 720 mg 12/12h.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Avaliar risco de TVP: Heparina 5.000 UI SC 8/12h se seguro.</span>
                </li>
              </ul>

              <MedicalDataViewer
                data={profilaxiaData}
                columns={[
                  { key: "alvo", header: "Alvo" },
                  { key: "esquema", header: "Esquema" },
                  { key: "duracao", header: "Duração" }
                ]}
                tableId="enfermaria"
                data-testid="table-enfermaria"
              />
            </MedicalSection>

            {/* Alta Hospitalar */}
            <MedicalSection
              id="alta"
              title="Alta Hospitalar (D7–D10)"
              isExpanded={expandedSections.has("alta")}
              onToggle={() => toggleSection("alta")}
              data-testid="section-alta"
            >
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Definida pelo Nefrologista</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Alta com consultas marcadas (uro e nefro) e medicamentos imunossupressores em mãos.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Uso rigoroso dos imunossupressores em horários fixos.</span>
                </li>
              </ul>
              
              <div className="mt-6 bg-yellow-50 border-l-4 border-warning-yellow p-4 rounded">
                <h3 className="font-semibold mb-2 text-yellow-800">⚠️ Sinais de alerta:</h3>
                <p className="text-sm text-yellow-700">febre, dor/incisão, ↓ diurese, diarreia intensa, cefaleia/HTA, dispneia.</p>
              </div>

              <div className="mt-6 bg-red-50 border-l-4 border-danger-red p-4 rounded">
                <h3 className="font-semibold mb-2 text-red-800">🚫 Contraindicações:</h3>
                <p className="text-sm text-red-700">Evitar AINEs e interações relevantes (ex.: macrolídeos, azólicos ↑ tacrolimo).</p>
              </div>

              <div className="mt-6 bg-secondary p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-primary">Seguimento:</h3>
                <ul className="text-sm space-y-2">
                  <li>• Consultas: 2–3×/semana no 1º mês; dosar tacrolimo em todas.</li>
                  <li>• Cuidados com ferida operatória e fotoproteção.</li>
                </ul>
              </div>
            </MedicalSection>

            {/* Fluxos Legais */}
            <MedicalSection
              id="fluxos"
              title="Fluxos Legais (CET-PA/SNT)"
              isExpanded={expandedSections.has("fluxos")}
              onToggle={() => toggleSection("fluxos")}
              data-testid="section-fluxos"
            >
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Comunicar CET-PA após o transplante.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Homologar o transplante até 15 dias.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Seguir Portaria GM/MS nº 2.600/2009 e ABTO.</span>
                </li>
              </ul>
            </MedicalSection>

            {/* Adendo */}
            <MedicalSection
              id="adendo"
              title="Adendo – Pontos importantes sobre Imunossupressão (IS) para o Nefrologista"
              isExpanded={expandedSections.has("adendo")}
              onToggle={() => toggleSection("adendo")}
              data-testid="section-adendo"
            >
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Aceite de rim: apenas com prova cruzada negativa; se DSA presente, aceitar apenas se &lt; 2500 MFI.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-1">ℹ️</span>
                  <span>DSA tem mais importância clínica do que o PRA.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Sempre considerar o risco imunológico do receptor e características do doador.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Regime padrão: indução + Tacrolimo + Corticoide + Micofenolato.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Doador vivo idêntico NÃO recebe terapia de indução.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Alternativas ao Micofenolato: Azatioprina e inibidores de mTOR, indicados em risco baixo a moderado e rins de critério padrão.</span>
                </li>
              </ul>
            </MedicalSection>

            {/* Footer */}
            <footer className="bg-secondary border border-border rounded-lg p-6 mt-8" data-testid="footer-references">
              <div className="text-center">
                <h3 className="font-semibold text-primary mb-3">Referências</h3>
                <p className="text-sm text-muted-foreground mb-4">KDIGO (2020); Sociedade Brasileira de Nefrologia (SBN); Associação Brasileira de Transplante de Órgãos (ABTO); Registro Brasileiro de Transplantes (RBT).</p>
                <p className="text-xs text-muted-foreground"><strong>Nota:</strong> Material de apoio rápido; não substitui protocolos institucionais.</p>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
