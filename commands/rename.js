import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('rename')
    .setDescription('Rename the ticket channel')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('New name for the ticket')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

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

    const newName = interaction.options.getString('name');
    const oldName = interaction.channel.name;

    try {
      await interaction.channel.setName(newName);

      const embed = new EmbedBuilder()
        .setColor('#1db954')
        .setTitle('✏️ Ticket Renamed')
        .setDescription(
          `**Old Name:** \`${oldName}\`\n` +
          `**New Name:** \`${newName}\`\n` +
          `**Renamed by:** ${interaction.user}`
        )
        .setFooter({ text: 'Hanzo Marketplace' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error renaming channel:', error);
      
      const embed = new EmbedBuilder()
        .setColor('#ef4444')
        .setTitle('❌ Error')
        .setDescription('Failed to rename the ticket channel.')
        .setFooter({ text: 'Hanzo Marketplace' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
