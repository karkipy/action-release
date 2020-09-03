const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require('@octokit/rest');
const { execSync } = require('child_process');
const { chdir } = require('process');

const PERSONAL_ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const OWNER = process.env.PACKAGE_SCOPE || 'bhoos';
const octokit = new Octokit({
  auth: PERSONAL_ACCESS_TOKEN,
});


async function createRelease(repoName,tag, name, body) {
  await octokit.repos.createRelease({
    owner: OWNER,
    repo: repoName,
    tag_name: tag,
    name,
    body,
    draft: true
  });
}

function getPackageProperty(property) {
  return execSync(`node -p "require('./package.json').${property}"`).toString().trim();
}


try {
  // check if draft has been released from master
  const { payload } = github.context;
  const { repository, ref } = payload;
  const { html_url, name, full_name } = repository;

  const firstName = full_name.split('/')[0];
  const gitURL = `https://${firstName}:${PERSONAL_ACCESS_TOKEN}@github.com/${full_name}.git`;


  execSync(`curl -H 'Authorization: token ${PERSONAL_ACCESS_TOKEN}' ${html_url}`)
  execSync(`git config --global user.email action@bhoos.com`);
  execSync(`git config --global user.name 'Bhoos Action'`);
  execSync(`git clone ${gitURL}`)
  chdir(`${name}`);
  execSync('git config pull.ff only');
  execSync(`git remote set-url origin ${gitURL}`);
  execSync('git fetch --all');
  execSync('git pull --all');

  const release = payload.action && payload.action === 'published';
  if (release) {
    const packageName = getPackageProperty('name');
    const currentVersion = getPackageProperty('version');
    // add latest tag to the current version of package
    console.log('....Adding latest Tag to current version of Package....');
    execSync(`npm dist-tag add ${packageName}@${currentVersion} latest`);
  } else {


    const branch = ref.split('/')[2];
    execSync(`git pull origin ${branch}`);

    // setup  npmrc
    execSync(`echo "//npm.pkg.github.com/bhoos/:_authToken=${PERSONAL_ACCESS_TOKEN}" > ~/.npmrc`);
    execSync(`echo "//npm.pkg.github.com/:_authToken=${PERSONAL_ACCESS_TOKEN}" >> ~/.npmrc`);
    execSync(`echo "@${OWNER}:registry=https://npm.pkg.github.com/" >> ~/.npmrc`);


    // make sure the branch is upto date with master
    execSync(`git checkout -b temp`);
    execSync('git pull origin master');
    // update the version
    console.log(`....Updating npm version using ${branch}....`);
    execSync(`npm version ${branch} -m "Release ${branch} version %s"`);


  // test and build
    execSync(`yarn`);
    execSync(`yarn test`);
    execSync(`yarn build`);


     // push the updates from temp branch to both the current branch and master branch
    console.log(`....Pushing Changes to ${branch} branch....`);
    execSync(`git push origin temp:${branch}`);

    console.log('....Pushing Changes to master branch....');
    execSync(`git push origin temp:master`);



    console.log('....Publishing Package With Next Tag....');
    execSync(`npm publish --tag=next`);


    // create a draft with a tag of version name with v suffix
    const tagName = `v${getPackageProperty('version')}`;

    console.log('....Creating a release....');
    createRelease(name, tagName, '', '').catch(e => {
      if (e) throw `Draft Release error ${e}`;
    });

  }

}  catch (error) {
  core.setFailed(error.message);
}
