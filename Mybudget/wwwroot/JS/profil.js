// ── Point d'entrée ──
async function init() {
    const user = await checkAuth();
    if (!user) return;

    document.getElementById("user-email").textContent = user.email;
    await chargerProfil();
}

// ── Charger les infos du profil ──
async function chargerProfil() {
    try {
        const response = await fetch("/api/utilisateurs/me", {
            credentials: "include"
        });
        if (!response.ok) return;

        const u = await response.json();

        // Afficher les infos actuelles
        document.getElementById("info-prenom").textContent = u.prenom || "—";
        document.getElementById("info-nom").textContent = u.nom || "—";
        document.getElementById("info-email").textContent = u.email || "—";
        document.getElementById("info-date").textContent =
            new Date(u.dateInscription).toLocaleDateString("fr-FR");

        // Pré-remplir le formulaire avec les valeurs actuelles
        document.getElementById("prenom").value = u.prenom || "";
        document.getElementById("nom").value = u.nom || "";
        document.getElementById("email").value = u.email || "";

    } catch (err) {
        console.error("Erreur profil:", err);
    }
}

// ── Soumission du formulaire ──
document.getElementById("profil-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const prenom = document.getElementById("prenom").value.trim();
    const nom = document.getElementById("nom").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("password-confirm").value;

    // Validation mot de passe
    if (password && password !== confirm) {
        showAlert("Les mots de passe ne correspondent pas.", "danger");
        return;
    }
    if (password && password.length < 6) {
        showAlert("Le mot de passe doit faire au moins 6 caractères.", "danger");
        return;
    }

    // On construit le body avec seulement les champs non vides
    // car on utilise PATCH — on n'envoie que ce qui change
    const body = {};
    if (prenom) body.Prenom = prenom;
    if (nom) body.Nom = nom;
    if (email) body.Email = email;
    if (password) body.MotDePasse = password;

    setLoading(true);

    try {
        const response = await fetch("/api/utilisateurs/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            credentials: "include"
        });

        if (response.ok) {
            showAlert("Profil mis à jour avec succès !", "success");
            // Vider les champs mot de passe après modification
            document.getElementById("password").value = "";
            document.getElementById("password-confirm").value = "";
            // Recharger les infos affichées
            await chargerProfil();
        } else {
            const data = await response.json();
            showAlert(data.error || "Une erreur est survenue.", "danger");
        }

    } catch (err) {
        console.error(err);
        showAlert("Impossible de contacter le serveur.", "danger");
    } finally {
        setLoading(false);
    }
});

// ── Supprimer le compte ──
async function supprimerCompte() {
    // Double confirmation car action irréversible
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ?")) return;
    if (!confirm("Cette action est irréversible. Confirmer ?")) return;

    try {
        const response = await fetch("/api/utilisateurs/me", {
            method: "DELETE",
            credentials: "include"
        });

        if (response.ok) {
            // Compte supprimé → retour au login
            window.location.href = "/login.html";
        }

    } catch (err) {
        console.error(err);
        showAlert("Impossible de contacter le serveur.", "danger");
    }
}

// ── Alerte ──
function showAlert(message, type) {
    const box = document.getElementById("alert-box");
    box.textContent = message;
    box.className = `alert alert-${type}`;
}

// ── Bouton chargement ──
function setLoading(isLoading) {
    const btn = document.getElementById("submit-btn");
    btn.disabled = isLoading;
    btn.textContent = isLoading ? "Enregistrement..." : "Enregistrer les modifications";
}

// ── Lancer ──
init();