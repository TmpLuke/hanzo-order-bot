import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getOrderByNumber } from '../utils/supabase.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('order')
  .setDescription('View details of a specific order')
  .addStringOption(option =>
    option.setName('number')
      .setDescription('Order number (e.g., ORD-12345678)')
      .setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const orderNumber = interaction.options.getString('number');
    const order = await getOrderByNumber(orderNumber);

    const statusEmoji = order.status === 'completed' ? '✅' : 
                       order.status === 'pending' ? '⏳' : '❌';

    const embed = new EmbedBuilder()
      .setTitle(`${statusEmoji} Order ${order.order_number}`)
      .setColor(order.status === 'completed' ? 0x00ff00 : 0xffaa00)
      .setTimestamp(new Date(order.created_at));

    embed.addFields(
      { name: '📦 Product', value: order.product_name, inline: true },
      { name: '💰 Amount', value: `$${parseFloat(order.amount).toFixed(2)}`, inline: true },
      { name: '📊 Status', value: order.status, inline: true },
      { name: '👤 Customer Name', value: order.customer_name || 'N/A', inline: true },
      { name: '📧 Customer Email', value: order.customer_email, inline: true },
      { name: '💳 Payment Method', value: order.payment_method || 'N/A', inline: true }
    );

    if (order.variant_label) {
      embed.addFields({ name: '🎯 Variant', value: order.variant_label, inline: true });
    }

    if (order.payment_id) {
      embed.addFields({ name: '🔑 Payment ID', value: `\`${order.payment_id}\``, inline: false });
    }

    embed.addFields(
      { name: '📅 Created', value: new Date(order.created_at).toLocaleString(), inline: true },
      { name: '🔄 Updated', value: new Date(order.updated_at).toLocaleString(), inline: true }
    );

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error fetching order:', error);
    await interaction.editReply('❌ Order not found or error occurred.');
  }
}
