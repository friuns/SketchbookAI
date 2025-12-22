# Netlify Deployment with GitHub Issue/PR Comments

This repository includes an automated Netlify deployment workflow that can post deployment URLs as comments on GitHub issues and pull requests.

## Prerequisites

Before using this workflow, ensure the following secrets are configured in your repository settings:

- `NETLIFY_AUTH_TOKEN`: Your Netlify authentication token
- `NETLIFY_SITE_ID`: Your Netlify site ID

To add these secrets:
1. Go to your repository's Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Add both `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` with their respective values

## Features

- **Automatic Deployment**: Every push to any branch triggers a Netlify deployment
- **Automatic PR Comments**: When pushing to a branch with an open PR, the deployment URL is automatically posted to that PR
- **Issue Commenting**: The workflow can also comment on GitHub issues when referenced in commit messages
- **Multiple Triggering Options**:
  1. Automatic: Push to a PR branch (comments on the PR)
  2. Automatic: Reference an issue in commit message (comments on the issue)
  3. Manual: Trigger workflow with a specific issue/PR number

## Usage

### Option 1: Automatic PR Comments (Recommended)

When you push commits to a branch that has an open pull request, the workflow will automatically post the Netlify deployment URL as a comment on that PR.

```bash
# Create a PR for your branch
git checkout -b my-feature
git push origin my-feature
# Open a PR on GitHub

# Push more commits - deployment URLs will be posted to the PR
git commit -m "Add feature"
git push
```

### Option 2: Automatic via Commit Message

Include an issue reference in your commit message using any of these formats:

```bash
git commit -m "fixes #123: Add new feature"
git commit -m "closes #456: Fix bug"
git commit -m "resolves #789: Update documentation"
git commit -m "#999: Quick fix"
```

When you push this commit, the Netlify deployment URL will automatically be posted as a comment on the referenced issue.

### Option 3: Manual Workflow Dispatch

You can manually trigger the deployment workflow with a specific issue or PR number:

1. Go to the **Actions** tab in the GitHub repository
2. Select the **Deploy to Netlify** workflow
3. Click **Run workflow**
4. Enter the issue or PR number you want to comment on
5. Click **Run workflow**

## Comment Format

The workflow posts a comment to the issue or PR with the following information:

```markdown
🚀 **Netlify Deployment**

The branch `branch-name` has been deployed to Netlify!

**🔗 Deployment URL:** https://deploy-preview-xxx--site-name.netlify.app

Deployed from commit: abc123...
Workflow run: https://github.com/owner/repo/actions/runs/123456
```

## Permissions

The workflow requires the following permissions to function:
- `contents: read` - To checkout the repository
- `issues: write` - To comment on issues
- `pull-requests: write` - To comment on pull requests

## Technical Details

- The workflow uses the `nwtgck/actions-netlify` action for deployment
- Issue commenting is done using the GitHub CLI (`gh`)
- Issue number extraction supports common keywords: fixes, closes, resolves, fix, close, resolve
- The workflow is triggered on every push to any branch
- Manual triggers are supported via `workflow_dispatch`

## Troubleshooting

**Issue comment not posted:**
- Ensure your commit message includes a valid issue reference (e.g., `#123`)
- Check that the issue number exists in the repository
- Verify the workflow has the necessary permissions

**Deployment failed:**
- Check the workflow logs in the Actions tab
- Ensure the build step completes successfully
- Verify Netlify credentials are properly configured

## Related Files

- Workflow definition: `.github/workflows/netlify-deploy.yml`
