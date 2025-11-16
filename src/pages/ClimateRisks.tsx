"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Risk {
  type: string;
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  actions: string[];
}

const ClimateRisks = () => {
  const { toast } = useToast();
  const [location, setLocation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [risks, setRisks] = useState<Risk[]>([]);

  const handleDetection = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/climate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location }),
      });

      const data = await res.json();

      // The API may return either an array of risks or a string. Handle both safely.
      const raw = data?.risks;

      let parsed: Risk[] = [];

      if (Array.isArray(raw)) {
        parsed = raw as Risk[];
      } else if (typeof raw === "string") {
        // Try to extract a JSON array from the string first
        try {
          const jsonMatch = raw.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          }
        } catch {
          parsed = [];
        }

        // If still empty → fallback: split by risk sections
        if (parsed.length === 0) {
          const blocks = raw.split(/\n\s*\n/);

          parsed = blocks.map((block) => ({
            type: (block.match(/(drought|flood|frost|storm|heat)/i)?.[1] ?? "unknown").toLowerCase(),
            severity: (block.match(/(high|medium|low)/i)?.[1] ?? "low").toLowerCase() as
              "low" | "medium" | "high",
            title: block.split("\n")[0] || "Climate Risk",
            description: block,
            actions: block.match(/- .+/g)?.map((a) => a.replace(/^-\s*/, "")) ?? [],
          }));
        }
      } else if (raw && typeof raw === "object") {
        // API might return an object with a `risks` key or similar structure
        if (Array.isArray(raw.risks)) parsed = raw.risks;
        else parsed = [];
      } else {
        parsed = [];
      }

      // Normalize parsed items to ensure safe `.map` usage in JSX
      parsed = parsed.map((r) => ({
        type: (r?.type as string) ?? "unknown",
        severity: ((r?.severity as unknown) ?? "low") as "low" | "medium" | "high",
        title: (r?.title as string) ?? "Climate Risk",
        description: (r?.description as string) ?? "",
        actions: Array.isArray(r?.actions) ? (r.actions as string[]) : [],
      }));

      setRisks(parsed);


      toast({
        title: "Risk Assessment Complete",
        description: "Climate risk analysis generated.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Unable to fetch climate risk analysis",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const severityColor = (sev: Risk["severity"]) => {
    return {
      high: "border-destructive text-destructive",
      medium: "border-warning text-warning",
      low: "border-info text-info",
    }[sev];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex justify-center items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-warning" />
          Climate Risk Detection
        </h1>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Location</CardTitle>
          <CardDescription>AI will detect climate risks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g., Mumbai, Maharashtra"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <Button disabled={!location || loading} onClick={handleDetection} className="w-full">
            {loading ? <Loader2 className="animate-spin" /> : "Detect Climate Risks"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {risks.length > 0 && (
        <div className="space-y-4">
          {risks.map((risk, i) => (
            <Card key={i} className={`border-2 ${severityColor(risk.severity)}`}>
              <CardHeader>
                <CardTitle>
                  {risk.title} ({risk.severity.toUpperCase()})
                </CardTitle>
                <CardDescription>{risk.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {risk.actions.map((a, idx) => (
                    <li key={idx}>{a}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClimateRisks;
