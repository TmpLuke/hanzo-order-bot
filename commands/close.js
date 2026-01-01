import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { handleCloseTicket } from '../utils/ticketHandler.js';

export default {
  data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Close the current ticket')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for closing the ticket')
        .setRequired(false)),

  async execute(interaction) {
    // Check if in a ticket channel
    if (!interaction.channel.name.startsWith('ticket-')) {
      const embed = new EmbedBuilder()
        .setColor('#ef4444')
        .setTitle('❌ Not a Ticket')
        .setDescription('This command can only be used in ticket channels!')
        .setFooter({ text: 'Hanzo Marketplace' })
        .setTimestamp();

      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const reason = interaction.options.getString('reason') || 'No reason provided';

    const embed = new EmbedBuilder()
      .setColor('#1db954')
      .setTitle('🔒 Closing Ticket')
      .setDescription(
        `**Closed by:** ${interaction.user}\n` +
        `**Reason:** ${reason}\n\n` +
        '📋 Generating transcript...\n' +
        '📧 Sending to user and logs...\n' +
        '⏱️ Channel will be deleted in 5 seconds...'
      )
      .setFooter({ text: 'Hanzo Marketplace' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Use the existing close handler
    await handleCloseTicket(interaction);
  },
};
