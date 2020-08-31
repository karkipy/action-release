const core = require('@actions/core');
const { execSync } = require('child_process');

try {
  // build the package and test it
  execSync(`yarn`);
  execSync(`yarn build`);
  execSync(`yarn test`);

  const branch = execSync('git branch --show-current').toString().trim();

  const tags = execSync('git tag --points-at HEAD').toString();

  console.log('tags', tags);

  // setup config for git
  execSync(`git config --global user.email action@bhoos.com`);
  execSync(`git config --global user.name 'Bhoos Action'`);

  execSync(`npm version ${branch}`);


  execSync(`git fetch origin`);
  execSync('git config pull.ff only');
  execSync(`git checkout -b temp`);
  execSync('git pull origin master')

  execSync(`git add -A`);
  execSync(`git commit -m "${branch} updated"`);
  execSync(`git push origin temp:${branch}`);
  execSync(`git push origin temp:master`);

}  catch (error) {
  core.setFailed(error.message);
}
