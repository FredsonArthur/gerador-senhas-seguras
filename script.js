/* --- script.js - CÓDIGO FINAL, LIMPO E OTIMIZADO (Lógica Pura) --- */

// --- 1. CONFIGURAÇÕES E VARIÁVEIS GLOBAIS (NÃO dependem do DOM) ---

// NOTA: 'translations' e 'wordLists' são carregados globalmente a partir de 'translations.js'

let generatedPasswords = [];
const MAX_HISTORY = 10;
let currentMode = 'char'; // 'char' ou 'passphrase'

// Variáveis de escopo global para acesso seguro, atualizadas em applyTranslations
let t; 
let activeWordList; 
let currentLang = localStorage.getItem('language') || 'pt-br';

// --- 2. CONJUNTOS DE CARACTERES ---
const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    accented: 'áàãâéèêíìîóòõôúùûçÁÀÃÂÉÈÊÍÌÎÓÒÕÔÚÙÛÇ',
    ambiguous: 'il1Lo0O' // Caracteres para exclusão
};


// --- 3. FUNÇÕES DE UTILIDADE E SEGURANÇA (Sem dependência do DOM) ---

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


// --- 4. LÓGICA DE FORÇA DA SENHA (Recebe referências do DOM como argumentos ou usa escopo de closure) ---

function capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Calcula a entropia da senha (em bits) baseada no modo.
 * @param {HTMLInputElement} capitalizeWords - Referência ao checkbox.
 * @param {HTMLInputElement} includePassphraseDigits - Referência ao checkbox.
 */
function calculateStrength(password, mode, charSetSize, passphraseArray = null, capitalizeWords, includePassphraseDigits) {
    if (password.length === 0) return 0;
    let entropy = 0;
    if (mode === 'char') {
        entropy = password.length * Math.log2(charSetSize);
    } else if (mode === 'passphrase' && activeWordList) {
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
            // 💡 NOTA: O fator '2' é um peso arbitrário para aumentar a pontuação de entropia. 
            // Para simplificar e maior rigor, o ' * 2' poderia ser removido.
            entropy += (digitEntropy + positionEntropy) * 2; 
        }
    }
    return entropy > 0 ? entropy : 0;
}

/**
 * Converte a entropia (bits) em tempo de quebra e formata em string legível.
 * @param {number} entropy - Entropia em bits.
 * @returns {string} Tempo de quebra formatado.
 */
function formatBreakTime(entropy) {
    // 1 trilhão de tentativas por segundo (10^12)
    const ATTACKS_PER_SECOND = 1e12; 
    
    // Total de combinações (2^entropy)
    const totalCombinations = Math.pow(2, entropy);
    
    // Tempo em segundos
    const timeInSeconds = totalCombinations / ATTACKS_PER_SECOND;

    // Constantes de tempo
    const MINUTE = 60;
    const HOUR = 3600;
    const DAY = 86400;
    const YEAR = 31536000;
    
    if (timeInSeconds < MINUTE) {
        return `${timeInSeconds.toFixed(0)} ${t.time_seconds}`;
    } else if (timeInSeconds < HOUR) {
        return `${(timeInSeconds / MINUTE).toFixed(0)} ${t.time_minutes}`;
    } else if (timeInSeconds < DAY) {
        return `${(timeInSeconds / HOUR).toFixed(0)} ${t.time_hours}`;
    } else if (timeInSeconds < YEAR) {
        return `${(timeInSeconds / DAY).toFixed(0)} ${t.time_days}`;
    } else if (timeInSeconds < 1000 * YEAR) {
        // Se for menos de 1000 anos, mostra em anos
        return `${(timeInSeconds / YEAR).toFixed(0)} ${t.time_years}`;
    } else {
        // Para tempos muito longos, simplifica para milhões de anos
        const millionsOfYears = timeInSeconds / (1e6 * YEAR);
        return `${millionsOfYears.toFixed(0)} ${t.time_millions_years}`;
    }
}

/**
 * Atualiza o indicador de força, tempo de quebra e acessibilidade.
 * @param {HTMLElement} strengthBar - Elemento da barra.
 * @param {HTMLElement} strengthText - Elemento do texto.
 */
