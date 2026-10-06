# GitHub and Cloudflare submission guide

This project now has two entry points: `src/server.ts` for the original Node/local SQLite API and `src/worker.ts` for Cloudflare Workers/D1. Both share field/date validation in `src/validation.ts`. Cloudflare deployment uses `wrangler.jsonc` and `migrations/0001_initial.sql`.

Prepared and verified by Codex: Node build and 41-case suite, Worker type check, 22 Worker HTTP cases plus competing requests against local D1, and Wrangler deployment dry run. See evidence/WORKER_LOCAL_TEST_RESULTS.md. Nothing has been pushed to GitHub or deployed remotely by Codex.

## 1. Sign in to GitHub

Create or sign in to your GitHub account. In PowerShell:

```powershell
cd C:\Users\ADMIN\Desktop\PD_Midterm
gh auth login
```

Choose GitHub.com, HTTPS, and browser login. Complete the sign-in in your browser. Git and GitHub CLI are installed on this computer.

## 2. Create a local commit

The project currently has no .git directory. Run once:

```powershell
git init
git branch -M main
git add .
git status
git commit -m "Complete campus equipment booking API"
```

Review the staged file list before committing. Source, migrations, configuration, lockfile, docs, snapshots, and evidence should be included. node_modules, data, dist, .npm-cache, .wrangler, and local secret files are ignored.

If Git asks for an identity, set your own name and email for this repository, then repeat the commit:

```powershell
git config user.name "YOUR NAME"
git config user.email "YOUR GITHUB EMAIL"
```

Replace those placeholders with your details. A GitHub-provided noreply address also works.

## 3. Create the GitHub repository and push

This example creates a private repository. Use the visibility your instructor requires; change --private to --public if required.

```powershell
gh repo create campus-equipment-booking-api --private --source=. --remote=origin --push
gh repo view --json url --jq ".url"
```

If that name already exists in your account, use another name rather than recreating it. The printed URL is your source-code submission link. For a private repository, grant your instructor access in its Settings > Collaborators. Pushing to GitHub stores the source; it does not start the API.

## 4. Sign in to Cloudflare

Create or sign in to a Cloudflare account, then run:

```powershell
npx.cmd wrangler login
npx.cmd wrangler whoami
```

Authorize Wrangler in your browser. whoami should identify your account. No Cloudflare credentials belong in the GitHub repository.

## 5. Create a D1 database and set its binding

```powershell
npx.cmd wrangler d1 create campus-equipment-db
```

Copy the returned database_id. If Wrangler asks to add the binding to your configuration, choose No: this project already has a DB binding.

Open `wrangler.jsonc`. Replace only this placeholder with the returned real database ID:

```json
"database_id": "00000000-0000-0000-0000-000000000000"
```

Keep `binding` as `DB` and `database_name` as `campus-equipment-db`. If you used a different database name, update database_name and use that name in the commands below. Do not deploy with the placeholder ID.

Generate the binding types and check the Worker:

```powershell
npm.cmd run cf:types
npm.cmd run cf:check
```

## 6. Test the Worker locally

Apply the local migration and start the Worker:

```powershell
npx.cmd wrangler d1 migrations apply campus-equipment-db --local
npm.cmd run cf:dev
```

This uses local simulated D1, not the remote database. The development URL is http://127.0.0.1:8789/api. Leave this terminal running. If another Worker dev server is already using 8789, stop it first rather than starting two.

In a second terminal in the same project folder:

```powershell
npm.cmd run cf:test
```

Expected: PASS for 22 Worker HTTP cases and competing creates. The test deletes only bookings it created. Its fixed test intervals must be free. Results are written to evidence/WORKER_LOCAL_TEST_RESULTS.md. This check exercises the actual Worker/D1 adapter; the original npm test exercises the Node adapter.

## 7. Initialize the remote database and deploy

After local checks pass:

```powershell
npx.cmd wrangler d1 migrations apply campus-equipment-db --remote
npx.cmd wrangler deploy --dry-run
npm.cmd run cf:deploy
```

Confirm the migration when prompted. It creates the tables, overlap triggers, and two equipment records in Cloudflare D1. Local test bookings are not uploaded. Deploy publishes the Worker; Wrangler prints its real workers.dev URL. If prompted to set up a workers.dev subdomain, complete that setup.

The live API base URL is the printed Worker URL plus `/api`, for example:

```text
https://campus-equipment-api.YOUR-SUBDOMAIN.workers.dev/api
```

Use the actual printed URL. No custom domain or frontend is needed.

## 8. Verify the live API and record its URL

In PowerShell, replace the example URL:

```powershell
$liveBase = 'https://campus-equipment-api.YOUR-SUBDOMAIN.workers.dev/api'
curl.exe -sS -i "$liveBase/equipment" | Tee-Object -FilePath evidence/cloudflare-equipment.txt
curl.exe -sS -i "$liveBase/bookings" | Tee-Object -FilePath evidence/cloudflare-bookings.txt
```

Both should return 200. The equipment endpoint should include eq-1 and eq-2. A fresh remote bookings collection should be empty.

Repeat the PowerShell manual CRUD/validation/conflict tests from curl_test_guide.md against `$liveBase` and preserve the complete output. Include at least create, read, update, delete, invalid input, not found, and conflict. Use unoccupied slots and delete your test booking afterward. Local success is not evidence that the remote deployment has been verified.

Add the actual GitHub URL, live base API URL, and remote-test evidence links to README.md. Record the deployment commands and your actual observed checks in AI_LOG.md. Keep the AI-assisted deployment changes disclosed and learn how D1 binding, migrations, and async queries work.

## 9. Push the final configuration and evidence

```powershell
git add .
git status
git commit -m "Record Cloudflare configuration and live verification"
git push
```

If Git reports nothing to commit, the latest files are already committed. Later code changes need both a Git push and `npm.cmd run cf:deploy`; this guide uses manual deployment and does not configure automatic GitHub deployment.

## 10. Submit the links

Submit your actual GitHub repository URL and the live `/api` base URL. You can also include `/api/equipment` as an endpoint the instructor can open immediately. Opening only the Worker root `/` returns the API's JSON 404 because no root route is defined.

Review quality_gate.md, your own code explanations, the run/deploy instructions, and the final evidence before marking the submission READY.

References: [GitHub source import guide](https://docs.github.com/en/enterprise-cloud@latest/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github), [Cloudflare D1 setup](https://developers.cloudflare.com/d1/get-started/), [Wrangler D1 commands](https://developers.cloudflare.com/d1/wrangler-commands/).
