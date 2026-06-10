# Deploy to Google Apps Script with clasp

Current Deployment Id: AKfycbxGZYkrWtCEjsUpgJJV9sj8gzCJo6QyEEZtkHpgj0fe-Ow4hVpqccV52nWLzyGItyA

Prerequisites
- Node.js (and npm) installed.
- Install clasp: `npm install -g @google/clasp`
- Ensure you have a Google account with access to the Apps Script project.

Quick steps
1. Authenticate
    - Run: `clasp login`
    - This opens a browser to authorize clasp with your Google account.

2. Work locally
    - Edit your files (ensure appsscript.json is present and rootDir is correct).
    - To fetch remote changes: `clasp pull`
    - To upload local changes: `clasp push`

3. Update the existing deployment
    - `clasp deploy --deploymentId (id from above) --description "Production"
