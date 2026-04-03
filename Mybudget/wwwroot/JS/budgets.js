let categories = [];

// ── Point d'entrée ──
async function init() {
    const user = await checkAuth();
    if (!user) return;

    document.getElementById("user-email").textContent = user.email;

    // Charger catégories et budgets en parallèle
    await Promise.all([
        chargerCategories(),
        chargerBudgets()
    ]);

    // Mettre l'année courante par défaut
    document.getElementById("annee").value = new Date().getFullYear();

    // Mettre le mois courant par défaut
    document.getElementById("mois").value = new Date().getMonth() + 1;
}

// ── Charger les catégories pour le select ──
async function chargerCategories() {
    try {
        const response = await fetch("/api/categories", {
            credentials: "include"
        });
        if (!response.ok) return;

        categories = await response.json();

        const select = document.getElementById("category-id");
        categories.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.nom;
            select.appendChild(option);
        });

    } catch (err) {
        console.error("Erreur catégories:", err);
    }
}

// ── Charger les budgets ──
async function chargerBudgets() {
    try {
        const response = await fetch("/api/budgets", {
            credentials: "include"
        });
        if (!response.ok) return;

        const budgets = await response.json();

        // Pour chaque budget, calculer le montant dépensé
        // en filtrant les transactions de la même catégorie et du même mois
        const transactions = await fetchTransactions();
        afficherBudgets(budgets, transactions);

    } catch (err) {
        console.error("Erreur budgets:", err);
    }
}

// ── Récupérer les transactions pour calculer les dépenses ──
async function fetchTransactions() {
    try {
        const response = await fetch("/api/transactions", {
            credentials: "include"
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (err) {
        return [];
    }
}

// ── Afficher les budgets ──
function afficherBudgets(budgets, transactions) {
    const tbody = document.getElementById("budgets-body");

    if (budgets.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Aucun budget</td></tr>`;
        return;
    }

    const moisNoms = [
        "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];

    tbody.innerHTML = budgets.map(b => {

        // Calculer le montant dépensé pour cette catégorie ce mois-ci
        // On filtre les transactions négatives (dépenses) par categoryId et par mois/année
        const depense = transactions
            .filter(t =>
                t.categoryId === b.categoryId &&
                t.montant < 0 &&
                new Date(t.dateOperation).getMonth() + 1 === b.mois &&
                new Date(t.dateOperation).getFullYear() === b.annee
            )
            .reduce((sum, t) => sum + Math.abs(t.montant), 0);

        // Calculer le pourcentage consommé
        const pct = b.montantLimite > 0
            ? Math.min((depense / b.montantLimite) * 100, 100)
            : 0;

        // Couleur de la barre selon le pourcentage
        let fillClass = "ok";
        if (pct >= 100) fillClass = "exceeded";
        else if (pct >= 75) fillClass = "warning";

        const categorie = b.categorie ? b.categorie.nom : "—";

        return `
      <tr>
        <td>${categorie}</td>
        <td>${moisNoms[b.mois]} ${b.annee}</td>
        <td>${b.montantLimite.toLocaleString("fr-FR")} €</td>
        <td>${depense.toLocaleString("fr-FR")} €</td>
        <td style="min-width:120px">
          <div class="budget-bar">
            <div class="budget-fill ${fillClass}" style="width:${pct}%"></div>
          </div>
          <small class="text-muted">${Math.round(pct)}%</small>
        </td>
        <td>
          <button class="btn-edit"   onclick="ouvrirModification(${b.id})">Modifier</button>
          <button class="btn-delete" onclick="supprimerBudget(${b.id})">Supprimer</button>
        </td>
      </tr>
    `;
    }).join("");
}

// ── Ouvrir le modal pour AJOUTER ──
function ouvrirModal() {
    document.getElementById("budget-form").reset();
    document.getElementById("budget-id").value = "";
    document.getElementById("modal-title").textContent = "Ajouter un budget";
    document.getElementById("modal-alert").className = "alert d-none";
    document.getElementById("annee").value = new Date().getFullYear();
    document.getElementById("mois").value = new Date().getMonth() + 1;
    document.getElementById("modal-overlay").classList.add("open");
}

// ── Ouvrir le modal pour MODIFIER ──
async function ouvrirModification(id) {
    try {
        const response = await fetch(`/api/budgets/${id}`, {
            credentials: "include"
        });
        if (!response.ok) return;

        const b = await response.json();

        document.getElementById("budget-id").value = b.id;
        document.getElementById("category-id").value = b.categoryId;
        document.getElementById("mois").value = b.mois;
        document.getElementById("annee").value = b.annee;
        document.getElementById("montant-limite").value = b.montantLimite;
        document.getElementById("modal-title").textContent = "Modifier le budget";
        document.getElementById("modal-alert").className = "alert d-none";

        document.getElementById("modal-overlay").classList.add("open");

    } catch (err) {
        console.error(err);
    }
}

// ── Fermer le modal ──
function fermerModal() {
    document.getElementById("modal-overlay").classList.remove("open");
}

// ── Soumission du formulaire ──
document.getElementById("budget-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("budget-id").value;
    const categoryId = document.getElementById("category-id").value;
    const mois = parseInt(document.getElementById("mois").value);
    const annee = parseInt(document.getElementById("annee").value);
    const montantLimite = parseFloat(document.getElementById("montant-limite").value);

    // Validations
    if (!categoryId) {
        showModalAlert("Veuillez choisir une catégorie.", "danger");
        return;
    }
    if (!montantLimite || montantLimite <= 0) {
        showModalAlert("Le montant limite doit être supérieur à 0.", "danger");
        return;
    }

    const isModification = id !== "";
    const url = isModification ? `/api/budgets/${id}` : "/api/budgets";
    const method = isModification ? "PATCH" : "POST";

    const body = {
        CategoryId: parseInt(categoryId),
        Mois: mois,
        Annee: annee,
        MontantLimite: montantLimite
    };

    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            credentials: "include"
        });

        if (response.ok) {
            fermerModal();
            chargerBudgets();
        } else {
            const data = await response.json();
            showModalAlert(data.error || "Une erreur est survenue.", "danger");
        }

    } catch (err) {
        console.error(err);
        showModalAlert("Impossible de contacter le serveur.", "danger");
    }
});

// ── Supprimer un budget ──
async function supprimerBudget(id) {
    if (!confirm("Supprimer ce budget ?")) return;

    try {
        const response = await fetch(`/api/budgets/${id}`, {
            method: "DELETE",
            credentials: "include"
        });
        if (response.ok) chargerBudgets();
    } catch (err) {
        console.error(err);
    }
}

// ── Alerte dans le modal ──
function showModalAlert(message, type) {
    const alert = document.getElementById("modal-alert");
    alert.textContent = message;
    alert.className = `alert alert-${type}`;
}

// ── Lancer ──
init();