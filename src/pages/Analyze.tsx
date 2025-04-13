// src/app/Analyze.tsx
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2,
  Send,
  Database,
  BookOpen,
  ChevronDown,
  ChevronUp,
  BarChart,
  FileText,
  FileJson,
  FileSpreadsheet,
  Bot,
  User,
  MessageCircle
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { api, DocumentSource, ChatMessage } from "@/services/api";
import { toast } from "sonner";
import { SidebarInset } from "@/components/ui/sidebar";

/**
 * A page that replicates the main features from the Streamlit app:
 * - Data source selection (Hugging Face, MongoDB, file upload)
 * - Document preview & indexing
 * - Chat Q&A with the indexed doc
 * - Export to PDF/CSV/JSON
 */
const AnalyzePage = () => {
  // 1) Data Source & Document States
  const [dataSource, setDataSource] = useState<"huggingface" | "mongodb" | "upload">("huggingface");
  const [documents, setDocuments] = useState<DocumentSource[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentSource | null>(null);

  // Document preview text (full doc)
  const [documentPreview, setDocumentPreview] = useState<string>("");

  // Whether we show a short snippet or the full doc
  const [isFullPreview, setIsFullPreview] = useState(false);

  // 2) Loading & Indexing States
  const [isLoading, setIsLoading] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isIndexed, setIsIndexed] = useState(false);

  // 3) Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // 4) File Upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // 5) FCV Analysis States
  const [showFCVResults, setShowFCVResults] = useState(true);
  const [fcvScore, setFcvScore] = useState<number | null>(null);

  // On mount, load all documents from /documents/sources
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const sources = await api.getDocumentSources();
        setDocuments(sources);
      } catch (err) {
        console.error("Error fetching documents:", err);
        toast.error("Failed to load documents");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  // Filter the docs by dataSource
  const filteredDocuments = documents.filter(doc => doc.source === dataSource);

  /**
   * When user selects a doc from the dropdown
   */
  const handleDocumentSelect = async (documentId: string) => {
    setIsLoading(true);
    const doc = documents.find(d => d.id === documentId);
    if (!doc) {
      setIsLoading(false);
      return;
    }

    setSelectedDocument(doc);
    setIsIndexed(false);
    setMessages([]); // reset chat
    setFcvScore(null);

    try {
      // fetch doc preview
      const preview = await api.getDocumentPreview(documentId);
      setDocumentPreview(preview || "");
    } catch (error) {
      toast.error("Error fetching document preview");
      console.error(error);
      setDocumentPreview("");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * If user picks "upload" as dataSource => upload the file
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setIsLoading(true);

    try {
      const uploadedDoc = await api.uploadDocument(file);
      // Add new doc to our list
      setDocuments(prev => [...prev, uploadedDoc]);
      setSelectedDocument(uploadedDoc);
      setDocumentPreview(uploadedDoc.preview || "");
      setIsIndexed(false);
      setMessages([]);
      toast.success("Document uploaded successfully");
    } catch (error) {
      toast.error("Error uploading document");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * POST /documents/{docId}/index
   */
  const handleIndexDocument = async () => {
    if (!selectedDocument) return;
    setIsIndexing(true);

    try {
      const success = await api.indexDocument(selectedDocument.id);
      if (success) {
        setIsIndexed(true);
        toast.success("Document indexed successfully");

        // For demo: set a random FCV score
        const randomScore = Math.floor(Math.random() * 100);
        setFcvScore(randomScore);
      } else {
        toast.error("Error indexing document");
      }
    } catch (error) {
      toast.error("Error indexing document");
      console.error(error);
    } finally {
      setIsIndexing(false);
    }
  };

  /**
   * Chat => POST /chat/{docId}, returns AI assistant reply
   */
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !selectedDocument) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: currentMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setCurrentMessage("");
    setIsSending(true);

    try {
      const reply = await api.sendMessage(selectedDocument.id, userMsg.content);
      // push the assistant message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + "_assistant",
          role: "assistant",
          content: reply.content,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      toast.error("Error sending message");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Export doc => GET /export/{docId}?format=pdf|csv|json
   */
  const handleExport = async (format: "pdf" | "csv" | "json") => {
    if (!selectedDocument) return;
    setIsLoading(true);

    try {
      const dataUrl = await api.exportData(selectedDocument.id, format);
      // Create anchor for download
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${selectedDocument.name}.${format}`;
      a.click();
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Error exporting as ${format.toUpperCase()}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------------------
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex flex-1">
        {/* The Sidebar uses the real LLM-based approach */}
        <AppSidebar isIndexed={isIndexed} selectedDocumentId={selectedDocument?.id || null} />

        <SidebarInset>
          <main className="flex-1 container py-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              Document Analysis
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT COLUMN: Data Source & Selection */}
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-bold mb-4">Select Data Source</h2>

                    <RadioGroup
                      value={dataSource}
                      onValueChange={(val) => setDataSource(val as any)}
                      className="mb-6"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="huggingface" id="huggingface" />
                          <Label htmlFor="huggingface">Hugging Face</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mongodb" id="mongodb" />
                          <Label htmlFor="mongodb">MongoDB</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="upload" id="upload" />
                          <Label htmlFor="upload">Upload File</Label>
                        </div>
                      </div>
                    </RadioGroup>

                    {dataSource === "upload" ? (
                      <div className="mb-6">
                        <Label htmlFor="file-upload" className="mb-2 block">
                          Upload Document
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="file-upload"
                            type="file"
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileUpload}
                            className="flex-1"
                          />
                          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                        {uploadedFile && (
                          <p className="text-sm mt-2">
                            {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mb-6">
                        <Label htmlFor="document-select" className="mb-2 block">
                          Select Document
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Select
                            onValueChange={handleDocumentSelect}
                            disabled={isLoading || filteredDocuments.length === 0}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a document..." />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredDocuments.map((doc) => (
                                <SelectItem key={doc.id} value={doc.id}>
                                  {doc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                        {filteredDocuments.length === 0 && !isLoading && (
                          <p className="text-sm text-muted-foreground mt-2">
                            No documents available from this source
                          </p>
                        )}
                      </div>
                    )}

                    {/* Index Button */}
                    {selectedDocument && (
                      <Button
                        onClick={handleIndexDocument}
                        disabled={isIndexing || isIndexed}
                        className="w-full"
                      >
                        {isIndexing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Indexing...
                          </>
                        ) : isIndexed ? (
                          "Document Indexed"
                        ) : (
                          "Index Document"
                        )}
                      </Button>
                    )}

                    {/* If doc is indexed, show FCV Score progress bar */}
                    {isIndexed && fcvScore !== null && (
                      <Collapsible
                        open={showFCVResults}
                        onOpenChange={setShowFCVResults}
                        className="mt-6 border rounded-md p-3"
                      >
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center">
                              <BarChart className="h-5 w-5 mr-2 text-primary" />
                              <h3 className="text-lg font-medium">FCV Analysis Results</h3>
                            </div>
                            {showFCVResults ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-3">
                          <div className="space-y-3">
                            <div>
                              <Label>Overall FCV Sensitivity Score</Label>
                              <div className="mt-2 bg-secondary rounded-full h-4">
                                <div
                                  className="bg-primary h-4 rounded-full transition-all"
                                  style={{ width: `${fcvScore}%` }}
                                />
                              </div>
                              <div className="flex justify-between mt-1 text-sm">
                                <span>0</span>
                                <span>{fcvScore}%</span>
                                <span>100</span>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              This document has a{" "}
                              {fcvScore < 30
                                ? "low"
                                : fcvScore < 70
                                ? "medium"
                                : "high"}{" "}
                              FCV sensitivity score.
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT COLUMN: Preview Tab & Chat Tab */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview" className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Document Preview
                    </TabsTrigger>
                    <TabsTrigger
                      value="chat"
                      className="flex items-center"
                      disabled={!isIndexed}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Ask Questions
                    </TabsTrigger>
                  </TabsList>

                  {/* Preview Tab */}
                  <TabsContent value="preview">
                    <Card>
                      <CardContent className="pt-6">
                        {selectedDocument ? (
                          <>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-bold">
                                {selectedDocument.name}
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsFullPreview(!isFullPreview)}
                              >
                                {isFullPreview ? "Show Less" : "Show More"}
                              </Button>
                            </div>

                            <div className="bg-muted p-4 rounded-md max-h-[500px] overflow-y-auto">
                              <p className="whitespace-pre-line text-sm">
                                {documentPreview
                                  ? isFullPreview
                                    ? documentPreview
                                    : documentPreview.slice(0, 800) +
                                      (documentPreview.length > 800 ? "..." : "")
                                  : "(No document content found.)"}
                              </p>
                            </div>

                            {isIndexed && (
                              <div className="flex items-center justify-end space-x-2 mt-4">
                                <span className="text-sm text-muted-foreground mr-2">
                                  Export as:
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleExport("pdf")}
                                  disabled={isLoading}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  PDF
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleExport("csv")}
                                  disabled={isLoading}
                                >
                                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                                  CSV
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleExport("json")}
                                  disabled={isLoading}
                                >
                                  <FileJson className="h-4 w-4 mr-1" />
                                  JSON
                                </Button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Select a document to view its preview</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Chat Tab */}
                  <TabsContent value="chat">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col h-[500px]">
                          {/* Chat Scrollable */}
                          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                            {messages.length === 0 ? (
                              <div className="text-center py-12 text-muted-foreground h-full flex flex-col items-center justify-center">
                                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Ask a question about the document</p>
                                <p className="text-sm mt-2">
                                  The AI will analyze the document and provide answers
                                </p>
                              </div>
                            ) : (
                              messages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex ${
                                    message.role === "user"
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                      message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                    }`}
                                  >
                                    <div className="flex items-center mb-1">
                                      {message.role === "user" ? (
                                        <>
                                          <span className="font-medium">You</span>
                                          <User className="h-3 w-3 ml-1" />
                                        </>
                                      ) : (
                                        <>
                                          <span className="font-medium">AI Assistant</span>
                                          <Bot className="h-3 w-3 ml-1" />
                                        </>
                                      )}
                                    </div>
                                    <p className="text-sm whitespace-pre-line">
                                      {message.content}
                                    </p>
                                    <span className="text-xs opacity-70 mt-1 block text-right">
                                      {new Date(
                                        message.timestamp
                                      ).toLocaleTimeString()}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Message Input */}
                          <div className="flex items-center space-x-2">
                            <Input
                              placeholder="Ask a question about the document..."
                              value={currentMessage}
                              onChange={(e) => setCurrentMessage(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                              disabled={isSending}
                            />
                            <Button
                              onClick={handleSendMessage}
                              disabled={isSending || !currentMessage.trim()}
                            >
                              {isSending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>

      <Footer />
    </div>
  );
};

export default AnalyzePage;
