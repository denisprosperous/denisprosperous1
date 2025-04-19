import { Navbar } from "@/components/navbar"
import { Contacts } from "@/components/contacts"

export default function ContactsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-4 px-4 md:px-6">
        <Contacts />
      </div>
    </main>
  )
}
