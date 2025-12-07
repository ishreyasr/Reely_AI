# ReelyAI:Smart Content Studio

## Project Description
Reely AI is an AI-powered content creation platform that helps users generate, refine, and manage content efficiently. The application leverages Google's Gemini API to provide various AI tools including text summarization, idea generation, content refinement, and an AI chatbot assistant.

## Deployment
This project is configured for deployment on Vercel. See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

## Setup Instructions

### Frontend (Next.js)
1. **Prerequisites**:
   - Node.js (v18 or later)
   - npm or yarn

2. **Installation**:
   ```bash
   cd Frontend
   npm install
   # or
   yarn install
   ```

3. **Firebase Setup**:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Google provider
   - Create a web app in your Firebase project
   - Copy the Firebase configuration to `lib/firebase.ts`

### Backend (FastAPI + Gemini)
1. **Prerequisites**:
   - Python 3.9+
   - pip

2. **Installation**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Environment Setup**:
   - Create a `.env` file in the backend directory
   - Add your Gemini API key: `GEMINI_API_KEY=your_google_gemini_api_key`

## Running Locally

### Frontend
```bash
cd Frontend
npm run dev
# or
yarn dev
```
The frontend will be available at http://localhost:3000

### Backend
```bash
cd backend
uvicorn api:app --reload --port 8000
```
The backend API will be available at http://localhost:8000

## API Documentation

### Endpoints

#### Text Summarization
- **Endpoint**: `POST /api/summarize`
- **Request Body**: `{ "text": string }`
- **Response**: `{ "summary": string }`

#### Idea Generation
- **Endpoint**: `POST /api/generate-ideas`
- **Request Body**: `{ "topic": string }`
- **Response**: `{ "ideas": string[] }`

#### Content Refinement
- **Endpoint**: `POST /api/refine-content`
- **Request Body**: `{ "text": string, "instruction"?: string }`
- **Response**: `{ "refinedText": string }`

#### AI Chat
- **Endpoint**: `POST /api/chat`
- **Request Body**: `{ "query": string }`
- **Response**: `{ "response": string }`

## Design Choices and Assumptions

1. **Architecture**:
   - Next.js frontend with React components
   - FastAPI backend for AI processing
   - Firebase for authentication

2. **State Management**:
   - React hooks for local state
   - Context API for global state where needed

3. **UI/UX**:
   - Responsive design for mobile and desktop
   - Shadcn UI components for consistent styling

4. **API Fallbacks**:
   - Frontend includes fallback responses when backend is unavailable
   - Helpful for development and demonstration purposes

5. **Security**:
   - API keys stored in environment variables
   - Firebase authentication for user management
   - CORS enabled but should be restricted in production#
