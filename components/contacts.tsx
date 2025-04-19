"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, Edit, Trash2, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { mockContacts } from "@/lib/mock-data"

export function Contacts() {
  const [contacts, setContacts] = useState(mockContacts)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<any | null>(null)
  const [newContact, setNewContact] = useState({
    name: "",
    phone_number: "",
    notes: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || contact.phone_number.includes(searchQuery),
  )

  const handleCreateContact = () => {
    if (!newContact.name || !newContact.phone_number) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both a name and phone number for the contact.",
      })
      return
    }

    const id = Date.now().toString()
    setContacts([...contacts, { ...newContact, id }])
    setNewContact({ name: "", phone_number: "", notes: "" })
    setIsDialogOpen(false)

    toast({
      title: "Contact Created",
      description: "Your contact has been created successfully.",
    })
  }

  const handleEditContact = () => {
    if (!editingContact || !editingContact.name || !editingContact.phone_number) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both a name and phone number for the contact.",
      })
      return
    }

    setContacts(contacts.map((contact) => (contact.id === editingContact.id ? editingContact : contact)))
    setEditingContact(null)
    setIsDialogOpen(false)

    toast({
      title: "Contact Updated",
      description: "Your contact has been updated successfully.",
    })
  }

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter((contact) => contact.id !== id))

    toast({
      title: "Contact Deleted",
      description: "Your contact has been deleted.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">Manage your WhatsApp contacts.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingContact ? "Edit Contact" : "Create Contact"}</DialogTitle>
              <DialogDescription>
                {editingContact
                  ? "Make changes to your contact."
                  : "Create a new contact to save information about your WhatsApp contacts."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name</Label>
                <Input
                  id="contact-name"
                  placeholder="John Doe"
                  value={editingContact ? editingContact.name : newContact.name}
                  onChange={(e) =>
                    editingContact
                      ? setEditingContact({ ...editingContact, name: e.target.value })
                      : setNewContact({ ...newContact, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Phone Number</Label>
                <Input
                  id="contact-phone"
                  placeholder="+1234567890"
                  value={editingContact ? editingContact.phone_number : newContact.phone_number}
                  onChange={(e) =>
                    editingContact
                      ? setEditingContact({ ...editingContact, phone_number: e.target.value })
                      : setNewContact({ ...newContact, phone_number: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-notes">Notes</Label>
                <textarea
                  id="contact-notes"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Additional information about this contact..."
                  value={editingContact ? editingContact.notes : newContact.notes}
                  onChange={(e) =>
                    editingContact
                      ? setEditingContact({ ...editingContact, notes: e.target.value })
                      : setNewContact({ ...newContact, notes: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingContact ? handleEditContact : handleCreateContact}>
                {editingContact ? "Save Changes" : "Create Contact"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search contacts..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-center">
                <p className="text-muted-foreground">Loading contacts...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={contact.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{contact.phone_number}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingContact(contact)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <User className="h-10 w-10 text-muted-foreground" />
                <h3 className="font-medium">No contacts found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "Add your first contact to get started"}
                </p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setEditingContact(null)
                    setIsDialogOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
