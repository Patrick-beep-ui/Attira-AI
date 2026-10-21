# Attira AI

AI-powered fashion assistant that turns a user's real wardrobe, preferences, profile, and context into practical outfit recommendations.

[Visit the official website](https://www.attiraai.com/)

## Overview

Attira is a full-stack product built to support everyday clothing decisions. Instead of generating generic fashion inspiration, the application works with information that belongs to the user: wardrobe items, style preferences, body profile, occasion, weather, prior choices, and feedback.

The product combines a responsive React experience with Supabase-backed authentication, data, storage, and server-side functions. AI is treated as one part of the application workflow: inputs are collected and validated, relevant context is assembled, a structured recommendation is generated, and the result can be reviewed and saved by the user.

## Core capabilities

- Account creation, authentication, password recovery, and protected application routes
- Guided profile setup for personal, style, and body information
- Digital wardrobe management with item records and images
- Context-aware outfit generation using wardrobe and preference data
- Saved looks and individual outfit views
- Public and private profile experiences
- English/Spanish application context
- Persisted client-side query data and an offline-status indicator
- Responsive, mobile-first interface

## Application flow

1. A user creates an account and completes the profile setup.
2. Clothing items are added to the digital wardrobe.
3. The user provides the occasion and other relevant context.
4. The application combines profile, wardrobe, preference, and contextual data.
5. The AI workflow returns a structured outfit recommendation.
6. The user reviews the result and can save it for later.

## Architecture

- **Client:** React, TypeScript, Vite, React Router
- **UI:** Tailwind CSS, shadcn/ui, Radix UI, Framer Motion
- **Forms and validation:** React Hook Form and Zod
- **Server state:** TanStack Query with persisted query caching
- **Backend platform:** Supabase Auth, PostgreSQL, Storage, and Edge Functions
- **AI integration:** Gemini-based recommendation workflows
- **Quality:** Vitest, React Testing Library, ESLint, and TypeScript checks

The frontend keeps product views, reusable UI, domain hooks, context providers, and Supabase access separated. Protected routes enforce authentication and profile completion before users reach the main product flows.

## Local development

### Prerequisites

- Node.js 18 or newer
- npm
- A configured Supabase project

### Setup

~~~bash
git clone https://github.com/Patrick-beep-ui/Attira-AI.git
cd Attira-AI
npm install
~~~

Create a `.env` file with the public Supabase client configuration:

~~~env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
~~~

Start the application:

~~~bash
npm run dev
~~~

## Available scripts

~~~bash
npm run dev        # Start the Vite development server
npm run build      # Create a production build
npm run preview    # Preview the production build
npm run test       # Run the Vitest suite
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript without emitting files
~~~

## Project context

This repository contains the main Attira application. The project involved product architecture, database design, frontend development, Supabase infrastructure, AI integration, prompt workflows, and the end-to-end user experience.

## Data and secrets

Do not commit service-role keys, model-provider secrets, or real user data. Browser-exposed variables must be limited to the Supabase public URL and publishable key; privileged operations belong in protected server-side functions.

