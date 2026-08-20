# Let's Talk. Period! — Work Assistant

A modern, responsive workplace productivity assistant that helps teams turn raw notes, ideas, and research into polished, actionable output. Built as a SaaS-style dashboard with a premium white-and-soft-pink aesthetic.

![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)
![TanStack Start](https://img.shields.io/badge/TanStack%20Start-000000?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)

---

## Features

### 1. Meeting Notes Summariser
Paste meeting notes or transcripts and get a structured summary including:
- Executive summary
- Key points discussed
- Key decisions made
- Action items with owners and due dates
- Upcoming deadlines
- Follow-up items

### 2. Smart Email Generator
Generate ready-to-edit business emails with control over:
- Tone (Professional, Friendly, Direct, Diplomatic, Enthusiastic)
- Length (Short, Medium, Long)
- Context such as recipient, purpose, and key points

### 3. AI Research Assistant
Break down complex research questions into:
- Sub-questions to explore
- Key findings and main themes
- Insights and questions to explore further
- Verification notes so claims are not stated as fact

### 4. Dashboard & Saved Work
- Quick-access cards for each tool
- Productivity statistics
- Recent activity feed
- Persistent local document history with save, copy, and delete actions

---

## Tech Stack

- **[TanStack Start](https://tanstack.com/start)** — Full-stack React framework with SSR/SSG and server functions
- **[React 19](https://react.dev)** — UI library
- **[TypeScript](https://www.typescriptlang.org)** — Type-safe development
- **[Tailwind CSS v4](https://tailwindcss.com)** — Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com)** — Accessible UI components
- **[Lovable AI Gateway](https://docs.lovable.dev/features/ai-gateway)** — AI model access via `google/gemini-2.5-flash`
- **Browser `localStorage`** — Lightweight document persistence for saved work

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (LTS recommended)
- [Bun](https://bun.sh) or npm
- A Lovable workspace with AI Gateway enabled

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd <repository-name>

# Install dependencies
bun install
# or
npm install
```

### Development

```bash
bun dev
# or
npm run dev
```

The app runs on `http://localhost:8080` by default.

### Environment Variables

This project uses Lovable's managed environment. The AI server function reads `LOVABLE_API_KEY` from the server runtime. No manual API keys are required for local development when running inside Lovable.

---

## Project Structure

```text
src/
├── components/          # Shared UI components
│   ├── AppLayout.tsx    # Responsive sidebar and page shell
│   └── OutputBlock.tsx  # Editable AI output display
├── lib/
│   ├── ai.functions.ts  # Server functions for AI generation
│   ├── storage.ts       # localStorage document persistence
│   └── utils.ts         # Utility helpers
├── routes/              # TanStack Start file-based routes
│   ├── index.tsx        # Dashboard
│   ├── meeting-summariser.tsx
│   ├── email-generator.tsx
│   ├── research-assistant.tsx
│   ├── saved-work.tsx
│   └── settings.tsx
├── styles.css           # Tailwind v4 theme and custom tokens
└── __root.tsx           # Root layout
```

---

## Design System

- **Primary accent:** Soft pink (`#F472B6` / `oklch(0.70 0.20 350)`)
- **Background:** Clean white with subtle muted surfaces
- **Text:** Charcoal / slate palette for high readability
- **Typography:** Plus Jakarta Sans
- **Radius:** Large rounded corners for a friendly, premium SaaS feel
- **Icons:** Lucide React

---

## Responsible AI

AI-generated content may contain errors or omissions. Always review and verify important information before using or sharing it. This tool assists with workplace productivity and does not replace professional judgement.

---

## Deployment

This project is developed with [Lovable](https://lovable.dev). To deploy:

1. Publish from the Lovable editor, or
2. Connect the project to GitHub and deploy from your preferred hosting platform.

---

## License

This project is private and proprietary to its owner unless otherwise stated.

---

Built with ❤️ using [Lovable](https://lovable.dev).
