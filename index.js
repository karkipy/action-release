const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');
const { execSync } = require('child_process');

const PERSONAL_ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const octokit = new Octokit({
  auth: PERSONAL_ACCESS_TOKEN,
});


async function createRelease(repoName,tag, name, body) {
  await octokit.repos.createRelease({
    owner: 'bhoos',
    repo: repoName,
    tag_name: tag,
    name,
    body,
    draft: true
  });
}

try {
  // build the package and test it
  execSync(`yarn`);
  execSync(`yarn build`);
  execSync(`yarn test`);

  const branch = execSync('git branch --show-current').toString().trim();


  // setup config for git
  execSync(`git config --global user.email action@bhoos.com`);
  execSync(`git config --global user.name 'Bhoos Action'`);
  execSync(`git fetch origin`);
  execSync('git config pull.ff only');
  // update the version
  execSync(`npm version ${branch} --no-git-tag-version`);

  const nextVersion = execSync(`node -p "require('./package.json').version"`).toString().trim();
  const repoName = execSync(`basename $(git remote get-url origin)`).toString().trim().split('.')[0];
  const tagName = `next v${nextVersion}`;



  // add tags and push it
  execSync(`git tag ${tagName}`);
  execSync('git push --tags');

  // push the updates from temp branch to both the current branch and master branch
  execSync(`git checkout -b temp`);
  execSync('git pull origin master');
  execSync(`git add -A`);
  execSync(`git commit -m "${branch} version updated"`);
  execSync(`git push origin temp:${branch}`);
  execSync(`git push origin temp:master`);
  createRelease(repoName, tagName, '', '').catch(e => {
    if (e) throw `Draft Release error ${e}`;
  });

  // setup to release package
  execSync(`echo "//npm.pkg.github.com/rchs/:_authToken=${PERSONAL_ACCESS_TOKEN}" > ~/.npmrc`);
  execSync(`echo "//npm.pkg.github.com/:_authToken=${PERSONAL_ACCESS_TOKEN}" >> ~/.npmrc`);
  execSync(`npm publish`);

}  catch (error) {
  core.setFailed(error.message);
}
