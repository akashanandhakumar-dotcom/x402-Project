import { PlaceholderPage } from "@/components/placeholder-page";
import { BarChart3, LayoutTemplate } from "lucide-react";

export function TemplatesPage() {
  return (
    <PlaceholderPage
      icon={LayoutTemplate}
      title="Deck templates"
      blurb="Curated, investor-grade layouts for every stage — from pre-seed narrative to growth round. Templates will let you restyle any deck in one click."
      chips={["Minimal glass", "Bold narrative", "SaaS growth", "Deep tech", "Impact"]}
    />
  );
}

export function AnalyticsPage() {
  return (
    <PlaceholderPage
      icon={BarChart3}
      title="Analytics"
      blurb="See who opened your deck, which slides investors linger on, and how your story performs. Analytics will connect to your share links automatically."
      chips={["Deck views", "Slide dwell time", "Share opens", "Section heat"]}
    />
  );
}
