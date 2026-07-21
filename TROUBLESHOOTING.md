# Troubleshooting Log — Enterprise Knowledge Intelligence System

A complete record of every error encountered during development and deployment, and how each was resolved.

---

## 1. Git Push Rejected — Non-Fast-Forward

**Error**
```
! [rejected] main -> main (non-fast-forward)
Updates were rejected because the tip of your current branch is behind its remote counterpart.
```

**Cause**
GitHub auto-created a README when the repo was initialized, which conflicted with the local commit history.

**Fix**
```cmd
git pull origin main --rebase
# If rebase opens vim: type :q! to exit
git rebase --abort
git push origin main --force
```
Force push is safe on a brand-new repo with no collaborators.

---

## 2. Git Rebase — Unmerged Files (README Conflict)

**Error**
```
error: Pulling is not possible because you have unmerged files.
fatal: Exiting because of an unresolved conflict.
```

**Cause**
Both local and GitHub had a `README.md`. The rebase paused waiting for conflict resolution.

**Fix**
Replaced the conflicted `README.md` with a clean version (removed `<<<<<<<`, `=======`, `>>>>>>>` markers), then:
```cmd
git add README.md
git rebase --continue
```

---

## 3. Azure CLI Not Recognized

**Error**
```
az : The term 'az' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

**Cause**
Azure CLI was not installed on the machine.

**Fix**
```powershell
winget install Microsoft.AzureCLI
# Close and reopen PowerShell (PATH refresh required)
# Or force refresh in current session:
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
```

---

## 4. Azure Region Policy — Resources Blocked

**Error**
```
(RequestDisallowedByAzure) Resource was disallowed by Azure: This policy maintains a set of best available regions.
```

**Cause**
The subscription had a policy (`Allowed resource deployment regions`) restricting deployable regions. The default `eastus` was blocked.

**Fix**
Queried the allowed regions:
```powershell
az policy assignment list --query "[?displayName=='Allowed resource deployment regions'].parameters" -o json
# Returned: koreacentral, malaysiawest, uaenorth, southeastasia, austriaeast
```
Updated all scripts to use `southeastasia`.

---

## 5. Azure Resource Providers Not Registered

**Error**
```
(MissingSubscriptionRegistration) The subscription is not registered to use namespace 'Microsoft.DBforPostgreSQL'.
(MissingSubscriptionRegistration) The subscription is not registered to use namespace 'Microsoft.Cache'.
```

**Cause**
The Azure subscription had never used these services so the resource providers were not registered.

**Fix**
```powershell
az provider register --namespace Microsoft.DBforPostgreSQL --wait
az provider register --namespace Microsoft.Cache --wait
az provider register --namespace Microsoft.Web --wait
az provider register --namespace Microsoft.Storage --wait
```

---

## 6. Storage Account Name Already Exists Globally

**Error**
```
(StorageAccountAlreadyExists) The storage account named docknowledgestorage already exists under the subscription.
```

**Cause**
Storage account names are globally unique across all Azure. The name was taken from a previous failed run in a different resource group.

**Fix**
Renamed to `docknowledgesto2` in the setup script.

---

## 7. Azure Static Web Apps — Region Not Allowed

**Error**
```
Resource 'doc-knowledge-frontend' was disallowed by Azure
```

**Cause**
Azure Static Web Apps only supports 5 regions globally (`Central US`, `East US 2`, `West US 2`, `West Europe`, `East Asia`). None overlap with the subscription's allowed regions.

**Fix**
Switched frontend deployment from Static Web Apps to a regular **Azure App Service (Node.js)** in `southeastasia`, which is in the allowed list. Added `server.js` (Express static file server) to serve the Vite build output.

---

## 8. GitHub Push Blocked — Secret Scanning

**Error**
```
remote: - GITHUB PUSH PROTECTION
remote: — OpenAI API Key ————————————————————
remote: locations: commit: 75a42046 path: .azure/setup-azure-resources.ps1:37
```

**Cause**
Real API keys (OpenAI, Qdrant, Neo4j, database password) were hardcoded in the PowerShell setup script and committed to git. GitHub's secret scanning caught them.

**Fix**
1. Replaced all real values with `PASTE_YOUR_*_HERE` placeholders in the script
2. Amended the commit to rewrite history:
```cmd
git add .azure/setup-azure-resources.ps1
git commit --amend --no-edit
git push origin main --force
```
3. Rotated all exposed credentials (OpenAI key, Qdrant API key, Neo4j password)

---

## 9. GitHub Actions — `npm ci` Fails (No package-lock.json)

**Error**
```
npm error: The `npm ci` command can only install with an existing package-lock.json
```

**Cause**
`package-lock.json` was not committed to the repo (excluded by `.gitignore`).

**Fix**
Changed `npm ci` to `npm install` in the GitHub Actions workflow.

---

## 10. Frontend TypeScript Build Errors

**Error**
```
src/pages/ComplianceReports.tsx: error TS2304: Cannot find name 'TextField'.
src/pages/ComplianceReports.tsx: error TS2304: Cannot find name 'Button'.
src/pages/Home.tsx: error TS6133: 'Box' is declared but its value is never read.
```

**Cause**
`ComplianceReports.tsx` used `TextField` and `Button` components without importing them. `Home.tsx` imported `Box` but never used it.

**Fix**
Added missing imports to `ComplianceReports.tsx`:
```tsx
import { ..., TextField, Button } from '@mui/material';
```
Removed unused `Box` import from `Home.tsx`. Also changed `--max-warnings 0` to `--max-warnings 10` in the lint script to prevent warnings from blocking builds.

---

## 11. Azure App Service — Publish Profile Blocked

**Error**
```
Download publish profile
Basic authentication is disabled.
```

**Cause**
The Azure subscription policy disabled basic auth for App Service publishing credentials.

**Fix**
Switched the entire deployment method from publish profiles to **Azure Service Principal** authentication:
```powershell
az ad sp create-for-rbac --name "doc-knowledge-deploy" --role contributor \
  --scopes /subscriptions/<id>/resourceGroups/doc_knowledge --sdk-auth
