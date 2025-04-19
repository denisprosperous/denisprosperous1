import { Navbar } from "@/components/navbar"
import { ConversationDetail } from "@/components/conversation-detail"

export default function ConversationDetailPage({ params }: { params: { phoneNumber: string } }) {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-4 px-4 md:px-6">
        <ConversationDetail phoneNumber={params.phoneNumber} />
      </div>
    </main>
  )
}
