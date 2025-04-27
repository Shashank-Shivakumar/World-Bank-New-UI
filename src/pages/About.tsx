import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Github,
  Mail,
  Cpu,
  Database,
  Cloud,
  FileType,
  BarChart3,
  Globe,
} from "lucide-react";

export default function About() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex flex-1">
        <AppSidebar />

        <SidebarInset>
          <main className="flex-1 container py-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              About World Bank AI Analyzer
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Overview</CardTitle>
                    <CardDescription>Our mission and purpose</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      The World Bank AI Analyzer is a specialized tool designed
                      for policy analysts, researchers, and project managers at
                      the World Bank. It uses artificial intelligence to analyze
                      documents for their sensitivity to Fragility, Conflict,
                      and Violence (FCV) contexts.
                    </p>
                    <p>
                      FCV analysis is crucial for effective project planning in
                      vulnerable regions. Our tool helps identify potential gaps
                      in project documents, ensuring that World Bank initiatives
                      adequately address the challenges posed by fragile
                      contexts.
                    </p>
                    <p>
                      By leveraging OpenAI's advanced language models, this
                      application provides nuanced assessments that would
                      traditionally require extensive expert review. It enables
                      more efficient document analysis, allowing teams to refine
                      their approach before implementation.
                    </p>
                    <p>
                      Originally prototyped in Streamlit for rapid development,
                      the AI Analyzer now runs on a modern tech stack featuring
                      a FastAPI backend and a React + TypeScript front end,
                      while still retaining the core functionalities from the
                      initial Streamlit version.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Technical Stack</CardTitle>
                    <CardDescription>
                      Technologies powering our platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <Cpu className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">OpenAI</h3>
                          <p className="text-sm text-muted-foreground">
                            GPT models for document analysis and natural
                            language processing
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <Database className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">MongoDB</h3>
                          <p className="text-sm text-muted-foreground">
                            Document storage and retrieval for World Bank
                            project data
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <Cloud className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Hugging Face</h3>
                          <p className="text-sm text-muted-foreground">
                            Access to datasets and additional machine learning
                            models
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <FileType className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">PyPDF2 & ReportLab</h3>
                          <p className="text-sm text-muted-foreground">
                            PDF processing and report generation capabilities
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Streamlit (Prototype)</h3>
                          <p className="text-sm text-muted-foreground">
                            Initially used for rapid prototyping of FCV analysis
                            features
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <BarChart3 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Altair</h3>
                          <p className="text-sm text-muted-foreground">
                            Interactive data visualization for analysis results
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                      Get in touch with our team
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Github className="h-5 w-5 text-primary" />
                      <a
                        href="https://github.com/worldbank-ai-analyzer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        github.com/worldbank-ai-analyzer
                      </a>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <a
                        href="mailto:ai-analyzer@worldbank.org"
                        className="hover:underline"
                      >
                        ai-analyzer@worldbank.org
                      </a>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-muted-foreground">
                        World Bank AI Analyzer is developed as an internal tool
                        to assist with document analysis and is not an official
                        World Bank product. For official inquiries, please
                        contact the World Bank directly.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Version Information</CardTitle>
                    <CardDescription>Current release details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Version:</span>
                      <span className="text-sm">1.0.0</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Last Updated:</span>
                      <span className="text-sm">April 2025</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm font-medium">
                        Default Model:
                      </span>
                      <span className="text-sm">gpt-4o-mini</span>
                    </div>

                    <div className="pt-4">
                      <p className="text-xs text-muted-foreground">
                        This software is continuously being improved based on
                        user feedback and advancements in AI technology. If you
                        encounter any issues or have suggestions, please contact
                        the development team.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>

      <Footer />
    </div>
  );
}
