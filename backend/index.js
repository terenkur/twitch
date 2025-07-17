import express from 'express';
import tmi from 'tmi.js';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = process.env.PORT || 3001;

// Supabase initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
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

app.get('/', (req, res) => {
  res.send('Twitch bot is running');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
