import { Navbar } from "@/components/navbar"
import { Templates } from "@/components/templates"

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-4 px-4 md:px-6">
        <Templates />
      </div>
    </main>
  )
}
