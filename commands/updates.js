import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('updates')
    .setDescription('Send the product updates panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Create the main updates panel embed
    const embed = new EmbedBuilder()
      .setColor('#1db954')
      .setTitle('Hanzo Product Notifications')
      .setDescription(
        'Get instant status pings from Hanzo Software.\n\n' +
        '• Pick the products you want alerts for (Fortnite, Warzone, Apex, etc.)\n' +
        '• Or press **Get All Alerts** to subscribe to everything.\n\n' +
        '*You can update or remove these roles whenever you want.*'
      )
      .setImage('https://media.discordapp.net/attachments/1444039826545447027/1453524291046998190/Discord_Banner_Lower_Quality.png')
      .setFooter({ text: 'Hanzo Software • Instant Product Alerts' })
      .setTimestamp();

    // Create dropdown menu with product options
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('updates_select')
      .setPlaceholder('Select which alerts you want...')
      .setMinValues(1)
      .setMaxValues(17) // Total number of products
      .addOptions([
        {
          label: 'Valorant',
          description: 'Get alerts for Valorant updates',
          value: 'valorant',
          emoji: '⚡'
        },
        {
          label: 'Rust',
          description: 'Get alerts for Rust updates',
          value: 'rust',
          emoji: '🔨'
        },
        {
          label: 'Black Ops 6',
          description: 'Get alerts for Black Ops 6 updates',
          value: 'blackops6',
          emoji: '🎮'
        },
        {
          label: 'Rainbow Six Siege',
          description: 'Get alerts for Rainbow Six Siege updates',
          value: 'r6',
          emoji: '🎯'
        },
        {
          label: 'Apex Legends',
          description: 'Get alerts for Apex Legends updates',
          value: 'apex',
          emoji: '🔫'
        },
        {
          label: 'Delta Force',
          description: 'Get alerts for Delta Force updates',
          value: 'deltaforce',
          emoji: '🪖'
        },
        {
          label: 'Woofer',
          description: 'Get alerts for Woofer updates',
          value: 'woofer',
          emoji: '🐕'
        },
        {
          label: 'DayZ',
          description: 'Get alerts for DayZ updates',
          value: 'dayz',
          emoji: '🧟'
        },
        {
          label: 'PUBG',
          description: 'Get alerts for PUBG updates',
          value: 'pubg',
          emoji: '🪂'
        },
        {
          label: 'Marvel Rivals',
          description: 'Get alerts for Marvel Rivals updates',
          value: 'marvel',
          emoji: '🦸'
        },
        {
          label: 'Escape From Tarkov',
          description: 'Get alerts for Escape From Tarkov updates',
          value: 'tarkov',
          emoji: '💀'
        },
        {
          label: 'Fortnite',
          description: 'Get alerts for Fortnite updates',
          value: 'fortnite',
          emoji: '🏗️'
        },
        {
          label: 'Dune Awakening',
          description: 'Get alerts for Dune Awakening updates',
          value: 'dune',
          emoji: '🏜️'
        },
        {
          label: 'Battlefield',
          description: 'Get alerts for Battlefield updates',
          value: 'battlefield',
          emoji: '💥'
        },
        {
          label: 'Dead by Daylight',
          description: 'Get alerts for Dead by Daylight updates',
          value: 'dbd',
          emoji: '🔪'
        },
        {
          label: 'Hunt Showdown',
          description: 'Get alerts for Hunt Showdown updates',
          value: 'hunt',
          emoji: '🤠'
        },
        {
          label: 'Battlefield 6',
          description: 'Get alerts for Battlefield 6 updates',
          value: 'battlefield6',
          emoji: '🎖️'
        }
      ]);

    const selectRow = new ActionRowBuilder().addComponents(selectMenu);

    // Create "Get All Alerts" button
    const allAlertsButton = new ButtonBuilder()
      .setCustomId('get_all_alerts')
      .setLabel('📢 Get All Alerts')
      .setStyle(ButtonStyle.Primary);

    const buttonRow = new ActionRowBuilder().addComponents(allAlertsButton);

    await interaction.reply({
      content: 'Updates panel sent!',
      ephemeral: true
    });

    await interaction.channel.send({
      embeds: [embed],
      components: [selectRow, buttonRow]
    });
  },
};

