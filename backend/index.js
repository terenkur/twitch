import express from 'express';
import tmi from 'tmi.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from a local .env file if present
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

// Supabase initialization. Default to provided credentials if env vars are absent
const supabaseUrl =
  process.env.SUPABASE_URL || 'https://bsiiyuwbzhwrflsdpoud.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzaWl5dXdiemh3cmZsc2Rwb3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDIzMzUsImV4cCI6MjA2ODMxODMzNX0.2dGo45jMsUK4Zg8aoSc4kuXd2yBIpFfXgzvhw6zEQfU';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.log('Using default Supabase credentials from the code');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Twitch bot configuration
const twitchOptions = {
  options: { debug: true },
  connection: { reconnect: true, secure: true },
  identity: {
    username: process.env.TWITCH_BOT_USERNAME,
    password: process.env.TWITCH_OAUTH_TOKEN
  },
  channels: [process.env.TWITCH_CHANNEL]
};

const client = new tmi.Client(twitchOptions);

client.connect().catch(console.error);

client.on('message', async (channel, tags, message, self) => {
  if (self) return;
  // Basic command: !vote gameName
  if (message.startsWith('!vote')) {
    const [, game] = message.split(' ');
    if (!game) return;
    await supabase.from('votes').insert({ user: tags['user-id'], game });
    client.say(channel, `${tags.username} проголосовал за ${game}`);
  }
});

// --- REST API for database access ---
app.post('/vote', async (req, res) => {
  const { user, game } = req.body;
  if (!user || !game) {
    return res.status(400).json({ error: 'user and game required' });
  }
  const { error } = await supabase.from('votes').insert({ user, game });
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ message: 'Vote recorded' });
});

app.get('/votes', async (req, res) => {
  const { data, error } = await supabase.from('votes').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/games', async (req, res) => {
  const { data, error } = await supabase.from('votes').select('game');
  if (error) return res.status(500).json({ error: error.message });
  const counts = data.reduce((acc, row) => {
    acc[row.game] = (acc[row.game] || 0) + 1;
    return acc;
  }, {});
  res.json(counts);
});

app.get('/', (req, res) => {
  res.send('Twitch bot is running');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
