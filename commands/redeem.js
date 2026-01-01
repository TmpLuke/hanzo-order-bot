import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

export default {
  data: new SlashCommandBuilder()
    .setName('redeem')
    .setDescription('Redeem your customer role with your order code'),

  async execute(interaction) {
    // Create beautiful embed matching the Edner style
    const embed = new EmbedBuilder()
      .setColor('#1db954')
      .setTitle('⭐ Claim Role | Hanzo ⭐')
      .setDescription(
        '🔧 You can automatically obtain the **Customer** role and access to the Customer section by utilizing the button below.\n\n' +
        '👇 Simply click **Customer Role** and enter your Order ID.'
      )
      .setThumbnail('https://www.hanzocheats.com/assets/hanzo-logo-DQM325gV.png')
      .setFooter({ text: 'Hanzo Marketplace • Secure Redemption' })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId('redeem_button')
      .setLabel('Customer Role')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('📦');

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false
    });
  },
};

// Handle button click - show modal
export async function handleRedeemButton(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('redeem_modal')
    .setTitle('🎫 Redeem Your Code');

  const codeInput = new TextInputBuilder()
    .setCustomId('redemption_code')
    .setLabel('Enter your Order ID')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('XXXX-XXXX-XXXX')
    .setRequired(true)
    .setMaxLength(14)
    .setMinLength(12);

  const row = new ActionRowBuilder().addComponents(codeInput);
  modal.addComponents(row);

  await interaction.showModal(modal);
}

// Handle modal submission - verify and redeem
export async function handleRedeemModal(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const code = interaction.fields.getTextInputValue('redemption_code').toUpperCase().trim();
    const userId = interaction.user.id;
    const username = interaction.user.tag;

    // Check if code exists and is valid
    const { data: redemption, error: fetchError } = await supabase
      .from('redemption_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (fetchError || !redemption) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#ef4444')
        .setTitle('❌ Invalid Code')
        .setDescription(
          '**The redemption code you entered is invalid.**\n\n' +
          'Please check:\n' +
          '• Code is entered correctly (including dashes)\n' +
          '• Code hasn\'t expired\n' +
          '• You copied it from your order email\n\n' +
          'Need help? Contact support!'
        )
        .setFooter({ text: 'Hanzo Marketplace' })
        .setTimestamp();

      return await interaction.editReply({ embeds: [errorEmbed] });
    }

    // Check if already redeemed
    if (redemption.redeemed) {
      const alreadyRedeemedEmbed = new EmbedBuilder()
        .setColor('#f59e0b')
        .setTitle('⚠️ Already Redeemed')
        .setDescription(
          '**This code has already been redeemed.**\n\n' +
          `Redeemed by: <@${redemption.discord_user_id}>\n` +
          `Redeemed on: <t:${Math.floor(new Date(redemption.redeemed_at).getTime() / 1000)}:F>\n\n` +
          'Each code can only be used once for security.\n' +
          'If this wasn\'t you, please contact support immediately!'
        )
        .setFooter({ text: 'Hanzo Marketplace • Security Alert' })
        .setTimestamp();

      return await interaction.editReply({ embeds: [alreadyRedeemedEmbed] });
    }

    // Mark as redeemed
    const { error: updateError } = await supabase
      .from('redemption_codes')
      .update({
        redeemed: true,
        redeemed_at: new Date().toISOString(),
        discord_user_id: userId,
        discord_username: username
      })
      .eq('code', code);

    if (updateError) {
      throw updateError;
    }

    // Get customer role from config or use default
    const customerRoleId = config.customerRoleId || process.env.CUSTOMER_ROLE_ID;

    if (customerRoleId && interaction.guild) {
      try {
        const member = await interaction.guild.members.fetch(userId);
        await member.roles.add(customerRoleId);
      } catch (roleError) {
        console.error('Error adding role:', roleError);
        // Continue even if role assignment fails
      }
    }

    // Success embed
    const successEmbed = new EmbedBuilder()
      .setColor('#10b981')
      .setTitle('✅ Role Claimed Successfully!')
      .setDescription(
        '**Welcome to the Hanzo family!**\n\n' +
        `**Order:** \`${redemption.order_number}\`\n` +
        `**Product:** ${redemption.product_name}\n` +
        `**Variant:** ${redemption.variant_label}\n\n` +
        '**You now have access to:**\n' +
        '✅ Customer role\n' +
        '✅ Exclusive customer channels\n' +
        '✅ Priority support\n' +
        '✅ Special deals and updates\n\n' +
        'Thank you for your purchase! 🎉'
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setFooter({ text: 'Hanzo Marketplace • Role Claimed' })
      .setTimestamp();

    await interaction.editReply({ embeds: [successEmbed] });

    // Send log to redeem logs channel
    await sendRedeemLog(interaction, redemption, code);

  } catch (error) {
    console.error('Redemption error:', error);

    const errorEmbed = new EmbedBuilder()
      .setColor('#ef4444')
      .setTitle('❌ Redemption Failed')
      .setDescription(
        '**An error occurred while processing your redemption.**\n\n' +
        'Please try again in a moment.\n' +
        'If the problem persists, contact support with your order number.\n\n' +
        `Error: ${error.message || 'Unknown error'}`
      )
      .setFooter({ text: 'Hanzo Marketplace' })
      .setTimestamp();

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    } catch (replyError) {
      console.error('Error sending error message:', replyError);
    }
  }
}

// Send log to redeem logs channel
async function sendRedeemLog(interaction, redemption, code) {
  try {
    const logChannelId = config.redeemLogsChannelId || process.env.REDEEM_LOGS_CHANNEL_ID;

    if (!logChannelId) {
      console.log('No redeem logs channel configured');
      return;
    }

    const logChannel = await interaction.client.channels.fetch(logChannelId);

    if (!logChannel) {
      console.log('Redeem logs channel not found');
      return;
    }

    const logEmbed = new EmbedBuilder()
      .setColor('#667eea')
      .setTitle('🎫 New Redemption')
      .addFields(
        { name: '👤 User', value: `<@${interaction.user.id}>\n${interaction.user.tag}`, inline: true },
        { name: '📧 Email', value: redemption.customer_email, inline: true },
        { name: '🎮 Product', value: redemption.product_name, inline: false },
        { name: '⏱️ Variant', value: redemption.variant_label, inline: true },
        { name: '🔢 Order', value: redemption.order_number, inline: true },
        { name: '🎫 Code', value: `\`${code}\``, inline: true }
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setFooter({ text: 'Hanzo Marketplace • Redeem Logs' })
      .setTimestamp();

    await logChannel.send({ embeds: [logEmbed] });
  } catch (error) {
    console.error('Error sending redeem log:', error);
  }
}
