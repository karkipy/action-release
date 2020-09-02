const core = require('@actions/core');
const github = require('@actions/github');
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


  // check if draft has been released from master
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  const release = !!(payload.action && payload.action === 'released');
  const packageName = execSync(`node -p "require('./package.json').name"`).toString().trim();

  if (release) {
    const currentVersion = execSync(`node -p "require('./package.json').version"`).toString().trim();
    console.log('....Remove next Tag from Package....');
    // remove next from current version of package
    execSync(`npm dist-tag rm ${packageName} next`);

    console.log('....Adding latest Tag from Package....');
    // add latest tag to the current version of package
    execSync(`npm dist-tag add ${packageName}@${currentVersion} latest`);
  } else {

    const branch = execSync('git branch --show-current').toString().trim();
    // setup config for git
    execSync(`git config --global user.email action@bhoos.com`);
    execSync(`git config --global user.name 'Bhoos Action'`);

    execSync(`git fetch origin`);
    execSync('git config pull.ff only');


    // make sure the branch is upto date with master
    execSync(`git checkout -b temp`);
    execSync('git pull origin master');
    // update the version
    console.log(`....Updating npm version using ${branch}....`);
    execSync(`npm version ${branch} -m "Release ${branch} version %s"`);


  // build the package and test it
    execSync(`yarn`);
    execSync(`yarn build`);
    execSync(`yarn test`);

    const nextVersion = execSync(`node -p "require('./package.json').version"`).toString().trim();
    const repoName = execSync(`basename $(git remote get-url origin)`).toString().trim().split('.')[0];
    const tagName = `v${nextVersion}`;

     // push the updates from temp branch to both the current branch and master branch
    console.log(`....Pushing Changes to ${branch} branch....`);
    execSync(`git push origin temp:${branch}`);

    console.log('....Pushing Changes to master branch....');
    execSync(`git push origin temp:master`);




    // setup to release package
    execSync(`echo "//npm.pkg.github.com/bhoos/:_authToken=${PERSONAL_ACCESS_TOKEN}" > ~/.npmrc`);
    execSync(`echo "//npm.pkg.github.com/:_authToken=${PERSONAL_ACCESS_TOKEN}" >> ~/.npmrc`);
    console.log('....Publishing Package With Next Tag....');
    execSync(`npm publish --tag=next`);


    console.log('....Creating a release....');
    createRelease(repoName, tagName, '', '').catch(e => {
      if (e) throw `Draft Release error ${e}`;
    });

  }

}  catch (error) {
  core.setFailed(error.message);
}
