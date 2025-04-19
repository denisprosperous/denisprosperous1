# WhatsApp Business Automation with AI

A full-stack progressive web application for WhatsApp Business Automation with AI integration. This application allows you to connect your WhatsApp account, monitor incoming messages, and respond automatically using AI.

## Features

- WhatsApp QR Login Interface
- Real-time chat monitoring and interaction
- AI-powered responses using OpenAI or local LLMs
- Local and cloud storage with Supabase
- Admin dashboard for conversation management
- Message templates for quick responses

## Tech Stack

- **Frontend**: React.js with Tailwind CSS and ShadCN UI
- **Backend**: Node.js with Express
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI API or local LLM options
- **WhatsApp Automation**: Puppeteer for headless browser control

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account (free tier)
- OpenAI API key (optional)

### Installation

1. Clone the repository:
   \`\`\`
   git clone https://github.com/yourusername/whatsapp-automation.git
   cd whatsapp-automation
   \`\`\`

2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

3. Create a `.env` file in the root directory with the following variables:
   \`\`\`
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3001
   \`\`\`

4. Set up the database schema:
   - Go to your Supabase project
   - Navigate to the SQL Editor
   - Copy and paste the contents of `src/server/db/schema.sql`
   - Run the SQL queries to create the necessary tables

5. Start the development server:
   \`\`\`
   npm run dev
   \`\`\`

### Building for Production

\`\`\`
npm run build
npm start
\`\`\`

## Using the Application

1. Open the application in your browser
2. Click "Connect WhatsApp" to scan the QR code with your WhatsApp
3. Once connected, the application will start monitoring for new messages
4. Configure your AI settings in the Settings page
5. Create message templates for common responses
6. Monitor conversations in the Conversations page
7. View statistics and performance in the Dashboard

## Using OpenAI API

1. Go to the Settings page
2. Enter your OpenAI API key
3. Create a secure passphrase to encrypt your API key
4. The API key will be encrypted and stored locally

## Using Local LLM (Alternative to OpenAI)

1. Go to the Settings page
2. Enable "Use local LLM instead of OpenAI API"
3. The application will use a local language model for generating responses

## Security

- API keys are encrypted using AES-256-GCM before being stored
- Encryption is performed client-side using the Web Crypto API
- API keys are only decrypted during runtime with your passphrase
- No sensitive data is stored in plain text

## Customization

- Modify the system prompt in Settings to change how the AI responds
- Create and manage message templates for quick responses
- Adjust automation settings to control when and how the AI responds

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Based on the [whatsapp-gpt](https://github.com/danielgross/whatsapp-gpt) project by Daniel Gross
- Uses [ShadCN UI](https://ui.shadcn.com/) for the user interface
- Powered by [OpenAI](https://openai.com/) or local LLM alternatives
\`\`\`

Let's create a tailwind.config.js file:

```js file="tailwind.config.js"
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
