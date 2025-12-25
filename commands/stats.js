import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getOrderStats, getProducts } from '../utils/supabase.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('stats')
  .setDescription('View store statistics');

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const [orderStats, products] = await Promise.all([
      getOrderStats(),
      getProducts()
    ]);

    const embed = new EmbedBuilder()
      .setTitle('📊 Store Statistics')
      .setColor(config.embedColor)
      .setTimestamp();

    // Order statistics
    embed.addFields(
      { name: '📦 Total Orders', value: orderStats.totalOrders.toString(), inline: true },
      { name: '✅ Completed', value: orderStats.completedOrders.toString(), inline: true },
      { name: '⏳ Pending', value: orderStats.pendingOrders.toString(), inline: true },
      { name: '💰 Total Revenue', value: `$${orderStats.totalRevenue.toFixed(2)}`, inline: true },
      { name: '📈 Average Order', value: orderStats.totalOrders > 0 
        ? `$${(orderStats.totalRevenue / orderStats.totalOrders).toFixed(2)}` 
        : '$0.00', inline: true },
      { name: '🛒 Total Products', value: products.length.toString(), inline: true }
    );

    // Category breakdown
    const categoryCount = {
      cheats: products.filter(p => p.category === 'cheats').length,
      tools: products.filter(p => p.category === 'tools').length,
      accounts: products.filter(p => p.category === 'accounts').length,
    };

    embed.addFields({
      name: '📂 Products by Category',
      value: `**Cheats:** ${categoryCount.cheats}\n` +
             `**Tools:** ${categoryCount.tools}\n` +
             `**Accounts:** ${categoryCount.accounts}`,
      inline: false,
    });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error fetching stats:', error);
    await interaction.editReply('❌ Failed to fetch statistics.');
  }
}
