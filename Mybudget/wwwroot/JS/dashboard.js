// Point d'entrée s'exécute au chargement de la page 
async function init() {

    // Vérifier que l'utilisateur est connecté
    // checkAuth() est défini dans auth.js chargé avant ce fichier
    const user = await checkAuth();
    if (!user) return; // checkAuth redirige déjà vers login si non connecté

    // Afficher l'email de l'utilisateur dans la navbar
    document.getElementById("user-email").textContent = user.email;

    //  Charger les données en parallèle
    // Promise.all lance les deux fetch EN MÊME TEMPS
    // au lieu de les attendre l'un après l'autre — plus rapide !
    const [transactions, budgets] = await Promise.all([
        fetchTransactions(),
        fetchBudgets()
    ]);

    // Afficher les données
    afficherResume(transactions);
    afficherTransactions(transactions);
    afficherBudgets(budgets);
}

// Récupérer les transactions 
async function fetchTransactions() {
    try {
        const response = await fetch("/api/transactions", {
            credentials: "include"
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (err) {
        console.error("Erreur transactions:", err);
        return [];
    }
}

// Récupérer les budgets 
async function fetchBudgets() {
    try {
        const response = await fetch("/api/budgets", {
            credentials: "include"
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (err) {
        console.error("Erreur budgets:", err);
        return [];
    }
}

// Calculer et afficher le résumé (entrées, sorties, solde) 
function afficherResume(transactions) {

    // On sépare les entrées des sorties selon le montant
    // Montant positif = entrée, montant négatif = sortie
    const entrees = transactions
        .filter(t => t.montant > 0)
        .reduce((sum, t) => sum + t.montant, 0);
    // .reduce() additionne tous les montants
    // sum = accumulateur, t = transaction courante

    const sorties = transactions
        .filter(t => t.montant < 0)
        .reduce((sum, t) => sum + t.montant, 0);

    const solde = entrees + sorties;

    // Formater en euros
    const fmt = (val) => val.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR"
    });

    document.getElementById("total-entrees").textContent = fmt(entrees);
    document.getElementById("total-sorties").textContent = fmt(Math.abs(sorties));
    document.getElementById("solde").textContent = fmt(solde);

    // Colorer le solde selon positif/négatif
    const soldeEl = document.getElementById("solde");
    soldeEl.style.color = solde >= 0 ? "#198754" : "#dc3545";
}

// Afficher les 5 dernières transactions 
function afficherTransactions(transactions) {
    const tbody = document.getElementById("transactions-body");

    if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Aucune transaction</td></tr>`;
        return;
    }

    // On prend seulement les 5 premières (déjà triées par date DESC)
    const dernieres = transactions.slice(0, 5);

    tbody.innerHTML = dernieres.map(t => {
        // Formater la date
        const date = new Date(t.dateOperation).toLocaleDateString("fr-FR");

        // Formater le montant avec couleur
        const montantClass = t.montant >= 0 ? "montant-positif" : "montant-negatif";
        const montantStr = t.montant.toLocaleString("fr-FR", {
            style: "currency", currency: "EUR"
        });

        // Nom de la catégorie  t.categorie vient du Include() dans l'API
        const categorie = t.categorie ? t.categorie.nom : "—";

        return `
      <tr>
        <td>${date}</td>
        <td>${t.description || "—"}</td>
        <td>${categorie}</td>
        <td class="${montantClass}">${montantStr}</td>
      </tr>
    `;
    }).join(""); // .join("") colle tous les <tr> ensemble
}

// Afficher l'état des budgets
function afficherBudgets(budgets) {
    const container = document.getElementById("budgets-list");

    if (budgets.length === 0) {
        container.innerHTML = `<p class="text-muted text-center">Aucun budget défini</p>`;
        return;
    }

    container.innerHTML = budgets.map(b => {
        // Pourcentage consommé
        const pct = Math.min((b.depenseActuelle / b.plafond) * 100, 100);
        // Math.min(..., 100) pour ne pas dépasser 100%

        // Couleur selon le pourcentage
        let fillClass = "ok";
        if (pct >= 100) fillClass = "exceeded";
        else if (pct >= 75) fillClass = "warning";

        return `
      <div class="budget-item">
        <div class="budget-header">
          <span>${b.categorie ? b.categorie.nom : "Catégorie"}</span>
          <span>${b.depenseActuelle?.toLocaleString("fr-FR")} / ${b.plafond?.toLocaleString("fr-FR")} €</span>
        </div>
        <div class="budget-bar">
          <div class="budget-fill ${fillClass}" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
    }).join("");
}

// Lancer l'initialisation
init();