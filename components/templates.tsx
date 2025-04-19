"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { mockTemplates } from "@/lib/mock-data"

export function Templates() {
  const [templates, setTemplates] = useState(mockTemplates)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    content: "",
    category: "greeting",
  })
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both a name and content for the template.",
      })
      return
    }

    const id = Date.now().toString()
    setTemplates([...templates, { ...newTemplate, id }])
    setNewTemplate({ name: "", content: "", category: "greeting" })
    setIsDialogOpen(false)

    toast({
      title: "Template Created",
      description: "Your message template has been created successfully.",
    })
  }

  const handleEditTemplate = () => {
    if (!editingTemplate || !editingTemplate.name || !editingTemplate.content) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both a name and content for the template.",
      })
      return
    }

    setTemplates(templates.map((template) => (template.id === editingTemplate.id ? editingTemplate : template)))
    setEditingTemplate(null)
    setIsDialogOpen(false)

    toast({
      title: "Template Updated",
      description: "Your message template has been updated successfully.",
    })
  }

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((template) => template.id !== id))

    toast({
      title: "Template Deleted",
      description: "Your message template has been deleted.",
    })
  }

  const filteredTemplates =
    activeCategory === "all" ? templates : templates.filter((template) => template.category === activeCategory)

  const categories = ["all", ...Array.from(new Set(templates.map((template) => template.category)))]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Message Templates</h1>
          <p className="text-muted-foreground">Create and manage templates for common responses.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
              <DialogDescription>
                {editingTemplate
                  ? "Make changes to your message template."
                  : "Create a new message template for quick responses."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="e.g., Welcome Message"
                  value={editingTemplate ? editingTemplate.name : newTemplate.name}
                  onChange={(e) =>
                    editingTemplate
                      ? setEditingTemplate({ ...editingTemplate, name: e.target.value })
                      : setNewTemplate({ ...newTemplate, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-category">Category</Label>
                <select
                  id="template-category"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={editingTemplate ? editingTemplate.category : newTemplate.category}
                  onChange={(e) =>
                    editingTemplate
                      ? setEditingTemplate({ ...editingTemplate, category: e.target.value })
                      : setNewTemplate({ ...newTemplate, category: e.target.value })
                  }
                >
                  <option value="greeting">Greeting</option>
                  <option value="info">Information</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-content">Content</Label>
                <textarea
                  id="template-content"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Hello {{name}}, thank you for reaching out!"
                  value={editingTemplate ? editingTemplate.content : newTemplate.content}
                  onChange={(e) =>
                    editingTemplate
                      ? setEditingTemplate({ ...editingTemplate, content: e.target.value })
                      : setNewTemplate({ ...newTemplate, content: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">Use {{ name }} to insert the contact's name.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingTemplate ? handleEditTemplate : handleCreateTemplate}>
                {editingTemplate ? "Save Changes" : "Create Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-4">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="space-y-4">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {template.name}
                    </CardTitle>
                    <CardDescription className="capitalize">{template.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{template.content}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTemplate(template)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <h3 className="font-medium">No templates found</h3>
                    <p className="text-sm text-muted-foreground">Create a new template to get started</p>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        setEditingTemplate(null)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
