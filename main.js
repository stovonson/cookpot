document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const form = document.querySelector('.form');
  const nameInput = document.getElementById('name');
  const taglineInput = document.getElementById('tagline');
  const descriptionInput = document.getElementById('description');
  const logoInput = document.getElementById('logo');
  const modrinthInput = document.getElementById('modrinth');
  const kofiInput = document.getElementById('kofi');
  const websiteInput = document.getElementById('website');
  const updateNotesInput = document.getElementById('updateNotes');
  const authorInput = document.getElementById('author');

  const markdownOutput = document.getElementById('markdownOutput');
  const visualOutput = document.getElementById('visualOutput');

  const toggleDarkBtn = document.getElementById('toggleDark');
  const copyBtn = document.getElementById('copyBtn');
  const resetBtn = document.getElementById('resetBtn');
  const previewTabs = document.querySelectorAll('.preview-tab');

  // State
  let isDarkMode = localStorage.getItem('darkMode') === 'true';
  let activeTab = 'visual';

  // Initialize
  initDarkMode();
  initTabSystem();
  updateOutput();
  setupEventListeners();

  function initDarkMode() {
    if (isDarkMode) {
      document.body.classList.add('dark');
    }
    toggleDarkBtn.setAttribute('aria-pressed', isDarkMode);
  }

  function initTabSystem() {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      activeTab = savedTab;
    }
    setActiveTab(activeTab);
  }

  function setActiveTab(tab) {
    activeTab = tab;
    localStorage.setItem('activeTab', tab);
    
    previewTabs.forEach(tabEl => {
      if (tabEl.dataset.tab === tab) {
        tabEl.classList.add('active');
      } else {
        tabEl.classList.remove('active');
      }
    });
  
    if (tab === 'visual') {
      markdownOutput.style.display = 'none';
      visualOutput.style.display = 'block';
    } else {
      markdownOutput.style.display = 'block';
      visualOutput.style.display = 'none';
    }
  }

  function setupEventListeners() {
    // Form inputs
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => input.addEventListener('input', debounce(updateOutput, 200)));

    // Buttons
    toggleDarkBtn.addEventListener('click', toggleDarkMode);
    copyBtn.addEventListener('click', copyMarkdown);
    resetBtn.addEventListener('click', resetForm);

    // Preview tabs
    previewTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        setActiveTab(tab.dataset.tab);
      });
    });

    // Validate URLs on blur
    [logoInput, modrinthInput, kofiInput, websiteInput].forEach(input => {
      input.addEventListener('blur', validateUrl);
    });
  }

  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    toggleDarkBtn.setAttribute('aria-pressed', isDarkMode);
  }

  function validateUrl(e) {
    const input = e.target;
    const url = input.value.trim();
    
    if (url && !isValidUrl(url)) {
      showError(input, 'Please enter a valid URL (starting with http:// or https://)');
    } else {
      clearError(input);
    }
    updateOutput();
  }

  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  function showError(input, message) {
    clearError(input);
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    input.parentNode.appendChild(error);
    input.setAttribute('aria-invalid', 'true');
  }

  function clearError(input) {
    const error = input.parentNode.querySelector('.error-message');
    if (error) {
      error.remove();
    }
    input.removeAttribute('aria-invalid');
  }

  function getMarkdown() {
    const name = nameInput.value.trim();
    const tagline = taglineInput.value.trim();
    const description = descriptionInput.value.trim();
    const logo = logoInput.value.trim();
    const modrinth = modrinthInput.value.trim();
    const kofi = kofiInput.value.trim();
    const website = websiteInput.value.trim();
    const updateNotes = updateNotesInput.value.trim();
    const author = authorInput.value.trim();

    // Validate required fields
    if (!name) return '# Please enter a project name';
    if (!description) return '# Please enter a project description';

    const badges = [
      modrinth ? `[![Modrinth](https://i.ibb.co/VcjK6GgK/modrinth-46h.png)](${modrinth})` : '',
      kofi ? `[![Ko-Fi](https://i.ibb.co/fzdWbrQL/kofi-singular-46h.png)](${kofi})` : '',
      website ? `[![Website](https://i.ibb.co/ymZTzT1W/website-46h.png)](${website})` : '',
    ].filter(Boolean).join(' ');

    return `
<center>

${logo ? `<img src="${logo}" alt="${name} Logo" style="max-height: 200px; width: auto;">` : ''}

## ${name}

${tagline ? `**${tagline}**` : ''}

${description}

${badges}

${updateNotes ? `### Updates\n\n${updateNotes}` : ''}

</center>

<details>
<summary>Versions</summary>

Available versions can be found [here](${website}/versions).

</details>

<details>
<summary>Other</summary>

### Version Format
**${name.toLowerCase()}-platform-v**
- ${name.toLowerCase()}: the name of the pack
- platform: the platform version it works on
- v: the version number of ${name.toLowerCase()}

### Other Other

Thanks to [Devin's Badges](https://intergrav.github.io/devins-badges-docs/) for the buttons.

</details>

<center>

${author ? `a ${author} production.` : ''}

</center>`;
  }

  function updateOutput() {
    const markdown = getMarkdown();
    markdownOutput.textContent = markdown;
    visualOutput.innerHTML = marked.parse(markdown);
  }

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdownOutput.textContent);
      showToast('Markdown copied to clipboard!');
    } catch (err) {
      showToast('Failed to copy: ' + err, true);
    }
  }

  function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function resetForm() {
    form.reset();
    updateOutput();
    showToast('Form reset');
  }

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }
});