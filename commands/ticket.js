import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits, ChannelType, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { config } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Send the ticket panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      // Check if guild is available
      if (!interaction.guild) {
        return await interaction.reply({
          content: '❌ This command can only be used in a server!',
          flags: MessageFlags.Ephemeral
        });
      }

      // Fetch emojis from the guild with null safety
      const cartEmoji = interaction.guild.emojis.cache.find(e => e.id === '1453863295084658751') || '🛒';
      const supportEmoji = interaction.guild.emojis.cache.find(e => e.id === '1453863878101565582') || '👤';
      const resetEmoji = interaction.guild.emojis.cache.find(e => e.id === '1453864082611503105') || '🔄';
      const claimEmoji = interaction.guild.emojis.cache.find(e => e.id === '1453864437823045774') || '⭐';
      const cashappEmoji = interaction.guild.emojis.cache.find(e => e.id === '1453863389641183384') || '💚';
      const paypalEmoji = interaction.guild.emojis.cache.find(e => e.id === '1453863410088542271') || '💙';
      const cryptoEmoji = interaction.guild.emojis.cache.find(e => e.id === '1453863730306613340') || '🪙';

      // Create the main ticket panel embed
      const embed = new EmbedBuilder()
        .setColor('#1db954')
        .setTitle('🎫 Ticket Centre | Hanzo 🎫')
        .setDescription(
          'Please submit a ticket for any questions or concerns you may have. You can also use the ticket system to purchase any of Hanzo\'s Products. We appreciate your interest and look forward to assisting you promptly.\n\n' +
          '━━━ 💳 Payment Methods ━━━\n\n' +
          `> 💳 (Credit/Debit Cards)\n` +
          `> ${paypalEmoji} (Paypal, Friends & Family)\n` +
          `> ${cashappEmoji} (Cashapp)\n` +
          `> ${cryptoEmoji} (Cryptocurrencies, BTC, ETH, LTC & More)\n\n` +
          '⚡ https://hanzocheats.com/ ⚡'
        )
        .setThumbnail('https://www.hanzocheats.com/assets/hanzo-logo-DQM325gV.png')
        .setFooter({ text: 'Hanzo | Hanzocheats.com' })
        .setTimestamp();

      // Create dropdown menu with ticket options
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('ticket_select')
        .setPlaceholder('Select a topic')
        .addOptions([
          {
            label: 'Purchase',
            description: 'Click on this option to purchase a product!',
            value: 'purchase',
            emoji: cartEmoji.id ? { id: cartEmoji.id, name: cartEmoji.name } : '🛒'
          },
          {
            label: 'Support',
            description: 'Click on this option if you require support!',
            value: 'support',
            emoji: supportEmoji.id ? { id: supportEmoji.id, name: supportEmoji.name } : '👤'
          },
          {
            label: 'License Key HWID Reset',
            description: 'Click on this option if you need a Key Reset!',
            value: 'hwid_reset',
            emoji: resetEmoji.id ? { id: resetEmoji.id, name: resetEmoji.name } : '🔄'
          },
          {
            label: 'Claim Role / Key',
            description: 'Click here to claim your customer role!',
            value: 'claim_role',
            emoji: claimEmoji.id ? { id: claimEmoji.id, name: claimEmoji.name } : '⭐'
          }
        ]);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: 'Ticket panel sent!',
        flags: MessageFlags.Ephemeral
      });

      await interaction.channel.send({
        embeds: [embed],
        components: [row]
      });
    } catch (error) {
      console.error('Error executing ticket command:', error);

      const errorMessage = {
        content: '❌ There was an error sending the ticket panel!',
        flags: MessageFlags.Ephemeral
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  },
};
