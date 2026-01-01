import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('Claim the ticket (staff only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    if (!interaction.channel.name.startsWith('ticket-')) {
      const embed = new EmbedBuilder()
        .setColor('#ef4444')
        .setTitle('❌ Not a Ticket')
        .setDescription('This command can only be used in ticket channels!')
        .setFooter({ text: 'Hanzo Marketplace' })
        .setTimestamp();

      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    try {
      // Update channel name to show claimed status
      const newName = `${interaction.channel.name}-claimed`;
      await interaction.channel.setName(newName);

      const embed = new EmbedBuilder()
        .setColor('#10b981')
        .setTitle('✅ Ticket Claimed')
        .setDescription(
          `**Claimed by:** ${interaction.user}\n\n` +
          `${interaction.user} is now handling this ticket.`
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: 'Hanzo Marketplace' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error claiming ticket:', error);
      
      const embed = new EmbedBuilder()
        .setColor('#ef4444')
        .setTitle('❌ Error')
        .setDescription('Failed to claim the ticket.')
        .setFooter({ text: 'Hanzo Marketplace' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
