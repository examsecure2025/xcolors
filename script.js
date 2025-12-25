const xcolorsApiBaseUrl = 'https://x-colors.yurace.pro/api';
const xcolorsApiEndpoint = '/random';

const xcolorsSearchInput = document.getElementById('xcolorsSearchInput');
const xcolorsGenerateBtn = document.getElementById('xcolorsGenerateBtn');
const xcolorsError = document.getElementById('xcolorsError');
const xcolorsLoading = document.getElementById('xcolorsLoading');
const xcolorsResults = document.getElementById('xcolorsResults');

// dito kinukuha yung kulay galing sa api
async function fetchRandomColor() {
    try {
        const response = await fetch(xcolorsApiBaseUrl + xcolorsApiEndpoint);
        
        if (!response.ok) {
            throw new Error('Failed to fetch color from API');
        }
        
        const colorData = await response.json();
        return colorData;
    } catch (error) {
        throw new Error('API call failed: ' + error.message);
    }
}

// ito naman ung function na nag fefetch ng maraming kulay depende sa input ng user
async function fetchMultipleColors(count) {
    const promises = [];
    
    for (let i = 0; i < count; i++) {
        promises.push(fetchRandomColor());
    }
    
    try {
        const colors = await Promise.all(promises);
        return colors;
    } catch (error) {
        throw error;
    }
}

// dito  chinecheck kung tama ung number na nilagay ni user
function validateColorInput(inputValue) {
    const trimmedValue = inputValue.trim();
    
    if (trimmedValue === '') {
        return { valid: false, message: 'Please enter a number' };
    }
    
    const number = parseInt(trimmedValue, 10);
    
    if (isNaN(number)) {
        return { valid: false, message: 'Invalid input. Please enter a number' };
    }
    
    if (number < 1 || number > 20) {
        return { valid: false, message: 'Please enter a number between 1 and 20' };
    }
    
    return { valid: true, value: number };
}

// dito  pinapakita yung mga kulay na nakuha sa cards
function displayColors(colors) {
    xcolorsResults.innerHTML = '';
    
    if (colors.length === 0) {
        showXcolorsError('No colors found');
        return;
    }
    
    colors.forEach(function(color, index) {
        const colorCard = createColorCard(color, index + 1);
        xcolorsResults.appendChild(colorCard);
    });
}

function createColorCard(colorData, index) {
    const card = document.createElement('div');
    card.className = 'xcolors-color-card';
    
    const preview = document.createElement('div');
    preview.className = 'xcolors-color-preview';
    preview.style.backgroundColor = colorData.hex;
    
    const info = document.createElement('div');
    info.className = 'xcolors-color-info';
    
    const hexValue = createColorValue('HEX', colorData.hex, colorData.hex);
    const rgbValue = createColorValue('RGB', colorData.rgb, colorData.rgb);
    const hslValue = createColorValue('HSL', colorData.hsl, colorData.hsl);
    
    info.appendChild(hexValue);
    info.appendChild(rgbValue);
    info.appendChild(hslValue);
    
    const setBackgroundBtn = document.createElement('button');
    setBackgroundBtn.className = 'xcolors-set-background-btn';
    setBackgroundBtn.innerHTML = 'Set as Background';
    setBackgroundBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        setPageBackground(colorData.hex);
    });
    
    info.appendChild(setBackgroundBtn);
    
    card.appendChild(preview);
    card.appendChild(info);
    
    return card;
}

function createColorValue(label, value, copyValue) {
    const container = document.createElement('div');
    container.className = 'xcolors-color-value';
    
    const labelSpan = document.createElement('span');
    labelSpan.className = 'xcolors-color-label';
    labelSpan.textContent = label + ':';
    
    const textSpan = document.createElement('span');
    textSpan.className = 'xcolors-color-text';
    textSpan.textContent = value;
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'xcolors-copy-btn';
    copyBtn.innerHTML = 'Copy';
    copyBtn.title = 'Copy to clipboard';
    
    copyBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        copyToClipboard(copyValue);
    });
    
    const valueContainer = document.createElement('span');
    valueContainer.style.display = 'flex';
    valueContainer.style.alignItems = 'center';
    valueContainer.style.gap = '8px';
    valueContainer.appendChild(textSpan);
    valueContainer.appendChild(copyBtn);
    
    container.appendChild(labelSpan);
    container.appendChild(valueContainer);
    
    return container;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        showXcolorsError('Copied to clipboard!', 'success');
    }).catch(function() {
        showXcolorsError('Failed to copy to clipboard');
    });
}

function setPageBackground(colorHex) {
    document.body.style.backgroundColor = colorHex;
    showXcolorsError('done napalitan yun bg', 'success');
}

function showXcolorsError(message, type) {
    xcolorsError.textContent = message;
    xcolorsError.classList.add('show');
    
    if (type === 'success') {
        xcolorsError.style.backgroundColor = '#d4edda';
        xcolorsError.style.borderColor = '#27ae60';
        xcolorsError.style.color = '#27ae60';
    } else {
        xcolorsError.style.backgroundColor = '#fee';
        xcolorsError.style.borderColor = '#e74c3c';
        xcolorsError.style.color = '#e74c3c';
    }
    
    setTimeout(function() {
        xcolorsError.classList.remove('show');
    }, 3000);
}

function clearXcolorsError() {
    xcolorsError.classList.remove('show');
    xcolorsError.textContent = '';
}

function showXcolorsLoading() {
    xcolorsLoading.style.display = 'block';
    xcolorsResults.innerHTML = '';
    clearXcolorsError();
}

function hideXcolorsLoading() {
    xcolorsLoading.style.display = 'none';
}

function handleGenerateColors() {
    const inputValue = xcolorsSearchInput.value;
    const validation = validateColorInput(inputValue);
    
    if (!validation.valid) {
        showXcolorsError(validation.message);
        return;
    }
    
    const count = validation.value;
    const button = xcolorsGenerateBtn;
    
    button.disabled = true;
    button.classList.add('loading');
    showXcolorsLoading();
    
    fetchMultipleColors(count)
        .then(function(colors) {
            displayColors(colors);
            hideXcolorsLoading();
            button.classList.remove('loading');
            button.disabled = false;
        })
        .catch(function(error) {
            showXcolorsError('Failed to fetch colors. Please try again.');
            hideXcolorsLoading();
            button.classList.remove('loading');
            button.disabled = false;
        });
}


function setupXcolorsEventListeners() {
    xcolorsGenerateBtn.addEventListener('click', handleGenerateColors);
    
    xcolorsSearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleGenerateColors();
        }
    });
    
    xcolorsSearchInput.addEventListener('input', function() {
        clearXcolorsError();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setupXcolorsEventListeners();
    
    xcolorsSearchInput.value = '1';
    handleGenerateColors();
});
