import { Navbar } from "@/components/navbar"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-4 px-4 md:px-6">
        <Dashboard />
      </div>
    </main>
  )
}
