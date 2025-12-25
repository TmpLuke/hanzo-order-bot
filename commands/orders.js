import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getOrders } from '../utils/supabase.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('orders')
  .setDescription('View recent orders')
  .addIntegerOption(option =>
    option.setName('limit')
      .setDescription('Number of orders to display (max 25)')
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(25));

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const limit = interaction.options.getInteger('limit') || 10;
    const orders = await getOrders(limit);

    if (orders.length === 0) {
      return interaction.editReply('❌ No orders found.');
    }

    const embed = new EmbedBuilder()
      .setTitle('📦 Recent Orders')
      .setColor(config.embedColor)
      .setTimestamp();

    orders.forEach(order => {
      const statusEmoji = order.status === 'completed' ? '✅' : 
                         order.status === 'pending' ? '⏳' : '❌';
      
      embed.addFields({
        name: `${statusEmoji} ${order.order_number}`,
        value: `**Product:** ${order.product_name}\n` +
               `**Amount:** $${parseFloat(order.amount).toFixed(2)}\n` +
               `**Customer:** ${order.customer_email}\n` +
               `**Status:** ${order.status}\n` +
               `**Date:** ${new Date(order.created_at).toLocaleString()}`,
        inline: false,
      });
    });

    embed.setFooter({ text: `Showing ${orders.length} most recent orders` });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error fetching orders:', error);
    await interaction.editReply('❌ Failed to fetch orders.');
  }
}
