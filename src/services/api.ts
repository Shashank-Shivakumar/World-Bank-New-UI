import { toast } from "sonner";

// Base API URL
const API_URL = "http://localhost:8000";

// Types
export interface DocumentSource {
  id: string;
  name: string;
  source: "huggingface" | "mongodb" | "upload";
  preview?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ModelSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  pricing: {
    input: number;
    output: number;
  };
}

export interface FCVScore {
  characteristic: string;
  score: number;
  probability: number;
  questions: Array<{
    question: string;
    score: number;
    probability: number;
  }>;
}

const handleError = (error: unknown) => {
  console.error("API Error:", error);
  let message = "An unexpected error occurred";
  if (error instanceof Error) {
    message = error.message;
  }
  toast.error(message);
  return { error: message };
};

export const api = {
  /**
   * 1) GET /documents/sources
   */
  async getDocumentSources(): Promise<DocumentSource[]> {
    try {
      const response = await fetch(`${API_URL}/documents/sources`);
      if (!response.ok) {
        throw new Error(`Failed to fetch doc sources: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      handleError(error);
      return [];
    }
  },

  /**
   * 2) GET /documents/{docId}/preview
   */
  async getDocumentPreview(documentId: string): Promise<string> {
    try {
      const response = await fetch(
        `${API_URL}/documents/${documentId}/preview`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch preview: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      handleError(error);
      return "";
    }
  },

  /**
   * 3) POST /documents/upload
   */
  async uploadDocument(file: File): Promise<DocumentSource> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/documents/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Upload error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      handleError(error);
      return {
        id: "999",
        name: file.name,
        source: "upload",
        preview: "Preview of uploaded document...",
      };
    }
  },

  /**
   * 4) POST /documents/{docId}/index
   */
  async indexDocument(documentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/documents/${documentId}/index`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`Indexing error: ${response.statusText}`);
      }
      const data = await response.json(); // { success, vector_store_id, message }
      return data.success;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  /**
   * 5) POST /chat/{docId}
   */
  async sendMessage(
    documentId: string,
    message: string
  ): Promise<{ content: string }> {
    try {
      const response = await fetch(`${API_URL}/chat/${documentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) {
        throw new Error(`Chat error: ${response.statusText}`);
      }
      const json = await response.json();
      return { content: json.content };
    } catch (error) {
      handleError(error);
      return { content: "Chat service unavailable." };
    }
  },

  /**
   * 6) GET /export/{docId}?format=pdf|csv|json
   */
  async exportData(
    documentId: string,
    format: "pdf" | "csv" | "json"
  ): Promise<string> {
    try {
      const url = `${API_URL}/export/${documentId}?format=${format}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Export error: ${response.statusText}`);
      }
      if (format === "pdf") {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } else {
        return await response.text();
      }
    } catch (error) {
      handleError(error);
      return `data:application/${format};base64,`;
    }
  },

  /**
   * 7) POST /documents/{docId}/report => returns { reportText: string }
   */
  async generateReport(
    documentId: string,
    prompt: string
  ): Promise<{ reportText: string }> {
    try {
      const response = await fetch(
        `${API_URL}/documents/${documentId}/report`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }
      );
      if (!response.ok) {
        throw new Error(`Generate report error: ${response.statusText}`);
      }
      return await response.json(); // { reportText }
    } catch (error) {
      handleError(error);
      return { reportText: "Error generating report." };
    }
  },

  /**
   * 8) POST /documents/{docId}/report-pdf => returns a PDF blob
   * We'll pass { fullText: <the entire text> }
   */
  async generateReportPdf(documentId: string, fullText: string): Promise<Blob> {
    try {
      const response = await fetch(
        `${API_URL}/documents/${documentId}/export-pdf`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullText }),
        }
      );
      if (!response.ok) {
        throw new Error(`PDF generation error: ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
      return new Blob(["Error generating PDF"], { type: "application/pdf" });
    }
  },

  // Optional model config or other endpoints ...
  async getModels(): Promise<string[]> {
    return ["gpt-4o-mini", "gpt-4o", "gpt-4o-2024-05"];
  },
  async getModelSettings(): Promise<ModelSettings> {
    return {
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 1024,
      pricing: { input: 0.5, output: 1.5 },
    };
  },
  async updateModelSettings(
    settings: Partial<ModelSettings>
  ): Promise<boolean> {
    return false;
  },
};
