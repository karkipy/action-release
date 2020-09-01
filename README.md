## WorkFlow Steps :

1) build and test scripts are run
2) git config are setup with username Bhoos Action and email action@bhoos.com
3) package version is updated according to branch name i.e minor or patch so this workflow should be only triggered from those branches
4) setup to publish the package using github token provided from env GITHUB_PERSONAL_ACCESS_TOKEN, then  package is published
5) the update is then pushed to the current branch and the master branch
6) tags named nextv(nextVersion) is pushed
7) a draft release is created with above tag


## Example USAGE
    on:
      push:
        branches:
          - minor
          - patch
        .....
        .....
    - name: Use bhoos action
        uses: actions/bhoos-package-action@v1
        env:
          GITHUB_PERSONAL_ACCESS_TOKEN: ${{ github.token }}
