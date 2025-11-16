"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CloudSun, Droplets, Wind, Thermometer, Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  recommendation: string;
}

const WeatherSoil = () => {
  const { toast } = useToast();
  const [region, setRegion] = useState<string>("");
  const [soilType, setSoilType] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const handleAnalysis = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, soilType }),
      });

      const data = await res.json();
      const raw = data.weatherData as string;

// Try to find JSON inside the text
let parsed: WeatherData | null = null;

try {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    parsed = JSON.parse(jsonMatch[0]);
  }
} catch {
  parsed = null;
}

// If not JSON, fall back to regex extraction
if (!parsed) {
  parsed = {
    temperature: parseFloat(raw.match(/temperature.*?(\d+)/i)?.[1] ?? "0"),
    humidity: parseFloat(raw.match(/humidity.*?(\d+)/i)?.[1] ?? "0"),
    rainfall: parseFloat(raw.match(/rain.*?(\d+)/i)?.[1] ?? "0"),
    windSpeed: parseFloat(raw.match(/wind.*?(\d+)/i)?.[1] ?? "0"),
    recommendation: raw,
  };
}

setWeatherData(parsed);


      toast({
        title: "Weather Analysis Complete",
        description: "AI weather details received.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Could not fetch weather data",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <CloudSun className="h-8 w-8 text-info" />
          Weather & Soil Analysis
        </h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Location & Soil Info</CardTitle>
          <CardDescription>AI-based weather prediction</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Label>Region</Label>
          <Input
            placeholder="e.g., Punjab, India"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />

          <Label>Soil Type</Label>
          <Select value={soilType} onValueChange={setSoilType}>
            <SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger>
            <SelectContent>
              {["sandy", "clay", "loamy", "silty", "peaty", "chalky"].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button disabled={!region || !soilType || loading} onClick={handleAnalysis} className="w-full">
            {loading ? <Loader2 className="animate-spin" /> : "Get Weather Analysis"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {weatherData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-6">
              <p>Temperature</p><strong>{weatherData.temperature}°C</strong>
              <Thermometer />
            </CardContent></Card>

            <Card><CardContent className="pt-6">
              <p>Humidity</p><strong>{weatherData.humidity}%</strong>
              <Droplets />
            </CardContent></Card>

            <Card><CardContent className="pt-6">
              <p>Rainfall</p><strong>{weatherData.rainfall} mm</strong>
              <CloudSun />
            </CardContent></Card>

            <Card><CardContent className="pt-6">
              <p>Wind Speed</p><strong>{weatherData.windSpeed} km/h</strong>
              <Wind />
            </CardContent></Card>
          </div>

          <Card className="border-primary">
            <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
            <CardContent>{weatherData.recommendation}</CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default WeatherSoil;
