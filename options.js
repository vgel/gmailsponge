let prompts = [];

function saveSettings() {
  const model = document.getElementById('model').value;
  const endpoint = document.getElementById('endpoint').value;
  const apiKey = document.getElementById('apiKey').value;

  chrome.storage.sync.set({
    prompts: prompts,
    model: model,
    endpoint: endpoint,
    apiKey: apiKey
  }, () => {
    console.log('Settings saved');
  });
}

function addPrompt(event) {
  event.preventDefault();
  const promptName = document.getElementById('promptName').value;
  const promptText = document.getElementById('promptText').value;
  
  if (promptName && promptText) {
    prompts.push({ name: promptName, text: promptText });
    renderPrompts();
    saveSettings();
    document.getElementById('promptForm').reset();
  }
}

function deletePrompt(index) {
  prompts.splice(index, 1);
  renderPrompts();
  saveSettings();
}

function renderPrompts() {
  const promptsContainer = document.getElementById('prompts');
  promptsContainer.innerHTML = '';

  prompts.forEach((prompt, index) => {
    const promptDiv = document.createElement('div');
    promptDiv.className = 'prompt';
    promptDiv.innerHTML = `
      <h3>${prompt.name}</h3>
      <p>${prompt.text}</p>
      <button class="deletePrompt" data-index="${index}">Delete</button>
    `;
    promptsContainer.appendChild(promptDiv);
  });

  // Add event listeners to delete buttons
  document.querySelectorAll('.deletePrompt').forEach(button => {
    button.addEventListener('click', function() {
      deletePrompt(parseInt(this.getAttribute('data-index')));
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['prompts', 'model', 'endpoint', 'apiKey'], (result) => {
    prompts = result.prompts || [];
    renderPrompts();

    if (result.model) document.getElementById('model').value = result.model;
    if (result.endpoint) document.getElementById('endpoint').value = result.endpoint;
    if (result.apiKey) document.getElementById('apiKey').value = result.apiKey;
  });

  document.getElementById('promptForm').addEventListener('submit', addPrompt);
  document.getElementById('save').addEventListener('click', saveSettings);
});