import dotenv from 'dotenv';
// Load from bot/.env first, then fallback to parent .env
dotenv.config({ path: '.env' });
dotenv.config({ path: '../.env' });

export const config = {
  // Discord Bot Token
  token: process.env.DISCORD_BOT_TOKEN,
  
  // Discord Client ID (Application ID)
  clientId: process.env.DISCORD_CLIENT_ID,
  
  // Supabase Configuration
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  
  // Role & Channel Configuration
  customerRoleId: process.env.CUSTOMER_ROLE_ID,
  redeemLogsChannelId: process.env.REDEEM_LOGS_CHANNEL_ID,
  
  // Bot Configuration
  prefix: '!',
  embedColor: 0x00ff00,
};
