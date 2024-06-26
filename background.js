console.log('Background script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background:', request);
  if (request.action === "callLLM") {
    callLLM(request.prompt, request.emailList, request.settings)
      .then(response => {
        console.log('LLM call successful:', response);
        sendResponse({ status: 'success', data: response });
      })
      .catch(error => {
        console.error('LLM call failed:', error);
        sendResponse({ status: 'error', message: error.message, details: error.details });
      });
    return true;  // Will respond asynchronously
  }
});

async function callLLM(prompt, emailList, settings) {
  const response = await fetch(settings.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        { role: "user", content: `${prompt}

Here are the emails:
${emailList}

Respond with a JSON array of numbers in a ${"```json"} code block, corresponding to the emails that should be checked. Before responding, open a <scratchpad> and, for each email in the list, briefly think with a few words about whether it should be archived. Only then open the JSON code block and respond with the numbers of emails to archive, as a JSON list.` }
      ],
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API error response:', errorText);
    throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
  }

  const data = await response.json();
  console.log(data);
  return data.content[0].text.split("```json")[1].split("```")[0];
}
