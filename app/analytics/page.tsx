import { Navbar } from "@/components/navbar"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-4 px-4 md:px-6">
        <AnalyticsDashboard />
      </div>
    </main>
  )
}
