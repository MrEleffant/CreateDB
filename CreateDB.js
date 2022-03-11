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
    const chann = "951237154225401866"
    // const tuto = new Discord.MessageEmbed()
    //     .setTitle('Commandes')
    //     .addFields(
    //         { name: "Créer une DB", value: `Allez dans <#${config.commande}> et tappez la commande \`?createdb [nom de votre choix]\`\n*Un channel et un role associé vous sera donné*` },
    //         { name: "Rejoindre une DB", value: `Allez dans <#${config.commande}> et tappez la commande \`?join [code de la DB]\`\nCe code devra vous être donné par le propriétaire de la DB\n*Un channel et un role associé vous sera donné*` },
    //     )
    //     .setColor('#4999dd')
    // const regles = new Discord.MessageEmbed()
    //     .setTitle('Règles')
    //     .addFields(
    //         { name: "1", value: `Traitez tout le monde avec respect. Aucun harcèlement, chasse aux sorcières, sexisme, racisme ou discours de haine ne sera toléré.` },
    //         { name: "2", value: `Pas de spam ni d'autopromotion (invitations de serveurs, publicités, etc.) sans l'autorisation d'un modérateur du serveur, y compris via les MP envoyés aux autres membres.` },
    //         { name: "3", value: `Si tu remarques quelque chose de contraire aux règles ou qui te met dans un sentiment d'insécurité, informe-en les modérateurs. Nous voulons que ce serveur soit accueillant pour tout le monde !` },
    //         { name: "4", value: `Pas de spam de DB, ou de requêtes sous peine d'être **ban et blacklist**` },
    //     )
    //     .setColor('#4999dd')
    // const premium = new Discord.MessageEmbed()
    //     .setTitle('Premium')
    //     .addFields(
    //         { name: "Fonctionnalité", value: `Permet de changer le code de la DB` },
    //         { name: "Obtention", value: `Soyez impliqué et utilisez l'extension` }
            
    //     )
    //     .setColor(client.channels.cache.get(chann).guild.roles.cache.get(config.premium).color)
    const install = new Discord.MessageEmbed()
        .setTitle('Guide d\'installation')
        .addFields(
            { name: "1", value: `Ajoutez l'extension chrome [Ajouter l'extension](https://chrome.google.com/webstore/detail/ctrlconverter/ijlnogmehhnikphdellobhngfdggfkjm?hl=fr&authuser=0)` },
            { name: "2", value: `Complétez l'installation` },
            { name: "Faculltatif", value: `Épinglez l'extension pour y avoir accès plus simplement` }
            
        )
        .setColor("#4999dd")

    const util = new Discord.MessageEmbed()
        .setTitle('Guide d\'utilisation')
        .addFields(
            { name: "1", value: `Complétez votre DB* voir <#938828626131054622>` },
            { name: "2", value: `Accédez à l'extension` },
            { name: "3", value: `Rentrez votre code de DB dans l'extension lorsqu'elle est terminée` },
            { name: "4", value: `Choisissez votre mode de fonctionnement:\nCtrl+C: remplacement du presse papier lors du copier` }
        )
        .setColor("#4999dd")
        .setFooter("DB: Base de donnée")

    client.channels.cache.get(chann).send(util)
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
                        if(message.member.roles.cache.has(config.premium)) {
                            commandes.addField("?code [code de 7 carractères]", `Permet de changer le code de la DB, Accessible seulement aux <@&${config.premium}>`)
                        }
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
                if (message.author.id != dbManager[code]?.owner && !message.member.permissions.has("ADMINISTRATOR")) {
                    message.channel.send('Désolé mais seul la personne qui a créé cette DB peut faire ça.')
                    return
                }
                message.guild.channels.cache.get(dbManager[code].channel).delete().catch(e => console.log(e))
                message.guild.roles.cache.get(dbManager[code].role).delete().catch(e => console.log(e))
                
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

            case "code": {
                if(message.channel.parentID != config.dbCat) break
                const code = message.channel.topic
                if (message.author.id != dbManager[code]?.owner) {
                    message.channel.send('Désolé mais seul la personne qui a créé cette DB peut faire ça.')
                    return
                }
                if(!message.member.roles.cache.has(config.premium)) {
                    message.channel.send('Désolé mais seul les premiums ont accès à cette commande.')
                    return    
                }

                if(!args[1] || args[1]?.length != 7) {
                    message.channel.send('Merci de me donner un nouveau code de DB de 7 carractères.')
                    return
                }
                const newcode  = args[1]
                if(fs.existsSync(`./db/${newcode}.json`)) {
                    message.channel.send('Désolé mais ce code de DB est déjà utilisé.')
                    return
                }
                dbManager[newcode] = dbManager[code]
                delete dbManager[code]
                writeJsonFileUTF8('./dbManager.json', dbManager);

                fs.rename(`./db/${code}.json`, `./db/${newcode}.json`, () => {
                    console.log('db renamed')
                })
                message.channel.setTopic(newcode)



                message.react("✅")
                message.channel.send(`Le nouveau code de la DB est \`${newcode}\``)
                break
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
            message.content.split("\n").forEach(ligne => {
                const content = ligne.split(dbManager[code].separator)
                if(!content[1]) return
                message.delete().catch(e => console.log(e))
                const question = content[0]?.trimEnd().trimStart()
                const response = content[1]?.trimEnd()?.trimStart() || false
                if (!response) {
                    message.channel.send("`"+question+"`>`"+response+"`").then(msg => {
                        msg.react('❌')
                    })
                    return
                } else {
                    if (db[question]) {
                        message.channel.send(`Ancienne réponse: \`${db[question]}\``)
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
