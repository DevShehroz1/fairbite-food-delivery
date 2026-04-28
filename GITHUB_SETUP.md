# GitHub Setup Instructions

## Push to GitHub (run these commands)

```bash
# 1. Create a new repo on github.com named: fairbite-food-delivery
#    (go to github.com/new — set to Public or Private)

# 2. Then run this (replace YOUR_USERNAME with your GitHub username):
cd /Users/shehrozasif/fairbite-food-delivery

git remote add origin https://github.com/YOUR_USERNAME/fairbite-food-delivery.git
git branch -M main
git push -u origin main
```

## If you want to use GitHub CLI (easier):
```bash
gh repo create fairbite-food-delivery --public --push --source=.
```

---

## Future sessions — how to continue

Just tell Claude:
"Continue FairBite — check PROGRESS.md"

Claude will read `/Users/shehrozasif/fairbite-food-delivery/PROGRESS.md`
and pick up from where we left off.

## Backup location
`/Users/shehrozasif/Downloads/fairbite-food-delivery-backup/`
