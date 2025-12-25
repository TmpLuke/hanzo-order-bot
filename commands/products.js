import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getProducts } from '../utils/supabase.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('products')
  .setDescription('View all available products')
  .addStringOption(option =>
    option.setName('category')
      .setDescription('Filter by category')
      .setRequired(false)
      .addChoices(
        { name: 'Cheats', value: 'cheats' },
        { name: 'Tools', value: 'tools' },
        { name: 'Accounts', value: 'accounts' }
      ));

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const category = interaction.options.getString('category');
    let products = await getProducts();

    if (category) {
      products = products.filter(p => p.category === category);
    }

    if (products.length === 0) {
      return interaction.editReply('❌ No products found.');
    }

    const embed = new EmbedBuilder()
      .setTitle(`🛒 ${category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Products'}`)
      .setColor(config.embedColor)
      .setTimestamp();

    products.slice(0, 10).forEach(product => {
      const variants = product.product_variants || [];
      const priceRange = variants.length > 0
        ? `$${Math.min(...variants.map(v => v.price))} - $${Math.max(...variants.map(v => v.price))}`
        : `$${product.price}`;

      embed.addFields({
        name: `${product.name} ${product.is_featured ? '⭐' : ''}`,
        value: `**Price:** ${priceRange}\n**Category:** ${product.category}\n**ID:** \`${product.id}\``,
        inline: true,
      });
    });

    if (products.length > 10) {
      embed.setFooter({ text: `Showing 10 of ${products.length} products` });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error fetching products:', error);
    await interaction.editReply('❌ Failed to fetch products.');
  }
}
