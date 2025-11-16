import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, CloudSun, AlertTriangle, Bug, TrendingUp, Droplets } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const features = [
    {
      title: "Crop Recommendations",
      description: "AI-powered suggestions based on soil type, climate, and market trends",
      icon: Sprout,
      link: "/crop-recommendations",
      color: "text-success",
    },
    {
      title: "Weather & Soil Analysis",
      description: "Real-time weather data and soil condition recommendations",
      icon: CloudSun,
      link: "/weather-soil",
      color: "text-info",
    },
    {
      title: "Climate Risk Detection",
      description: "Early warning system for harsh climate conditions",
      icon: AlertTriangle,
      link: "/climate-risks",
      color: "text-warning",
    },
    {
      title: "Pesticide Recommendations",
      description: "Smart pesticide suggestions for crop protection",
      icon: Bug,
      link: "/pesticides",
      color: "text-destructive",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Welcome to AgriSmart</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered agricultural assistant for smarter farming decisions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.link} to={feature.link}>
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-2 hover:border-primary">
                <CardHeader>
                  <Icon className={`h-12 w-12 mb-4 ${feature.color}`} />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <TrendingUp className="h-8 w-8 text-success mb-2" />
            <CardTitle>Smart Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Leverage machine learning models trained on agricultural data for accurate predictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CloudSun className="h-8 w-8 text-info mb-2" />
            <CardTitle>Real-time Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get up-to-date weather forecasts and climate information for your region
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Droplets className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Soil Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Understand your soil conditions and receive tailored recommendations
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
