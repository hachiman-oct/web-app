// ========================================
// Constants
// ========================================

const STORAGE_KEYS = {
    TITLE: 'textSaver_title',
    CONTENT: 'textSaver_content',
    FORMAT: 'textSaver_format'
};

const FILE_FORMATS = {
    TXT: 'txt',
    MD: 'md'
};

// Invalid characters for filenames (Windows and Unix)
const INVALID_FILENAME_CHARS = /[<>:"\/\\|?*\x00-\x1F]/g;

// ========================================
// DOM Elements
// ========================================

const titleInput = document.getElementById('titleInput');
const contentInput = document.getElementById('contentInput');
const formatButtons = document.querySelectorAll('.format-btn');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');

// ========================================
// State Management
// ========================================

let currentFormat = FILE_FORMATS.TXT;

// ========================================
// Initialization
// ========================================

function init() {
    loadFromStorage();
    attachEventListeners();
}

// ========================================
// Local Storage Functions
// ========================================

function saveToStorage() {
    localStorage.setItem(STORAGE_KEYS.TITLE, titleInput.value);
    localStorage.setItem(STORAGE_KEYS.CONTENT, contentInput.value);
    localStorage.setItem(STORAGE_KEYS.FORMAT, currentFormat);
}

function loadFromStorage() {
    const savedTitle = localStorage.getItem(STORAGE_KEYS.TITLE);
    const savedContent = localStorage.getItem(STORAGE_KEYS.CONTENT);
    const savedFormat = localStorage.getItem(STORAGE_KEYS.FORMAT);

    if (savedTitle !== null) {
        titleInput.value = savedTitle;
    }

    if (savedContent !== null) {
        contentInput.value = savedContent;
    }

    if (savedFormat !== null && Object.values(FILE_FORMATS).includes(savedFormat)) {
        currentFormat = savedFormat;
        updateFormatButtons();
    }
}

function clearStorage() {
    localStorage.removeItem(STORAGE_KEYS.TITLE);
    localStorage.removeItem(STORAGE_KEYS.CONTENT);
    localStorage.removeItem(STORAGE_KEYS.FORMAT);
}

// ========================================
// Event Listeners
// ========================================

function attachEventListeners() {
    // Auto-save on input
    titleInput.addEventListener('input', saveToStorage);
    contentInput.addEventListener('input', saveToStorage);

    // Format selection
    formatButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const format = btn.dataset.format;
            if (format && Object.values(FILE_FORMATS).includes(format)) {
                currentFormat = format;
                updateFormatButtons();
                saveToStorage();
            }
        });
    });

    // Save button
    saveBtn.addEventListener('click', handleSave);

    // Reset button
    resetBtn.addEventListener('click', handleReset);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleSave();
        }
    });
}

// ========================================
// UI Update Functions
// ========================================

function updateFormatButtons() {
    formatButtons.forEach(btn => {
        if (btn.dataset.format === currentFormat) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ========================================
// File Generation Functions
// ========================================

function sanitizeFilename(filename) {
    // Replace invalid characters with underscore
    return filename.replace(INVALID_FILENAME_CHARS, '_').trim();
}

function generateFilename() {
    const title = titleInput.value.trim();

    if (title) {
        // Pattern A: Use user-provided title
        const sanitized = sanitizeFilename(title);
        return `${sanitized}.${currentFormat}`;
    } else {
        // Pattern B: Use current timestamp
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `memo_${year}${month}${day}_${hours}${minutes}${seconds}.${currentFormat}`;
    }
}

function downloadFile(filename, content) {
    // Create Blob with UTF-8 encoding
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ========================================
// Event Handlers
// ========================================

function handleSave() {
    const content = contentInput.value;

    // Validate content
    if (!content.trim()) {
        alert('Please enter some content.');
        contentInput.focus();
        return;
    }

    try {
        const filename = generateFilename();
        downloadFile(filename, content);

        // Visual feedback
        const originalText = saveBtn.querySelector('.btn-text').textContent;
        saveBtn.querySelector('.btn-text').textContent = 'Saved!';
        saveBtn.querySelector('.btn-icon').textContent = '✅';

        setTimeout(() => {
            saveBtn.querySelector('.btn-text').textContent = originalText;
            saveBtn.querySelector('.btn-icon').textContent = '💾';
        }, 2000);

    } catch (error) {
        console.error('File save error:', error);
        alert('Failed to save file. Please try again.');
    }
}

function handleReset() {
    // Confirmation dialog
    const hasContent = titleInput.value.trim() || contentInput.value.trim();

    if (hasContent) {
        const confirmed = confirm('Are you sure you want to clear all content?');
        if (!confirmed) {
            return;
        }
    }

    // Clear inputs
    titleInput.value = '';
    contentInput.value = '';
    currentFormat = FILE_FORMATS.TXT;

    // Update UI
    updateFormatButtons();

    // Clear storage
    clearStorage();

    // Focus on content
    contentInput.focus();

    // Visual feedback
    const originalText = resetBtn.querySelector('.btn-text').textContent;
    resetBtn.querySelector('.btn-text').textContent = 'Cleared';

    setTimeout(() => {
        resetBtn.querySelector('.btn-text').textContent = originalText;
    }, 1500);
}

// ========================================
// App Start
// ========================================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
