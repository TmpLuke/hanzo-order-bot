import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits } from 'discord.js';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { generateTranscript } from './transcriptGenerator.js';

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

// Helper function to check if a channel is a ticket
export async function isTicketChannel(channelId) {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('id')
      .eq('channel_id', channelId)
      .eq('status', 'open')
      .single();
    
    return !error && data !== null;
  } catch {
    return false;
  }
}

// Ticket configuration - reads from environment variables
const TICKET_CONFIG = {
  purchase: {
    categoryId: process.env.PURCHASE_CATEGORY_ID || null,
    emoji: '🛒',
    title: 'Purchase Information',
    color: '#1db954'
  },
  support: {
    categoryId: process.env.SUPPORT_CATEGORY_ID || null,
    emoji: '👤',
    title: 'Support Request',
    color: '#1db954'
  },
  hwid_reset: {
    categoryId: process.env.HWID_CATEGORY_ID || null,
    emoji: '🔄',
    title: 'License Key Reset',
    color: '#1db954'
  },
  claim_role: {
    categoryId: process.env.CLAIM_CATEGORY_ID || null,
    emoji: '⭐',
    title: 'Claim Role/Key',
    color: '#1db954'
  }
};

export async function handleTicketSelect(interaction) {
  const ticketType = interaction.values[0];
  
  // Show the appropriate modal based on ticket type
  const modal = createTicketModal(ticketType);
  await interaction.showModal(modal);
}

function createTicketModal(ticketType) {
  const modals = {
    purchase: createPurchaseModal(),
    support: createSupportModal(),
    hwid_reset: createHWIDResetModal(),
    claim_role: createClaimRoleModal()
  };
  
  return modals[ticketType];
}

function createPurchaseModal() {
  const modal = new ModalBuilder()
    .setCustomId('ticket_modal_purchase')
    .setTitle('Purchase Information');

  const productInput = new TextInputBuilder()
    .setCustomId('product')
    .setLabel('Which Product Do You Want To Purchase?')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Enter the product name...')
    .setRequired(true);

  const paymentInput = new TextInputBuilder()
    .setCustomId('payment')
    .setLabel('Which Payment Method Would You Like To Use?')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('PayPal, Crypto, etc...')
    .setRequired(true);

  const durationInput = new TextInputBuilder()
    .setCustomId('duration')
    .setLabel('Which Duration Are You Interested In?')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('1 month, 3 months, lifetime, etc...')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(productInput),
    new ActionRowBuilder().addComponents(paymentInput),
    new ActionRowBuilder().addComponents(durationInput)
  );

  return modal;
}

function createSupportModal() {
  const modal = new ModalBuilder()
    .setCustomId('ticket_modal_support')
    .setTitle('Support Request');

  const issueInput = new TextInputBuilder()
    .setCustomId('issue')
    .setLabel('What Can We Help With?')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Describe your issue in detail...')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(issueInput)
  );

  return modal;
}

function createHWIDResetModal() {
  const modal = new ModalBuilder()
    .setCustomId('ticket_modal_hwid_reset')
    .setTitle('License Key Reset');

  const productInput = new TextInputBuilder()
    .setCustomId('product')
    .setLabel('Product To Be Reset?')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Enter the product name...')
    .setRequired(true);

  const licenseInput = new TextInputBuilder()
    .setCustomId('license')
    .setLabel('What Is Your License Key?')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Enter your license key...')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(productInput),
    new ActionRowBuilder().addComponents(licenseInput)
  );

  return modal;
}

function createClaimRoleModal() {
  const modal = new ModalBuilder()
    .setCustomId('ticket_modal_claim_role')
    .setTitle('Claim Role/Key');

  const orderInput = new TextInputBuilder()
    .setCustomId('order')
    .setLabel('Order Number?')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Enter your order number...')
    .setRequired(true);

  const productInput = new TextInputBuilder()
    .setCustomId('product')
    .setLabel('Product Ordered And Duration')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Product name and duration...')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(orderInput),
    new ActionRowBuilder().addComponents(productInput)
  );

  return modal;
}

export async function handleTicketModalSubmit(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const modalId = interaction.customId;
  const ticketType = modalId.replace('ticket_modal_', '');
  
  try {
    // Create ticket channel
    const { channel, ticketNumber } = await createTicketChannel(interaction, ticketType);
    
    // Send ticket embed in the channel
    await sendTicketEmbed(channel, interaction, ticketType);
    
    // Store ticket in database
    await storeTicket(channel.id, interaction.user.id, ticketType, ticketNumber);
    
    await interaction.editReply({
      content: `✅ Ticket created! ${channel}`,
      ephemeral: true
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    await interaction.editReply({
      content: '❌ Failed to create ticket. Please contact an administrator.',
      ephemeral: true
    });
  }
}

async function createTicketChannel(interaction, ticketType) {
  const config = TICKET_CONFIG[ticketType];
  
  // Get the next ticket number from database
  const { data: lastTicket } = await supabase
    .from('tickets')
    .select('ticket_number')
    .order('ticket_number', { ascending: false })
    .limit(1)
    .single();
  
  const ticketNumber = (lastTicket?.ticket_number || 0) + 1;
  const username = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Map ticket types to readable names
  const typeNames = {
    purchase: 'purchase',
    support: 'support',
    hwid_reset: 'hwid',
    claim_role: 'claim'
  };
  
  const channelName = `${username}-${typeNames[ticketType]}`;

  const channel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: config.categoryId || null,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: interaction.client.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ],
  });

  return { channel, ticketNumber };
}

