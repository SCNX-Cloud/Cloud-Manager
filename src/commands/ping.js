const { SlashCommandBuilder, InteractionContextType, EmbedBuilder, MessageFlags } = require("discord.js");
const { getString } = require("../functions/helpers.js");
const c = require("../../config.json").colors;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Shows the ping from the bot")
    .setDescriptionLocalizations({ "de": "Zeigt den Ping vom Bot an" })
    .setContexts([InteractionContextType.Guild]),
    
  async execute(interaction) {
    const lang = interaction.locale.startsWith('de') ? 'de' : 'en';
    
    const title = getString(lang, "ping.title", { clientName: interaction.client.user.username });
    
    const embed = new EmbedBuilder()
      .setColor(c.default || "#0099ff")
      .setTitle(`📡 ${title}`)
      .setDescription(`${Math.round(interaction.client.ws.ping)}ms`)
      .setTimestamp();

    await interaction.reply({ 
      embeds: [embed], 
      flags: [MessageFlags.Ephemeral]
    });
  },
};
