require("dotenv").config();
const fs = require('fs')
const Discord = require('discord.js');
const { exists } = require("update/lib/utils");
const client = new Discord.Client()
const config = require('./config.json')
const dbManager = require('./dbManager.json')
client.login(process.env.TOKEN)


client.on('ready', () => {
    console.log(client.user.username + " online")
    // const chann = "938828626131054622"
    // const tuto = new Discord.MessageEmbed()
    //     .setTitle('Commandes')
    //     .addFields(
    //         { name: "Créer une DB", value: `Allez dans <#${config.commande}> et tappez la commande \`?createdb [nom de votre choix]\`\n*Un channel et un role associé vous sera donné*` },
    //         { name: "Rejoindre une DB", value: `Allez dans <#${config.commande}> et tappez la commande \`?join [code de la DB]\`\nCe code devra vous être donné par le propriétaire de la DB\n*Un channel et un role associé vous sera donné*` },
    //     )
    //     .setColor('#4999dd')

    // client.channels.cache.get(chann).send(tuto)
})

client.on('message', async (message) => {
    if (message.author.bot) return
    if (message.content.startsWith(config.prefix)) {
        const commande = message.content.substring(config.prefix.length).trim()
        const args = commande.split(" ")
        switch (args[0]) {
            case "createdb": {
                if(message.channel.id != config.commande) break
                message.delete();
                // check si nom donné à la db
                if (!args[1]) {
                    message.reply('Il faut que tu me donnes un nom pour ta base de donnée\nRetape la commande: `?createdb NomDeTonChoix`')
                    return
                }
                // generation du code
                let code = generate()
                let path = `./db/${code}.json`
                while (exists(path)) {
                    code = generate()
                    path = `./db/${code}.json`
                }

                // creation du role
                const dbName = args[1]
                let roleID
                var randomColor = Math.floor(Math.random() * 16777215).toString(16);
                await message.guild.roles.create({
                    data: {
                        name: dbName,
                        color: '#' + randomColor,
                    }
                }).then(role => {
                    message.member.roles.add(role.id)
                    roleID = role.id
                })
                // creation du salon
                let chanId
                await message.guild.channels.create(dbName, {
                    topic: code,
                    parent: config.dbCat,
                    permissionOverwrites: [
                        {
                            id: message.guild.id,
                            deny: ['VIEW_CHANNEL']
                        },
                        {
                            id: roleID,
                            allow: ['VIEW_CHANNEL']
                        }
                    ]

                }).then(chann => {
                    chanId = chann
                    chann.send(`Bienvenue dans ta base de donnée <@${message.author.id}>, fait en bonne usage, Voilà un rappel des commandes:`)
                    //ajouter les commandes
                    const commandes = new Discord.MessageEmbed()
                        .setTitle('Create DB')
                        .setDescription(`Commandes`)
                        .addFields(
                            { name: "?add [tag/id]", value: "Ajouter quelqu'un à la DB" },
                            { name: "?remove [tag/id]", value: "Supprimer quelqu'un de la DB" },
                            { name: "?get", value: "Recevoir le json de la DB" },
                            { name: "?delete", value: "Supprimer la DB" },
                            { name: "?separator [sep]", value: "Permet de changer le séparateur\n`>` par défaut" },
                            { name: "?join [code]", value: "Permet de join une DB" }
                        )
                        .setColor('#4999dd')
                        .setTimestamp()
                        .setFooter("Code : " + code)
                    chann.send(commandes)
                })
                // envoi du code en mp
                const codeMp = new Discord.MessageEmbed()
                    .setTitle('Create DB')
                    .setDescription(`Voilà le code de ta base de donnée : \`${code}\`\n<#${chanId.id}>`)
                    .setColor('#4999dd')
                    .setTimestamp()
                message.author.send(codeMp).catch(e => {
                    chanId.send(`Je n'ai pas pu te communiquer ton code de base de donnée, mais tu peux le trouver dans le topic de ce salon.`)
                })
                //création de la db
                fs.writeFileSync(`./db/${code}.json`, JSON.stringify({}))

                // sauvegarde des données
                dbManager[code] = {
                    dbName: dbName,
                    channel: chanId.id,
                    owner: message.author.id,
                    role: roleID,
                    separator: ">"
                }
                writeJsonFileUTF8('./dbManager.json', dbManager);



                break;
            }

            case "delete": {
                if(message.channel.parentID != config.dbCat) break
                const code = message.channel.topic
                if (message.author.id != dbManager[code]?.owner) {
                    message.channel.send('Désolé mais seul la personne qui a créé cette DB peut faire ça.')
                    return
                }
                message.guild.channels.cache.get(dbManager[code].channel).delete()
                message.guild.roles.cache.get(dbManager[code].role).delete()
                
                delete dbManager[code]
                writeJsonFileUTF8('./dbManager.json', dbManager);
                
                try {
                    fs.unlinkSync(`./db/${code}.json`)
                    //file removed
                  } catch(err) {
                    console.error(err)
                  }
                break;
            }

            case "get": {
                if(message.channel.parentID != config.dbCat) break
                message.delete()
                message.channel.send({files: [`./db/${message.channel.topic}.json`]})
                break;
            }

            case "add": {
                if(message.channel.parentID != config.dbCat) break
                const code = message.channel.topic
                if (message.author.id != dbManager[code]?.owner) {
                    message.channel.send('Désolé mais seul la personne qui a créé cette DB peut faire ça.')
                    return
                }
                let target = message?.mentions?.users?.first() || args[1]
                if(!target){
                    message.reply('Merci de tagg ou de me donner un id valide')
                    return
                }
                message.guild.member(target).roles.add(dbManager[code].role)
                message.react("✅")
                break;
            }

            case "remove": {
                if(message.channel.parentID != config.dbCat) break
                const code = message.channel.topic
                if (message.author.id != dbManager[code]?.owner) {
                    message.channel.send('Désolé mais seul la personne qui a créé cette DB peut faire ça.')
                    return
                }
                let target = message?.mentions?.users?.first() || args[1]
                if(!target){
                    message.reply('Merci de tagg ou de me donner un id valide')
                    return
                }
                message.guild.member(target).roles.remove(dbManager[code].role)
                message.react("✅")
                break;
            }
            
            case "join": {
                if(message.channel.id != config.commande) break
                
                message.delete()
                const code=args[1]
                if(dbManager[code]) {
                    message.member.roles.add(dbManager[code].role)
                } 
                break;
            }

            case "separator": {
                if(message.channel.parentID != config.dbCat) break
                const code = message.channel.topic
                if (message.author.id != dbManager[code]?.owner) {
                    message.channel.send('Désolé mais seul la personne qui a créé cette DB peut faire ça.')
                    return
                }
                if(!args[1]) {
                    message.channel.send('Merci de me donner un séparateur')
                    return
                }
                
                dbManager[code].separator = args[1]
                writeJsonFileUTF8('./dbManager.json', dbManager);

                message.react("✅")
                message.channel.send(`Le nouveau séparateur est : \`${dbManager[code].separator}\``)
                break;
            }

            default: {
                break;
            }
        }

    } else {
        if (message.channel.parentID == config.dbCat) {
            const code = message.channel.topic
            const dbPath = `./db/${code}.json`
            if (!exists(dbPath)) {
                const content = {}
                fs.writeFileSync(dbPath, JSON.stringify(content))
            }
            const db = require(dbPath)
            message.delete()
            message.content.split("\n").forEach(ligne => {
                const content = ligne.split(dbManager[code].separator)
                const question = content[0].trimEnd().trimStart()
                const response = content[1].trimEnd().trimStart() || false
                if (!response) {
                    message.channel.send("`"+question+"`>`"+response+"`").then(msg => {
                        msg.react('❌')
                    })
                    message.delete({ timeout: 5000 })
                    return
                } else {
                    if (db[question]) {
                        message.channel.send(`Ancienne réponse: "${db[question]}"`)
                    }
                    db[question] = response
                    message.channel.send("`"+question+"`>`"+response+"`").then(msg => {
                        msg.react('✅')
                    })
                }
            })
            writeJsonFileUTF8(dbPath, db);
            return
        }
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

function generate(l) {
    if (typeof l === 'undefined') { var l = 8; }
    /* c : chaîne de caractères alphanumérique */
    var c = 'abcdefghijknopqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ12345679',
        n = c.length,
        /* p : chaîne de caractères spéciaux */
        p = '_',
        o = p.length,
        r = '',
        n = c.length,
        /* s : determine la position du caractère spécial dans le mdp */
        s = Math.floor(Math.random() * (p.length - 1));

    for (var i = 0; i < l; ++i) {
        if (s == i) {
            /* on insère à la position donnée un caractère spécial aléatoire */
            r += p.charAt(Math.floor(Math.random() * o));
        } else {
            /* on insère un caractère alphanumérique aléatoire */
            r += c.charAt(Math.floor(Math.random() * n));
        }
    }
    return r;
}
