import { Navbar } from "@/components/navbar"
import { Webhooks } from "@/components/webhooks"

export default function WebhooksPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-4 px-4 md:px-6">
        <Webhooks />
      </div>
    </main>
  )
}
