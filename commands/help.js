import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Show all available commands');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('🤖 Hanzo Bot Commands')
    .setDescription('Here are all available slash commands:')
    .setColor(config.embedColor)
    .setTimestamp();

  embed.addFields(
    {
      name: '🛒 Product Commands',
      value: '`/products [category]` - View all products (optional filter)\n' +
             '`/product <id>` - View detailed product information',
      inline: false,
    },
    {
      name: '📦 Order Commands',
      value: '`/orders [limit]` - View recent orders\n' +
             '`/order <number>` - View specific order details\n' +
             '`/updateorder <number> <status>` - Update order status',
      inline: false,
    },
    {
      name: '📊 Statistics',
      value: '`/stats` - View store statistics and analytics',
      inline: false,
    },
    {
      name: 'ℹ️ Other',
      value: '`/help` - Show this help message\n' +
             '`/ping` - Check bot latency',
      inline: false,
    }
  );

  embed.setFooter({ text: 'Hanzo Marketplace Bot' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
