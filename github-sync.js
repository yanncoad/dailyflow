// github-sync.js

const GITHUB_USERNAME = "yanncoad";
const REPO_NAME = "dailyflow";
const FILE_PATH = "data/user-data.json";

// 🔐 TOKEN demandé à l'utilisateur à la volée
let TOKEN = localStorage.getItem("githubToken");
if (!TOKEN) {
  TOKEN = prompt("Entrez votre token GitHub (il sera mémorisé localement) :");
  if (TOKEN) {
    localStorage.setItem("githubToken", TOKEN);
  } else {
    alert("Aucun token fourni. Les fonctionnalités de sauvegarde/restauration sont désactivées.");
  }
}

const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;

async function syncToGitHub() {
  if (!TOKEN) return;

  const data = {
    "tasks": getAllTasksFromStorage(),
    "sport-program": JSON.parse(localStorage.getItem("sport-program") || "[]"),
    "lbb-contests": JSON.parse(localStorage.getItem("lbb-contests") || "{}")
  };

  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

  try {
    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json"
      }
    });

    const json = await res.json();
    const sha = json.sha;

    await fetch(API_URL, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Mise à jour automatique YannApp",
        content: content,
        sha: sha
      })
    });

    console.log("✅ Données sauvegardées sur GitHub.");
  } catch (error) {
    console.error("❌ Erreur lors de la sauvegarde :", error);
  }
}

async function loadFromGitHub() {
  if (!TOKEN) return;

  try {
    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json"
      }
    });

    if (!res.ok) {
      throw new Error("Échec de récupération GitHub : " + res.status);
    }

    const json = await res.json();
    const content = JSON.parse(decodeURIComponent(escape(atob(json.content))));

    if (content.tasks) {
      for (const key in content.tasks) {
        localStorage.setItem(key, JSON.stringify(content.tasks[key]));
      }
    }

    localStorage.setItem("sport-program", JSON.stringify(content["sport-program"]));
    localStorage.setItem("lbb-contests", JSON.stringify(content["lbb-contests"]));

    console.log("✅ Données restaurées depuis GitHub.");
    location.reload();
  } catch (err) {
    console.error("❌ Erreur de chargement depuis GitHub :", err);
    alert("Erreur : impossible de charger les données GitHub.");
  }
}

function getAllTasksFromStorage() {
  const tasks = {};
  Object.keys(localStorage).forEach(key => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
      try {
        tasks[key] = JSON.parse(localStorage.getItem(key));
      } catch (e) {}
    }
  });
  return tasks;
}
