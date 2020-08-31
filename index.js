const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');
const { execSync } = require('child_process');

const octokit = new Octokit({
  auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
});


async function createRelease(repoName, name, body) {
  await octokit.repos.createRelease({
    owner: 'bhoos',
    repo: repoName,
    tag_name: 'next',
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

  // update the version
  execSync(`npm version ${branch} --no-git-tag-version`);

  const nextVersion = execSync(`grep version package.json`).toString().trim();

  const repoName = execSync(`basename $(git remote get-url origin)`).toString().trim().split('.')[0];
  execSync(`git fetch origin`);
  execSync('git config pull.ff only');
  execSync(`git tag next${nextVersion}`);
  execSync('git push --tags');
  execSync(`git checkout -b temp`);
  execSync('git pull origin master')

  execSync(`git add -A`);
  execSync(`git commit -m "${branch} updated"`);
  execSync(`git push origin temp:${branch}`);
  execSync(`git push origin temp:master`);
  createRelease(repoName, '', '').catch(e => {
    console.log('e', e)
  })

}  catch (error) {
  core.setFailed(error.message);
}
