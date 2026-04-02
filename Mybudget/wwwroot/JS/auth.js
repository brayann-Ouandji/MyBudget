// Cette fonction est appelée sur chaque page protégée
// Elle vérifie que l'utilisateur est bien connecté
async function checkAuth() {
    try {
        const response = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include" 
        });

        if (!response.ok) {
            window.location.href = "/login.html";
            return null;
        }

        return await response.json();

    } catch (err) {
        console.error(err);
        window.location.href = "/login.html";
        return null;
    }
}

// Déconnexion 
async function logout() {
    await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
    });
    window.location.href = "/login.html";
}