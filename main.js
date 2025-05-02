document.addEventListener('DOMContentLoaded', () => {
  
  const form = document.querySelector('.form');
  const nameInput = document.getElementById('name');
  const taglineInput = document.getElementById('tagline');
  const descriptionInput = document.getElementById('description');
  const logoInput = document.getElementById('logo');
  const modrinthInput = document.getElementById('modrinth');
  const curseforgeInput = document.getElementById('curseforge');
  const supportInput = document.getElementById('support');
  const websiteInput = document.getElementById('website');
  const updateNotesInput = document.getElementById('updateNotes');
  const authorInput = document.getElementById('author');

  const markdownOutput = document.getElementById('markdownOutput');
  const visualOutput = document.getElementById('visualOutput');

  const toggleDarkBtn = document.getElementById('toggleDark');
  const copyBtn = document.getElementById('copyBtn');
  const resetBtn = document.getElementById('resetBtn');
  const previewTabs = document.querySelectorAll('.preview-tab');

  
  let isDarkMode = localStorage.getItem('darkMode') === 'true';
  let activeTab = 'visual';

  
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
    
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => input.addEventListener('input', debounce(updateOutput, 200)));

    
    toggleDarkBtn.addEventListener('click', toggleDarkMode);
    copyBtn.addEventListener('click', copyMarkdown);
    resetBtn.addEventListener('click', resetForm);

    
    previewTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        setActiveTab(tab.dataset.tab);
      });
    });

    
    modrinthInput.addEventListener('blur', () => validatePlatformUrl(modrinthInput, 'modrinth.com'));
    curseforgeInput.addEventListener('blur', () => validatePlatformUrl(curseforgeInput, 'curseforge.com'));


    [logoInput, supportInput, websiteInput].forEach(input => {
      input.addEventListener('blur', validateUrl);
    });
  }

  function validatePlatformUrl(input, requiredDomain) {
    const url = input.value.trim();
    
    if (url === '') {
      clearError(input);
      return true;
    }
    
    if (!isValidUrl(url)) {
      showError(input, `Please enter a valid URL (starting with http:// or https://)`);
      return false;
    }
    
    if (!url.includes(requiredDomain)) {
      showError(input, `Please enter a valid ${requiredDomain.split('.')[0]} URL`);
      return false;
    }
    
    clearError(input);
    return true;
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
  }

  function validateModrinthUrl(e) {
    const input = e.target;
    const url = input.value.trim();
    
    if (url && !url.includes('modrinth.com/')) {
      showError(input, 'Please enter a valid Modrinth URL (should contain modrinth.com)');
    } else {
      clearError(input);
    }
    updateOutput();
  }

  function validateCurseForgeUrl(e) {
    const input = e.target;
    const url = input.value.trim();
    
    if (url && !url.includes('curseforge.com/')) {
      showError(input, 'Please enter a valid CurseForge URL (should contain curseforge.com)');
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
    input.classList.add('error');
  }
  
  function clearError(input) {
    const error = input.parentNode.querySelector('.error-message');
    if (error) {
      error.remove();
    }
    input.classList.remove('error');
  }

  function getMarkdown() {
    const name = nameInput.value.trim();
    const tagline = taglineInput.value.trim();
    const description = descriptionInput.value.trim();
    const logo = logoInput.value.trim();
    const modrinth = modrinthInput.value.trim();
    const curseforge = curseforgeInput.value.trim();
    const support = supportInput.value.trim();
    const website = websiteInput.value.trim();
    const updateNotes = updateNotesInput.value.trim();
    const author = authorInput.value.trim();
  
    if (!name) return '# Fill in the name to get started!';
  
    const sections = [];
    
    sections.push('<center>');
    if (logo) sections.push(`<img src="${logo}" alt="${name} Logo" width="200px" height="200px">`);
    sections.push(`## ${name}`);
    
    const badges = [
      (modrinth && isValidModrinthUrl(modrinth)) ? `[![Modrinth](https://github.com/intergrav/devins-badges/blob/v3/assets/compact/available/modrinth_46h.png?raw=true)](${modrinth})` : '',
      (curseforge && isValidCurseForgeUrl(curseforge)) ? `[![CurseForge](https://github.com/intergrav/devins-badges/blob/v3/assets/compact/available/curseforge_46h.png?raw=true)](${curseforge})` : '',
      (support && isValidUrl(support)) ? `[![Support](https://github.com/intergrav/devins-badges/blob/v3/assets/compact/donate/generic-plural_46h.png?raw=true)](${support})` : '',
      (website && isValidUrl(website)) ? `[![Website](https://github.com/intergrav/devins-badges/blob/v3/assets/compact-minimal/documentation/website_46h.png?raw=true)](${website})` : '',
    ].filter(Boolean);
    
    if (badges.length > 0) {
      sections.push(badges.join(' '));
    }
    
    if (tagline || description) {
      sections.push(tagline ? `**${tagline}**${description ? ' ' + description : ''}` : description);
    }
    sections.push('</center>');
    
    if (updateNotes) {
      sections.push('<details>',
      '<summary>Updates</summary>',
      `\n${updateNotes}\n`,
      '</details>');
    }
    
    sections.push(
      '<details>',
      '<summary>Versions</summary>',
      getVersionsText(modrinth, curseforge, website),
      '</details>'
    );
    
    sections.push(
      '<details>',
      '<summary>Other</summary>',
      '\n<p>README created with <a href="https://cookpot.top">Cookpot</a>.</p>\n',
      '</details>'
    );
    
    sections.push('<center>');
    if (author) sections.push(`a ${author} production.`);
    sections.push('</center>');
    
    return sections.filter(section => section.trim() !== '')
                  .join('\n\n')
                  .replace(/\n{3,}/g, '\n\n')
                  .trim();
  }

  function getVersionsText(modrinth, curseforge, website) {
    const hasModrinth = modrinth && isValidModrinthUrl(modrinth);
    const hasCurseForge = curseforge && isValidCurseForgeUrl(curseforge);
    
    if (hasModrinth && hasCurseForge) {
      return `\nAvailable versions can be found on [CurseForge](${curseforge}) or [Modrinth](${modrinth}).\n`;
    } else if (hasModrinth) {
      return `\nAvailable versions can be found on [Modrinth](${modrinth}versions).\n`;
    } else if (hasCurseForge) {
      return `\nAvailable versions can be found on [CurseForge](${curseforge}files).\n`;
    } else if (website && isValidUrl(website)) {
      return `\nAvailable versions can be found [here](${website}versions).\n`;
    } else {
      return `\nAvailable versions can be found on the project's download pages.\n`;
    }
  }

  function isValidModrinthUrl(url) {
    return isValidUrl(url) && url.includes('modrinth.com/');
  }
  
  function isValidCurseForgeUrl(url) {
    return isValidUrl(url) && url.includes('curseforge.com/');
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
