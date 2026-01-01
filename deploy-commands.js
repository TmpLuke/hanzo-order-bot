import { REST, Routes } from 'discord.js';
import { config } from './config.js';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function registerCommands() {
  const commands = [];
  const commandsPath = join(__dirname, 'commands');
  const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  // Load all command data
  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    try {
      const command = await import(`file://${filePath}`);
      const cmd = command.default || command;
      
      if ('data' in cmd && 'execute' in cmd) {
        commands.push(cmd.data.toJSON());
      }
    } catch (error) {
      console.error(`❌ Error loading command ${file}:`, error.message);
    }
  }

  // Construct and prepare an instance of the REST module
  const rest = new REST().setToken(config.token);

  try {
    console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

    // Register commands globally
    const data = await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands },
    );

    console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  registerCommands();
}
