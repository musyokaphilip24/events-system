const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// In-memory data store (for demonstration)
let events = [
  {
    id: 1,
    title: "USIU Tech Conference 2024",
    description: "Annual technology conference",
    date: "2024-09-15",
    location: "USIU Auditorium",
    capacity: 500,
    registered: 245
  },
  {
    id: 2,
    title: "Career Fair",
    description: "Meet potential employers",
    date: "2024-10-01",
    location: "USIU Main Hall",
    capacity: 300,
    registered: 178
  }
];

let clubs = [
  {
    id: 1,
    name: "Computer Science Club",
    description: "For CS enthusiasts",
    members: 120,
    president: "John Doe"
  },
  {
    id: 2,
    name: "Business Club",
    description: "Business networking and learning",
    members: 85,
    president: "Jane Smith"
  }
];

// Health check endpoint (important for CI/CD)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// API Routes
app.get('/api/events', (req, res) => {
  res.json({
    success: true,
    data: events,
    count: events.length
  });
});

app.get('/api/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  const event = events.find(e => e.id === eventId);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  
  res.json({
    success: true,
    data: event
  });
});

app.post('/api/events', (req, res) => {
  const { title, description, date, location, capacity } = req.body;
  
  // Basic validation
  if (!title || !description || !date || !location || !capacity) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }
  
  const newEvent = {
    id: Math.max(...events.map(e => e.id)) + 1,
    title,
    description,
    date,
    location,
    capacity: parseInt(capacity),
    registered: 0
  };
  
  events.push(newEvent);
  
  res.status(201).json({
    success: true,
    data: newEvent,
    message: 'Event created successfully'
  });
});

app.get('/api/clubs', (req, res) => {
  res.json({
    success: true,
    data: clubs,
    count: clubs.length
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 USIU Events API running on port ${PORT}`);
});

// Export for testing
module.exports = { app, server };