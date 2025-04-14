// src/components/AppSidebar.tsx
import { useState, useEffect } from "react";
import { Database, FileText, Save, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { toast } from "sonner";
import { api } from "@/services/api";

// 1) Import your dictionary of prompts
import { ALL_PROMPTS } from "@/services/prompts";

interface AppSidebarProps {
  isIndexed?: boolean;
  selectedDocumentId?: string | null;
}

/**
 * The sidebar replicates the "Analysis Protocol" editing plus
 * "Generate PDF" workflow with actual LLM-based text from the backend.
 */
export function AppSidebar({
  isIndexed = false,
  selectedDocumentId = null,
}: AppSidebarProps) {
  // Build a list of prompt keys from the dictionary. Optionally add "Custom Prompt".
  const promptKeys = Object.keys(ALL_PROMPTS);
  const [availablePrompts] = useState([...promptKeys, "Custom Prompt"]);

  // The currently chosen prompt name
  const [selectedPrompt, setSelectedPrompt] = useState(promptKeys[0]);

  // The text displayed in the Textarea
  const [customPrompt, setCustomPrompt] = useState(ALL_PROMPTS[promptKeys[0]]);

  // Tracking the generation states
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // The actual LLM-based analysis text that we want in our PDF
  const [reportPreview, setReportPreview] = useState("");

  /**
   * If user picks a prompt from the list, update the textarea.
   * If "Custom Prompt", do nothing so they can type freely.
   */
  useEffect(() => {
    if (selectedPrompt === "Custom Prompt") {
      return;
    }
    setCustomPrompt(ALL_PROMPTS[selectedPrompt]);
  }, [selectedPrompt]);

  /**
   * Called when the user clicks "Update Protocol" — for demonstration only.
   */
  const handleUpdateProtocol = () => {
    toast.success("Analysis protocol updated successfully");
  };

  /**
   * 1) Call the backend to generate the LLM-based analysis text
   * 2) Store that text in `reportPreview`
   */
  const handleGenerateReportPreview = async () => {
    if (!selectedDocumentId) {
      toast.error("No document selected");
      return;
    }
    setIsGeneratingReport(true);

    try {
      // This calls your actual LLM endpoint => /documents/{docId}/report
      const response = await api.generateReport(selectedDocumentId, customPrompt);
      // response = { reportText: "...the LLM's text..." }
      setReportPreview(response.reportText);

      toast.success("Report generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error generating report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  /**
   * 1) Pass the entire `reportPreview` text to the backend
   * 2) The backend returns a PDF
   * 3) We auto-download
   */
  const handleGeneratePdf = async () => {
    if (!selectedDocumentId) {
      toast.error("No document selected");
      return;
    }
    if (!reportPreview) {
      toast.error("No report preview available to export");
      return;
    }
    setIsGeneratingReport(true);

    try {
      // send the entire text => fullText
      const pdfBlob = await api.generateReportPdf(selectedDocumentId, reportPreview);

      // Download PDF
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `report_${selectedDocumentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);

      toast.success("PDF generated & downloaded");
    } catch (error) {
      console.error(error);
      toast.error("Error generating PDF");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <Sidebar>
      {/* ---- HEADER ---- */}
      <SidebarHeader className="flex h-14 items-center border-b px-6">
        <div className="flex items-center space-x-2">
          <Database className="h-6 w-6 text-primary" />
          <span className="font-heading font-bold text-lg">WB AI Analyzer</span>
        </div>
      </SidebarHeader>

      {/* ---- CONTENT ---- */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Analysis Protocol</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-4 p-2">
              {/* Prompt Selector */}
              <div className="space-y-2">
                <Label>Select Prompt</Label>
                <Select value={selectedPrompt} onValueChange={setSelectedPrompt}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a prompt" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePrompts.map((promptKey) => (
                      <SelectItem key={promptKey} value={promptKey}>
                        {promptKey}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Text Area */}
              <div className="space-y-2">
                <Label>Protocol Instructions</Label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="h-32 resize-none"
                />
              </div>

              {/* Update Button */}
              <Button onClick={handleUpdateProtocol} className="w-full" variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Update Protocol
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Only show "Generate Report" if doc is indexed */}
        {isIndexed && (
          <SidebarGroup>
            <SidebarGroupLabel>Generate Report</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-4 p-2">
                <Button
                  onClick={handleGenerateReportPreview}
                  className="w-full"
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport ? (
                    <>
                      <FileText className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Preview
                    </>
                  )}
                </Button>

                {reportPreview && (
                  <>
                    <div className="space-y-2">
                      <Label>Report Preview</Label>
                      <div className="max-h-44 overflow-y-auto rounded-md border bg-muted p-3 text-sm font-mono whitespace-pre-line">
                        {reportPreview}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleGeneratePdf}
                      disabled={isGeneratingReport}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Export as PDF
                    </Button>
                  </>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* ---- FOOTER ---- */}
      {/*<SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground text-center">
          World Bank AI Analyzer v1.0
        </div>
      </SidebarFooter>*/}
    </Sidebar>
  );
}
