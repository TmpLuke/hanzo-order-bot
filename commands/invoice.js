import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

export default {
  data: new SlashCommandBuilder()
    .setName('invoice')
    .setDescription('Look up invoice information')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Order number, email, or Discord user')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const query = interaction.options.getString('query');

    try {
      let order = null;
      let redemption = null;

      // Try to find by order number first
      const { data: orderByNumber } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', query)
        .single();

      if (orderByNumber) {
        order = orderByNumber;
      } else {
        // Try by email
        const { data: ordersByEmail } = await supabase
          .from('orders')
          .select('*')
          .ilike('customer_email', `%${query}%`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (ordersByEmail && ordersByEmail.length > 0) {
          order = ordersByEmail[0];
        } else {
          // Try by Discord user ID (extract ID from mention)
          const userId = query.replace(/[<@!>]/g, '');
          const { data: redemptionByUser } = await supabase
            .from('redemption_codes')
            .select('*')
            .eq('discord_user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);

          if (redemptionByUser && redemptionByUser.length > 0) {
            redemption = redemptionByUser[0];
            
            // Get the order
            const { data: orderById } = await supabase
              .from('orders')
              .select('*')
              .eq('id', redemption.order_id)
              .single();

            if (orderById) {
              order = orderById;
            }
          }
        }
      }

      if (!order) {
        const notFoundEmbed = new EmbedBuilder()
          .setColor('#ef4444')
          .setTitle('❌ Invoice Not Found')
          .setDescription(
            '**No invoice found matching your query.**\n\n' +
            'Try searching by:\n' +
            '• Order number (e.g., `HNZ-12345`)\n' +
            '• Customer email\n' +
            '• Discord user mention\n\n' +
            'Make sure the order exists and is completed.'
          )
          .setFooter({ text: 'Hanzo Marketplace' })
          .setTimestamp();

        return await interaction.editReply({ embeds: [notFoundEmbed] });
      }

      // Get redemption info if not already fetched
      if (!redemption) {
        const { data: redemptionData } = await supabase
          .from('redemption_codes')
          .select('*')
          .eq('order_id', order.id)
          .single();

        redemption = redemptionData;
      }

      // Create beautiful invoice embed
      const invoiceEmbed = new EmbedBuilder()
        .setColor('#1db954')
        .setTitle('📄 Invoice Details')
        .setDescription(
          `**Order Number:** \`${order.order_number}\`\n` +
          `**Status:** ${order.status === 'completed' ? '✅ Completed' : '⏳ Pending'}`
        )
        .addFields(
          { name: '\u200B', value: '**Customer Information**', inline: false },
          { name: '👤 Name', value: order.customer_name || 'N/A', inline: true },
          { name: '📧 Email', value: order.customer_email, inline: true },
          { name: '📅 Purchase Date', value: `<t:${Math.floor(new Date(order.created_at).getTime() / 1000)}:F>`, inline: false },
          { name: '\u200B', value: '**Order Details**', inline: false },
          { name: '🎮 Product', value: order.product_name, inline: true },
          { name: '⏱️ Variant', value: order.variant_label || 'N/A', inline: true },
          { name: '💰 Amount Paid', value: `$${Number(order.amount).toFixed(2)}`, inline: true },
          { name: '\u200B', value: '**Payment Information**', inline: false },
          { name: '💳 Method', value: order.payment_method || 'N/A', inline: true },
          { name: '🆔 Transaction ID', value: order.payment_id ? `\`${order.payment_id.substring(0, 20)}...\`` : 'N/A', inline: true },
          { name: '\u200B', value: '\u200B', inline: true }
        )
        .setThumbnail('https://www.hanzocheats.com/assets/hanzo-logo-DQM325gV.png')
        .setFooter({ text: 'Hanzo Marketplace • Invoice System' })
        .setTimestamp();

      // Add redemption info if available
      if (redemption) {
        invoiceEmbed.addFields(
          { name: '\u200B', value: '**Redemption Status**', inline: false },
          { name: '🎫 Code', value: `\`${redemption.code}\``, inline: true },
          { name: '✅ Status', value: redemption.redeemed ? '✅ Redeemed' : '⏳ Not Redeemed', inline: true },
          { name: '\u200B', value: '\u200B', inline: true }
        );

        if (redemption.redeemed) {
          invoiceEmbed.addFields(
            { name: '👤 Redeemed By', value: redemption.discord_username ? `<@${redemption.discord_user_id}>\n${redemption.discord_username}` : 'N/A', inline: true },
            { name: '📅 Redeemed On', value: `<t:${Math.floor(new Date(redemption.redeemed_at).getTime() / 1000)}:R>`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true }
          );
        }
      }

      await interaction.editReply({ embeds: [invoiceEmbed] });

    } catch (error) {
      console.error('Invoice lookup error:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#ef4444')
        .setTitle('❌ Lookup Failed')
        .setDescription(
          '**An error occurred while looking up the invoice.**\n\n' +
          'Please try again in a moment.'
        )
        .setFooter({ text: 'Hanzo Marketplace' })
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
