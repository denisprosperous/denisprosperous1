export const mockScheduledMessages = [
  {
    id: "1",
    recipient: {
      name: "John Doe",
      phone_number: "+1234567890",
    },
    message: "Reminder: Your appointment is tomorrow.",
    scheduled_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    status: "pending",
    created_at: new Date().toISOString(),
    recurring: false,
    recurrence_pattern: null,
  },
  {
    id: "2",
    recipient: {
      name: "Jane Smith",
      phone_number: "+9876543210",
    },
    message: "Weekly report due this Friday.",
    scheduled_time: new Date(Date.now() + 604800000).toISOString(), // Next week
    status: "pending",
    created_at: new Date().toISOString(),
    recurring: true,
    recurrence_pattern: "weekly",
  },
]

export const mockWebhooks = [
  {
    id: "1",
    name: "Order Notification",
    url: "https://example.com/webhook",
    events: ["message.received", "message.sent"],
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    secret: "secret1",
  },
  {
    id: "2",
    name: "CRM Integration",
    url: "https://crm.example.com/api/whatsapp",
    events: ["contact.created", "contact.updated"],
    active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    secret: "secret2",
  },
]

export const mockContacts = [
  {
    id: "1",
    name: "John Doe",
    phone_number: "+1234567890",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    notes: "CEO of Example Corp",
  },
  {
    id: "2",
    name: "Jane Smith",
    phone_number: "+9876543210",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    notes: "Marketing Director",
  },
  {
    id: "3",
    name: "Bob Johnson",
    phone_number: "+1122334455",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    notes: "Regular customer",
  },
  {
    id: "4",
    name: "Alice Williams",
    phone_number: "+5566778899",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    notes: "New lead from website",
  },
]

