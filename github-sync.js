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



  // Get SHA (required by GitHub to overwrite)

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

      message: "Mise à jour automatique des données YannApp",

      content: content,

      sha: sha

    })

  }).then(() => console.log("✅ Données sauvegardées sur GitHub."));

}



async function loadFromGitHub() {

  const res = await fetch(API_URL, {

    headers: {

      Authorization: `Bearer ${TOKEN}`,

      Accept: "application/vnd.github+json"

    }

  });



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



// Récupère toutes les clés de tâches (par date)

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