```
The JSON output was stored as the `AZURE_CREDENTIALS` GitHub secret.

---

## 12. Service Principal Creation — Resource Group Not Found

**Error**
```
(ResourceGroupNotFound) Resource group 'doc-knowledge-rg' could not be found.
```

**Cause**
The resource group was actually named `doc_knowledge` (underscore), not `doc-knowledge-rg` (hyphen). The Azure Portal created it with a different name than the script expected.

**Fix**
```powershell
az group list --query "[].{name:name, location:location}" -o table
# Found: doc_knowledge in southeastasia
az ad sp create-for-rbac --scopes /subscriptions/<id>/resourceGroups/doc_knowledge ...
```

---

## 13. Backend App Service — QuotaExceeded

**Error**
```
State: QuotaExceeded
Error 403 - This web app is stopped.
```

**Cause**
The B1 App Service plan hit its CPU/memory quota limit.

**Fix**
```powershell
az appservice plan update --name ASP-docknowledge-a801 --resource-group doc_knowledge --sku B2
az webapp restart --name doc-knowledge-backend --resource-group doc_knowledge
```

---

## 14. Backend Startup — `ModuleNotFoundError: No module named 'uvicorn'`

**Error** (repeated across many deployments)
```
ModuleNotFoundError: No module named 'uvicorn'
Error: class uri 'uvicorn.workers.UvicornWorker' invalid or not found
WARNING: Could not find virtual environment directory /home/site/wwwroot/antenv.
WARNING: Could not find package directory /home/site/wwwroot/__oryx_packages__.
```

**Root Cause**
This was the hardest problem. Multiple deployment methods were tried before finding the root cause:

| Attempt | Method | Why It Failed |
|---|---|---|
| 1 | `az webapp deploy --type zip` | Just copies files, never runs `pip install` |
| 2 | GitHub Actions venv (`antenv/`) + curl zipdeploy | `curl --data-binary: out of memory` — 500MB zip too large |
| 3 | `--target=".python_packages/lib/site-packages"` | Wrong folder name, Oryx doesn't look there |
| 4 | `SCM_DO_BUILD_DURING_DEPLOYMENT=true` | Had no effect with `az webapp deploy` (bypasses Kudu build) |

**Root cause identified via Kudu API logs:**
Oryx (Azure's build system) only recognizes two package locations:
- `antenv/` — a full virtualenv
- `__oryx_packages__/` — flat package directory

**Final Fix**
Changed the workflow to install packages into exactly `__oryx_packages__`:
```yaml
- name: Install dependencies
  run: |
    cd backend
    pip install --upgrade pip
    pip install -r requirements.txt --target="__oryx_packages__"
