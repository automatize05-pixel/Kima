require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Kima API is running' });
});

// We will add more routes here
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/tasks', require('./routes/tasks.routes'));
app.use('/api/gamification', require('./routes/gamification.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

app.listen(PORT, () => {
  console.log(`Kima Backend running on port ${PORT}`);
});
