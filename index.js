import { Client, GatewayIntentBits, Collection, MessageFlags } from 'discord.js';
import { config } from './config.js';
import { registerCommands } from './deploy-commands.js';
import { loadCommands } from './utils/commandLoader.js';
import './healthcheck.js'; // Keep Railway happy

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Need this to read message content
  ],
});

// Initialize commands collection
client.commands = new Collection();

// Load all commands
loadCommands(client);

// Ready event
client.once('ready', async () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
  
  // Register commands on startup
  console.log('🔄 Registering ALL slash commands...');
  try {
    const { registerCommands } = await import('./deploy-commands.js');
    await registerCommands();
    console.log('✅ Commands registered successfully');
    console.log('✅ All ticket and redemption commands are now available!');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }

  // Set bot status
  client.user.setActivity('/ticket to open a ticket!', { type: 'PLAYING' });
});

// Handle interactions (commands, buttons, modals, select menus)
client.on('interactionCreate', async (interaction) => {
  // Handle slash commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}:`, error);

      const errorMessage = {
        content: '❌ There was an error executing this command!',
        flags: MessageFlags.Ephemeral,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  }

  // Handle button interactions
  if (interaction.isButton()) {
    try {
      if (interaction.customId === 'redeem_button') {
        const { handleRedeemButton } = await import('./commands/redeem.js');
        await handleRedeemButton(interaction);
      } else if (interaction.customId === 'close_ticket') {
        const { handleCloseTicket } = await import('./utils/ticketHandler.js');
        await handleCloseTicket(interaction);
      } else if (interaction.customId === 'get_all_alerts') {
        const { handleGetAllAlerts } = await import('./commands/updates.js');
        await handleGetAllAlerts(interaction);
      }
    } catch (error) {
      console.error(`Error handling button ${interaction.customId}:`, error);
    }
  }

  // Handle select menu interactions
  if (interaction.isStringSelectMenu()) {
    try {
      if (interaction.customId === 'ticket_select') {
        const { handleTicketSelect } = await import('./utils/ticketHandler.js');
        await handleTicketSelect(interaction);
      } else if (interaction.customId === 'updates_select') {
        const { handleUpdatesSelect } = await import('./commands/updates.js');
        await handleUpdatesSelect(interaction);
      }
    } catch (error) {
      console.error(`Error handling select menu ${interaction.customId}:`, error);
    }
  }

  // Handle modal submissions
  if (interaction.isModalSubmit()) {
    try {
      if (interaction.customId === 'redeem_modal') {
        const { handleRedeemModal } = await import('./commands/redeem.js');
        await handleRedeemModal(interaction);
      } else if (interaction.customId.startsWith('ticket_modal_')) {
        const { handleTicketModalSubmit } = await import('./utils/ticketHandler.js');
        await handleTicketModalSubmit(interaction);
      }
    } catch (error) {
      console.error(`Error handling modal ${interaction.customId}:`, error);
    }
  }
});

// Auto-react to messages in specific channel
client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Check if message is in the auto-react channel
  const AUTO_REACT_CHANNEL_ID = '1453498365005529241';

  if (message.channel.id === AUTO_REACT_CHANNEL_ID) {
    try {
      await message.react('👍');
      await message.react('👎');
    } catch (error) {
      console.error('Error adding reactions:', error);
    }
  }
});

// Login to Discord
client.login(config.token).catch((error) => {
  console.error('❌ Failed to login:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down bot...');
  client.destroy();
  process.exit(0);
});
