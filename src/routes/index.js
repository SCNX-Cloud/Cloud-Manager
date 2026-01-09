const express = require('express');
const router = express.Router();

module.exports = (client) => {
    
    router.get("/", (req, res) => {
        const botName = client.user ? client.user.username : "Bot ist noch nicht bereit";
        res.json({ message: botName });
    });
    
    router.get("/commands", async (req, res) => {
        const fetchedCommands = await client.application.commands.fetch();
        res.json({ data: fetchedCommands });
    });

    return router;
};
