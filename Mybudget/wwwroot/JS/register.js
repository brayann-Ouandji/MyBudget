// Afficher un message 
function showAlert(message, type) {
    const box = document.getElementById("alert-box");
    box.textContent = message;
    box.className = `alert alert-${type}`;
}

// Gérer l'état du bouton 
function setLoading(isLoading) {
    const btn = document.getElementById("submit-btn");
    btn.disabled = isLoading;
    btn.textContent = isLoading ? "Création..." : "Créer mon compte";
}

// Soumission du formulaire
document.getElementById("register-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    //  Récupérer les valeurs
    const prenom = document.getElementById("prenom").value.trim();
    const nom = document.getElementById("nom").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("password-confirm").value;

    // Validations côté client
    if (!prenom || !nom || !email || !password) {
        showAlert("Veuillez remplir tous les champs.", "danger");
        return;
    }
    if (password !== confirm) {
        showAlert("Les mots de passe ne correspondent pas.", "danger");
        return;
    }
    if (password.length < 6) {
        showAlert("Le mot de passe doit faire au moins 6 caractères.", "danger");
        return;
    }

    setLoading(true);

    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                Prenom: prenom,
                Nom: nom,
                Email: email,
                MotDePasse: password
            }),
            credentials: "include"
        });

        const data = await response.json();

        if (response.ok) {
            showAlert("Compte créé avec succès ! Redirection...", "success");
            setTimeout(() => {
                window.location.href = "/login.html";
            }, 1500);
        } else if (response.status === 409) {
            showAlert("Cet e-mail est déjà utilisé.", "danger");
        } else {
            showAlert(data.error || "Une erreur est survenue.", "danger");
        }

    } catch (err) {
        console.error(err);
        showAlert("Impossible de contacter le serveur.", "danger");
    } finally {
        setLoading(false);
    }
});