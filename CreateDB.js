require("dotenv").config();
const fs = require('fs')
const Discord = require('discord.js')
const client = new Discord.Client()

const db = require('./db.json')

client.login(process.env.TOKEN)

client.on('message', (message) => {
    const dbChann = '928597107441561610'
    if(message.channel.id == dbChann) {
        const content = message.content.split('-')
        const question = content[0]
        const response = content[1] || false
        if (db[question] || !response ) {
            message.react('❌')
            message.delete({timeout: 5000})
            return
        } else {
            message.react('✅')
            db[question] = response
            writeJsonFileUTF8("./db.json", db);
        }
        return
    }
    return
})

async function writeJsonFileUTF8(filename, content) {
    fs.writeFile(filename,
        JSON.stringify(content, null, 1), "utf8",
        (err) => {
            if (err) { console.log(err); }
        }
        );
}