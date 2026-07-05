// Liste des fichiers à charger automatiquement depuis le dossier /data/
const fichiersData = ['chaussures.json', 'bas.json', 'pulls.json', 'vestes.json']; 

let produits = [];

// Fonction pour charger et fusionner tous les fichiers JSON
async function chargerDonnees() {
    for (const fichier of fichiersData) {
        try {
            const reponse = await fetch(`data/${fichier}`);
            if (!reponse.ok) throw new Error(`Impossible de charger ${fichier}`);
            const data = await reponse.json();
            // On fusionne les produits dans notre liste globale
            produits = produits.concat(data);
        } catch (err) {
            console.error(`Erreur lors du chargement de ${fichier}:`, err);
        }
    }
    // Une fois tout chargé, on affiche les produits
    afficherProduits();
}

function afficherProduits() {
    const conteneur = document.getElementById("liste-produits");
    const recherche = document.getElementById("searchInput").value.toLowerCase();
    const categorie = document.getElementById("filtreCategorie").value;
    
    conteneur.innerHTML = ""; // Vide l'affichage actuel

    // Filtrage et affichage
    produits.filter(p => 
        (categorie === "all" || p.categorie === categorie) &&
        (p.nom && p.nom.toLowerCase().includes(recherche))
    ).forEach(p => {
        // Condition stricte : on n'affiche la carte QUE SI les infos nécessaires sont présentes
        if (!p.nom || !p.image || !p.prix) return; 

        conteneur.innerHTML += `
            <div class="card">
                <img src="${p.image}" alt="${p.nom}" onerror="this.style.display='none'">
                <h3>${p.nom}</h3>
                <p class="price">${p.prix}</p>
                <a href="${p.lienBBD}" target="_blank" class="btn">Voir le lien</a>
            </div>`;
    });
}

// Lancer le chargement au démarrage
chargerDonnees();

// Écouteurs d'événements
document.getElementById("searchInput").addEventListener("input", afficherProduits);
document.getElementById("filtreCategorie").addEventListener("change", afficherProduits);