# GitHub Pages Deployment Setup

## Automatic Deployment Configured ✅

The repository is now configured for automatic deployment to GitHub Pages using GitHub Actions.

### What's been set up:

1. **GitHub Actions Workflow**: `.github/workflows/deploy-pages.yml`
   - Triggers on push to `master` or `main` branches
   - Automatically builds the frontend
   - Deploys to GitHub Pages on successful build

### To Enable GitHub Pages:

1. Go to your GitHub repository: https://github.com/Jistriane/ZKQUESTCHAIN
2. Click **Settings** (top right)
3. In the left sidebar, click **Pages**
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - This will automatically deploy from the GitHub Actions workflow
5. Click **Save**

### How it works:

- Every push to `master` or `main` triggers the workflow
- Frontend is built to `frontend/dist/`
- Built files are deployed to GitHub Pages
- Your site will be available at: `https://Jistriane.github.io/ZKQUESTCHAIN/`

### Monitoring Deployments:

1. Go to repository **Actions** tab
2. You'll see the workflow running
3. Once complete, click the workflow to see details
4. your site will be live at the GitHub Pages URL

### Features:

- ✅ Automatic builds on every push
- ✅ Concurrent deployment protection
- ✅ Supports both `master` and `main` branches
- ✅ Manual trigger available (workflow_dispatch)

## Next Steps:

Once Pages are enabled, the deployment will complete automatically. You can then:
- Visit your live site
- Test Sudoku quests in production
- Verify Testnet connectivity
- Share the GitHub Pages URL with users

---

**Status**: Deployment workflow ready. Just enable GitHub Pages in repository settings!
