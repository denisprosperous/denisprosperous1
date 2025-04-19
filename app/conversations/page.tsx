import { Navbar } from "@/components/navbar"
import { Conversations } from "@/components/conversations"

export default function ConversationsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-4 px-4 md:px-6">
        <Conversations />
      </div>
    </main>
  )
}
