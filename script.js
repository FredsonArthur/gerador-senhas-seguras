/* --- script.js - CÓDIGO FINAL E LIMPO (Lógica Pura) --- */

// --- 1. CONFIGURAÇÕES E VARIÁVEIS GLOBAIS ---

// NOTA: 'translations' e 'wordLists' são carregados globalmente a partir de 'translations.js'

let currentLang = localStorage.getItem('language') || 'pt-br';
// Acessa os objetos globais definidos em translations.js
let t = translations[currentLang]; // Variável de tradução ativa
let activeWordList = wordLists[currentLang]; // Lista de palavras ativa

let generatedPasswords = [];
const MAX_HISTORY = 10;
let currentMode = 'char'; // 'char' ou 'passphrase'

// --- 2. CONJUNTOS DE CARACTERES ---
const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    accented: 'áàãâéèêíìîóòõôúùûçÁÀÃÂÉÈÊÍÌÎÓÒÕÔÚÙÛÇ',
    ambiguous: 'il1Lo0O' // Caracteres para exclusão
};


// --- 3. REFERÊNCIAS AO DOM ---

// Elementos de Entrada/Saída
const passwordDisplay = document.getElementById('password-display');
const generateButton = document.getElementById('generate-button');
const copyButton = document.getElementById('copy-button');

// Range Sliders
const lengthRangeInput = document.getElementById('length-range'); 
const lengthNumberInput = document.getElementById('length-number');
const numWordsRangeInput = document.getElementById('num-words-range');
const numWordsNumberInput = document.getElementById('num-words-number');

// Checkboxes de Caracteres
const includeUppercase = document.getElementById('include-uppercase');
const includeLowercase = document.getElementById('include-lowercase');
const includeNumbers = document.getElementById('include-numbers');
const includeSymbols = document.getElementById('include-symbols');
const includeAccentedChars = document.getElementById('include-accented-chars');
const excludeAmbiguous = document.getElementById('exclude-ambiguous');

// Elementos de Configuração de Modo
const modeChar = document.getElementById('mode-char');
const modePassphrase = document.getElementById('mode-passphrase');
const charSettingsDiv = document.getElementById('char-settings');
const passphraseSettingsDiv = document.getElementById('passphrase-settings');

// Configurações de Passphrase
const separatorInput = document.getElementById('separator');
const capitalizeWords = document.getElementById('capitalize-words');
const includePassphraseDigits = document.getElementById('include-passphrase-digits');

// Indicador de Força
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');

// Tema
const themeToggle = document.getElementById('theme-toggle');

// Histórico
const historyList = document.getElementById('password-history-list');
const clearHistoryButton = document.getElementById('clear-history-button');
const historyStatus = document.getElementById('history-status');

// NOVO: Seletor de Idioma
const languageSelect = document.getElementById('language-select');


// --- 4. FUNÇÕES DE UTILIDADE E SEGURANÇA ---

/**
 * Retorna um índice seguro e aleatório (crypto.getRandomValues).
 */
function getRandomSecureIndex(max) {
    const randomArray = new Uint32Array(1); 
    let randomNumber;
    const range = 4294967296; // 2^32
    const maxRandom = range - (range % max);
    
    do {
        window.crypto.getRandomValues(randomArray);
        randomNumber = randomArray[0];
    } while (randomNumber >= maxRandom);

    return randomNumber % max;
}

/**
 * Embaralha uma string/array de forma criptograficamente segura (Fisher-Yates).
 */