function updateStrengthIndicator(password, mode, charSetSize, passphraseArray = null, strengthBar, strengthText, charInputs = {}, passphraseInputs = {}) {
    const capitalizeWords = passphraseInputs.capitalizeWords;
    const includePassphraseDigits = passphraseInputs.includePassphraseDigits;

    const entropy = calculateStrength(
        password, 
        mode, 
        charSetSize, 
        passphraseArray, 
        capitalizeWords, 
        includePassphraseDigits
    );
    let strength = "";
    let width = 0;
    let className = "";

    // 1. Lógica de cálculo e classificação
    if (entropy === 0 || password === t.displayDefault) {
        strengthBar.style.width = "0%";
        strengthText.textContent = t.tooShort; 
        strengthBar.className = `strength-bar`;
        
        // 🔑 ARIA: Valores de acessibilidade
        strengthBar.setAttribute('aria-valuenow', 0);
        strengthBar.setAttribute('aria-valuetext', t.tooShort);
        return;
    }

    if (entropy < 40) {
        strength = t.tooShort; 
        width = (entropy / 40) * 25; 
        className = "strength-weak";
    } else if (entropy < 60) {
        strength = t.weak; 
        width = 25 + ((entropy - 40) / 20) * 25; 
        className = "strength-medium";
    } else if (entropy < 80) {
        strength = t.medium; 
        width = 50 + ((entropy - 60) / 20) * 25; 
        className = "strength-strong"; 
    } else if (entropy < 100) {
        strength = t.strong; 
        width = 75 + ((entropy - 80) / 20) * 25; 
        className = "strength-strong"; 
    } else {
        strength = t.veryStrong; 
        width = 100;
        className = "strength-very-strong";
    }
    
    // 2. Formatação do Tempo de Quebra
    const breakTime = formatBreakTime(entropy);

    // 3. Atualização do DOM e ARIA
    strengthBar.style.width = Math.min(width, 100).toFixed(2) + "%";
    strengthBar.className = `strength-bar ${className}`;
    
    // Texto aprimorado com entropia e tempo de quebra
    strengthText.innerHTML = 
        `${t.strengthLabel} <strong>${strength}</strong> (${entropy.toFixed(1)} bits)<br>` +
        `${t.breakTimeLabel} <strong>${breakTime}</strong>`;

    // 🔑 ARIA: Configuração de acessibilidade para a barra
    strengthBar.setAttribute('role', 'progressbar');
    strengthBar.setAttribute('aria-valuenow', entropy.toFixed(1));
    strengthBar.setAttribute('aria-valuemin', 0);
    strengthBar.setAttribute('aria-valuemax', 128); // Um valor de referência alto
    strengthBar.setAttribute('aria-valuetext', `${strength}: ${breakTime}`);
}


// --- 5. LÓGICA DE GERAÇÃO (Usa referências de closure) ---

function removeAmbiguous(charSet) {
    const regex = new RegExp('[' + charSets.ambiguous.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + ']', 'g');
    return charSet.replace(regex, '');
}

/**
 * @param {Object} inputs - Objeto contendo todas as referências de input de Caracteres.
 */
function generateCharacterPassword(inputs, strengthInputs) {
    const { passwordDisplay, lengthNumberInput, excludeAmbiguous, 
            includeUppercase, includeLowercase, includeNumbers, includeSymbols, includeAccentedChars } = inputs;
    
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
        updateStrengthIndicator("", 'char', 0, null, strengthInputs.strengthBar, strengthInputs.strengthText);
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
    updateStrengthIndicator(password, 'char', allChars.length, null, strengthInputs.strengthBar, strengthInputs.strengthText, inputs, strengthInputs.passphraseInputs);
    saveToHistory(password);
}

/**
 * @param {Object} inputs - Objeto contendo todas as referências de input de Passphrase.
 */
