import { Navbar } from "@/components/navbar"
import { Settings } from "@/components/settings"

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-4 px-4 md:px-6">
        <Settings />
      </div>
    </main>
  )
}
