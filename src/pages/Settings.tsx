import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  HistoryIcon,
  LineChart,
  SettingsIcon,
  Save,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart as RechartLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart as RechartBarChart,
  Bar,
} from "recharts";
import { api, ModelSettings } from "@/services/api";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function Settings() {
  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    model: "gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 1500,
    pricing: {
      input: 0.5,
      output: 1.5,
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [hasFetchedSettings, setHasFetchedSettings] = useState(false);

  // Mock data for charts
  const costData = [
    { date: "Apr 05", cost: 0.12 },
    { date: "Apr 06", cost: 0.23 },
    { date: "Apr 07", cost: 0.18 },
    { date: "Apr 08", cost: 0.32 },
    { date: "Apr 09", cost: 0.45 },
    { date: "Apr 10", cost: 0.29 },
    { date: "Apr 11", cost: 0.38 },
    { date: "Apr 12", cost: 0.52 },
  ];

  const tokenData = [
    { date: "Apr 05", input: 4200, output: 1800 },
    { date: "Apr 06", input: 8500, output: 3200 },
    { date: "Apr 07", input: 6300, output: 2700 },
    { date: "Apr 08", input: 10500, output: 4800 },
    { date: "Apr 09", input: 15200, output: 6300 },
    { date: "Apr 10", input: 9800, output: 4200 },
    { date: "Apr 11", input: 12500, output: 5300 },
    { date: "Apr 12", input: 18000, output: 7200 },
  ];

  // Mock usage history
  const usageHistory = [
    {
      id: 1,
      date: "2025-04-12",
      document: "Project Implementation Report",
      tokens: 12500,
      cost: 0.52,
    },
    {
      id: 2,
      date: "2025-04-11",
      document: "FCV Country Strategy",
      tokens: 8700,
      cost: 0.38,
    },
    {
      id: 3,
      date: "2025-04-10",
      document: "Environmental Analysis",
      tokens: 6800,
      cost: 0.29,
    },
    {
      id: 4,
      date: "2025-04-09",
      document: "Social Impact Assessment",
      tokens: 10200,
      cost: 0.45,
    },
    {
      id: 5,
      date: "2025-04-08",
      document: "Economic Development Plan",
      tokens: 7500,
      cost: 0.32,
    },
    {
      id: 6,
      date: "2025-04-07",
      document: "Climate Adaptation Strategy",
      tokens: 4200,
      cost: 0.18,
    },
    {
      id: 7,
      date: "2025-04-06",
      document: "Financial Inclusion Report",
      tokens: 5600,
      cost: 0.23,
    },
    {
      id: 8,
      date: "2025-04-05",
      document: "Gender Equality Assessment",
      tokens: 3100,
      cost: 0.12,
    },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      if (hasFetchedSettings) return; // Skip fetching if already fetched

      setIsLoading(true);
      try {
        const models = await api.getModels();
        setAvailableModels(models);

        const settings = await api.getModelSettings();
        setModelSettings(settings);
        setHasFetchedSettings(true); // Mark settings as fetched
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Error loading settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [hasFetchedSettings]); // Dependency on `hasFetchedSettings`

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Send updated settings to the backend
      const success = await api.updateModelSettings(modelSettings);
      if (success) {
        toast.success("Settings saved successfully");
        setHasFetchedSettings(true); // Ensure settings are marked as fetched
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex flex-1">
        <AppSidebar />

        <SidebarInset>
          <main className="flex-1 container py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-heading text-3xl md:text-4xl font-bold">
                Settings
              </h1>

              <Button
                onClick={handleSaveSettings}
                disabled={isLoading || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>

            <Tabs defaultValue="model">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="model" className="flex items-center">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Model Settings
                </TabsTrigger>
                <TabsTrigger value="usage" className="flex items-center">
                  <HistoryIcon className="h-4 w-4 mr-2" />
                  Usage & Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="model">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Model Configuration</CardTitle>
                      <CardDescription>
                        Configure the OpenAI model settings for document
                        analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="model-select">Select Model</Label>
                        <Select
                          value={modelSettings.model}
                          onValueChange={(value) =>
                            setModelSettings((prev) => ({
                              ...prev,
                              model: value,
                            }))
                          }
                          disabled={isLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableModels.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Select the OpenAI model to use for document analysis
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="temperature">
                          Temperature: {modelSettings.temperature.toFixed(1)}
                        </Label>
                        <Slider
                          id="temperature"
                          min={0}
                          max={1}
                          step={0.1}
                          value={[modelSettings.temperature]}
                          onValueChange={(value) =>
                            setModelSettings((prev) => ({
                              ...prev,
                              temperature: value[0],
                            }))
                          }
                          disabled={isLoading}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>More Focused (0.0)</span>
                          <span>More Creative (1.0)</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max-tokens">Max Tokens</Label>
                        <Input
                          id="max-tokens"
                          type="number"
                          min={100}
                          max={4000}
                          value={modelSettings.maxTokens}
                          onChange={(e) =>
                            setModelSettings((prev) => ({
                              ...prev,
                              maxTokens: parseInt(e.target.value) || 100,
                            }))
                          }
                          disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Maximum number of tokens to generate (100-4000)
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pricing Information</CardTitle>
                      <CardDescription>
                        Current pricing for the selected model
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="text-left pb-2 border-b">Model</th>
                              <th className="text-right pb-2 border-b">
                                Input
                              </th>
                              <th className="text-right pb-2 border-b">
                                Output
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-2 border-b">
                                {modelSettings.model}
                              </td>
                              <td className="py-2 border-b text-right">
                                ${modelSettings.pricing.input.toFixed(2)}/M
                                tokens
                              </td>
                              <td className="py-2 border-b text-right">
                                ${modelSettings.pricing.output.toFixed(2)}/M
                                tokens
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-6 space-y-2">
                        <h4 className="text-sm font-medium">
                          Additional Information
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Prices are shown per million tokens</li>
                          <li>
                            • gpt-4o models have improved capabilities at lower
                            cost
                          </li>
                          <li>
                            • Higher token counts may result in more detailed
                            analysis
                          </li>
                          <li>• Usage is billed by actual tokens processed</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="usage">
                <div className="grid grid-cols-1 gap-6">
                  {/* Cost Over Time Chart - Now stacked vertically */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <LineChart className="h-5 w-5 mr-2 text-primary" />
                        Cost Over Time
                      </CardTitle>
                      <CardDescription>
                        Daily API cost for the past week
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 sm:h-72 md:h-80">
                        <ChartContainer config={{ cost: { color: "#8884d8" } }}>
                          <RechartLineChart
                            data={costData}
                            margin={{
                              top: 20,
                              right: 20,
                              left: 20,
                              bottom: 20,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis name="Cost ($)" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="cost"
                              name="Cost ($)"
                              stroke="#8884d8"
                              activeDot={{ r: 8 }}
                            />
                          </RechartLineChart>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Tokens Over Time Chart - Now stacked vertically */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart className="h-5 w-5 mr-2 text-primary" />
                        Total Tokens Over Time
                      </CardTitle>
                      <CardDescription>
                        Daily token usage breakdown
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 sm:h-72 md:h-80">
                        <ChartContainer
                          config={{
                            input: { color: "#8884d8" },
                            output: { color: "#82ca9d" },
                          }}
                        >
                          <RechartBarChart
                            data={tokenData}
                            margin={{
                              top: 20,
                              right: 20,
                              left: 20,
                              bottom: 20,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar
                              dataKey="input"
                              name="Input Tokens"
                              fill="#8884d8"
                            />
                            <Bar
                              dataKey="output"
                              name="Output Tokens"
                              fill="#82ca9d"
                            />
                          </RechartBarChart>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Usage History Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Usage History</CardTitle>
                      <CardDescription>
                        Detailed usage logs for all documents
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="text-left pb-2 border-b">Date</th>
                              <th className="text-left pb-2 border-b">
                                Document
                              </th>
                              <th className="text-right pb-2 border-b">
                                Tokens
                              </th>
                              <th className="text-right pb-2 border-b">Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usageHistory.map((item) => (
                              <tr key={item.id}>
                                <td className="py-2 border-b">{item.date}</td>
                                <td className="py-2 border-b">
                                  {item.document}
                                </td>
                                <td className="py-2 border-b text-right">
                                  {item.tokens.toLocaleString()}
                                </td>
                                <td className="py-2 border-b text-right">
                                  ${item.cost.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>

      <Footer />
    </div>
  );
}
