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
import { ALL_PROMPTS } from "@/services/prompts";

interface AppSidebarProps {
  isIndexed?: boolean;
  selectedDocumentId?: string | null;
}

export function AppSidebar({
  isIndexed = false,
  selectedDocumentId = null,
}: AppSidebarProps) {
  const promptKeys = Object.keys(ALL_PROMPTS);
  const [availablePrompts] = useState([...promptKeys, "Custom Prompt"]);
  const [selectedPrompt, setSelectedPrompt] = useState(promptKeys[0]);
  const [customPrompt, setCustomPrompt] = useState(ALL_PROMPTS[promptKeys[0]]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportPreview, setReportPreview] = useState("");
  useEffect(() => {
    if (selectedPrompt === "Custom Prompt") {
      return;
    }
    setCustomPrompt(ALL_PROMPTS[selectedPrompt]);
  }, [selectedPrompt]);

  const handleUpdateProtocol = () => {
    toast.success("Analysis protocol updated successfully");
  };

  const handleGenerateReportPreview = async () => {
    if (!selectedDocumentId) {
      toast.error("No document selected");
      return;
    }
    setIsGeneratingReport(true);

    try {
      const response = await api.generateReport(
        selectedDocumentId,
        customPrompt
      );
      setReportPreview(response.reportText);

      toast.success("Report generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error generating report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

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
      const pdfBlob = await api.generateReportPdf(
        selectedDocumentId,
        reportPreview
      );

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
      <SidebarHeader className="flex h-14 items-center border-b px-6">
        <div className="flex items-center space-x-2">
          <Database className="h-6 w-6 text-primary" />
          <span className="font-heading font-bold text-lg">WB AI Analyzer</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Analysis Protocol</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-4 p-2">
              <div className="space-y-2">
                <Label>Select Prompt</Label>
                <Select
                  value={selectedPrompt}
                  onValueChange={setSelectedPrompt}
                >
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

              <div className="space-y-2">
                <Label>Protocol Instructions</Label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="h-32 resize-none"
                />
              </div>

              <Button
                onClick={handleUpdateProtocol}
                className="w-full"
                variant="outline"
              >
                <Save className="mr-2 h-4 w-4" />
                Update Protocol
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

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
    </Sidebar>
  );
}
