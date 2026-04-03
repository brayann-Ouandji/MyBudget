// ── Point d'entrée ──
async function init() {
    const user = await checkAuth();
    if (!user) return;

    document.getElementById("user-email").textContent = user.email;
    await chargerCategories();
    initCouleurPicker();
}

// ── Charger et afficher les catégories ──
async function chargerCategories() {
    try {
        const response = await fetch("/api/categories", {
            credentials: "include"
        });
        if (!response.ok) return;

        const categories = await response.json();
        afficherCategories(categories);

    } catch (err) {
        console.error("Erreur catégories:", err);
    }
}

// ── Afficher dans le tableau ──
function afficherCategories(categories) {
    const tbody = document.getElementById("categories-body");

    if (categories.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Aucune catégorie</td></tr>`;
        return;
    }

    // Correspondance enum C# → texte lisible
    // 0 = Depense, 1 = Revenu
    const typeLabel = { 0: "Dépense", 1: "Revenu" };

    // Correspondance couleur → code hex pour afficher le rond coloré
    const couleurHex = {
        rouge: "#dc3545", vert: "#198754", bleu: "#0d6efd",
        orange: "#fd7e14", jaune: "#ffc107", violet: "#6f42c1"
    };

    tbody.innerHTML = categories.map(c => `
    <tr>
      <td>${c.nom}</td>
      <td>${typeLabel[c.typeOperation] ?? "—"}</td>
      <td>
        <span style="
          display:inline-block;
          width:16px; height:16px;
          border-radius:50%;
          background:${couleurHex[c.couleur] ?? "#aaa"};
          vertical-align:middle;
          margin-right:6px;
        "></span>
        ${c.couleur ?? "—"}
      </td>
      <td>
        <button class="btn-edit"   onclick="ouvrirModification(${c.id})">Modifier</button>
        <button class="btn-delete" onclick="supprimerCategorie(${c.id})">Supprimer</button>
      </td>
    </tr>
  `).join("");
}

// ── Initialiser le sélecteur de couleur ──
function initCouleurPicker() {
    document.querySelectorAll(".couleur-dot").forEach(dot => {
        dot.addEventListener("click", function () {
            // Retirer la sélection de tous les points
            document.querySelectorAll(".couleur-dot").forEach(d => d.classList.remove("selected"));
            // Sélectionner ce point
            this.classList.add("selected");
            // Stocker la valeur dans l'input caché
            document.getElementById("couleur").value = this.dataset.couleur;
            document.getElementById("couleur-label").textContent =
                this.getAttribute("title");
        });
    });

    // Sélectionner rouge par défaut
    document.querySelector('.couleur-dot[data-couleur="rouge"]').classList.add("selected");
}

// ── Ouvrir le modal pour AJOUTER ──
function ouvrirModal() {
    document.getElementById("categorie-form").reset();
    document.getElementById("categorie-id").value = "";
    document.getElementById("modal-title").textContent = "Ajouter une catégorie";
    document.getElementById("modal-alert").className = "alert d-none";
    document.getElementById("couleur").value = "rouge";
    document.getElementById("couleur-label").textContent = "Rouge";

    // Réinitialiser la sélection couleur
    document.querySelectorAll(".couleur-dot").forEach(d => d.classList.remove("selected"));
    document.querySelector('.couleur-dot[data-couleur="rouge"]').classList.add("selected");

    document.getElementById("modal-overlay").classList.add("open");
}

// ── Ouvrir le modal pour MODIFIER ──
async function ouvrirModification(id) {
    try {
        const response = await fetch(`/api/categories/${id}`, {
            credentials: "include"
        });
        if (!response.ok) return;

        const c = await response.json();

        document.getElementById("categorie-id").value = c.id;
        document.getElementById("nom").value = c.nom || "";
        document.getElementById("type-operation").value = c.typeOperation;
        document.getElementById("couleur").value = c.couleur || "rouge";
        document.getElementById("modal-title").textContent = "Modifier la catégorie";
        document.getElementById("modal-alert").className = "alert d-none";

        // Mettre à jour le sélecteur de couleur
        document.querySelectorAll(".couleur-dot").forEach(d => d.classList.remove("selected"));
        const dot = document.querySelector(`.couleur-dot[data-couleur="${c.couleur}"]`);
        if (dot) {
            dot.classList.add("selected");
            document.getElementById("couleur-label").textContent = dot.getAttribute("title");
        }

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
document.getElementById("categorie-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("categorie-id").value;
    const nom = document.getElementById("nom").value.trim();
    const typeOperation = parseInt(document.getElementById("type-operation").value);
    const couleur = document.getElementById("couleur").value;

    if (!nom) {
        showModalAlert("Le nom est obligatoire.", "danger");
        return;
    }

    const isModification = id !== "";
    const url = isModification ? `/api/categories/${id}` : "/api/categories";
    const method = isModification ? "PATCH" : "POST";

    const body = { Nom: nom, TypeOperation: typeOperation, Couleur: couleur };

    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            credentials: "include"
        });

        if (response.ok) {
            fermerModal();
            chargerCategories();
        } else {
            const data = await response.json();
            showModalAlert(data.error || "Une erreur est survenue.", "danger");
        }

    } catch (err) {
        console.error(err);
        showModalAlert("Impossible de contacter le serveur.", "danger");
    }
});

// ── Supprimer une catégorie ──
async function supprimerCategorie(id) {
    if (!confirm("Supprimer cette catégorie ?")) return;

    try {
        const response = await fetch(`/api/categories/${id}`, {
            method: "DELETE",
            credentials: "include"
        });
        if (response.ok) chargerCategories();
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