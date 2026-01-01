export async function generateTranscript(channel) {
  const messages = await fetchAllMessages(channel);
  const html = generateHTML(channel, messages);
  
  return {
    html,
    messageCount: messages.length
  };
}

async function fetchAllMessages(channel) {
  let allMessages = [];
  let lastId;

  while (true) {
    const options = { limit: 100 };
    if (lastId) {
      options.before = lastId;
    }

    const messages = await channel.messages.fetch(options);
    allMessages.push(...messages.values());

    if (messages.size < 100) {
      break;
    }

    lastId = messages.last().id;
  }

  return allMessages.reverse();
}

function generateHTML(channel, messages) {
  const messagesHTML = messages.map(msg => generateMessageHTML(msg)).join('\n');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket Transcript - ${channel.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #e4e4e4;
      padding: 20px;
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: #0f1419;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }

    .header {
      background: linear-gradient(135deg, #1db954 0%, #169c46 100%);
      padding: 30px;
      text-align: center;
      border-bottom: 3px solid #169c46;
    }

    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
      color: white;
    }

    .header p {
      font-size: 16px;
      color: rgba(255,255,255,0.9);
    }

    .info-bar {
      background: #1a1f2e;
      padding: 20px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #2a2f3e;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .info-label {
      color: #8b8b8b;
      font-size: 14px;
    }

    .info-value {
      color: #ffffff;
      font-weight: 600;
      font-size: 14px;
    }

    .messages {
      padding: 30px;
      min-height: 400px;
    }

    .message {
      margin-bottom: 20px;
      padding: 15px;
      background: #1a1f2e;
      border-radius: 12px;
      border-left: 3px solid #1db954;
      transition: transform 0.2s;
    }

    .message:hover {
      transform: translateX(5px);
      background: #1f2533;
    }

    .message-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1db954 0%, #169c46 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: white;
      font-size: 18px;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .author {
      font-weight: 600;
      color: #ffffff;
      font-size: 16px;
    }

    .bot-badge {
      background: #1db954;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .timestamp {
      color: #8b8b8b;
      font-size: 13px;
      margin-left: auto;
    }

    .message-content {
      color: #e4e4e4;
      font-size: 15px;
      line-height: 1.6;
      word-wrap: break-word;
    }

    .embed {
      margin-top: 10px;
      border-left: 4px solid #1db954;
      background: #0f1419;
      border-radius: 8px;
      padding: 15px;
    }

    .embed-title {
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
      font-size: 16px;
    }

    .embed-description {
      color: #b9bbbe;
      font-size: 14px;
      margin-bottom: 10px;
    }

    .embed-field {
      margin-top: 10px;
    }

    .embed-field-name {
      font-weight: 600;
      color: #ffffff;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .embed-field-value {
      color: #b9bbbe;
      font-size: 14px;
    }

    .footer {
      background: #1a1f2e;
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #2a2f3e;
    }

    .footer p {
      color: #8b8b8b;
      font-size: 14px;
    }

    .footer a {
      color: #1db954;
      text-decoration: none;
      font-weight: 600;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .info-bar {
        flex-direction: column;
        gap: 15px;
      }

      .messages {
        padding: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Ticket Transcript</h1>
      <p>Channel: #${channel.name}</p>
    </div>

    <div class="info-bar">
      <div class="info-item">
        <span class="info-label">Channel:</span>
        <span class="info-value">#${channel.name}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Messages:</span>
        <span class="info-value">${messages.length}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Exported:</span>
        <span class="info-value">${new Date().toLocaleString()}</span>
      </div>
    </div>

    <div class="messages">
      ${messagesHTML}
    </div>

    <div class="footer">
      <p>Generated by <a href="https://hanzocheats.com">Hanzo Marketplace</a> • ${new Date().getFullYear()}</p>
      <p>This transcript contains ${messages.length} messages from #${channel.name}</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateMessageHTML(message) {
  const avatarInitial = message.author.username.charAt(0).toUpperCase();
  const avatarHTML = message.author.displayAvatarURL() 
    ? `<img src="${message.author.displayAvatarURL()}" alt="${message.author.username}">`
    : avatarInitial;

  const botBadge = message.author.bot ? '<span class="bot-badge">APP</span>' : '';
  
  const embedsHTML = message.embeds.map(embed => generateEmbedHTML(embed)).join('\n');

  return `
    <div class="message">
      <div class="message-header">
        <div class="avatar">${avatarHTML}</div>
        <span class="author">${escapeHTML(message.author.username)}</span>
        ${botBadge}
        <span class="timestamp">${message.createdAt.toLocaleString()}</span>
      </div>
      <div class="message-content">
        ${escapeHTML(message.content) || '<em>No content</em>'}
      </div>
      ${embedsHTML}
    </div>
  `;
}

function generateEmbedHTML(embed) {
  const fieldsHTML = embed.fields.map(field => `
    <div class="embed-field">
      <div class="embed-field-name">${escapeHTML(field.name)}</div>
      <div class="embed-field-value">${escapeHTML(field.value)}</div>
    </div>
  `).join('');

  return `
    <div class="embed">
      ${embed.title ? `<div class="embed-title">${escapeHTML(embed.title)}</div>` : ''}
      ${embed.description ? `<div class="embed-description">${escapeHTML(embed.description)}</div>` : ''}
      ${fieldsHTML}
    </div>
  `;
}

function escapeHTML(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}
