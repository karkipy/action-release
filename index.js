const core = require('@actions/core');
const { execSync } = require('child_process');

try {
  const branch = execSync('git branch --show-current').toString().trim();
  execSync(`git fetch origin`);
  execSync('git config pull.ff only');
  execSync(`git checkout -b temp`);
  execSync('git pull origin master')
  execSync(`npm version ${branch} --no-git-tag-version`);
  execSync(`git add -A`);
  execSync(`git commit -m "${branch} updated"`);
  execSync(`git push origin temp:${branch}`);
  execSync(`git push origin temp:master`);

}  catch (error) {
  core.setFailed(error.message);
}
