 ## Action-Release

 Personal release action for github packages


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
        - name: Use release action
          uses: karkipy/action-release
```