function secureShuffle(input) {
    let array = Array.isArray(input) ? input : input.split('');
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = getRandomSecureIndex(currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return Array.isArray(input) ? array : array.join('');
}


// --- 5. LÓGICA DE FORÇA DA SENHA ---

function capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function calculateStrength(password, mode, charSetSize, passphraseArray = null) {
    if (password.length === 0) return 0;
    let entropy = 0;
    if (mode === 'char') {
        entropy = password.length * Math.log2(charSetSize);
    } else if (mode === 'passphrase') {
        // Usa a lista ativa para o cálculo de entropia
        const numWords = passphraseArray.filter(item => activeWordList.includes(item.toLowerCase())).length;
        entropy = numWords * Math.log2(activeWordList.length); 
        if (capitalizeWords.checked) {
            entropy += numWords * 1; 
        }
        const doIncludeDigits = includePassphraseDigits.checked;
        if (doIncludeDigits && passphraseArray) {
            const numElements = passphraseArray.length; 
            const digitEntropy = Math.log2(10); 
            const positionEntropy = Math.log2(numElements); 
            entropy += digitEntropy + positionEntropy;
        }
    }
    return entropy > 0 ? entropy : 0;
}

function updateStrengthIndicator(password, mode, charSetSize, passphraseArray = null) {
    const entropy = calculateStrength(password, mode, charSetSize, passphraseArray);
    let strength = "";
    let width = 0;
    let className = "";

    if (entropy === 0) {
        strengthBar.style.width = "0%";
        strengthText.textContent = t.strengthNone; 
        return;
    }

    if (entropy < 40) {
        strength = t.strengthWeak; 
        width = (entropy / 40) * 25; 
        className = "strength-weak";
    } else if (entropy < 60) {
        strength = t.strengthMedium; 
        width = 25 + ((entropy - 40) / 20) * 25; 
        className = "strength-medium";
    } else if (entropy < 80) {
        strength = t.strengthStrong; 
        width = 50 + ((entropy - 60) / 20) * 25; 
        className = "strength-strong";
    } else {
        strength = t.strengthVeryStrong; 
        width = 75 + Math.min(25, (entropy - 80) / 20); 
        className = "strength-very-strong";
    }
    
    strengthBar.style.width = Math.min(width, 100).toFixed(2) + "%";
    strengthBar.className = `strength-bar ${className}`;
    strengthText.textContent = `${strength} (${entropy.toFixed(1)} bits)`;
}


// --- 6. LÓGICA DE GERAÇÃO ---

function removeAmbiguous(charSet) {
    const regex = new RegExp('[' + charSets.ambiguous.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + ']', 'g');
    return charSet.replace(regex, '');
}

function generateCharacterPassword() {
    const length = parseInt(lengthNumberInput.value);
    const isAmbiguousExcluded = excludeAmbiguous.checked;

    let allChars = "";
    let password = "";
    let requiredChars = []; 
    
    const processCharSet = (charSet) => isAmbiguousExcluded ? removeAmbiguous(charSet) : charSet;

    // 1. Constrói o conjunto
    if (includeUppercase.checked) { const chars = processCharSet(charSets.uppercase); if(chars.length > 0) { allChars += chars; requiredChars.push(chars); } }
    if (includeLowercase.checked) { const chars = processCharSet(charSets.lowercase); if(chars.length > 0) { allChars += chars; requiredChars.push(chars); } }
    if (includeNumbers.checked) { const chars = processCharSet(charSets.numbers); if(chars.length > 0) { allChars += chars; requiredChars.push(chars); } }
    if (includeSymbols.checked) { const chars = processCharSet(charSets.symbols); if(chars.length > 0) { allChars += chars; requiredChars.push(chars); } }
    if (includeAccentedChars.checked) { const chars = processCharSet(charSets.accented); if(chars.length > 0) { allChars += chars; requiredChars.push(chars); } }
    
    // 2. VALIDAÇÃO
    if (allChars.length === 0) {
        passwordDisplay.value = t.errorSelectChar; 
        updateStrengthIndicator("", 'char', 0);
        return;
    }
    
    // 3. Garante que os obrigatórios sejam incluídos
    for (const charSet of requiredChars) {
        password += charSet[getRandomSecureIndex(charSet.length)];
    }
    
    // 4. Preenche e evita repetição trivial
    const remainingLength = length - requiredChars.length;
    let lastChar = password.slice(-1); 
    
    for (let i = 0; i < remainingLength; i++) {
        let newChar;
        let attempts = 0;
        do {
            newChar = allChars[getRandomSecureIndex(allChars.length)];
            attempts++;
            if (allChars.length === 1 && attempts > 1) break; 
        } while (newChar === lastChar); 
        password += newChar;
        lastChar = newChar; 
    }

    // 5. Embaralha
    password = secureShuffle(password);
    
    passwordDisplay.value = password;
    updateStrengthIndicator(password, 'char', allChars.length);
    saveToHistory(password);
}

function generatePassphrase() {
    const numWords = parseInt(numWordsNumberInput.value); 
    const separator = separatorInput.value || '-';
    const doCapitalize = capitalizeWords.checked;
    const doIncludeDigits = includePassphraseDigits.checked;

    let passphraseArray = [];

    if (numWords < 3 || numWords > 10) { 
        passwordDisplay.value = t.errorInvalidWords; 
        updateStrengthIndicator("", 'passphrase', 0);
        return;
    }

    // 1. Gera as palavras usando a lista ativa
    for (let i = 0; i < numWords; i++) {
        let word = activeWordList[getRandomSecureIndex(activeWordList.length)];
        if (doCapitalize) {
            word = capitalizeFirstLetter(word);
        }
        passphraseArray.push(word);
    }
    
    // 2. Inclui o dígito
    if (doIncludeDigits) {
        const numDigits = getRandomSecureIndex(3) + 1; 
        const maxNumber = 10**numDigits - 1; 
        const digit = getRandomSecureIndex(maxNumber + 1); 
        const digitString = String(digit).padStart(numDigits, '0'); 
        const insertIndex = getRandomSecureIndex(passphraseArray.length + 1); 
        passphraseArray.splice(insertIndex, 0, digitString);
    }

    // 3. Junta
    const finalPassphrase = passphraseArray.join(separator);
    
    passwordDisplay.value = finalPassphrase;
    updateStrengthIndicator(finalPassphrase, 'passphrase', activeWordList.length, passphraseArray);
    saveToHistory(finalPassphrase);
}

function generatePassword() {
    copyButton.textContent = t.copy; 
    copyButton.classList.remove('copied');
    // Limpa a exibição antes de gerar
    passwordDisplay.value = t.defaultMessage; 

    if (modePassphrase.checked) {
        generatePassphrase();
    } else {
        generateCharacterPassword();
    }
}


// --- 7. LÓGICA DE SINCRONIZAÇÃO ---

function syncLengthInputs(source) {
    const value = source.value;
    const min = parseInt(lengthNumberInput.min);
    const max = parseInt(lengthNumberInput.max);
    const safeValue = Math.min(Math.max(parseInt(value) || min, min), max);

    if (source === lengthRangeInput) {
        lengthNumberInput.value = safeValue;
    } else {
        lengthRangeInput.value = safeValue;
    }
}

function syncNumWordsInputs(source) {
    const value = source.value;
    const min = parseInt(numWordsNumberInput.min);
    const max = parseInt(numWordsNumberInput.max);
    const safeValue = Math.min(Math.max(parseInt(value) || min, min), max);

    if (source === numWordsRangeInput) {
        numWordsNumberInput.value = safeValue;
    } else {
        numWordsRangeInput.value = safeValue;
    }
}

/**
 * Alterna entre os modos de exibição de configurações (Character vs. Passphrase).
 */
function switchMode() {
    const isPassphraseMode = modePassphrase.checked;
    
    charSettingsDiv.style.display = isPassphraseMode ? 'none' : 'block';
    passphraseSettingsDiv.style.display = isPassphraseMode ? 'block' : 'none';
    
    // Atualiza o texto do botão de geração (AGORA TRADUZIDO)
    generateButton.textContent = isPassphraseMode ? t.generatePassphrase : t.generate;
    
    currentMode = isPassphraseMode ? 'passphrase' : 'char';
    
    // Tenta gerar automaticamente ao mudar de modo
    generatePassword();
}


// --- 8. HISTÓRICO, COPIAR E TOAST ---

function saveToHistory(password) {
    if (!password || password.includes('**')) return; 
    let history = JSON.parse(sessionStorage.getItem('passwordHistory') || '[]');
    if (history.length === 0 || history[history.length - 1] !== password) {
        history.push(password);
    }
    if (history.length > MAX_HISTORY) {
        history.shift(); 
    }
    sessionStorage.setItem('passwordHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    let history = JSON.parse(sessionStorage.getItem('passwordHistory') || '[]');
    historyList.innerHTML = ''; 
    
    // Se não há histórico, mostra a mensagem de status traduzida
    if (history.length === 0) {
        historyStatus.textContent = t.historyStatus; 
        historyStatus.style.display = 'block';
        return;
    }
    historyStatus.style.display = 'none';

    history.slice().reverse().forEach((pwd) => {
        const item = document.createElement('div');
        item.classList.add('history-item');
        item.innerHTML = `
            <span class="history-password">${pwd}</span>
            <button class="history-copy-btn" data-password="${pwd}">${t.copy}</button>
        `;
        historyList.appendChild(item);
    });

    document.querySelectorAll('.history-copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pwdToCopy = e.target.getAttribute('data-password');
            navigator.clipboard.writeText(pwdToCopy);
            e.target.textContent = t.copySuccess; 
            setTimeout(() => { e.target.textContent = t.copy; }, 1500);
        });
    });
}

