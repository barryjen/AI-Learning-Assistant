# AI Learning Assistant

## Overview

This is a full-stack AI Learning Assistant application built with React, Express.js, and Google's Gemini AI. The application allows users to have conversations with an AI that improves over time through user feedback. It features a modern chat interface, conversation management, and a learning system that adapts based on user interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **AI Integration**: Google Gemini API for natural language processing
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: PostgreSQL database storage (switched from memory storage)

### Data Storage
- **Database**: PostgreSQL (configured via Drizzle) - **ACTIVE**
- **ORM**: Drizzle ORM with migrations support
- **Schema**: Structured tables for users, conversations, messages, feedback, and learning context
- **Storage Interface**: Abstracted storage layer with DatabaseStorage now active (replaced MemStorage)
- **Database Connection**: Neon serverless PostgreSQL via @neondatabase/serverless

## Key Components

### Database Schema
- **Users**: User authentication and profile data
- **Conversations**: Chat sessions with titles and timestamps
- **Messages**: Individual messages with role (user/assistant) and content
- **Feedback**: User ratings (positive/negative) for AI responses
- **Learning Context**: AI improvement data including patterns and performance metrics

### AI Service
- **Gemini Integration**: Google's Gemini 2.5 Flash model for response generation
- **User API Keys**: Each user provides their own Gemini API key for security and individual usage tracking
- **Context Management**: Conversation history and learning context integration
- **Feedback Processing**: System for improving responses based on user feedback
- **Adaptive Learning**: AI responses improve over time using feedback patterns

### Frontend Components
- **Chat Interface**: Real-time messaging with message history
- **Sidebar**: Conversation management and navigation
- **Feedback System**: Thumbs up/down rating for AI responses
- **Responsive Design**: Mobile-first approach with collapsible sidebar

## Data Flow

1. **User Input**: User types message in chat interface
2. **API Request**: Frontend sends message to `/api/conversations/:id/messages`
3. **AI Processing**: Backend calls Gemini API with conversation context
4. **Response Generation**: AI generates response using learning context
5. **Database Storage**: Message and response stored in database
6. **Real-time Updates**: Frontend receives response and updates UI
7. **Feedback Loop**: User provides feedback, which updates learning context

## External Dependencies

### AI Services
- **Google Gemini API**: Primary AI model for natural language processing
- **User API Key Management**: Individual users provide their own Gemini API keys for security and usage tracking
- **API Key Validation**: Backend endpoint to test API key validity before use

### Database
- **Neon Database**: PostgreSQL hosting service
- **Connection**: Serverless PostgreSQL connection via @neondatabase/serverless

### UI Components
- **Radix UI**: Accessible, unstyled UI primitives
- **Lucide React**: Icon library for consistent iconography
- **TanStack Query**: Server state management and caching

## Deployment Strategy

### Development
- **Hot Reload**: Vite development server with HMR
- **TypeScript**: Full type checking and compilation
- **Development Scripts**: `npm run dev` for local development

### Production Build
- **Frontend**: Vite builds optimized React application
- **Backend**: ESBuild bundles Node.js server with external dependencies
- **Static Assets**: Frontend built to `dist/public` directory
- **Server Bundle**: Backend compiled to `dist/index.js`

### Environment Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **User API Keys**: Users provide their own Gemini API keys via secure browser storage
- **Build Process**: Separate build commands for frontend and backend

### Key Features
- **Learning System**: AI improves responses based on user feedback
- **Conversation Persistence**: All chats saved and retrievable
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Feedback**: Immediate response to user interactions
- **Modern UI**: Clean, accessible interface with dark/light theme support