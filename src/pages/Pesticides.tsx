"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield, Bug, Loader2, AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Pesticide {
  name: string;
  type: string;
  dosage: string;
  application: string;
  safety: string;
}

interface PesticideResponse {
  pesticides: Pesticide[];
  precautions: string[];
}

const Pesticides = () => {
  const { toast } = useToast();

  const [cropType, setCropType] = useState<string>("");
  const [pestType, setPestType] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<PesticideResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/pesticides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropType, pestType, symptoms }),
      });

      const data = await res.json();

      const raw = data?.recommendations;

      let parsed: PesticideResponse = {
        pesticides: [],
        precautions: [],
      };

      // Helper to normalize various pesticide item shapes into our `Pesticide` type
      const normalizeP = (item: unknown): Pesticide => {
        const it = (item as Record<string, unknown>) || {};
        const safetyPrec = it["safety_precautions"];
        const safety = Array.isArray(safetyPrec) ? (safetyPrec as string[]).join("; ") : (it["safety"] as string | undefined) ?? (typeof safetyPrec === "string" ? (safetyPrec as string) : undefined);

        return {
          name: (it["name"] as string) ?? (it["pesticide_name"] as string) ?? (it["pesticide"] as string) ?? "Unknown",
          type: (it["type"] as string) ?? (it["form"] as string) ?? "Unknown",
          dosage: (it["dosage"] as string) ?? (it["dose"] as string) ?? (it["application_rate"] as string) ?? "Not specified",
          application: (it["application"] as string) ?? (it["application_method"] as string) ?? (it["method"] as string) ?? "Not specified",
          safety: safety ?? "Not specified",
        };
      };

      // If backend already returned an array/object
      if (Array.isArray(raw)) {
        // Could be an array of pesticide-like objects
        parsed.pesticides = (raw as unknown[]).map(normalizeP);
      } else if (raw && typeof raw === "object") {
        // Might already be the structured object with different key names
        const obj = raw as Record<string, unknown>;

        // Common key used in model response: `pesticide_recommendations`
        if (Array.isArray(obj.pesticide_recommendations)) {
          parsed.pesticides = obj.pesticide_recommendations.map(normalizeP);
        } else if (Array.isArray(obj.pesticides)) {
          parsed.pesticides = obj.pesticides.map(normalizeP);
        } else if (Array.isArray(obj.recommendations)) {
          parsed.pesticides = obj.recommendations.map(normalizeP);
        } else {
          parsed.pesticides = [];
        }

        // Collect precautions / safety lists from various possible keys
        const precautionsSources: string[] = [];
        const prec = obj["precautions"];
        if (Array.isArray(prec)) precautionsSources.push(...(prec as string[]));
        const sp = obj["safety_precautions"];
        if (Array.isArray(sp)) precautionsSources.push(...(sp as string[]));
        const s = obj["safety"];
        if (Array.isArray(s)) precautionsSources.push(...(s as string[]));

        // If pesticides themselves had safety_precautions arrays, include them
        const pr = obj["pesticide_recommendations"];
        if (Array.isArray(pr)) {
          (pr as unknown[]).forEach((p) => {
            const pObj = p as Record<string, unknown>;
            const psp = pObj["safety_precautions"];
            if (Array.isArray(psp)) precautionsSources.push(...(psp as string[]));
          });
        }

        parsed.precautions = precautionsSources.filter(Boolean).map((p) => String(p));
      } else if (typeof raw === "string") {
        const text = raw as string;

        // Try to find JSON inside triple-backtick code fences first, then object/array
        try {
          const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
          if (codeBlockMatch) {
            const candidate = codeBlockMatch[1].trim();
            const obj = JSON.parse(candidate);
            const objRec = obj as Record<string, unknown>;

            // handle same shapes as object responses
            if (Array.isArray(objRec["pesticide_recommendations"])) {
              parsed.pesticides = (objRec["pesticide_recommendations"] as unknown[]).map((x) => normalizeP(x));
            } else if (Array.isArray(objRec["pesticides"])) {
              parsed.pesticides = (objRec["pesticides"] as unknown[]).map((x) => normalizeP(x));
            } else if (Array.isArray(objRec["recommendations"])) {
              parsed.pesticides = (objRec["recommendations"] as unknown[]).map((x) => normalizeP(x));
            }

            const combinedPrec: string[] = [];
            if (Array.isArray(objRec["precautions"])) combinedPrec.push(...(objRec["precautions"] as string[]));
            if (Array.isArray(objRec["safety_precautions"])) combinedPrec.push(...(objRec["safety_precautions"] as string[]));
            if (Array.isArray(objRec["pesticide_recommendations"])) {
              (objRec["pesticide_recommendations"] as unknown[]).forEach((p) => {
                const pObj = p as Record<string, unknown>;
                const psp = pObj["safety_precautions"];
                if (Array.isArray(psp)) combinedPrec.push(...(psp as string[]));
              });
            }

            parsed.precautions = combinedPrec;
          } else {
            const arrayMatch = text.match(/\[[\s\S]*\]/);
            const objMatch = text.match(/\{[\s\S]*\}/);

            if (arrayMatch) {
              const arr = JSON.parse(arrayMatch[0]);
              if (Array.isArray(arr)) {
                parsed.pesticides = (arr as unknown[]).map((x) => normalizeP(x));
              }
            } else if (objMatch) {
              const obj = JSON.parse(objMatch[0]);
              const objRec = obj as Record<string, unknown>;
              if (Array.isArray(objRec["pesticide_recommendations"])) {
                parsed.pesticides = (objRec["pesticide_recommendations"] as unknown[]).map((x) => normalizeP(x));
              } else if (Array.isArray(objRec["pesticides"])) {
                parsed.pesticides = (objRec["pesticides"] as unknown[]).map((x) => normalizeP(x));
              }

              const combinedPrec: string[] = [];
              if (Array.isArray(objRec["precautions"])) combinedPrec.push(...(objRec["precautions"] as string[]));
              if (Array.isArray(objRec["safety_precautions"])) combinedPrec.push(...(objRec["safety_precautions"] as string[]));
              if (Array.isArray(objRec["pesticide_recommendations"])) {
                (objRec["pesticide_recommendations"] as unknown[]).forEach((p) => {
                  const pObj = p as Record<string, unknown>;
                  const psp = pObj["safety_precautions"];
                  if (Array.isArray(psp)) combinedPrec.push(...(psp as string[]));
                });
              }

              parsed.precautions = combinedPrec;
            }
          }
        } catch {
          // fallthrough to heuristic parsing
        }

        // Heuristic fallback parsing when no JSON found
        if (parsed.pesticides.length === 0) {
          const pesticideBlocks = text.split(/(?:\n\n|\n-)/).filter(Boolean);

          const pesticides = pesticideBlocks.slice(0, 4).map((t) => ({
            name: t.match(/^[-\s]*([A-Za-z0-9 ()]+)/)?.[1]?.trim() ?? "Unknown",
            type: t.match(/(organic|chemical)/i)?.[1] ?? "Unknown",
            dosage: t.match(/dosage\s*[:-]?\s*(.+)/i)?.[1] ?? "Not specified",
            application: t.match(/application\s*[:-]?\s*(.+)/i)?.[1] ?? "Not specified",
            safety: t.match(/safety\s*[:-]?\s*(.+)/i)?.[1] ?? "Not specified",
          }));

          const precautions = text.match(/-\s+(.+)/g)?.map((x) => x.replace(/^-\s*/g, "")) ?? [];

          parsed = { pesticides, precautions };
        }
      }

      // Normalize to safe types
      parsed.pesticides = parsed.pesticides.map((p) => ({
        name: p?.name ?? "Unknown",
        type: p?.type ?? "Unknown",
        dosage: p?.dosage ?? "Not specified",
        application: p?.application ?? "Not specified",
        safety: p?.safety ?? "Not specified",
      }));

      parsed.precautions = Array.isArray(parsed.precautions) ? parsed.precautions : [];

      setRecommendations(parsed);


      toast({
        title: "Pesticide Recommendations Ready",
        description: "AI-powered suggestions generated.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Could not fetch pesticide recommendations",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex gap-2 items-center justify-center">
          <Bug className="h-8 w-8 text-destructive" />
          Pesticide Recommendations
        </h1>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Crop & Pest Info</CardTitle>
          <CardDescription>AI will generate ideal pesticide advice</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Crop */}
            <Label>Crop Type</Label>
            <Select value={cropType} onValueChange={setCropType}>
              <SelectTrigger><SelectValue placeholder="Select crop type" /></SelectTrigger>
              <SelectContent>
                {["rice", "wheat", "cotton", "corn", "sugarcane", "vegetables", "fruits"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Pest */}
            <Label>Pest Type</Label>
            <Select value={pestType} onValueChange={setPestType}>
              <SelectTrigger><SelectValue placeholder="Select pest type" /></SelectTrigger>
              <SelectContent>
                {["aphids", "beetles", "caterpillars", "whiteflies", "mites", "fungal", "bacterial"].map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Symptoms */}
            <Label>Symptoms</Label>
            <Textarea
              placeholder="Describe symptoms..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />

            <Button disabled={!cropType || !pestType || loading} className="w-full">
              {loading ? <Loader2 className="animate-spin" /> : "Get Pesticide Recommendations"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {recommendations && (
        <div className="space-y-4">
          {/* Pesticides */}
          {recommendations.pesticides.map((p, i) => (
            <Card key={i} className="border-2">
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <CardDescription>{p.type}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Dosage:</strong> {p.dosage}</p>
                <p><strong>Application:</strong> {p.application}</p>
                <p><strong>Safety:</strong> {p.safety}</p>
              </CardContent>
            </Card>
          ))}

          {/* Precautions */}
          <Card className="border-warning bg-warning/5">
            <CardHeader>
              <CardTitle className="text-warning flex gap-2 items-center">
                <AlertCircle /> Safety Precautions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside">
                {recommendations.precautions.map((prec, idx) => (
                  <li key={idx}>{prec}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Pesticides;