function clearHistory() {
    sessionStorage.removeItem('passwordHistory');
    renderHistory(); 
    showToast(t.toastHistoryCleared); 
}

function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;

    toastContainer.appendChild(toast);
    void toast.offsetWidth;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, 3000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        copyButton.textContent = t.copySuccess; 
        copyButton.classList.add('copied');
        showToast(t.toastCopied); 
        setTimeout(() => {
            copyButton.textContent = t.copy; 
            copyButton.classList.remove('copied');
        }, 1500);
    });
}


// --- 9. LÓGICA DE TEMA SIMPLIFICADA 🌙☀️ ---

function setTheme(theme) {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    setTheme(isDark ? 'light' : 'dark'); 
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 
                       (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
}


// --- 10. LÓGICA DE INTERNACIONALIZAÇÃO (i18n) ---

/**
 * Aplica as traduções baseadas no idioma ativo.
 */
function applyTranslations(lang) {
    // Acessa os objetos globais (definidos em translations.js)
    if (!translations[lang]) {
        console.error(`Traduções para o idioma ${lang} não encontradas.`);
        return;
    }

    // 1. Atualiza a variável de tradução ativa 't' e as listas
    t = translations[lang];
    currentLang = lang;
    activeWordList = wordLists[lang];
    
    // 2. Itera sobre todos os elementos com data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        let text = t[key] || el.textContent;

        // Suporta formatação de texto (ex: **negrito**)
        if (text.includes('**')) {
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            el.innerHTML = text;
        } else if (el.tagName === 'INPUT' && el.type === 'text') {
            el.setAttribute('placeholder', text);
            if (key === 'displayDefault' && el.value === "") {
                el.value = text;
            }
        } else {
            el.textContent = text;
        }
    });

    // 3. Casos Especiais Manuais
    document.title = t.title;
    
    // 4. Garante que o texto do botão de Gerar e Força seja atualizado
    switchMode(); 
    updateStrengthIndicator(passwordDisplay.value, currentMode, 0);

    // 5. Atualiza o status do histórico
    renderHistory();
}

