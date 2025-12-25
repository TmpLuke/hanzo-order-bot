import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getProductById } from '../utils/supabase.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('product')
  .setDescription('View detailed information about a specific product')
  .addStringOption(option =>
    option.setName('id')
      .setDescription('Product ID')
      .setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const productId = interaction.options.getString('id');
    const product = await getProductById(productId);

    const embed = new EmbedBuilder()
      .setTitle(`${product.name} ${product.is_featured ? '⭐' : ''}`)
      .setDescription(product.description || 'No description available')
      .setColor(config.embedColor)
      .setThumbnail(product.image_url)
      .setTimestamp();

    // Add basic info
    embed.addFields(
      { name: '📦 Category', value: product.category, inline: true },
      { name: '📊 Status', value: product.status || 'active', inline: true },
      { name: '🆔 Product ID', value: `\`${product.id}\``, inline: true }
    );

    // Add features
    if (product.features && product.features.length > 0) {
      embed.addFields({
        name: '✨ Features',
        value: product.features.map(f => `• ${f}`).join('\n').slice(0, 1024),
        inline: false,
      });
    }

    // Add variants
    if (product.product_variants && product.product_variants.length > 0) {
      const variantsText = product.product_variants
        .map(v => `**${v.label}:** $${v.price}`)
        .join('\n');
      
      embed.addFields({
        name: '💰 Pricing Options',
        value: variantsText,
        inline: false,
      });
    }

    // Add rating if available
    if (product.rating) {
      const stars = '⭐'.repeat(Math.round(product.rating));
      embed.addFields({
        name: '⭐ Rating',
        value: `${stars} ${product.rating}/5 (${product.reviews || 0} reviews)`,
        inline: false,
      });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error fetching product:', error);
    await interaction.editReply('❌ Product not found or error occurred.');
  }
}
