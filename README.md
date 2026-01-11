# Campus Connect - Student Collaboration Platform

A full-stack web application that empowers student teams to collaborate on projects, manage tasks, and track progress—just like professional teams at tech companies.

## Overview

Campus Connect is a modern collaboration platform built with Next.js and Node.js/Express. It demonstrates real-world software engineering practices including authentication, database design, RESTful APIs, and team collaboration features.

## Key Features

### 1. User Authentication & Management
- Secure sign-up and login with JWT tokens
- Password hashing with bcryptjs
- Session management with localStorage
- Protected routes and API endpoints

### 2. Team Management
- Create and manage teams
- Invite team members
- Assign team roles (Member/Leader)
- Team-based project organization

### 3. Project Management
- Create projects within teams
- Organize work by projects
- Track project progress
- Project descriptions and metadata

### 4. Task Management
- Create, assign, and track tasks
- Three-status workflow: To Do → In Progress → Done
- Set task deadlines
- Task descriptions and details
- Delete completed or irrelevant tasks

### 5. Collaboration Tools
- **Comments**: Add comments to tasks for team discussions
- **Activity Feed**: Track team actions and updates in real-time
- **Real-time Updates**: See changes as they happen
- **User Attribution**: All actions tied to user accounts

## Tech Stack

### Frontend
- **React 19.2** - UI library
- **Next.js 16** - Full-stack framework
- **Tailwind CSS v4** - Styling
- **Shadcn/UI** - Component library
- **TypeScript** - Type safety
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Document database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

## Project Structure

\`\`\`
campus-connect/
├── app/                           # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   ├── login/page.tsx            # Login page
│   ├── signup/page.tsx           # Sign up page
│   ├── dashboard/page.tsx        # User dashboard
│   ├── team/[teamId]/page.tsx    # Team projects view
│   ├── team/[teamId]/activity.tsx # Activity feed component
│   ├── project/[projectId]/page.tsx # Project tasks view
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # Shadcn/UI components
│   └── auth-context.tsx          # Auth provider
├── backend/
│   └── server.js                 # Express API server
├── public/                       # Static assets
└── package.json
\`\`\`

## Database Schema

### Users
\`\`\`javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (default: "member"),
  createdAt: Date
}
\`\`\`

### Teams
\`\`\`javascript
{
  name: String,
  description: String,
  leader: ObjectId (User),
  members: [ObjectId] (Users),
  createdAt: Date
}
\`\`\`

### Projects
\`\`\`javascript
{
  name: String,
  description: String,
  team: ObjectId (Team),
  tasks: [ObjectId] (Tasks),
  createdAt: Date
}
\`\`\`

### Tasks
\`\`\`javascript
{
  title: String,
  description: String,
  project: ObjectId (Project),
  assignee: ObjectId (User),
  status: String (todo | in-progress | done),
  dueDate: Date,
  createdAt: Date
}
\`\`\`

### Comments
\`\`\`javascript
{
  text: String,
  author: ObjectId (User),
  task: ObjectId (Task),
  createdAt: Date
}
\`\`\`

### Activity
\`\`\`javascript
{
  action: String,
  user: ObjectId (User),
  team: ObjectId (Team),
  taskId: ObjectId (Task),
  description: String,
  createdAt: Date
}
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Teams
- `GET /api/teams` - Get user's teams
- `POST /api/teams` - Create new team

### Projects
- `GET /api/projects/:teamId` - Get team projects
- `POST /api/projects` - Create new project

### Tasks
- `GET /api/tasks/:projectId` - Get project tasks
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### Comments
- `POST /api/comments` - Add comment to task
- `GET /api/comments/:taskId` - Get task comments
- `DELETE /api/comments/:id` - Delete comment

### Activity
- `GET /api/activity/:teamId` - Get team activity feed

## Setup & Installation

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd campus-connect
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure environment variables**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Update `.env` with:
   \`\`\`
   MONGODB_URI=mongodb://localhost:27017/campus-connect
   JWT_SECRET=your-secret-key-here
   PORT=5000
   \`\`\`

4. **Start MongoDB**
   \`\`\`bash
   # If using local MongoDB
   mongod
   \`\`\`

5. **Run backend server**
   \`\`\`bash
   npm run backend:dev
   \`\`\`

### Frontend Setup

1. **Install frontend dependencies** (already included)
   \`\`\`bash
   npm install
   \`\`\`

2. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open browser**
   Navigate to `http://localhost:3000`

## Usage Guide

### 1. Sign Up
- Create an account with email and password
- Automatically logged in after registration

### 2. Create a Team
- Go to Dashboard
- Click "New Team"
- Enter team name and description
- Share team code with members

### 3. Create a Project
- Click on a team
- Click "New Project"
- Create projects to organize work

### 4. Manage Tasks
- Open a project
- Click "New Task" to create tasks
- Assign deadlines and descriptions
- Update status as work progresses

### 5. Collaborate
- Click comment icon on any task
- Add comments for team discussions
- View activity feed to track team progress

## Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────┐
│              CLIENT LAYER (Browser)                  │
├─────────────────────────────────────────────────────┤
│  React Components (Login, Dashboard, Projects)      │
│  ├─ AuthContext (Session Management)                │
│  ├─ Pages (team, project, task views)               │
│  └─ UI Components (Forms, Cards, Dialogs)           │
└────────────────────┬────────────────────────────────┘
                     │ HTTP/REST API
                     │ (JWT Authentication)
┌────────────────────▼────────────────────────────────┐
│             API LAYER (Express.js)                   │
├─────────────────────────────────────────────────────┤
│  Routes:                                             │
│  ├─ /api/auth (signup, login)                       │
│  ├─ /api/teams (CRUD operations)                    │
│  ├─ /api/projects (CRUD operations)                 │
│  ├─ /api/tasks (CRUD + status updates)              │
│  ├─ /api/comments (add, delete, read)               │
│  └─ /api/activity (feed aggregation)                │
└────────────────────┬────────────────────────────────┘
                     │ Driver Protocol
                     │ (Mongoose ODM)
┌────────────────────▼────────────────────────────────┐
│         DATABASE LAYER (MongoDB)                     │
├─────────────────────────────────────────────────────┤
│  Collections:                                        │
│  ├─ users                                            │
│  ├─ teams                                            │
│  ├─ projects                                         │
│  ├─ tasks                                            │
│  ├─ comments                                         │
│  └─ activities                                       │
└─────────────────────────────────────────────────────┘
\`\`\`

## Data Flow

\`\`\`
User Action (Task Creation)
│
├─→ Frontend Validation
│
├─→ HTTP POST /api/tasks
│   ├─ Headers: { Authorization: "Bearer <JWT>" }
│   └─ Body: { title, description, project, dueDate }
│
├─→ Backend Authentication Middleware
│   └─ Verify JWT token, extract userId
│
├─→ Create Task in MongoDB
│   └─ Insert document with project reference
│
├─→ Log Activity
│   └─ Create activity record for team feed
│
└─→ Return Response
    └─ Frontend updates UI optimistically
\`\`\`

## Security Features

1. **Password Security**
   - Passwords hashed with bcryptjs (10 salt rounds)
   - Never stored in plaintext

2. **Authentication**
   - JWT tokens with 24-hour expiration
   - Token stored in localStorage
   - All API endpoints protected with verifyToken middleware

3. **Data Validation**
   - Input validation on all endpoints
   - MongoDB ObjectId validation
   - Proper error handling

4. **CORS Protection**
   - CORS middleware enabled
   - Only allows requests from configured origins

## Future Enhancements

1. **Email Notifications**
   - Task assignment notifications
   - Comment mentions with @user
   - Weekly digest emails

2. **Real-time Updates**
   - WebSocket integration (Socket.io)
   - Live comment streaming
   - Real-time activity feed

3. **Advanced Features**
   - File attachments to tasks
   - @mentions in comments
   - Task priorities and labels
   - Recurring tasks
   - Team analytics dashboard

4. **Search & Filtering**
   - Task search across projects
   - Filter by assignee, status, deadline
   - Team member search

5. **Integrations**
   - Slack notifications
   - Calendar integration (Google Calendar)
   - GitHub issue sync

## Deployment

### Vercel (Frontend)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically

### Render or Railway (Backend)
1. Create account on Render/Railway
2. Connect GitHub repository
3. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT`
4. Deploy

### MongoDB Atlas (Database)
1. Create cluster on MongoDB Atlas
2. Get connection string
3. Set `MONGODB_URI` in backend environment

## Troubleshooting

**Issue**: MongoDB connection error
- Ensure MongoDB is running
- Check `MONGODB_URI` environment variable
- Verify network access on MongoDB Atlas

**Issue**: JWT authentication fails
- Clear browser localStorage
- Re-login to get new token
- Check `JWT_SECRET` matches between frontend/backend

**Issue**: CORS errors
- Verify backend CORS middleware is enabled
- Check frontend API URL matches backend

## Performance Considerations

1. **Database Indexing**
   - Index on `email` for user lookups
   - Index on `team` for team queries
   - Index on `project` for project queries

2. **API Response Caching**
   - Cache team data (60 seconds)
   - Cache activity feed (30 seconds)

3. **Frontend Optimization**
   - Lazy load components
   - Optimize bundle with tree-shaking
   - Use SWR for data fetching

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Team

**Developed as a CV project for Microsoft Explore Program**

This project demonstrates:
- Full-stack development skills
- Software engineering best practices
- Product thinking and feature prioritization
- Team collaboration and communication
- Real-world problem solving

## License

MIT License - feel free to use this project for learning and development.

## Support

For issues or questions:
1. Check existing documentation
2. Review GitHub Issues
3. Create new issue with clear description
4. Include error messages and steps to reproduce

---

**Happy collaborating! Build amazing things with Campus Connect.**
