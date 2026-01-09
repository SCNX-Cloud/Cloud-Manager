const { SlashCommandBuilder, InteractionContextType, EmbedBuilder, MessageFlags } = require("discord.js");
const util = require("util");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("debug")
    .setDescription("Zeigt die Struktur der Interaction an")
    .setContexts([InteractionContextType.Guild]),

  async execute(interaction) {
    // 1. Das komplette Objekt in die Konsole loggen
    console.log("--- DEBUG INTERACTION START ---");
    console.log(util.inspect(interaction, { showHidden: false, depth: 1, colors: true }));
    console.log("--- DEBUG INTERACTION END ---");

    // 2. Wichtige Infos als Embed aufbereiten
    const debugEmbed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle("🔍 Interaction Debug")
      .addFields(
        { name: "Nutzer Locale", value: `\`${interaction.locale}\``, inline: true },
        { name: "Guild Locale", value: `\`${interaction.guildLocale || "N/A"}\``, inline: true },
        { name: "Command Name", value: `\`${interaction.commandName}\``, inline: true },
        { name: "Channel ID", value: `\`${interaction.channelId}\``, inline: true },
        { name: "User ID", value: `\`${interaction.user.id}\``, inline: true }
      )
      .setFooter({ text: "Check deine Konsole für das volle Objekt!" });

    await interaction.reply({
      embeds: [debugEmbed],
      flags: [MessageFlags.Ephemeral]
    });
  },
};
