import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a user from the ticket')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to remove from the ticket')
        .setRequired(true))
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

    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id);

    try {
      await interaction.channel.permissionOverwrites.delete(member);

      const embed = new EmbedBuilder()
        .setColor('#f59e0b')
        .setTitle('🚫 User Removed')
        .setDescription(`${user} has been removed from this ticket by ${interaction.user}`)
        .setThumbnail(user.displayAvatarURL())
        .setFooter({ text: 'Hanzo Marketplace' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error removing user:', error);
      
      const embed = new EmbedBuilder()
        .setColor('#ef4444')
        .setTitle('❌ Error')
        .setDescription('Failed to remove user from the ticket.')
        .setFooter({ text: 'Hanzo Marketplace' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
