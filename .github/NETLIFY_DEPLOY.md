# Netlify Deployment with GitHub Issue Comments

This repository includes an automated Netlify deployment workflow that can post deployment URLs as comments on GitHub issues.

## Features

- **Automatic Deployment**: Every push to any branch triggers a Netlify deployment
- **Issue Commenting**: The workflow can automatically comment on GitHub issues with the deployment URL
- **Multiple Triggering Options**:
  1. Extract issue number from commit message
  2. Manually trigger with a specific issue number

## Usage

### Option 1: Automatic via Commit Message

Include an issue reference in your commit message using any of these formats:

```bash
git commit -m "fixes #123: Add new feature"
git commit -m "closes #456: Fix bug"
git commit -m "resolves #789: Update documentation"
git commit -m "#999: Quick fix"
```

When you push this commit, the Netlify deployment URL will automatically be posted as a comment on the referenced issue.

### Option 2: Manual Workflow Dispatch

You can manually trigger the deployment workflow with a specific issue number:

1. Go to the **Actions** tab in the GitHub repository
2. Select the **Deploy to Netlify** workflow
3. Click **Run workflow**
4. Enter the issue number you want to comment on
5. Click **Run workflow**

## Comment Format

The workflow posts a comment to the issue with the following information:

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
