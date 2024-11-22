const fetch = require('node-fetch');
const { exec } = require('child_process');

const REPO_OWNER = 'kennydedavion';
const REPO_NAME = 'videomulti-stream';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

(async () => {
  try {
    exec("git log --format='%H %s'", { cwd: process.cwd() }, async (error, stdout) => {
      if (error) {
        console.error(`Chyba při načítání commitů: ${error}`);
        return;
      }
      
      const commits = stdout.trim().split('\n').map(line => {
        const [commitHash, ...messageParts] = line.split(' ');
        return {
          hash: commitHash,
          message: messageParts.join(' ')
        };
      });

      for (let i = 0; i < commits.length; i++) {
        const { hash, message } = commits[i];
        console.log(`Přenáším verzi: ${message} (${hash})`);

        exec(`git archive --format=zip --output=/tmp/${hash}.zip ${hash}`, { cwd: process.cwd() }, async (error) => {
          if (error) {
            console.error(`Chyba při vytváření archivu: ${error}`);
            return;
          }

          try {
            const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/`, {
              method: 'PUT',
              headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                message: `Verze ${i + 1}: ${message}`,
                content: Buffer.from(`/tmp/${hash}.zip`).toString('base64'),
                branch: 'main'
              })
            });

            if (response.ok) {
              console.log(`Verze ${i + 1} přenesena.`);
            } else {
              const errorText = await response.text();
              console.error(`Chyba při přenosu verze ${i + 1}:`, errorText);
            }
          } catch (err) {
            console.error(`Chyba při komunikaci s GitHub API: ${err.message}`);
          }
        });
      }
    });
  } catch (error) {
    console.error('Chyba při provádění skriptu:', error);
  }
})();
