const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/campus-connect")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err))

// Models
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "member" },
  createdAt: { type: Date, default: Date.now },
})

const teamSchema = new mongoose.Schema({
  name: String,
  description: String,
  leader: mongoose.Schema.Types.ObjectId,
  members: [mongoose.Schema.Types.ObjectId],
  createdAt: { type: Date, default: Date.now },
})

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  team: mongoose.Schema.Types.ObjectId,
  tasks: [mongoose.Schema.Types.ObjectId],
  createdAt: { type: Date, default: Date.now },
})

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  project: mongoose.Schema.Types.ObjectId,
  assignee: mongoose.Schema.Types.ObjectId,
  status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
  dueDate: Date,
  createdAt: { type: Date, default: Date.now },
})

const commentSchema = new mongoose.Schema({
  text: String,
  author: mongoose.Schema.Types.ObjectId,
  task: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
})

const activitySchema = new mongoose.Schema({
  action: String,
  user: mongoose.Schema.Types.ObjectId,
  team: mongoose.Schema.Types.ObjectId,
  taskId: mongoose.Schema.Types.ObjectId,
  description: String,
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.model("User", userSchema)
const Team = mongoose.model("Team", teamSchema)
const Project = mongoose.model("Project", projectSchema)
const Task = mongoose.model("Task", taskSchema)
const Comment = mongoose.model("Comment", commentSchema)
const Activity = mongoose.model("Activity", activitySchema)

// Auth Routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body
    const hashedPassword = await bcryptjs.hash(password, 10)

    const user = new User({
      name,
      email,
      password: hashedPassword,
    })

    await user.save()

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || "secret", {
      expiresIn: "24h",
    })

    res.json({ token, user: { id: user._id, name, email } })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || "secret", {
      expiresIn: "24h",
    })

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret")
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ error: "Invalid token" })
  }
}

// Team Routes
app.get("/api/teams", verifyToken, async (req, res) => {
  try {
    const teams = await Team.find({ members: req.userId })
    res.json(teams)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post("/api/teams", verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body
    const team = new Team({
      name,
      description,
      leader: req.userId,
      members: [req.userId],
    })

    await team.save()
    res.json(team)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Project Routes
app.get("/api/projects/:teamId", verifyToken, async (req, res) => {
  try {
    const projects = await Project.find({ team: req.params.teamId })
    res.json(projects)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post("/api/projects", verifyToken, async (req, res) => {
  try {
    const { name, description, team } = req.body
    const project = new Project({
      name,
      description,
      team,
      tasks: [],
    })

    await project.save()
    res.json(project)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Task Routes
app.get("/api/tasks/:projectId", verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
    res.json(tasks)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post("/api/tasks", verifyToken, async (req, res) => {
  try {
    const { title, description, project, assignee, dueDate } = req.body
    const task = new Task({
      title,
      description,
      project,
      assignee,
      dueDate,
    })

    await task.save()
    res.json(task)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.patch("/api/tasks/:id", verifyToken, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(task)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Comment Routes
app.post("/api/comments", verifyToken, async (req, res) => {
  try {
    const { text, task } = req.body
    const comment = new Comment({
      text,
      author: req.userId,
      task,
    })

    await comment.save()

    // Log activity
    const taskDoc = await Task.findById(task)
    const activity = new Activity({
      action: "comment_added",
      user: req.userId,
      taskId: task,
      team: taskDoc.team,
      description: `Added a comment on task`,
    })
    await activity.save()

    const populatedComment = await comment.populate("author", "name email")
    res.json(populatedComment)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.get("/api/comments/:taskId", verifyToken, async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId }).populate("author", "name email")
    res.json(comments)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.delete("/api/comments/:id", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id)
    res.json(comment)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Activity Feed Endpoints
app.get("/api/activity/:teamId", verifyToken, async (req, res) => {
  try {
    const activities = await Activity.find({ team: req.params.teamId })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(50)
    res.json(activities)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
