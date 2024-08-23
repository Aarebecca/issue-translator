const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');
const axios = require('axios');

const token = process.env.GITHUB_TOKEN;
const key = process.env.AZURE_TRANSLATE_KEY;
const endpoint = process.env.AZURE_TRANSLATE_ENDPOINT;
const location = process.env.AZURE_TRANSLATE_LOCATION;
const to = process.env.AZURE_TRANSLATE_TARGET || 'en';
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

async function translate(text) {
  try {
    const response = await axios.post(
      `${endpoint}/translate?api-version=3.0&from=zh-Hans&to=${to}`,
      [{ text }],
      {
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Ocp-Apim-Subscription-Region': location,
          'Content-type': 'application/json',
          'X-ClientTraceId': crypto.randomUUID(),
        },
      }
    );

    const translatedText = response.data[0].translations[0].text;
    return translatedText;
  } catch (error) {
    console.error('Error translating text:', error);
    throw error;
  }
}

run();
