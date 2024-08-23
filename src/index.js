import core from '@actions/core';
import { Octokit } from '@octokit/rest';
import { translate } from './translate';

const token = process.env.GITHUB_TOKEN;
const octokit = new Octokit({ auth: token });

async function run() {
  try {
    const context = require('@actions/github').context;
    const { owner, repo } = context.repo;
    const issueNumber = context.payload.issue.number;

    const issue = await octokit.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });

    const title = issue.data.title;

    let translatedTitle = title;
    try {
      translatedTitle = await translate(title);
    } catch (error) {
      // do nothing
    }

    await octokit.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      title: translatedTitle,
    });

    console.log(
      `The title of issue #${issueNumber} has been translated to: ${translatedTitle}`
    );
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
}

run();
