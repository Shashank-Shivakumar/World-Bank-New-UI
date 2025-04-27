import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  Database,
  FileText,
  BarChart3,
  Download,
  CircleDollarSign,
  Globe,
  FileUp,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex flex-1">
        <AppSidebar />

        <SidebarInset>
          <main className="flex-1">
            <section className="container py-12 md:py-20">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center text-primary mb-4">
                  <Globe className="h-10 w-10 md:h-16 md:w-16" />
                </div>
                <h1 className="font-heading text-4xl md:text-6xl font-bold">
                  World Bank AI Analyzer 🌍
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                  AI-Powered Document Analysis for Fragility, Conflict, and
                  Violence
                </p>
                <p className="max-w-3xl mx-auto text-muted-foreground">
                  Leverage the power of OpenAI's GPT models to analyze World
                  Bank documents and assess their sensitivity to Fragility,
                  Conflict, and Violence (FCV) contexts. Extract insights,
                  generate reports, and enhance project planning with AI
                  assistance.
                </p>
                <div className="pt-4">
                  <Button asChild size="lg" className="rounded-full px-8">
                    <Link to="/analyze">Get Started</Link>
                  </Button>
                </div>
              </div>
            </section>

            <section className="bg-muted/50 py-16">
              <div className="container">
                <h2 className="text-3xl font-heading font-bold text-center mb-12">
                  Key Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="bg-background rounded-lg p-6 shadow-sm border border-border/60 transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Database className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl font-bold mb-2">
                      Document Selection
                    </h3>
                    <p className="text-muted-foreground">
                      Access documents from MongoDB, Hugging Face datasets, or
                      upload your own files for analysis.
                    </p>
                  </div>

                  <div className="bg-background rounded-lg p-6 shadow-sm border border-border/60 transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl font-bold mb-2">
                      FCV Sensitivity Scoring
                    </h3>
                    <p className="text-muted-foreground">
                      Get comprehensive scores on how well documents address
                      Fragility, Conflict, and Violence concerns.
                    </p>
                  </div>

                  <div className="bg-background rounded-lg p-6 shadow-sm border border-border/60 transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl font-bold mb-2">
                      OpenAI GPT Integration
                    </h3>
                    <p className="text-muted-foreground">
                      Powered by cutting-edge GPT models to provide accurate
                      analysis and natural language responses.
                    </p>
                  </div>

                  <div className="bg-background rounded-lg p-6 shadow-sm border border-border/60 transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Download className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl font-bold mb-2">
                      Exportable Reports
                    </h3>
                    <p className="text-muted-foreground">
                      Generate and download reports in multiple formats
                      including PDF, CSV, and JSON for easy sharing.
                    </p>
                  </div>

                  <div className="bg-background rounded-lg p-6 shadow-sm border border-border/60 transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <CircleDollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl font-bold mb-2">
                      Token and Cost Tracking
                    </h3>
                    <p className="text-muted-foreground">
                      Monitor your API usage with built-in token counting and
                      cost estimation features.
                    </p>
                  </div>

                  <div className="bg-background rounded-lg p-6 shadow-sm border border-border/60 transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <FileUp className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl font-bold mb-2">
                      Custom File Upload
                    </h3>
                    <p className="text-muted-foreground">
                      Upload and analyze your own documents in various formats
                      including PDF, DOCX, and TXT.
                    </p>
                  </div>
                </div>

                <div className="text-center mt-12">
                  <Button asChild size="lg">
                    <Link to="/analyze">Start Analyzing Documents</Link>
                  </Button>
                </div>
              </div>
            </section>
          </main>
        </SidebarInset>
      </div>

      <Footer />
    </div>
  );
}
