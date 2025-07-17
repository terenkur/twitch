# Twitch Streamer Site

This repository contains a minimal example of a site dedicated to a Twitch streamer.
It demonstrates how to combine several services:

- **Frontend**: deployed on Vercel (see `frontend/` folder).
- **Backend and bot**: Node.js service deployed on Render (see `backend/`).
- **Database**: Supabase for storing viewers, votes and roulette results.
- **Twitch API**: used for OAuth and reading chat messages.

## Backend

The backend uses `express` and `tmi.js` to run a Twitch chat bot. Votes are stored in Supabase.

Environment variables expected by `backend/index.js`:

```bash
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_KEY=<your-service-key>
TWITCH_BOT_USERNAME=bot_username
TWITCH_OAUTH_TOKEN=oauth:token
TWITCH_CHANNEL=channel_name
PORT=3001
```

For local development copy `.env.example` to `.env` and fill in your values.
The backend uses [dotenv](https://github.com/motdotla/dotenv) to load this file
automatically. On Render, define the same variables in the **Environment** tab
of your service settings.

Install dependencies and run locally:

```bash
cd backend
npm install
npm start
```

Deploy the backend on **Render** as a **Node** service.
Use `npm install` as the build command and `npm start` (or `node index.js`) as
the start command so Render runs the Express server instead of trying to launch
a Python app. Make sure to define the environment variables above in the Render
dashboard under **Environment**.

### API Endpoints

The backend exposes a few endpoints focused on managing votes:

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `POST` | `/vote`  | Record a vote. JSON body must contain `user` and `game`. |
| `GET`  | `/votes` | List all recorded votes. |
| `GET`  | `/games` | Returns vote counts aggregated by game. |

## Frontend

The `frontend/` folder can contain any Vercel-compatible frontend (for example, Next.js).
For brevity it only contains a placeholder file.
Deploy this folder on **Vercel**.
You can connect your GitHub repo to Vercel and set any required environment variables in
the project settings (such as the URL of your Render backend).

## Database schema

Create a table `votes` in Supabase with at least these columns:

- `id` – primary key
- `user` – Twitch user id
- `game` – text name of the voted game
- `created_at` – timestamp with default value `now()`

You can extend the schema to store roulette results and viewer history.

## Twitch OAuth

Register an application in the [Twitch Developer Console](https://dev.twitch.tv/console/apps).
Use the OAuth token for the bot account to connect to chat.

---

This repository provides only a starting point. Extend it with additional
functionality such as moderator views, YouTube playlists and roulette logic.
