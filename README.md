# Hanzo Marketplace Discord Bot

Discord bot for managing your Hanzo Marketplace store with slash commands.

## Features

- `/products` - View all products
- `/product <id>` - View product details
- `/orders` - View recent orders
- `/order <number>` - View order details
- `/updateorder` - Update order status
- `/stats` - View store statistics
- `/help` - Show all commands
- `/ping` - Check bot status

## Setup

1. Set environment variables in Railway:
   - `DISCORD_BOT_TOKEN`
   - `DISCORD_CLIENT_ID`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Deploy to Railway
3. Bot will automatically start

## Connected to Supabase

This bot connects directly to your Supabase database for 100% accurate, real-time data.
