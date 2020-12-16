 ## Action-Release

 Personal release action for github packages


## Example usage

```yml
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
        - name: Use release action
          uses: karkipy/action-release@v1
          env:
            NPM_PKG_GITHUB_TOKEN: ${{ secrets.NPM_PKG_GITHUB_TOKEN }}
            PACKAGE_SCOPE: ${{ secrets.PACKAGE_SCOPE }}
```
