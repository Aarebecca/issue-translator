import fetch from 'node-fetch';

export async function translate(text) {
  const key = process.env.AZURE_TRANSLATE_KEY;
  const endpoint = process.env.AZURE_TRANSLATE_ENDPOINT;
  const location = process.env.AZURE_TRANSLATE_LOCATION;
  const to = process.env.AZURE_TRANSLATE_TARGET || 'en';

  const data = await fetch(
    `${endpoint}/translate?api-version=3.0&from=zh-Hans&to=en`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Ocp-Apim-Subscription-Region': location,
        'Content-type': 'application/json',
        'X-ClientTraceId': crypto.randomUUID(),
      },
      params: {
        'api-version': '3.0',
        to,
      },
      body: JSON.stringify([{ text }]),
    }
  )
    .then((response) => response.json())
    .then((data) => data[0].translations[0].text);

  return data;
}
