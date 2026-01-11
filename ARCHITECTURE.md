# Campus Connect - System Architecture

## Overview

Campus Connect is built on a modern three-tier architecture with clear separation of concerns:

\`\`\`
┌─────────────────────────────────────────────────┐
│         Presentation Layer (Next.js)             │
│  React Components, Pages, UI Logic              │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│         Business Logic Layer (Express)           │
│  API Routes, Authentication, Validation         │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│         Data Layer (MongoDB)                     │
│  Collections, Indexes, Relationships            │
└─────────────────────────────────────────────────┘
\`\`\`

## Components

### Frontend Architecture

\`\`\`
app/
├── layout.tsx              # Root layout with metadata
├── globals.css             # Tailwind configuration
├── page.tsx                # Landing page
├── login/page.tsx          # Authentication
├── signup/page.tsx         # Registration
├── dashboard/
│   └── page.tsx           # Main dashboard
├── team/
│   ├── [teamId]/page.tsx  # Team view with Kanban
│   └── [teamId]/activity.tsx # Activity feed component
└── project/
    └── [projectId]/page.tsx # Task management

components/
├── ui/                     # Shadcn UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── tabs.tsx
│   └── ...
└── auth-context.tsx       # Auth state management
\`\`\`

### Key Frontend Concepts

**Authentication Flow**:
\`\`\`
User → Signup/Login Page
     → API Call to /api/auth/signup or /api/auth/login
     → Receive JWT Token
     → Store in localStorage
     → AuthContext updates
     → Redirect to /dashboard
\`\`\`

**Data Fetching Pattern**:
\`\`\`
Component Mount
     → Check localStorage for token
     → If no token, redirect to /login
     → Fetch data from API with JWT header
     → Update local state
     → Render component
\`\`\`

**Navigation Structure**:
\`\`\`
/ (Landing)
├── /login
├── /signup
├── /dashboard (protected)
│   └── Teams List
│       └── /team/[teamId] (protected)
│           ├── Projects List
│           └── /project/[projectId] (protected)
│               └── Tasks Kanban
└── /project/[projectId] (protected)
    └── Task Details & Comments
\`\`\`

### Backend Architecture

\`\`\`
backend/server.js
├── Middleware
│   ├── cors()
│   ├── express.json()
│   └── verifyToken()
├── Database Connection
│   └── MongoDB Atlas
├── Schemas
│   ├── userSchema
│   ├── teamSchema
│   ├── projectSchema
│   ├── taskSchema
│   ├── commentSchema
│   └── activitySchema
└── Routes
    ├── Auth Routes (/api/auth/*)
    ├── Team Routes (/api/teams/*)
    ├── Project Routes (/api/projects/*)
    ├── Task Routes (/api/tasks/*)
    ├── Comment Routes (/api/comments/*)
    └── Activity Routes (/api/activity/*)
\`\`\`

### Authentication Architecture

**JWT Implementation**:
\`\`\`
1. User Credentials → POST /api/auth/login
2. Backend validates password
3. Backend generates JWT (payload: userId, email)
4. JWT stored in localStorage
5. All subsequent requests include: Authorization: Bearer <JWT>
6. Middleware verifies JWT on each request
\`\`\`

**Token Structure**:
\`\`\`javascript
{
  header: { alg: "HS256", typ: "JWT" },
  payload: { userId: "...", email: "..." },
  signature: "..." // signed with JWT_SECRET
}
\`\`\`

**Expiration**: 24 hours

### Database Schema Relationships

\`\`\`
User
├── Created: Team (as leader)
├── Member of: Team (in members array)
├── Assigned: Task (as assignee)
└── Created: Comment (as author)

Team
├── Has: Project (multiple)
├── Has Members: User (multiple)
└── Generates: Activity (multiple)

Project
├── Belongs to: Team
├── Has: Task (multiple)
└── Belongs to: User (implicitly via team)

Task
├── Belongs to: Project
├── Assigned to: User (optional)
├── Has: Comment (multiple)
└── Generates: Activity

Comment
├── Written by: User
└── On: Task

Activity
├── Performed by: User
├── On: Team
├── Related to: Task (optional)
\`\`\`

## Request/Response Flow

### Example: Create Task

**Frontend**:
\`\`\`javascript
const handleCreateTask = async () => {
  const token = localStorage.getItem("token")
  const response = await axios.post(
    "http://localhost:5000/api/tasks",
    { title, description, project: projectId, dueDate },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  setTasks([...tasks, response.data])
}
\`\`\`

**Backend**:
\`\`\`javascript
app.post("/api/tasks", verifyToken, async (req, res) => {
  // 1. Verify token (middleware)
  // 2. Extract userId from token
  // 3. Validate input
  // 4. Create Task document
  // 5. Create Activity log
  // 6. Return task to frontend
})
\`\`\`

**Database**:
\`\`\`javascript
// Task inserted
db.tasks.insertOne({
  title: "...",
  description: "...",
  project: ObjectId("..."),
  status: "todo",
  dueDate: ISODate("..."),
  createdAt: ISODate("...")
})

// Activity logged
db.activities.insertOne({
  action: "task_created",
  user: ObjectId("..."),
  team: ObjectId("..."),
  taskId: ObjectId("..."),
  createdAt: ISODate("...")
})
\`\`\`

## State Management

### Frontend State Patterns

**Local Component State**:
\`\`\`typescript
const [tasks, setTasks] = useState<Task[]>([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState("")
\`\`\`

**Global State** (AuthContext):
\`\`\`typescript
interface AuthContextType {
  user: User | null
  token: string | null
  logout: () => void
  isLoading: boolean
}
\`\`\`

**Persistent State** (localStorage):
\`\`\`javascript
localStorage.setItem("token", jwtToken)
localStorage.setItem("user", JSON.stringify(userData))
\`\`\`

## API Response Format

**Success Response**:
\`\`\`javascript
{
  status: 200,
  data: { /* resource data */ }
}
\`\`\`

**Error Response**:
\`\`\`javascript
{
  status: 400,
  error: "Error message"
}
\`\`\`

## Security Architecture

**Password Security**:
\`\`\`
User Input Password
     ↓
bcryptjs.hash(password, 10)  // Hash with 10 rounds
     ↓
Store hashed password in DB
\`\`\`

**Request Authentication**:
\`\`\`
Frontend Request
     ↓
Authorization: Bearer <JWT>
     ↓
Backend verifyToken middleware
     ↓
Verify signature with JWT_SECRET
     ↓
Extract userId
     ↓
Proceed with request
\`\`\`

## Scalability Considerations

### Current Implementation (Suitable for MVP)
- Single Express server
- Direct MongoDB connection
- In-memory state on frontend
- No caching layer

### Future Scaling Strategy

1. **Horizontal Scaling**
   - Load balancer (NGINX)
   - Multiple Express servers
   - Stateless API design

2. **Caching**
   - Redis for session storage
   - API response caching
   - Database query caching

3. **Database Optimization**
   - Connection pooling
   - Query optimization
   - Read replicas

4. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Logging system

## Error Handling

**Frontend**:
\`\`\`typescript
try {
  const response = await apiCall()
  setData(response.data)
} catch (error) {
  setError(error.message)
  // Show error to user
}
\`\`\`

**Backend**:
\`\`\`javascript
try {
  // Operation
} catch (error) {
  res.status(400).json({ error: error.message })
}
\`\`\`

## Performance Optimization

1. **Database Level**
   - Proper indexing on frequently queried fields
   - Aggregation pipelines for complex queries
   - Query optimization

2. **API Level**
   - Selective field projection
   - Pagination for large datasets
   - Response compression

3. **Frontend Level**
   - Code splitting
   - Image optimization
   - Lazy loading components
   - Efficient re-renders with React hooks

## Testing Strategy (Future)

\`\`\`
Frontend Tests:
├── Unit Tests (Jest)
│   ├── Component rendering
│   ├── Form validation
│   └── Auth logic
├── Integration Tests (React Testing Library)
│   ├── User flows
│   ├── API interactions
│   └── State management
└── E2E Tests (Cypress)
    ├── Full user journeys
    ├── Multi-user scenarios
    └── Error handling

Backend Tests:
├── Unit Tests
│   ├── Schema validation
│   └── Utility functions
├── Integration Tests
│   ├── API endpoints
│   ├── Database operations
│   └── Authentication
└── Load Tests
    ├── Concurrent users
    └── Database stress
\`\`\`

## Monitoring & Logging (Future)

\`\`\`
Application Logs
├── Info: User actions, API calls
├── Warning: Validation failures, deprecations
└── Error: Exceptions, failed operations

Performance Metrics
├── API response times
├── Database query durations
├── Frontend load times
└── Error rates

User Analytics
├── Feature usage
├── User journey analysis
└── Conversion funnels
\`\`\`

---

**Campus Connect is built with scalability and maintainability in mind, ready for growth!**
