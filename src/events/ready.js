const { Events, ActivityType, REST, Routes } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`✅ Eingeloggt als: ${client.user.tag}`);

    // Die Commands aus der Collection holen, die wir in index.js befüllt haben
    const commandsJSON = client.commands.map(command => command.data.toJSON());

    const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

    try {
      console.log("⌛ Registriere Slash Commands dynamisch...");
      
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commandsJSON }
      );

      console.log(`🚀 ${commandsJSON.length} Commands erfolgreich registriert!`);
    } catch (error) {
      console.error("❌ Fehler bei der Registrierung:", error);
    }
    
    await client.application.commands.fetch();

    client.user.setPresence({
      status: "online",
      activities: [{ name: "✨ SCNX Cloud", type: ActivityType.Custom }]
    });
  },
};
