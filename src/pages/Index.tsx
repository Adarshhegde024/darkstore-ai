import { useState } from "react";
import { Sparkles, TrendingUp, Package, AlertTriangle, MessageSquare, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroBanner from "@/assets/hero-banner.jpg";
import StoreHealthCard from "@/components/StoreHealthCard";
import InventoryGrid from "@/components/InventoryGrid";
import DemandForecast from "@/components/DemandForecast";
import AIAssistant from "@/components/AIAssistant";
import QuickActions from "@/components/QuickActions";

const Index = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-ai flex items-center justify-center shadow-glow-ai">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">DarkStore AI</h1>
                <p className="text-xs text-muted-foreground">Intelligent Store Management</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowChat(!showChat)}
              className="bg-gradient-ai hover:opacity-90 transition-opacity shadow-glow-ai"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Ask AI Assistant
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src={heroBanner} alt="AI Store Management" className="w-full h-full object-cover" />
        </div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by AI
          </Badge>
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Solving the Dark Store Dilemma
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Zero missed orders. Zero wastage. Powered by predictive AI that thinks ahead.
          </p>
        </div>
      </section>

      {/* Main Dashboard */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-card border-border hover:shadow-glow-success transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Fulfillment</p>
                <p className="text-3xl font-bold text-foreground">98.7%</p>
                <p className="text-xs text-success mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +2.3% vs last week
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border hover:shadow-glow-ai transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Stock Accuracy</p>
                <p className="text-3xl font-bold text-foreground">99.2%</p>
                <p className="text-xs text-primary mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Optimized
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shadow-glow-ai">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active SKUs</p>
                <p className="text-3xl font-bold text-foreground">1,247</p>
                <p className="text-xs text-muted-foreground mt-1">
                  245 fast-moving
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Package className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow border-warning/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Alerts</p>
                <p className="text-3xl font-bold text-foreground">7</p>
                <p className="text-xs text-warning mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Needs attention
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <StoreHealthCard />
            <DemandForecast />
            <InventoryGrid />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <QuickActions />
            {showChat && <AIAssistant onClose={() => setShowChat(false)} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
