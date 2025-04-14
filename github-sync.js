// github-sync.js

const GITHUB_USERNAME = "yanncoad";
const REPO_NAME = "dailyflow";
const FILE_PATH = "data/user-data.json";
const TOKEN = "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";

const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;

async function syncToGitHub() {
  const data = {
    "tasks": getAllTasksFromStorage(),
    "sport-program": JSON.parse(localStorage.getItem("sport-program") || "[]"),
    "lbb-contests": JSON.parse(localStorage.getItem("lbb-contests") || "{}")
  };

  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

  // Obtenir le SHA du fichier actuel
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
  }).then(() => console.log("✅ Données sauvegardées sur GitHub."))
    .catch((err) => console.error("❌ Erreur de sauvegarde :", err));
}

async function loadFromGitHub() {
  const res = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json"
    }
  });

  if (!res.ok) {
    console.error("❌ Erreur de récupération GitHub :", res.status);
    alert("Erreur lors de la mise à jour depuis GitHub. Vérifie ton token ou l'existence du fichier.");
    return;
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
