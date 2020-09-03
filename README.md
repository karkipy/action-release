## WorkFlow Steps :

1) build and test scripts are run
2) git config are setup with username Bhoos Action and email action@bhoos.com
3) package version is updated according to branch name i.e minor or patch so this workflow should be only triggered from those branches
4) setup to publish the package using github token provided from env GITHUB_PERSONAL_ACCESS_TOKEN,  also add NODE_AUTH_TOKEN else there will be authentication issue then package is published with updated version and next tag
5) the update is then pushed to the current branch and the master branch
6) a draft release is created with above version
7) and upon release the said version is moved to latest tag


## Example usage

```bash
  on:
    push:
      branches:
        - minor
        - patch
  release:
    types: [published]
  jobs:
    package-release:
      runs-on: ubuntu-latest
      steps:
        - name: Use Bhoos release action
          uses: bhoos/action-release@v{currentVersion}
          env:
            # use PERSONAL_ACCESS_TOKEN as secrets.GITHUB_TOKEN is limited to current repository
            NPM_PKG_GITHUB_TOKEN: ${{ secrets.PERSONAL_ACCESS_TOKEN }}

```
