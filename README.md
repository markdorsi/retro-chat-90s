# RetroChat 90s - 1990s Style Chat Application

A fun, retro-styled chat application with a 1990s Trapper Keeper aesthetic! Built with Vite, Netlify Functions, and Netlify Blob storage.

## Features

- Real-time chat with multiple users
- 1990s retro Trapper Keeper styling with bright colors and geometric patterns
- Username selection
- Message persistence using Netlify Blob storage
- Online user tracking
- Automatic message polling every 2 seconds
- Responsive design

## Technology Stack

- **Frontend**: Vite (vanilla JavaScript)
- **Backend**: Netlify Functions
- **Storage**: Netlify Blob
- **Styling**: Custom CSS with 90s aesthetic

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Running Locally

To run the application locally with Netlify Dev (which provides access to Netlify Functions and Blobs):

```bash
npm run netlify:dev
```

This will start the development server at `http://localhost:8888`

### Running with Vite Only (without Netlify features)

If you just want to see the frontend:

```bash
npm run dev
```

Note: The chat functionality won't work without Netlify Functions running.

## Deployment

### Deploy to Netlify

1. Install Netlify CLI globally:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Initialize and deploy:
```bash
netlify init
netlify deploy --prod
```

Alternatively, you can connect your Git repository to Netlify for automatic deployments.

## Project Structure

```
retro-chat-app/
├── src/
│   ├── main.js          # Frontend application logic
│   └── style.css        # 90s retro styling
├── netlify/
│   └── functions/       # Netlify serverless functions
│       ├── join.js          # User join endpoint
│       ├── send-message.js  # Send message endpoint
│       └── get-messages.js  # Get messages endpoint
├── index.html           # Main HTML file
├── vite.config.js       # Vite configuration
├── netlify.toml         # Netlify configuration
└── package.json         # Project dependencies

```

## How It Works

1. **Login**: Users choose a username to join the chat
2. **Messaging**: Users can send messages that are stored in Netlify Blob storage
3. **Polling**: The frontend polls the server every 2 seconds for new messages
4. **User Tracking**: Active users are tracked (users inactive for 5+ minutes are removed)
5. **Storage**: All data (users and messages) is persisted in Netlify Blob storage

## API Endpoints

- `POST /.netlify/functions/join` - Join the chat with a username
- `POST /.netlify/functions/send-message` - Send a new message
- `GET /.netlify/functions/get-messages?since={timestamp}` - Get messages since timestamp

## Styling

The application features authentic 1990s aesthetics including:
- Bright gradient backgrounds (pink, cyan, yellow)
- Comic Sans MS font
- Bold borders and shadows
- Geometric shapes (triangles, circles, squares)
- Animated gradient backgrounds
- Trapper Keeper-inspired color schemes

Enjoy chatting in retro style!
