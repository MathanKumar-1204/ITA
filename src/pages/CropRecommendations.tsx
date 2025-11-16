"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CropRecommendations = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      setRecommendations(data.recommendations);

      toast({
        title: "Analysis Complete",
        description: "Crop recommendations generated successfully",
      });
    } catch (error) {
      toast({
        title: "Server Error",
        description: "Unable to connect to the prediction server.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
          <Sprout className="h-8 w-8 text-primary" />
          Crop Recommendations
        </h1>
        <p className="text-muted-foreground">
          Enter your soil and climate data for AI-powered crop suggestions
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Soil & Climate Parameters</CardTitle>
          <CardDescription>
            Provide accurate measurements for best results
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nitrogen */}
              <div className="space-y-2">
                <Label htmlFor="nitrogen">Nitrogen (N) - kg/ha</Label>
                <Input
                  id="nitrogen"
                  type="number"
                  value={formData.nitrogen}
                  onChange={(e) =>
                    setFormData({ ...formData, nitrogen: e.target.value })
                  }
                  placeholder="e.g., 90"
                  required
                />
              </div>

              {/* Phosphorus */}
              <div className="space-y-2">
                <Label htmlFor="phosphorus">Phosphorus (P) - kg/ha</Label>
                <Input
                  id="phosphorus"
                  type="number"
                  value={formData.phosphorus}
                  onChange={(e) =>
                    setFormData({ ...formData, phosphorus: e.target.value })
                  }
                  placeholder="e.g., 42"
                  required
                />
              </div>

              {/* Potassium */}
              <div className="space-y-2">
                <Label htmlFor="potassium">Potassium (K) - kg/ha</Label>
                <Input
                  id="potassium"
                  type="number"
                  value={formData.potassium}
                  onChange={(e) =>
                    setFormData({ ...formData, potassium: e.target.value })
                  }
                  placeholder="e.g., 43"
                  required
                />
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData({ ...formData, temperature: e.target.value })
                  }
                  placeholder="e.g., 25.5"
                  required
                />
              </div>

              {/* Humidity */}
              <div className="space-y-2">
                <Label htmlFor="humidity">Humidity (%)</Label>
                <Input
                  id="humidity"
                  type="number"
                  step="0.1"
                  value={formData.humidity}
                  onChange={(e) =>
                    setFormData({ ...formData, humidity: e.target.value })
                  }
                  placeholder="e.g., 82.5"
                  required
                />
              </div>

              {/* pH */}
              <div className="space-y-2">
                <Label htmlFor="ph">Soil pH</Label>
                <Input
                  id="ph"
                  type="number"
                  step="0.1"
                  value={formData.ph}
                  onChange={(e) =>
                    setFormData({ ...formData, ph: e.target.value })
                  }
                  placeholder="e.g., 6.5"
                  required
                />
              </div>

              {/* Rainfall */}
              <div className="space-y-2">
                <Label htmlFor="rainfall">Rainfall (mm)</Label>
                <Input
                  id="rainfall"
                  type="number"
                  step="0.1"
                  value={formData.rainfall}
                  onChange={(e) =>
                    setFormData({ ...formData, rainfall: e.target.value })
                  }
                  placeholder="e.g., 202.5"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Get Recommendations"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-success">
          <CardHeader>
            <CardTitle className="text-success">Recommended Crops</CardTitle>
            <CardDescription>
              Based on your soil and climate conditions
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Sprout className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CropRecommendations;
