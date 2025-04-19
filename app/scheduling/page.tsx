import { Navbar } from "@/components/navbar"
import { Scheduling } from "@/components/scheduling"

export default function SchedulingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-4 px-4 md:px-6">
        <Scheduling />
      </div>
    </main>
  )
}
