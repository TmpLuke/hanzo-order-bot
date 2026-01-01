# Hanzo Marketplace Discord Bot

Discord bot for managing your Hanzo Marketplace store with slash commands.

## Features

### Customer Commands
- `/redeem` - Redeem customer role with order code (beautiful embed + button)
- `/products` - View all products
- `/product <id>` - View product details
- `/help` - Show all commands
- `/ping` - Check bot status

### Staff Commands (Manage Messages permission required)
- `/invoice <query>` - Look up invoice by order number, email, or Discord user
- `/orders` - View recent orders
- `/order <number>` - View order details
- `/updateorder` - Update order status
- `/stats` - View store statistics

## Redemption System

Customers receive a unique redemption code in their order confirmation email. They can:
1. Join your Discord server
2. Run `/redeem` command
3. Click the "Redeem Code" button
4. Enter their code
5. Automatically receive the customer role

All redemptions are logged to a dedicated channel for tracking.

## Setup

1. Set environment variables in Railway:
   - `DISCORD_BOT_TOKEN`
   - `DISCORD_CLIENT_ID`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `CUSTOMER_ROLE_ID` (for role redemption)
   - `REDEEM_LOGS_CHANNEL_ID` (for redemption logs)

2. Deploy to Railway
3. Bot will automatically start

See `REDEMPTION_SYSTEM_SETUP.md` for detailed setup instructions.

## Connected to Supabase

This bot connects directly to your Supabase database for 100% accurate, real-time data.
