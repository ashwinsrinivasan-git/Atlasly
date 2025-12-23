#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd dist

# place .nojekyll to bypass Jekyll processing
echo > .nojekyll

git init
git checkout -B main
git add -A
git commit -m 'deploy'

# Get the remote URL from the parent repository (which has the token configured)
REMOTE_URL=$(git config --get remote.origin.url)

# Deploy using the parent's remote URL
# We use https here so it works with the credential helper or token-in-url
git push -f "$REMOTE_URL" main:gh-pages

cd -
