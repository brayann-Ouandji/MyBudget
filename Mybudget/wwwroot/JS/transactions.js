let categories = []; // stocke les catégories pour remplir le select

// ── Point d'entrée ──
async function init() {
    const user = await checkAuth();
    if (!user) return;

    document.getElementById("user-email").textContent = user.email;

    // Charger catégories et transactions en parallèle
    await Promise.all([
        chargerCategories(),
        chargerTransactions()
    ]);
}

// ── Charger les catégories pour le select du formulaire ──
async function chargerCategories() {
    try {
        const response = await fetch("/api/categories", {
            credentials: "include"
        });
        if (!response.ok) return;

        categories = await response.json();

        // Remplir le <select> avec les catégories
        const select = document.getElementById("categorie-id");
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

// ── Charger et afficher les transactions ──
async function chargerTransactions() {
    try {
        const response = await fetch("/api/transactions", {
            credentials: "include"
        });
        if (!response.ok) return;

        const transactions = await response.json();
        afficherTransactions(transactions);

    } catch (err) {
        console.error("Erreur transactions:", err);
    }
}

// ── Afficher les transactions dans le tableau ──
function afficherTransactions(transactions) {
    const tbody = document.getElementById("transactions-body");

    if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Aucune transaction</td></tr>`;
        return;
    }

    tbody.innerHTML = transactions.map(t => {
        const date = new Date(t.dateOperation).toLocaleDateString("fr-FR");
        const categorie = t.categorie ? t.categorie.nom : "—";
        const montantClass = t.montant >= 0 ? "montant-positif" : "montant-negatif";
        const montantStr = t.montant.toLocaleString("fr-FR", {
            style: "currency", currency: "EUR"
        });

        return `
      <tr>
        <td>${date}</td>
        <td>${t.description || "—"}</td>
        <td>${categorie}</td>
        <td class="${montantClass}">${montantStr}</td>
        <td>
          <button class="btn-edit"   onclick="ouvrirModification(${t.id})">Modifier</button>
          <button class="btn-delete" onclick="supprimerTransaction(${t.id})">Supprimer</button>
        </td>
      </tr>
    `;
    }).join("");
}

// ── Ouvrir le modal pour AJOUTER ──
function ouvrirModal() {
    // Réinitialiser le formulaire
    document.getElementById("transaction-form").reset();
    document.getElementById("transaction-id").value = "";
    document.getElementById("modal-title").textContent = "Ajouter une transaction";
    document.getElementById("modal-alert").className = "alert d-none";

    // Mettre la date d'aujourd'hui par défaut
    document.getElementById("date-operation").value = new Date().toISOString().split("T")[0];

    document.getElementById("modal-overlay").classList.add("open");
}

// ── Ouvrir le modal pour MODIFIER ──
async function ouvrirModification(id) {
    try {
        // Récupérer la transaction par son id
        const response = await fetch(`/api/transactions/${id}`, {
            credentials: "include"
        });
        if (!response.ok) return;

        const t = await response.json();

        // Remplir le formulaire avec les données existantes
        document.getElementById("transaction-id").value = t.id;
        document.getElementById("montant").value = t.montant;
        document.getElementById("description").value = t.description || "";
        document.getElementById("date-operation").value = t.dateOperation.split("T")[0];
        document.getElementById("categorie-id").value = t.categorieId || "";
        document.getElementById("modal-title").textContent = "Modifier la transaction";
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

// ── Soumission du formulaire (ajout ou modification) ──
document.getElementById("transaction-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("transaction-id").value;
    const montant = parseFloat(document.getElementById("montant").value);
    const description = document.getElementById("description").value.trim();
    const date = document.getElementById("date-operation").value;
    const categorieId = document.getElementById("categorie-id").value;

    // Validation
    if (!montant || !date) {
        showModalAlert("Montant et date sont obligatoires.", "danger");
        return;
    }
    if (!categorieId) {
        showModalAlert("Veuillez sélectionner une catégorie.", "danger");
        return;
    }

    // Si id est rempli → modification, sinon → création
    const isModification = id !== "";
    const url = isModification ? `/api/transactions/${id}` : "/api/transactions";
    const method = isModification ? "PATCH" : "POST";

    // Pour PATCH on envoie seulement les champs modifiés
    // Pour POST on envoie tout
    const body = {
        Montant: montant,
        Description: description,
        DateOperation: date,
        CategoryId: categorieId ? parseInt(categorieId) : null
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
            chargerTransactions(); // recharger le tableau
        } else {
            const data = await response.json();
            showModalAlert(data.error || "Une erreur est survenue.", "danger");
        }

    } catch (err) {
        console.error(err);
        showModalAlert("Impossible de contacter le serveur.", "danger");
    }
});

// ── Supprimer une transaction ──
async function supprimerTransaction(id) {
    // Demander confirmation avant de supprimer
    if (!confirm("Supprimer cette transaction ?")) return;

    try {
        const response = await fetch(`/api/transactions/${id}`, {
            method: "DELETE",
            credentials: "include"
        });

        if (response.ok) {
            chargerTransactions(); // recharger le tableau
        }

    } catch (err) {
        console.error(err);
    }
}

// ── Afficher une alerte dans le modal ──
function showModalAlert(message, type) {
    const alert = document.getElementById("modal-alert");
    alert.textContent = message;
    alert.className = `alert alert-${type}`;
}

// ── Lancer ──
init();
