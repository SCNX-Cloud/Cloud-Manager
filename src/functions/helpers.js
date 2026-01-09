const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, PermissionFlagsBits } = require("discord.js");
const fs = require('fs');
const path = require('path');

const langCache = new Map();

async function createPagination(interaction, pages, timeout = 60000) {
    if (!pages || pages.length === 0) return;
    let currentPage = 0;

    const getRow = (index, disabled = false) => {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('◀ Zurück')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disabled || index === 0),
            new ButtonBuilder()
                .setCustomId('page_num')
                .setLabel(`${index + 1} / ${pages.length}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Weiter ▶')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disabled || index === pages.length - 1)
        );
    };

    const response = await interaction.reply({
        embeds: [pages[currentPage]],
        components: [getRow(currentPage)]
    });

    const collector = response.createMessageComponentCollector({ time: timeout });

    collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
            return i.reply({ content: "Nutze den Befehl selbst zum Blättern!", flags: [MessageFlags.Ephemeral] });
        }
        if (i.customId === 'prev' && currentPage > 0) currentPage--;
        if (i.customId === 'next' && currentPage < pages.length - 1) currentPage++;

        await i.update({
            embeds: [pages[currentPage]],
            components: [getRow(currentPage)]
        });
    });

    collector.on('end', () => {
        const disabledRow = getRow(currentPage, true);
        interaction.editReply({ components: [disabledRow] }).catch(() => {});
    });
}

/**
 * Holt einen String aus der JSON-Datei und ersetzt Platzhalter
 * @param {string} lang - Der Sprachcode (de, en, etc.)
 * @param {string} keyPath - Der Pfad im JSON (z.B. "help.title")
 * @param {object} variables - Variablen zum Ersetzen (z.B. { botName: "ScootKit" })
 */
function getString(lang, keyPath, variables = {}) {
    try {
        const filePath = path.join(__dirname, `../../locales/${lang}.json`);
        const finalLang = fs.existsSync(filePath) ? lang : 'en';
        const finalPath = path.join(__dirname, `../../locales/${finalLang}.json`);

        let langData;
        if (langCache.has(finalLang)) {
            langData = langCache.get(finalLang);
        } else {
            langData = JSON.parse(fs.readFileSync(finalPath, 'utf8'));
            langCache.set(finalLang, langData);
        }

        let text = keyPath.split('.').reduce((obj, key) => obj && obj[key], langData) || keyPath;

        if (typeof text === 'string') {
            Object.entries(variables).forEach(([key, value]) => {
                text = text.replaceAll(`{${key}}`, value);
            });
        }

        return text;
    } catch (e) {
        console.error(`Fehler in getString: ${keyPath}`, e);
        return keyPath;
    }
}

function getFullCommandList(commands, lang) {
    const list = [];
    if (!commands) return list;

    commands.forEach(cmd => {
        const name = cmd.name;
        // Wir suchen in der JSON unter commands.[name]
        const description = getString(lang, `commands.${name}`) || cmd.description;
        
        let emoji = "";
        if (cmd.defaultMemberPermissions) {
            const bitfield = BigInt(cmd.defaultMemberPermissions.bitfield);
            emoji = (bitfield & PermissionFlagsBits.Administrator) === PermissionFlagsBits.Administrator ? " 👑" : " 🛡️";
        }

        const hasOptions = cmd.options && cmd.options.length > 0;

        if (hasOptions && cmd.options.some(opt => opt.type === 1 || opt.type === 2)) {
            cmd.options.forEach(opt => {
                if (opt.type === 1) { // Subcommand
                    // Pfad: commands.[mainName].[subName]
                    const sDesc = getString(lang, `commands.${name}.${opt.name}`) || opt.description;
                    list.push({ name: `/${name} ${opt.name}${emoji}`, desc: sDesc });
                } else if (opt.type === 2) { // Gruppe
                    opt.options?.forEach(sub => {
                        const subDesc = getString(lang, `commands.${name}.${opt.name}.${sub.name}`) || sub.description;
                        list.push({ name: `/${name} ${opt.name} ${sub.name}${emoji}`, desc: subDesc });
                    });
                }
            });
        } else {
            list.push({ name: `/${name}${emoji}`, desc: description });
        }
    });

    return list.sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = { createPagination, getString, getFullCommandList };
