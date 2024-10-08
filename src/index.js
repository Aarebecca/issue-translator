const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');
const axios = require('axios');

const token = core.getInput('GITHUB_TOKEN');
const key = core.getInput('AZURE_TRANSLATE_KEY');
const endpoint =
  core.getInput('AZURE_TRANSLATE_ENDPOINT') ||
  'https://api.cognitive.microsofttranslator.com';
const location = core.getInput('AZURE_TRANSLATE_LOCATION') || 'eastus';
const to = core.getInput('AZURE_TRANSLATE_TARGET') || 'en';

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

    // Only translate Chinese text
    if (!/[\u4e00-\u9fa5]/.test(title)) {
      console.log(
        'The title does not contain Chinese text, no need to translate'
      );
      return;
    }

    let translatedTitle = title;
    try {
      translatedTitle = await translate(title);
    } catch (error) {
      console.warn('Failed to translate the title:', error);
      return;
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
