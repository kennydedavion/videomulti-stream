const axios = require('axios');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

const git = simpleGit();
const projectId = process.env.GLITCH_PROJECT_ID; // ID vašeho projektu na Glitch
const glitchApiUrl = `https://api.glitch.com/project/${projectId}/log`;

async function fetchProjectLog() {
  const response = await axios.get(glitchApiUrl);
  return response.data;
}

async function rewindAndCommit(version, index) {
  const versionUrl = `https://api.glitch.com/project/${projectId}/log/${version.id}/files`;
  const response = await axios.get(versionUrl);
  const files = response.data;

  // Smazat všechny soubory v lokálním repozitáři
  fs.readdirSync('.').forEach(file => {
    if (file !== '.git' && file !== 'migrate.js') {
      fs.unlinkSync(file);
    }
  });

  // Stáhnout soubory z Glitch
  for (const file of files) {
    const fileResponse = await axios.get(file.downloadUrl);
    fs.writeFileSync(file.path, fileResponse.data);
  }

  // Commit změny do GitHub
  await git.add('./*');
  await git.commit(`Version ${index + 1}: ${version.description}`);
  await git.tag(`v0.0.${index + 1}`);
  await git.push('origin', 'main', `--tags`);
}

async function migrateProject() {
  const log = await fetchProjectLog();
  for (let i = 0; i < log.length; i++) {
    const version = log[i];
    await rewindAndCommit(version, i);
  }
}

migrateProject().catch(console.error);
