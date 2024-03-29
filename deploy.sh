#!/bin/sh
# Script to manage github pages deployment using a 'distribution' directory
# Ref: http://www.damian.oquanta.info/posts/one-line-deployment-of-your-site-to-gh-pages.html
# https://gist.github.com/cobyism/4730490
#
# This script assumes '${TARGET_DEPLOYMENT_BRANCH}' branch is the target deployment branch
#  note: in the case of standard github pages, this is 'gh-pages')
#  note: in the case of a user github pages, this is 'main')
# This script will deploy the CURRENT branch to TARGET_DEPLOYMENT_BRANCH
set -o

TARGET_DEPLOYMENT_BRANCH='gh-pages'
DISTRIBUTION_DIRECTORY='dist'

npm run build

git add ${DISTRIBUTION_DIRECTORY} -f

git commit -m "build"

# Create the subtree
git subtree split --prefix ${DISTRIBUTION_DIRECTORY} -b ${TARGET_DEPLOYMENT_BRANCH}

# Because this is a 'force push' the branch must not be 'protected'
git push -f origin ${TARGET_DEPLOYMENT_BRANCH}:${TARGET_DEPLOYMENT_BRANCH}

# Remove the branch locally as its not needed.
# Deployment is simplified by re-creating the force pushing the branch
git branch -D ${TARGET_DEPLOYMENT_BRANCH}