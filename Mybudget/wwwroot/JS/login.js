//Afficher un message à l'utilisateur 
function showAlert(message, type) {
    const box = document.getElementById("alert-box");
    box.textContent = message;
    box.className = `alert alert-${type}`;
   
}

// Gérer l'état du bouton 
function setLoading(isLoading) {
    const btn = document.getElementById("submit-btn");
    btn.disabled = isLoading;
    btn.textContent = isLoading ? "Connexion..." : "Se connecter";
}

// Soumission du formulaire 
document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    // Empêche le rechargement de la page

    //  Récupérer les valeurs du formulaire
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    //  Validation basique côté client
    if (!email || !password) {
        showAlert("Veuillez remplir tous les champs.", "danger");
        return;
    }

    setLoading(true);

    try {
        //  Envoyer la requête à l'API
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                Email: email,
                MotDePasse: password
            }),
            credentials: "include"
        });

        // Lire la réponse JSON
        const data = await response.json();

        if (response.ok) {
            showAlert("Connexion réussie ! Redirection...", "success");
            setTimeout(() => {
                window.location.href = "/dashboard.html";
            }, 800);
        } else {
            showAlert(data.error || "Identifiants incorrects.", "danger");
        }

    } catch (err) {
        console.error(err);
        showAlert("Impossible de contacter le serveur.", "danger");
    } finally {
        setLoading(false);
    }
});