function generatePassphrase(inputs, strengthInputs) {
    const { passwordDisplay, numWordsNumberInput, separatorInput, capitalizeWords, includePassphraseDigits } = inputs;

    const numWords = parseInt(numWordsNumberInput.value); 
    const separator = separatorInput.value || '-';
    const doCapitalize = capitalizeWords.checked;
    const doIncludeDigits = includePassphraseDigits.checked;

    let passphraseArray = [];

    if (!activeWordList || numWords < 3 || numWords > 10) { 
        passwordDisplay.value = t.errorInvalidWords; 
        updateStrengthIndicator("", 'passphrase', 0, null, strengthInputs.strengthBar, strengthInputs.strengthText);
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
    updateStrengthIndicator(finalPassphrase, 'passphrase', activeWordList.length, passphraseArray, strengthInputs.strengthBar, strengthInputs.strengthText, strengthInputs.charInputs, inputs);
    saveToHistory(finalPassphrase);
}

/**
 * Função principal, chama a geração correta.
 * @param {Object} elements - Todas as referências de elementos.
 */
function generatePassword(elements) {
    const { copyButton, passwordDisplay, modePassphrase, charInputs, passphraseInputs, strengthInputs } = elements;
    
    copyButton.textContent = t.copy; 
    copyButton.classList.remove('copied');
    
    if (passwordDisplay.value === t.displayDefault) {
        passwordDisplay.value = "";
    }

    if (modePassphrase.checked) {
        generatePassphrase(passphraseInputs, strengthInputs);
    } else {
        generateCharacterPassword(charInputs, strengthInputs);
    }
}


// --- 6. LÓGICA DE SINCRONIZAÇÃO E MODO ---

function syncLengthInputs(source, lengthRangeInput, lengthNumberInput) {
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

function syncNumWordsInputs(source, numWordsRangeInput, numWordsNumberInput) {
    const value = source.value;
    const min = parseInt(numWordsNumberInput.min);
    const max = parseInt(numWordsNumberInput.max);
    const safeValue = Math.min(Math.max(parseInt(value) || min, min), max);

    if (source === numWordsRangeInput) {
        numWordsNumberInput.value = safeValue;
    } else {
        numWordsNumberInput.value = safeValue;
    }
}

/**
 * Alterna entre os modos de exibição de configurações (Character vs. Passphrase).
 * @param {Object} elements - Todas as referências de elementos.
 */
function switchMode(elements) {
    const { modePassphrase, charSettingsDiv, passphraseSettingsDiv, generateButton } = elements;
    
    const isPassphraseMode = modePassphrase.checked;
    
    charSettingsDiv.style.display = isPassphraseMode ? 'none' : 'block';
    passphraseSettingsDiv.style.display = isPassphraseMode ? 'block' : 'none';
    
    generateButton.textContent = t.generateButton;
    
    currentMode = isPassphraseMode ? 'passphrase' : 'char';
    
    generatePassword(elements);
}


// --- 7. HISTÓRICO, COPIAR E TOAST (Acessa o DOM via closure ou getElementById pontual) ---

function saveToHistory(password) {
    if (!password || password.includes('Clique em GERAR') || password.includes('Selecione')) return; 
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
    const historyList = document.getElementById('password-history-list');
    const historyStatus = document.getElementById('history-status');
    const clearHistoryButton = document.getElementById('clear-history-button');

    // Segurança: se os elementos não existirem, aborta.
    if (!historyList || !historyStatus || !clearHistoryButton) return; 

    let history = JSON.parse(sessionStorage.getItem('passwordHistory') || '[]');
    historyList.innerHTML = ''; 
    
    if (history.length === 0) {
        historyStatus.textContent = t.historyEmpty; 
        historyStatus.style.display = 'block';
        clearHistoryButton.style.display = 'none';
        return;
    }
    historyStatus.style.display = 'none';
    clearHistoryButton.style.display = 'inline-block';

    history.slice().reverse().forEach((pwd) => {
        const item = document.createElement('div');
        item.classList.add('history-item');
        // 💡 Ajuste: Usando t.copy em vez de t.historyPasswordCopied no botão inicial.
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
            e.target.textContent = t.historyPasswordCopied; 
            setTimeout(() => { e.target.textContent = t.copy; }, 1500);
        });
    });
}

function clearHistory() {
    sessionStorage.removeItem('passwordHistory');
    renderHistory(); 
    showToast(t.historyClear); 
}

function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return; // Aborta se o container não existe
    
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

function copyToClipboard(text, copyButton) {
    navigator.clipboard.writeText(text).then(() => {
        copyButton.textContent = t.copied; 
        copyButton.classList.add('copied');
        showToast(t.copied); 
        setTimeout(() => {
            copyButton.textContent = t.copy; 
            copyButton.classList.remove('copied');
        }, 1500);
    });
}


// --- 8. LÓGICA DE TEMA SIMPLIFICADA 🌙☀️ ---

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


// --- 9. LÓGICA DE INTERNACIONALIZAÇÃO (i18n) ---

/**
 * Aplica as traduções baseadas no idioma ativo.
 */
function applyTranslations(lang, elements) {
    if (!translations[lang] || !wordLists[lang]) {
        console.error(`Traduções ou listas de palavras para o idioma ${lang} não encontradas.`);
        return;
    }
    t = translations[lang];
    activeWordList = wordLists[lang];
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        let text = t[key] || el.textContent;

        if (text && text.includes('**')) {
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            el.innerHTML = text;
        } else if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'number')) {
            if (key === 'displayDefault') {
                el.setAttribute('placeholder', text);
            }
        } else {
            el.textContent = text;
        }
    });

    document.title = t.title;
    
    // Atualiza o display padrão
    if (elements.passwordDisplay.value === "" || elements.passwordDisplay.value.includes("Clique em GERAR")) {
        elements.passwordDisplay.value = t.displayDefault;
    }

    // Garante que o texto do botão de Gerar e Força seja atualizado
    switchMode(elements); 
    
    // updateStrengthIndicator é chamado dentro de switchMode(elements)
    
    renderHistory();
}

