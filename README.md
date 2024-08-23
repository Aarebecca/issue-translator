# issue-translator

When an issue is opened or edited, this GitHub Action will translate the title of the issue to a target language using Azure Cognitive Services.

Generic Usage:

```yml
name: Translate Issue Title

on:
  issues:
    types: [opened, edited]

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Translate
        uses: Aarebecca/issue-translator@1.0.0
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          AZURE_TRANSLATE_KEY: ${{ secrets.AZURE_TRANSLATE_KEY }}
          AZURE_TRANSLATE_ENDPOINT: 'https://api.cognitive.microsofttranslator.com'
          AZURE_TRANSLATE_LOCATION: 'eastus'
          AZURE_TRANSLATE_TARGET: 'en'

```