/**
 * Função para trocar o idioma e persistir a escolha.
 */
function switchLanguage(newLang) {
    localStorage.setItem('language', newLang);
    currentLang = newLang;
    applyTranslations(newLang);
}

// --- 11. INICIALIZAÇÃO E OUVINTES DE EVENTOS (Listeners) ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrega o tema e o idioma (ordem é importante!)
    loadTheme();
    
    // Sincroniza o seletor de idioma com o idioma salvo (ou padrão 'pt-br')
    languageSelect.value = currentLang; 
    applyTranslations(currentLang); // Aplica as traduções no carregamento
    
    // 2. OUVINTES DE EVENTOS
    
    // Modo (Caracteres/Passphrase)
    modeChar.addEventListener('change', switchMode);
    modePassphrase.addEventListener('change', switchMode);

    // Comprimento/Número de Palavras
    lengthRangeInput.addEventListener('input', () => syncLengthInputs(lengthRangeInput));
    lengthNumberInput.addEventListener('input', () => syncLengthInputs(lengthNumberInput));
    numWordsRangeInput.addEventListener('input', () => syncNumWordsInputs(numWordsRangeInput));
    numWordsNumberInput.addEventListener('input', () => syncNumWordsInputs(numWordsNumberInput));

    // Ações ao Gerar e Copiar (incluindo mudanças nas opções de geração)
    const generationInputs = [
        generateButton, includeUppercase, includeLowercase, includeNumbers, 
        includeSymbols, includeAccentedChars, excludeAmbiguous, separatorInput, 
        capitalizeWords, includePassphraseDigits, lengthRangeInput, numWordsRangeInput
    ];
    // Adiciona listener para alterações que exigem nova geração/cálculo
    generationInputs.forEach(input => {
        input.addEventListener('change', generatePassword); 
        input.addEventListener('input', () => { 
            // Para sliders, atualiza a força sem gerar nova senha a cada movimento
            updateStrengthIndicator(passwordDisplay.value, currentMode, 0); 
        });
    });
    generateButton.addEventListener('click', generatePassword);
    
    // Copiar
    copyButton.addEventListener('click', () => {
        const password = passwordDisplay.value;
        if (password && password !== t.defaultMessage && !password.includes('**')) {
            copyToClipboard(password);
        } else {
            showToast(t.defaultMessage); 
        }
    });

    // Tema
    themeToggle.addEventListener('click', toggleTheme);

    // Histórico
    clearHistoryButton.addEventListener('click', clearHistory);

    // NOVO: Seletor de Idioma
    languageSelect.addEventListener('change', (e) => {
        switchLanguage(e.target.value);
    });

    // Finalmente, gera uma senha inicial ao carregar
    generatePassword();
});