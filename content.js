console.log('Content script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in content script:', request);
  if (request.action === "runPrompt") {
    processEmails(request.prompt)
      .then(() => {
        console.log('Emails processed successfully');
        sendResponse({status: 'success'});
      })
      .catch((error) => {
        console.error('Error in processEmails:', error);
        sendResponse({status: 'error', message: error.toString(), details: error.details});
      });
    return true;  // Indicates we will send a response asynchronously
  }
});

async function processEmails(prompt) {
  console.log('Processing emails with prompt:', prompt);
  const emailRows = document.querySelectorAll('tr[role="row"]');
  let emailList = [];

  emailRows.forEach((row, index) => {
    // Updated subject extraction
    const subjectElement = row.querySelector('span[data-thread-id]');
    const subject = subjectElement ? subjectElement.textContent.trim() : 'No subject';
    
    const senderElement = row.querySelector('span[email]');
    const sender = senderElement ? senderElement.getAttribute('email') : 'Unknown sender';
    
    emailList.push(`${index + 1}. From: ${sender} - Subject: ${subject}`);
  });

  console.log('Extracted emails:', emailList);

  console.log('Fetching settings...');
  const settings = await new Promise((resolve) => chrome.storage.sync.get(['model', 'endpoint', 'apiKey'], resolve));
  console.log('Settings fetched:', settings);

  console.log('Sending message to background script...');
  const response = await chrome.runtime.sendMessage({
    action: "callLLM",
    prompt: prompt,
    emailList: emailList.join('\n'),
    settings: settings
  });
  console.log('Response from background script:', response);

  if (response.status === 'error') {
    throw new Error(`${response.message}\nDetails: ${response.details || 'No additional details'}`);
  }

  const emailsToCheck = JSON.parse(response.data);

  emailsToCheck.forEach((index) => {
    const checkbox = emailRows[index - 1]?.querySelector('div[role="checkbox"]');
    if (checkbox) {
      checkbox.click();
    }
  });
}
