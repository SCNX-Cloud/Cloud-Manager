const { SlashCommandBuilder, InteractionContextType, EmbedBuilder, blockQuote } = require("discord.js");
const { createPagination, getFullCommandList, getString } = require("../functions/helpers.js");
const c = require("../../config.json").colors;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show every commands")
    .setDescriptionLocalizations({ "de": "Zeigt alle Befehle an" })
    .setContexts([InteractionContextType.Guild]),

  async execute(interaction) {
    // Sprache ermitteln (Fallback auf 'en')
    const lang = interaction.locale.startsWith('de') ? 'de' : 'en';

    // Befehle aktiv von der API abrufen
    const fetchedCommands = await interaction.client.application.commands.fetch();
    
    // Befehlsliste generieren (nutzt intern getString für Beschreibungen)
    const allFullCommands = getFullCommandList(fetchedCommands, lang);
    
    const pages = [];
    const itemsPerPage = 6;

    // --- SEITE 1: STATISTIKEN ---
    const statsPage = new EmbedBuilder()
      .setColor(c.default || "#0099ff")
      // Nutzt getString für Titel und Beschreibungen aus der JSON
      .setTitle(`🔢 ${getString(lang, "help.title")}`) 
      .setDescription(blockQuote(getString(lang, "help.description")))
      .addFields(
        { 
            name: `📊 ${getString(lang, "help.stats_commands")}`, 
            value: `${allFullCommands.length}`, 
            inline: true 
        },
        { 
            name: `📡 ${getString(lang, "help.stats_ping")}`, 
            value: `${interaction.client.ws.ping}ms`, 
            inline: true 
        }
      )
      .setTimestamp();
    pages.push(statsPage);

    // --- BEFEHLSSEITEN GENERIEREN ---
    for (let i = 0; i < allFullCommands.length; i += itemsPerPage) {
      const currentBatch = allFullCommands.slice(i, i + itemsPerPage);
      
      const embed = new EmbedBuilder()
        .setColor(c.default || "#0099ff")
        .setTitle(`📄 ${getString(lang, "help.list_title")}`)
        .setTimestamp();

      currentBatch.forEach(cmd => {
        embed.addFields({ 
            name: cmd.name, 
            value: blockQuote(cmd.desc || getString(lang, "help.no_description")) 
        });
      });

      pages.push(embed);
    }

    // Helper aufrufen für Pagination und Button-Deaktivierung
    await createPagination(interaction, pages);
  },
};