// Handle select menu interaction
export async function handleUpdatesSelect(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const selectedProducts = interaction.values;
  const member = interaction.member;

  // Role mapping - UPDATE THESE WITH YOUR ACTUAL ROLE IDs
  const roleMap = {
    valorant: '1453498271665225769',
    rust: '1453498273120911473',
    blackops6: '1453498274869809386',
    r6: '1453498276031496344',
    apex: '1453498277096853594',
    deltaforce: '1453498278321717258',
    woofer: '1453498279462572042',
    dayz: '1453498280385314877',
    pubg: '1453498281643479104',
    marvel: '1453498282725867685',
    tarkov: '1453498283996614899',
    fortnite: '1453498286085247107',
    dune: '1453498287171698791',
    battlefield: '1453498288383856805',
    dbd: '1453498289797201942',
    hunt: '1453498291563270205',
    battlefield6: '1453498293316227105'
  };

  try {
    const rolesToAdd = [];
    const rolesToRemove = [];
    const allProductRoles = Object.values(roleMap);

    // Determine which roles to add and remove
    for (const [product, roleId] of Object.entries(roleMap)) {
      if (selectedProducts.includes(product)) {
        if (!member.roles.cache.has(roleId)) {
          rolesToAdd.push(roleId);
        }
      } else {
        if (member.roles.cache.has(roleId)) {
          rolesToRemove.push(roleId);
        }
      }
    }

    // Add selected roles
    if (rolesToAdd.length > 0) {
      await member.roles.add(rolesToAdd);
    }

    // Remove unselected roles
    if (rolesToRemove.length > 0) {
      await member.roles.remove(rolesToRemove);
    }

    const embed = new EmbedBuilder()
      .setColor('#1db954')
      .setTitle('✅ Your alert roles have been updated')
      .setDescription(
        `You will now receive alerts for:\n` +
        selectedProducts.map(p => {
          const names = {
            valorant: 'Valorant',
            rust: 'Rust',
            blackops6: 'Black Ops 6',
            r6: 'Rainbow Six Siege',
            apex: 'Apex Legends',
            deltaforce: 'Delta Force',
            woofer: 'Woofer',
            dayz: 'DayZ',
            pubg: 'PUBG',
            marvel: 'Marvel Rivals',
            tarkov: 'Escape From Tarkov',
            fortnite: 'Fortnite',
            dune: 'Dune Awakening',
            battlefield: 'Battlefield',
            dbd: 'Dead by Daylight',
            hunt: 'Hunt Showdown',
            battlefield6: 'Battlefield 6'
          };
          return `• ${names[p]}`;
        }).join('\n')
      )
      .setFooter({ text: 'Hanzo Software' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error updating roles:', error);
    
    const embed = new EmbedBuilder()
      .setColor('#ef4444')
      .setTitle('❌ Error')
      .setDescription('Failed to update your alert roles. Please contact an administrator.')
      .setFooter({ text: 'Hanzo Software' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}

// Handle "Get All Alerts" button
export async function handleGetAllAlerts(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const member = interaction.member;

  // Role mapping - UPDATE THESE WITH YOUR ACTUAL ROLE IDs
  const allRoles = [
    '1453498271665225769', // Valorant
    '1453498273120911473', // Rust
    '1453498274869809386', // Black Ops 6
    '1453498276031496344', // Rainbow Six Siege
    '1453498277096853594', // Apex Legends
    '1453498278321717258', // Delta Force
    '1453498279462572042', // Woofer
    '1453498280385314877', // DayZ
    '1453498281643479104', // PUBG
    '1453498282725867685', // Marvel Rivals
    '1453498283996614899', // Escape From Tarkov
    '1453498286085247107', // Fortnite
    '1453498287171698791', // Dune Awakening
    '1453498288383856805', // Battlefield
    '1453498289797201942', // Dead by Daylight
    '1453498291563270205', // Hunt Showdown
    '1453498293316227105'  // Battlefield 6
  ];

  try {
    await member.roles.add(allRoles);

    const embed = new EmbedBuilder()
      .setColor('#1db954')
      .setTitle('✅ Your alert roles have been updated')
      .setDescription('You will now receive alerts for **all products**!')
      .setFooter({ text: 'Hanzo Software' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error adding all roles:', error);
    
    const embed = new EmbedBuilder()
      .setColor('#ef4444')
      .setTitle('❌ Error')
      .setDescription('Failed to add all alert roles. Please contact an administrator.')
      .setFooter({ text: 'Hanzo Software' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}
