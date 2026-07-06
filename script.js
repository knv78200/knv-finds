// Liste des fichiers à charger automatiquement depuis le dossier /data/
const fichiersData = ['chaussures.json', 'bas.json', 'pulls.json', 'tshirts.json', 'vestes.json']; 

let produits = [];

// Fonction pour charger et fusionner tous les fichiers JSON
async function chargerDonnees() {
    for (const fichier of fichiersData) {
        try {
            console.log(`Chargement de : ${fichier}`); // Vous verrez ça dans la console F12
            const reponse = await fetch(`data/${fichier}`);
            if (!reponse.ok) throw new Error(`Erreur HTTP : ${reponse.status}`);
            const data = await reponse.json();
            produits = produits.concat(data);
        } catch (err) {
            console.error(`Erreur critique sur ${fichier}:`, err);
        }
    }
    console.log("Total produits chargés :", produits.length);
    afficherProduits();
    mettreAJourMenuSousCategories(); // <--- AJOUTEZ CETTE LIGNE
}


function mettreAJourMenuSousCategories() {
    const select = document.getElementById("filtreSousCategorie");
    const categorieActive = document.getElementById("filtreCategorie").value;
    
    // On filtre les produits par catégorie avant de lister les sous-catégories
    const produitsFiltres = categorieActive === "all" 
        ? produits 
        : produits.filter(p => p.categorie === categorieActive);

    const sousCats = [...new Set(produitsFiltres.map(p => p.sousCategorie).filter(sc => sc))];
    
    select.innerHTML = '<option value="all">Toutes les sous-catégories</option>';
    sousCats.forEach(sc => {
        select.innerHTML += `<option value="${sc}">${sc}</option>`;
    });
}

// Ajoutez aussi cet écouteur pour rafraîchir les sous-catégories quand on change de catégorie principale
document.getElementById("filtreCategorie").addEventListener("change", mettreAJourMenuSousCategories);

function afficherProduits() {
    const conteneur = document.getElementById("liste-produits");
    const recherche = document.getElementById("searchInput").value.toLowerCase();
    const categorie = document.getElementById("filtreCategorie").value;
    
    // Récupération sécurisée du filtre de sous-catégorie
    const sousCatElement = document.getElementById("filtreSousCategorie");
    const sousCat = sousCatElement ? sousCatElement.value : "all";
    
    conteneur.innerHTML = ""; 

    produits.filter(p => {
        const matchCategorie = (categorie === "all" || p.categorie === categorie);
        const matchSousCat = (sousCat === "all" || !p.sousCategorie || p.sousCategorie === sousCat);
        const matchRecherche = (p.nom && p.nom.toLowerCase().includes(recherche));

        return matchCategorie && matchSousCat && matchRecherche;
    }).forEach(p => {
        if (!p.nom || !p.image || !p.prix) return; 

        conteneur.innerHTML += `
    <div class="card">
        <span class="price">${p.prix}</span>
        <img src="${p.image}" alt="${p.nom}" onerror="this.style.display='none'">
        <h3>${p.nom}</h3>
        <span class="category-badge">${p.categorie}</span> <a href="${p.lienBBD}" target="_blank" class="btn">Voir le lien</a>
    </div>`;
    });
}
// Lancer le chargement au démarrage
chargerDonnees();

// Écouteurs d'événements
// Rafraîchir quand on tape dans la recherche
document.getElementById("searchInput").addEventListener("input", afficherProduits);

// Rafraîchir les produits et le menu quand on change de catégorie
document.getElementById("filtreCategorie").addEventListener("change", () => {
    mettreAJourMenuSousCategories();
    afficherProduits();
});

// Rafraîchir les produits quand on change de sous-catégorie
document.getElementById("filtreSousCategorie").addEventListener("change", afficherProduits);