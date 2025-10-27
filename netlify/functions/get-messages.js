import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const since = parseInt(url.searchParams.get('since') || '0', 10);

    // Get the blob store
    const store = getStore('retro-chat');

    // Get messages
    let messages = [];
    try {
      const messagesData = await store.get('messages', { type: 'json' });
      if (messagesData) {
        messages = messagesData;
      }
    } catch (error) {
      console.log('No messages found');
    }

    // Filter messages if since parameter provided
    if (since > 0) {
      messages = messages.filter(m => m.timestamp > since);
    }

    // Get online users count
    let onlineUsers = 0;
    try {
      const usersData = await store.get('users', { type: 'json' });
      if (usersData) {
        const now = Date.now();
        const fiveMinutesAgo = now - (5 * 60 * 1000);
        // Clean up old users
        const activeUsers = usersData.filter(u => u.lastSeen > fiveMinutesAgo);
        onlineUsers = activeUsers.length;

        // Save cleaned up users list
        if (activeUsers.length !== usersData.length) {
          await store.setJSON('users', activeUsers);
        }
      }
    } catch (error) {
      console.log('Could not get users');
    }

    return new Response(
      JSON.stringify({
        messages: messages,
        onlineUsers: onlineUsers,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Get messages error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get messages' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