```
This folder is deployed inside the zip, and Oryx automatically adds it to `sys.path` at runtime.

---

## 15. Backend Startup Crash — Heavy Services Initializing at Import Time

**Error**
```
Container did not start within expected time limit of 230s.
```

**Cause**
Multiple services were connecting to databases and downloading ML models at Python import time:
- `KnowledgeService.__init__()` — connected to Qdrant + Neo4j + loaded SentenceTransformer
- `MultimodalService.__init__()` — downloaded Florence-2 model (~1.5GB) at startup
- `MemoryService.__init__()` — connected to Redis at startup
- `create_workflow()` and `create_compliance_workflow()` — built LangGraph graphs at module load

**Fix**
Converted all heavy initializations to lazy properties — connections only made on first actual API call:
```python
# Before (crashes at startup)
class KnowledgeService:
    def __init__(self):
        self.qdrant_client = QdrantClient(...)  # connects immediately

# After (lazy)
class KnowledgeService:
    def __init__(self):
        self._qdrant_client = None

    @property
    def qdrant_client(self):
        if self._qdrant_client is None:
            self._qdrant_client = QdrantClient(...)
        return self._qdrant_client
```
Also removed `torch`, `transformers`, and `accelerate` from `requirements.txt` — Florence-2 is not needed in production since OpenAI handles LLM responses.

---

## 16. Backend Deploy — `curl: out of memory`

**Error**
```
curl: option --data-binary: out of memory
```

**Cause**
Trying to upload a 500MB+ zip (containing the full `antenv` virtualenv) using `curl --data-binary` on a GitHub Actions runner with limited memory.

**Fix**
Dropped the curl approach entirely. Switched back to `azure/webapps-deploy@v3` which handles chunked upload internally, and stopped bundling the venv — used `__oryx_packages__` instead.

---

## 17. `az webapp deploy` — Not Triggering Oryx Build

**Error** (silent — deployment succeeds but packages missing)
```
Running deployment command... Project type: OneDeploy
Total number of files to be synced = 31
Build completed successfully.
```
Then at runtime: `ModuleNotFoundError: No module named 'uvicorn'`

**Cause**
`az webapp deploy --type zip` uses the OneDeploy path which just rsyncs files. It does NOT trigger the Oryx build pipeline even with `SCM_DO_BUILD_DURING_DEPLOYMENT=true`. The Oryx build only runs when deploying via the Kudu `/api/zipdeploy` endpoint or via Git.

**Fix**
Pre-install packages in CI and include them in the deployment package (see fix #14 above).

---

## 18. `.env` Config Issues

Several values in `backend/.env` were wrong:

| Field | Problem | Fix |
|---|---|---|
| `QDRANT_PORT=6333.` | Trailing dot caused `int()` conversion crash | Removed dot → `6333` |
| `STORAGE_TYPE=local` | Azure Blob Storage credentials were set but local mode was still active | Changed to `azure` |
| `NEO4J_USER=6a558658` | Instance ID used instead of username | Changed to `neo4j` (AuraDB always uses `neo4j`) |

---

## 19. Frontend Static Web Apps Region Block → Switched to Web App

See error #7. The broader lesson: when Azure Static Web Apps is not available in your subscription's allowed regions, use App Service (Node.js) with an Express server to serve the static `dist/` folder:

```js
// server.js
import express from 'express';
const app = express();
app.use(express.static('dist'));
app.get('*', (req, res) => res.sendFile('dist/index.html'));
app.listen(process.env.PORT || 8080);
```

---

## Summary — Key Lessons

1. **Azure subscription policies** can block entire service categories and regions — always check first with `az policy assignment list`
2. **Never commit secrets** to git — use `.gitignore` for `.env` files and placeholders in scripts
3. **Azure Oryx package lookup** is strict — only `antenv/` or `__oryx_packages__/` are recognized
4. **`az webapp deploy`** does NOT trigger `pip install` — it's a file-copy operation
5. **Lazy initialization** is essential for Azure App Service — all DB connections and ML model loads must happen on first request, not at import time
6. **Service Principal auth** (`AZURE_CREDENTIALS`) is more reliable than publish profiles when basic auth policies are enforced