export const mockConversations = [
  {
    id: "1",
    contact: {
      name: "John Doe",
      phoneNumber: "+1234567890",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    lastMessage: {
      text: "Thanks for the information. I'll get back to you soon.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      isFromMe: false,
    },
    unreadCount: 2,
  },
  {
    id: "2",
    contact: {
      name: "Jane Smith",
      phoneNumber: "+9876543210",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    lastMessage: {
      text: "The meeting is scheduled for tomorrow at 10 AM.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      isFromMe: true,
    },
    unreadCount: 0,
  },
  {
    id: "3",
    contact: {
      name: "Bob Johnson",
      phoneNumber: "+1122334455",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    lastMessage: {
      text: "Do you have the latest product catalog?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      isFromMe: false,
    },
    unreadCount: 1,
  },
  {
    id: "4",
    contact: {
      name: "Alice Williams",
      phoneNumber: "+5566778899",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    lastMessage: {
      text: "I'm interested in your services. Can you provide more details?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      isFromMe: false,
    },
    unreadCount: 3,
  },
]

export const mockMessages = {
  "+1234567890": [
    {
      id: "1",
      sender_name: "John Doe",
      phone_number: "+1234567890",
      message: "Hi there! I'm interested in your products.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      is_from_me: false,
      read: true,
    },
    {
      id: "2",
      sender_name: "AI Assistant",
      phone_number: "+1234567890",
      message: "Hello John! Thank you for your interest. What specific products are you looking for?",
      timestamp: new Date(Date.now() - 1000 * 60 * 59).toISOString(), // 59 minutes ago
      is_from_me: true,
      read: true,
    },
    {
      id: "3",
      sender_name: "John Doe",
      phone_number: "+1234567890",
      message: "I'm looking for the latest smartphone models you have available.",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
      is_from_me: false,
      read: true,
    },
    {
      id: "4",
      sender_name: "AI Assistant",
      phone_number: "+1234567890",
      message:
        "We have several new models in stock. I can send you our catalog with detailed specifications and pricing.",
      timestamp: new Date(Date.now() - 1000 * 60 * 44).toISOString(), // 44 minutes ago
      is_from_me: true,
      read: true,
    },
    {
      id: "5",
      sender_name: "John Doe",
      phone_number: "+1234567890",
      message: "That would be great. Please send it over.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      is_from_me: false,
      read: true,
    },
    {
      id: "6",
      sender_name: "AI Assistant",
      phone_number: "+1234567890",
      message: "I've sent the catalog to your email. Let me know if you have any questions!",
      timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString(), // 29 minutes ago
      is_from_me: true,
      read: true,
    },
    {
      id: "7",
      sender_name: "John Doe",
      phone_number: "+1234567890",
      message: "Thanks for the information. I'll get back to you soon.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      is_from_me: false,
      read: false,
    },
  ],
  "+9876543210": [
    {
      id: "1",
      sender_name: "Jane Smith",
      phone_number: "+9876543210",
      message: "Hello, I'd like to schedule a meeting to discuss your services.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      is_from_me: false,
      read: true,
    },
    {
      id: "2",
      sender_name: "AI Assistant",
      phone_number: "+9876543210",
      message: "Hi Jane! I'd be happy to schedule a meeting. When would be a good time for you?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9).toISOString(), // 1.9 hours ago
      is_from_me: true,
      read: true,
    },
    {
      id: "3",
      sender_name: "Jane Smith",
      phone_number: "+9876543210",
      message: "How about tomorrow at 10 AM?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(), // 1.5 hours ago
      is_from_me: false,
      read: true,
    },
    {
      id: "4",
      sender_name: "AI Assistant",
      phone_number: "+9876543210",
      message: "Tomorrow at 10 AM works perfectly. I'll send you a calendar invite with the meeting details.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.4).toISOString(), // 1.4 hours ago
      is_from_me: true,
      read: true,
    },
    {
      id: "5",
      sender_name: "Jane Smith",
      phone_number: "+9876543210",
      message: "Great, thank you!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      is_from_me: false,
      read: true,
    },
    {
      id: "6",
      sender_name: "AI Assistant",
      phone_number: "+9876543210",
      message: "The meeting is scheduled for tomorrow at 10 AM.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      is_from_me: true,
      read: true,
    },
  ],
}

export const mockTemplates = [
  {
    id: "1",
    name: "Welcome Message",
    content: "Hello {{contactName}}, thank you for reaching out to us!",
    category: "greeting",
  },
  {
    id: "2",
    name: "Follow-up",
    content: "Hi {{contactName}}, just checking in to see if you have any questions about our services.",
    category: "follow-up",
  },
  {
    id: "3",
    name: "Business Hours",
    content: "Our business hours are Monday to Friday, 9am to 5pm. We'll get back to you during business hours.",
    category: "info",
  },
  {
    id: "4",
    name: "Out of Office",
    content:
      "I'm currently out of the office and will return on {{returnDate}}. For urgent matters, please contact {{alternateContact}}.",
    category: "other",
  },
]

export const mockAnalyticsData = {
  messageVolume: [
    { name: "Mon", received: 45, sent: 32 },
    { name: "Tue", received: 52, sent: 41 },
    { name: "Wed", received: 49, sent: 43 },
    { name: "Thu", received: 63, sent: 58 },
    { name: "Fri", received: 51, sent: 47 },
    { name: "Sat", received: 25, sent: 22 },
    { name: "Sun", received: 18, sent: 14 },
  ],
  responseTimes: [
    { name: "Mon", time: 45 },
    { name: "Tue", time: 38 },
    { name: "Wed", time: 42 },
    { name: "Thu", time: 35 },
    { name: "Fri", time: 40 },
    { name: "Sat", time: 52 },
    { name: "Sun", time: 58 },
  ],
  engagement: [
    { name: "6-9 AM", count: 12 },
    { name: "9-12 PM", count: 45 },
    { name: "12-3 PM", count: 38 },
    { name: "3-6 PM", count: 56 },
    { name: "6-9 PM", count: 32 },
    { name: "9-12 AM", count: 18 },
  ],
  templatePerformance: [
    { name: "Welcome", value: 35 },
    { name: "Follow-up", value: 25 },
    { name: "Info", value: 20 },
    { name: "Sales", value: 15 },
    { name: "Support", value: 5 },
  ],
}

export const mockDashboardStats = {
  totalMessages: 1248,
  activeChats: 32,
  responseTime: "45s",
  pendingResponses: 5,
}

export const mockRecentMessages = [
  {
    sender: "John Doe",
    time: "5 minutes ago",
    content: "Thanks for the information. I'll get back to you soon.",
  },
  {
    sender: "Jane Smith",
    time: "30 minutes ago",
    content: "The meeting is scheduled for tomorrow at 10 AM.",
  },
  {
    sender: "Bob Johnson",
    time: "2 hours ago",
    content: "Do you have the latest product catalog?",
  },
  {
    sender: "Alice Williams",
    time: "1 day ago",
    content: "I'm interested in your services. Can you provide more details?",
  },
]

export const mockConversationMessages = {
  "+1234567890": [
    {
      id: "1",
      sender_name: "John Doe",
      phone_number: "+1234567890",
      message: "Hi there! I'm interested in your products.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      is_from_me: false,
      read: true,
    },
    {
      id: "2",
      sender_name: "AI Assistant",
      phone_number: "+1234567890",
      message: "Hello John! Thank you for your interest. What specific products are you looking for?",
      timestamp: new Date(Date.now() - 1000 * 60 * 59).toISOString(), // 59 minutes ago
      is_from_me: true,
      read: true,
    },
    {
      id: "3",
      sender_name: "John Doe",
      phone_number: "+1234567890",
      message: "I'm looking for the latest smartphone models you have available.",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
      is_from_me: false,
      read: true,
    },
    {
      id: "4",
      sender_name: "AI Assistant",
      phone_number: "+1234567890",
      message:
        "We have several new models in stock. I can send you our catalog with detailed specifications and pricing.",
      timestamp: new Date(Date.now() - 1000 * 60 * 44).toISOString(), // 44 minutes ago
      is_from_me: true,
      read: true,
    },
    {
      id: "5",
      sender_name: "John Doe",
      phone_number: "+1234567890",
      message: "That would be great. Please send it over.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      is_from_me: false,
      read: true,
    },
    {
      id: "6",
      sender_name: "AI Assistant",
      phone_number: "+1234567890",
      message: "I've sent the catalog to your email. Let me know if you have any questions!",
      timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString(), // 29 minutes ago
      is_from_me: true,
      read: true,
    },
    {
      id: "7",
      sender_name: "John Doe",
      phone_number: "+1234567890",
      message: "Thanks for the information. I'll get back to you soon.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      is_from_me: false,
      read: false,
    },
  ],
  "+9876543210": [
    {
      id: "1",
      sender_name: "Jane Smith",
      phone_number: "+9876543210",
      message: "Hello, I'd like to schedule a meeting to discuss your services.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      is_from_me: false,
      read: true,
    },
    {
      id: "2",
      sender_name: "AI Assistant",
      phone_number: "+9876543210",
      message: "Hi Jane! I'd be happy to schedule a meeting. When would be a good time for you?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9).toISOString(), // 1.9 hours ago
      is_from_me: true,
      read: true,
    },
    {
      id: "3",
      sender_name: "Jane Smith",
      phone_number: "+9876543210",
      message: "How about tomorrow at 10 AM?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(), // 1.5 hours ago
      is_from_me: false,
      read: true,
    },
    {
      id: "4",
      sender_name: "AI Assistant",
      phone_number: "+9876543210",
      message: "Tomorrow at 10 AM works perfectly. I'll send you a calendar invite with the meeting details.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.4).toISOString(), // 1.4 hours ago
      is_from_me: true,
      read: true,
    },
    {
      id: "5",
      sender_name: "Jane Smith",
      phone_number: "+9876543210",
      message: "Great, thank you!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      is_from_me: false,
      read: true,
    },
    {
      id: "6",
      sender_name: "AI Assistant",
      phone_number: "+9876543210",
      message: "The meeting is scheduled for tomorrow at 10 AM.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      is_from_me: true,
      read: true,
    },
  ],
}