/**
 * Função para trocar o idioma e persistir a escolha.
 */
function switchLanguage(newLang, elements) {
    localStorage.setItem('language', newLang);
    currentLang = newLang; // Atualiza a variável de estado
    applyTranslations(newLang, elements);
}

// --- 10. INICIALIZAÇÃO E OUVINTES DE EVENTOS (Listeners) ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. 🎯 REUNIÃO DE TODAS AS REFERÊNCIAS DO DOM (Para simplificar e otimizar)
    
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
    const clearHistoryButton = document.getElementById('clear-history-button');

    // Seletor de Idioma
    const languageSelect = document.getElementById('language-select');

    // 2. 💡 Organiza as referências em objetos (passadas para as funções)
    const charInputs = { passwordDisplay, lengthNumberInput, excludeAmbiguous, includeUppercase, includeLowercase, includeNumbers, includeSymbols, includeAccentedChars };
    const passphraseInputs = { passwordDisplay, numWordsNumberInput, separatorInput, capitalizeWords, includePassphraseDigits };
    const strengthInputs = { strengthBar, strengthText, charInputs, passphraseInputs }; // Passa os inputs para o cálculo de força
    
    const elements = { 
        passwordDisplay, generateButton, copyButton, modeChar, modePassphrase, 
        charSettingsDiv, passphraseSettingsDiv, languageSelect, themeToggle, 
        lengthRangeInput, lengthNumberInput, numWordsRangeInput, numWordsNumberInput,
        charInputs, passphraseInputs, strengthInputs
    };

    // 3. Inicialização
    loadTheme();
    languageSelect.value = currentLang; 
    applyTranslations(currentLang, elements);
    
    // 4. OUVINTES DE EVENTOS (Usam as referências de closure)
    
    // Modo (Caracteres/Passphrase)
    modeChar.addEventListener('change', () => switchMode(elements));
    modePassphrase.addEventListener('change', () => switchMode(elements));

    // Comprimento/Número de Palavras
    lengthRangeInput.addEventListener('input', () => { 
        syncLengthInputs(lengthRangeInput, lengthRangeInput, lengthNumberInput); 
        updateStrengthIndicator(passwordDisplay.value, currentMode, 0, null, strengthBar, strengthText, charInputs, passphraseInputs); 
    });
    lengthNumberInput.addEventListener('input', () => { 
        syncLengthInputs(lengthNumberInput, lengthRangeInput, lengthNumberInput); 
        updateStrengthIndicator(passwordDisplay.value, currentMode, 0, null, strengthBar, strengthText, charInputs, passphraseInputs); 
    });
    numWordsRangeInput.addEventListener('input', () => { 
        syncNumWordsInputs(numWordsRangeInput, numWordsRangeInput, numWordsNumberInput); 
        updateStrengthIndicator(passwordDisplay.value, currentMode, 0, null, strengthBar, strengthText, charInputs, passphraseInputs); 
    });
    numWordsNumberInput.addEventListener('input', () => { 
        syncNumWordsInputs(numWordsNumberInput, numWordsRangeInput, numWordsNumberInput); 
        updateStrengthIndicator(passwordDisplay.value, currentMode, 0, null, strengthBar, strengthText, charInputs, passphraseInputs); 
    });


    // Ações ao Gerar e Copiar (incluindo mudanças nas opções de geração)
    const generationInputs = [
        includeUppercase, includeLowercase, includeNumbers, includeSymbols, 
        includeAccentedChars, excludeAmbiguous, separatorInput, capitalizeWords, includePassphraseDigits
    ];
    
    generationInputs.forEach(input => {
        input.addEventListener('change', () => generatePassword(elements)); 
        input.addEventListener('input', () => { 
            updateStrengthIndicator(passwordDisplay.value, currentMode, 0, null, strengthBar, strengthText, charInputs, passphraseInputs); 
        });
    });

    generateButton.addEventListener('click', () => generatePassword(elements));
    
    // Copiar
    copyButton.addEventListener('click', () => {
        const password = passwordDisplay.value;
        if (password && password !== t.displayDefault && !password.includes('**')) {
            copyToClipboard(password, copyButton);
        } else {
            showToast(t.displayDefault); 
        }
    });

    // Tema
    themeToggle.addEventListener('click', toggleTheme);

    // Histórico
    clearHistoryButton.addEventListener('click', clearHistory);

    // Seletor de Idioma
    languageSelect.addEventListener('change', (e) => {
        switchLanguage(e.target.value, elements);
    });

    // 5. Gera a senha inicial (já coberta pelo applyTranslations/switchMode)
});