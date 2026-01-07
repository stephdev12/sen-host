import StephUI from 'stephtech-ui';

export default { 
    name: 'testui',
    description: 'Test all UI components',
    
    async execute({ sock, msg  }) {
        const jid = msg.key.remoteJid;
        const ui = new StephUI(sock);

        try {
            // Test 1: Boutons simples
            await ui.buttons(jid, {
                text: "🎯 *TEST BOUTONS SIMPLES*\n\nChoisissez une option:",
                footer: "Steph UI Test",
                buttons: [
                    { id: ".option1", text: "✅ Option 1" },
                    { id: ".option2", text: "⭐ Option 2" },
                    { id: ".option3", text: "🔥 Option 3" }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 2000));

            // Test 2: Boutons avec image
            await ui.buttons(jid, {
                text: "🖼️ *TEST BOUTONS AVEC IMAGE*\n\nAvec une belle image:",
                footer: "Steph UI Test",
                image: "https://i.postimg.cc/gkBjFqvB/sukuna.jpg",
                buttons: [
                    { id: ".like", text: "❤️ J'aime" },
                    { id: ".share", text: "📤 Partager" }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 2000));

            // Test 3: Boutons URL
            await ui.urlButtons(jid, {
                text: "🔗 *TEST BOUTONS URL*\n\nCliquez pour visiter:",
                footer: "Steph UI Test",
                buttons: [
                    { text: "🌐 GitHub", url: "https://github.com" },
                    { text: "📺 YouTube", url: "https://youtube.com" }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 2000));

            // Test 4: Boutons mixtes
            await ui.mixedButtons(jid, {
                text: "🎨 *TEST BOUTONS MIXTES*\n\nMélange de boutons:",
                footer: "Steph UI Test",
                buttons: [
                    { id: ".info", text: "ℹ️ Info" },
                    { text: "🔗 Site Web", url: "https://example.com", type: "url" }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 2000));

            // Test 5: Liste
            await ui.list(jid, {
                text: "📋 *TEST LISTE*\n\nSélectionnez une catégorie:",
                title: "Menu Principal",
                buttonText: "📋 Voir le menu",
                footer: "Steph UI Test",
                sections: [
                    {
                        title: "🎮 Divertissement",
                        rows: [
                            { id: ".music", title: "🎵 Musique", description: "Écouter de la musique" },
                            { id: ".video", title: "🎬 Vidéos", description: "Regarder des vidéos" }
                        ]
                    },
                    {
                        title: "🛠️ Outils",
                        rows: [
                            { id: ".sticker", title: "🎨 Sticker", description: "Créer un sticker" },
                            { id: ".download", title: "📥 Download", description: "Télécharger du contenu" }
                        ]
                    }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 2000));

            // Test 6: Carousel
            await ui.carousel(jid, {
                header: "🎠 *TEST CAROUSEL*\n\n🔍 Query: test carousel\n\nFound 3 results 👇",
                cards: [
                    {
                        title: "Carte 1",
                        body: "👤 Auteur 1\n⏱️ 1:30\n❤️ 10K",
                        image: "https://i.postimg.cc/gkBjFqvB/sukuna.jpg",
                        buttons: [
                            { id: ".dl1", text: "📥 Télécharger" },
                            { text: "🔗 Voir", url: "https://example.com", type: "url" }
                        ]
                    },
                    {
                        title: "Carte 2",
                        body: "👤 Auteur 2\n⏱️ 2:15\n❤️ 25K",
                        image: "https://i.postimg.cc/gkBjFqvB/sukuna.jpg",
                        buttons: [
                            { id: ".dl2", text: "📥 Télécharger" }
                        ]
                    }
                ]
            });

            await sock.sendMessage(jid, { 
                text: "✅ *Tous les tests terminés !*\n\nSi tous les composants s'affichent correctement, Steph UI fonctionne parfaitement ! 🎉" 
            });

        } catch (error) {
            console.error('Erreur test UI:', error);
            await sock.sendMessage(jid, { 
                text: `❌ Erreur lors du test:\n${error.message}` 
            });
        }
    }
};