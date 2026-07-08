// Liste des fichiers à charger automatiquement depuis le dossier /data/
const fichiersData = ['chaussures.json', 'pantalon.json', 'pulls.json', 'tshirts.json', 'vestes.json']; 

let produits = [];

// Fonction pour charger et fusionner tous les fichiers JSON
async function chargerDonnees() {
    for (const fichier of fichiersData) {
        try {
            console.log(`Chargement de : ${fichier}`);
            const reponse = await fetch(`data/${fichier}`);
            if (!reponse.ok) throw new Error(`Erreur HTTP : ${reponse.status}`);
            const data = await reponse.json();
            produits = produits.concat(data);
        } catch (err) {
            console.error(`Erreur critique sur ${fichier}:`, err);
        }
    }
    console.log("Total produits chargés :", produits.length);
    
    // Initialisation : Remplir les marques et afficher tout
    mettreAJourMenuMarques();
    afficherProduits();
}

// Fonction pour remplir dynamiquement le menu déroulant "Marques"
function mettreAJourMenuMarques() {
    const select = document.getElementById("filtreMarques");
    const categorieActive = document.getElementById("filtreCategorie").value;
    
    // On filtre les produits par catégorie pour n'afficher que les marques pertinentes
    const produitsFiltres = categorieActive === "all" 
        ? produits 
        : produits.filter(p => p.categorie === categorieActive);

    // Récupérer les marques uniques (propriété 'Marques' de votre JSON)
    // On utilise le ?. (Optional Chaining) pour éviter de planter si la propriété manque sur un produit
    const marquesUniques = [...new Set(produitsFiltres.map(p => p.Marques).filter(Boolean))];
    
    // Trier les marques par ordre alphabétique
    marquesUniques.sort((a, b) => a.localeCompare(b));

    // Vider et reconstruire le menu déroulant
    select.innerHTML = '<option value="all">Toutes les marques</option>';
    marquesUniques.forEach(marque => {
        select.innerHTML += `<option value="${marque}">${marque}</option>`;
    });
}

// Fonction principale d'affichage avec regroupement par catégorie
function afficherProduits() {
    const conteneur = document.getElementById("liste-produits");
    // Valeurs des filtres
    const recherche = document.getElementById("searchInput").value.toLowerCase();
    const categorieSelectionnee = document.getElementById("filtreCategorie").value;
    const marqueSelectionnee = document.getElementById("filtreMarques").value;
    
    conteneur.innerHTML = ""; 

    // 1. Filtrer les produits selon les critères
    const produitsFiltres = produits.filter(p => {
        // Vérification de sécurité minimale
        if (!p.nom || !p.image || !p.prix) return false;

        const matchCategorie = (categorieSelectionnee === "all" || p.categorie === categorieSelectionnee);
        // On autorise p.Marques à être vide (undefined/null) pour ne pas cacher le produit
        const matchMarque = (marqueSelectionnee === "all" || p.Marques === marqueSelectionnee);
        const matchRecherche = p.nom.toLowerCase().includes(recherche);

        return matchCategorie && matchMarque && matchRecherche;
    });

    // 2. Extraire les catégories uniques présentes dans les résultats filtrés
    const categoriesPresentes = [...new Set(produitsFiltres.map(p => p.categorie))];
    categoriesPresentes.sort();

    // 3. Afficher les produits section par section
    categoriesPresentes.forEach(cat => {
        // Ajouter le titre de la section
        conteneur.innerHTML += `<div class="category-section" style="grid-column: 1 / -1;"><h2 class="category-title">${cat}</h2></div>`;
        
        // Ajouter uniquement les produits de cette catégorie
        produitsFiltres.filter(p => p.categorie === cat).forEach(p => {
    // Affichage conditionnel de la marque si elle existe
    const marqueDisplay = p.Marques ? `<span class="brand-badge">${p.Marques}</span>` : "";

    // Ajout du produit avec le tracking GA4 sur l'ensemble de la carte
    // On utilise une balise <a> englobante pour rendre toute la carte cliquable
    conteneur.innerHTML += `
    <a href="${p.lienBBD}" 
       target="_blank" 
       class="card-link" 
       onclick="gtag('event', 'clic_produit', {'nom_produit': '${p.nom.replace(/'/g, "\\'")}', 'categorie': '${p.categorie}'});">
        <div class="card">
            <span class="price">${p.prix}</span>
            <img src="${p.image}" alt="${p.nom}" onerror="this.style.display='none'">
            
            <div class="card-content">
                <h3>${p.nom}</h3>
                <div class="card-infos">
                    <span class="category-badge">${p.categorie}</span>
                    ${marqueDisplay}
                </div>
            </div>
        </div>
    </a>`;
});
    });
}

const modal = document.getElementById("videoModal");
const btnTuto = document.querySelector(".highlight-link");
const spanClose = document.querySelector(".close");
const iframe = modal ? modal.querySelector("iframe") : null;

// Vérification que les éléments existent pour éviter les erreurs
if (btnTuto && modal) {
    btnTuto.onclick = (e) => { 
        e.preventDefault(); 
        modal.style.display = "block"; 
    };
}

if (spanClose && modal) {
    spanClose.onclick = () => { 
        modal.style.display = "none"; 
        
        // Coupe le son en réinitialisant la source de l'iframe
        if (iframe) {
            const src = iframe.src;
            iframe.src = "";
            iframe.src = src;
        }
    };
}

// Fermer la vidéo si on clique sur le fond noir
window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        if (iframe) {
            const src = iframe.src;
            iframe.src = "";
            iframe.src = src;
        }
    }
};

// --- Écouteurs d'événements ---

// Lancer le chargement au démarrage
chargerDonnees();

// 1. Quand on tape dans la recherche
document.getElementById("searchInput").addEventListener("input", afficherProduits);

// 2. Quand on change de catégorie principale
document.getElementById("filtreCategorie").addEventListener("change", () => {
    // Il faut mettre à jour le menu des marques ET réafficher les produits
    mettreAJourMenuMarques();
    afficherProduits();
});

// 3. Quand on change le filtre de marque
document.getElementById("filtreMarques").addEventListener("change", afficherProduits);