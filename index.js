const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const express = require('express');
const cors = require("cors");
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "authorization"],
  credentials: false,
  maxAge: 3600,
};
app.use(cors(corsOptions));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

// Collections für Commands vorbereiten
client.commands = new Collection();

/* =======================
   COMMAND LOADER
======================= */
const commandsPath = path.join(__dirname, "src/commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
const commandsJSON = [];

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
    commandsJSON.push(command.data.toJSON());
  }
}

/* =======================
   EVENT LOADER
======================= */
const eventsPath = path.join(__dirname, "src/events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

const botRouter = require('./src/routes/index.js')(client);

app.use('/', botRouter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Web-Server läuft auf Port ${PORT}`));


client.login(process.env.BOT_TOKEN);
