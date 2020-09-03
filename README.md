## WorkFlow Steps :

1) build and test scripts are run
2) git config are setup with username Bhoos Action and email action@bhoos.com
3) package version is updated according to branch name i.e minor or patch so this workflow should be only triggered from those branches
4) setup to publish the package using github token provided from env GITHUB_PERSONAL_ACCESS_TOKEN, then  package is published with next tag
5) the update is then pushed to the current branch and the master branch
6) a draft release is created with above tag
7) and upon release the said veersion is moved to latest tag


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
        - uses: actions/checkout@v2
          with:
            fetch-depth: 0
        - name: Use Node.js ${{ matrix.node-version }}
          uses: actions/setup-node@v1
          with:
            node-version: '10.x'
        - name: Use Bhoos release action
          uses: bhoos/action-release@v{currentVersion}
          env:
            GITHUB_PERSONAL_ACCESS_TOKEN: ${{ github.token }}
            NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

```
