import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { updateOrderStatus } from '../utils/supabase.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('updateorder')
  .setDescription('Update the status of an order')
  .addStringOption(option =>
    option.setName('number')
      .setDescription('Order number (e.g., ORD-12345678)')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('status')
      .setDescription('New status')
      .setRequired(true)
      .addChoices(
        { name: 'Pending', value: 'pending' },
        { name: 'Completed', value: 'completed' },
        { name: 'Cancelled', value: 'cancelled' },
        { name: 'Refunded', value: 'refunded' }
      ));

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const orderNumber = interaction.options.getString('number');
    const newStatus = interaction.options.getString('status');

    const updatedOrder = await updateOrderStatus(orderNumber, newStatus);

    const statusEmoji = newStatus === 'completed' ? '✅' : 
                       newStatus === 'pending' ? '⏳' : 
                       newStatus === 'cancelled' ? '❌' : '💸';

    const embed = new EmbedBuilder()
      .setTitle(`${statusEmoji} Order Updated`)
      .setDescription(`Order **${orderNumber}** has been updated to **${newStatus}**`)
      .setColor(newStatus === 'completed' ? 0x00ff00 : 
               newStatus === 'cancelled' ? 0xff0000 : 0xffaa00)
      .setTimestamp();

    embed.addFields(
      { name: '📦 Product', value: updatedOrder.product_name, inline: true },
      { name: '💰 Amount', value: `$${parseFloat(updatedOrder.amount).toFixed(2)}`, inline: true },
      { name: '📧 Customer', value: updatedOrder.customer_email, inline: true }
    );

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error updating order:', error);
    await interaction.editReply('❌ Failed to update order. Make sure the order number is correct.');
  }
}
