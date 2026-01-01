import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a user to the ticket')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to add to the ticket')
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
      await interaction.channel.permissionOverwrites.create(member, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });

      const embed = new EmbedBuilder()
        .setColor('#10b981')
        .setTitle('✅ User Added')
        .setDescription(`${user} has been added to this ticket by ${interaction.user}`)
        .setThumbnail(user.displayAvatarURL())
        .setFooter({ text: 'Hanzo Marketplace' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error adding user:', error);
      
      const embed = new EmbedBuilder()
        .setColor('#ef4444')
        .setTitle('❌ Error')
        .setDescription('Failed to add user to the ticket.')
        .setFooter({ text: 'Hanzo Marketplace' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
