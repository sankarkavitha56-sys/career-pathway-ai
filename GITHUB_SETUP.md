# 🚀 GitHub Setup Guide

This guide will help you push your Career Pathway project to GitHub.

## Step 1: Create a Repository on GitHub

1. Go to [https://github.com/new](https://github.com/new)
2. Enter repository name: `careerpathway` (or your preferred name)
3. Add description: "AI-powered job search and career development platform"
4. Choose **Public** (for open source) or **Private** (for personal use)
5. **Do NOT** initialize with README, .gitignore, or license (we have these already)
6. Click "Create repository"

## Step 2: Connect Local Repository to GitHub

Copy the commands from GitHub (they'll look like below) and run them:

```bash
# Add the remote origin (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/careerpathway.git

# Rename branch to main if needed
git branch -M main

# Push to GitHub
git push -u origin main
```

Or if using SSH:

```bash
git remote add origin git@github.com:USERNAME/careerpathway.git
git branch -M main
git push -u origin main
```

## Step 3: Verify on GitHub

1. Go to `https://github.com/USERNAME/careerpathway`
2. You should see:
   - ✅ All your source code files
   - ✅ README.md with your project information
   - ✅ `.env.example` for environment setup
   - ❌ NO `.env` file (protected by .gitignore)
   - ❌ NO `node_modules/` folder
   - ❌ NO `dist/` folder

## Step 4: Add GitHub Secrets (if using CI/CD)

If you plan to deploy using GitHub Actions:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add your environment variables:
   - `VITE_RAPIDAPI_KEY`: your RapidAPI key
   - `VITE_GROK_API_KEY`: your Grok API key

## Step 5: Setup for Cloning

When someone clones your project:

```bash
git clone https://github.com/USERNAME/careerpathway.git
cd careerpathway
npm install
cp .env.example .env
# Then edit .env and add their API keys
npm start
```

## 📋 Checklist

- [ ] Repository created on GitHub
- [ ] Remote origin added (`git remote -v` to verify)
- [ ] All commits pushed to GitHub
- [ ] `.env` file is NOT in the repository
- [ ] `node_modules/` is NOT in the repository
- [ ] `dist/` is NOT in the repository
- [ ] README.md is visible on GitHub
- [ ] `.env.example` is visible on GitHub

## 🔒 Security Best Practices

✅ **Already Done:**
- API keys removed from code
- `.env` file in `.gitignore`
- `.env.example` shows what keys are needed
- `node_modules/` and `dist/` in `.gitignore`

✅ **If You Accidentally Push API Keys:**
1. Regenerate your API keys immediately
2. Run: `git rm --cached .env` (remove from git history)
3. Force push: `git push --force-with-lease`
4. Or use: `git-filter-repo` to rewrite history

## 📚 Additional Resources

- [GitHub Docs - Adding a repository](https://docs.github.com/en/migrations/importing-your-projects-to-github/importing-source-code-to-github/adding-locally-hosted-code-to-github)
- [GitHub Docs - Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [.gitignore Templates](https://github.com/github/gitignore)

---

Happy coding! 🎉