async function sendTicketEmbed(channel, interaction, ticketType) {
  const config = TICKET_CONFIG[ticketType];
  const fields = getTicketFields(interaction, ticketType);

  const embed = new EmbedBuilder()
    .setColor(config.color)
    .setTitle(`Ticket ${config.title}`)
    .setDescription(
      `Thanks ${interaction.user.username} for contacting the support team of **Hanzo**!\n` +
      `Please explain your case so we can help you as quickly as possible!`
    )
    .addFields(fields)
    .setFooter({ text: 'Hanzo | Hanzocheats.com' })
    .setTimestamp();

  const closeButton = new ButtonBuilder()
    .setCustomId('close_ticket')
    .setLabel('🔒 Close')
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(closeButton);

  await channel.send({
    content: `${interaction.user}`,
    embeds: [embed],
    components: [row]
  });
}

function getTicketFields(interaction, ticketType) {
  const fields = [];

  if (ticketType === 'purchase') {
    fields.push(
      { name: '1. Which Product Do You Want To Purchase?', value: interaction.fields.getTextInputValue('product') },
      { name: '2. Which Payment Method Would You Like To Use?', value: interaction.fields.getTextInputValue('payment') },
      { name: '3. Which Duration Are You Interested In?', value: interaction.fields.getTextInputValue('duration') }
    );
  } else if (ticketType === 'support') {
    fields.push(
      { name: 'What Can We Help With?', value: interaction.fields.getTextInputValue('issue') }
    );
  } else if (ticketType === 'hwid_reset') {
    fields.push(
      { name: 'Product To Be Reset?', value: interaction.fields.getTextInputValue('product') },
      { name: 'What Is Your License Key?', value: interaction.fields.getTextInputValue('license') }
    );
  } else if (ticketType === 'claim_role') {
    fields.push(
      { name: 'Order Number?', value: interaction.fields.getTextInputValue('order') },
      { name: 'Product Ordered And Duration', value: interaction.fields.getTextInputValue('product') }
    );
  }

  return fields;
}

async function storeTicket(channelId, userId, ticketType, ticketNumber) {
  try {
    await supabase.from('tickets').insert({
      channel_id: channelId,
      user_id: userId,
      ticket_type: ticketType,
      ticket_number: ticketNumber,
      status: 'open',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error storing ticket:', error);
  }
}

export async function handleCloseTicket(interaction) {
  // Check if in a ticket channel by checking database
  const isTicket = await isTicketChannel(interaction.channel.id);
  
  if (!isTicket) {
    const embed = new EmbedBuilder()
      .setColor('#ef4444')
      .setTitle('❌ Not a Ticket')
      .setDescription('This command can only be used in ticket channels!')
      .setFooter({ text: 'Hanzo | Hanzocheats.com' })
      .setTimestamp();

    return await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const channel = interaction.channel;
    
    // Generate transcript
    const transcript = await generateTranscript(channel);
    
    // Send transcript to logs channel
    await sendTranscriptToLogs(interaction.guild, channel, transcript);
    
    // Send transcript to user
    await sendTranscriptToUser(interaction.user, transcript);
    
    // Update ticket status in database
    await updateTicketStatus(channel.id, 'closed');
    
    await interaction.editReply({
      content: '✅ Ticket will be closed in 5 seconds...',
      ephemeral: true
    });
    
    setTimeout(async () => {
      await channel.delete();
    }, 5000);
  } catch (error) {
    console.error('Error closing ticket:', error);
    await interaction.editReply({
      content: '❌ Failed to close ticket.',
      ephemeral: true
    });
  }
}

async function sendTranscriptToLogs(guild, channel, transcript) {
  const logsChannelId = process.env.TRANSCRIPT_LOGS_CHANNEL_ID;
  if (!logsChannelId) return;

  const logsChannel = await guild.channels.fetch(logsChannelId);
  if (!logsChannel) return;

  await logsChannel.send({
    content: `📋 Transcript for ${channel.name}`,
    files: [{
      attachment: Buffer.from(transcript.html),
      name: `transcript-${channel.name}.html`
    }]
  });
}

async function sendTranscriptToUser(user, transcript) {
  try {
    await user.send({
      content: '📋 Here is your ticket transcript:',
      files: [{
        attachment: Buffer.from(transcript.html),
        name: `ticket-transcript.html`
      }]
    });
  } catch (error) {
    console.error('Could not send transcript to user:', error);
  }
}

async function updateTicketStatus(channelId, status) {
  try {
    await supabase
      .from('tickets')
      .update({ status, closed_at: new Date().toISOString() })
      .eq('channel_id', channelId);
  } catch (error) {
    console.error('Error updating ticket status:', error);
  }
}
