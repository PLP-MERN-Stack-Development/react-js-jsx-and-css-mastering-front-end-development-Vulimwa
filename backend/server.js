const express=require('express');
require('dotenv').config();
const app= express();
const logger=require('./src/middleware/logger');
const bodyParser = require('body-parser');
const connectDB = require('./src/config/db');
const cors = require('cors');

// Middlewares
app.use(logger);
app.use(cors());

// Parse JSON bodies only for POST, PUT, PATCH requests
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    express.json()(req, res, next);
  } else {
    next();
  }
});

// Error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      status: 400,
      message: "Invalid JSON format in request body" 
    });
  }
  next();
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the taskmanager API!');
});

// Import routes
const userRoutes = require('./src/routes/userRoutes');
const taskRoutes = require('./src/routes/taskRouter');
const commentRoutes = require('./src/routes/commentRouter');

// Use routes
app.use('/api', userRoutes);
app.use('/api', taskRoutes);
app.use('/api', commentRoutes);

connectDB().then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  });
});

module.exports=app