document.addEventListener('DOMContentLoaded', () => {
  const promptSelect = document.getElementById('promptSelect');
  const runButton = document.getElementById('runPrompt');
  const statusDiv = document.getElementById('status');

  chrome.storage.sync.get('prompts', (result) => {
    const prompts = result.prompts || [];
    prompts.forEach((prompt) => {
      const option = document.createElement('option');
      option.value = prompt.text;
      option.textContent = prompt.name;
      promptSelect.appendChild(option);
    });
  });

  runButton.addEventListener('click', () => {
    const selectedPrompt = promptSelect.value;
    if (selectedPrompt) {
      statusDiv.textContent = 'Running prompt...';
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab.url.includes('mail.google.com')) {
          chrome.tabs.sendMessage(currentTab.id, {action: "runPrompt", prompt: selectedPrompt}, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error:', chrome.runtime.lastError.message);
              statusDiv.textContent = 'Error: ' + chrome.runtime.lastError.message;
            } else if (response && response.status === 'success') {
              statusDiv.textContent = 'Prompt executed. Check Gmail for results.';
            } else {
              statusDiv.textContent = 'Error: Unexpected response from content script.';
            }
          });
        } else {
          statusDiv.textContent = 'Error: Not on Gmail. Please open Gmail and try again.';
        }
      });
    } else {
      statusDiv.textContent = 'Please select a prompt.';
    }
  });
});