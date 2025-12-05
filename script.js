/* --- script.js - CÓDIGO FINAL, LIMPO E OTIMIZADO (Lógica Pura) --- */

// NOTA: Para rodar este script, você precisaria de um arquivo 'translations.js' 
// que defina 'translations' e 'wordLists', além do HTML e CSS.

// --- 1. CONFIGURAÇÕES E VARIÁVEIS GLOBAIS (NÃO dependem do DOM) ---

// 🚨 NOVO: CONSTANTE PARA A VALIDAÇÃO DE ENTROPIA
const MIN_WORDS_REQUIRED = 256; // Mínimo de palavras para garantir 8 bits de entropia.

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
 * Obtém a lista de palavras a ser usada (personalizada se houver, ou a padrão).
 * Atualiza o aviso de segurança da lista personalizada.
 * @param {HTMLTextAreaElement} customWordlist - Elemento textarea da lista personalizada.
 * @param {HTMLElement} customDictWarning - Elemento para exibir o aviso.
 * @returns {Array<string>} A lista de palavras efetiva.
 */
function getEffectiveWordList(customWordlist, customDictWarning) {
    let customList = [];
    
    // 1. Processa a lista personalizada
    if (customWordlist && customWordlist.value.trim().length > 0) {
        customList = customWordlist.value
            .toLowerCase()
            .split(/[\s,]+/) // Divide por espaço ou vírgula (incluindo nova linha)
            .filter(word => word.length > 0)
            .map(word => word.trim()) // Adicionado para limpar espaços extras no início/fim
            // 🚨 REFORÇO DE SANITIZAÇÃO: Remove palavras que ainda contenham espaços internos
            .filter(word => !word.includes(' ')); 
    }
    
    // 2. Determina a lista efetiva
    const listToUse = customList.length > 0 ? customList : activeWordList;

    // 3. Atualiza o aviso para o usuário (só se a lista personalizada estiver ativa)
    if (customDictWarning) {
        // 🚨 VALIDAÇÃO DE ENTROPIA IMPLEMENTADA AQUI
        if (customList.length > 0 && customList.length < MIN_WORDS_REQUIRED) {
            customDictWarning.textContent = t.customDictWarning;
            customDictWarning.style.display = 'block';
        } else {
            customDictWarning.textContent = '';
            customDictWarning.style.display = 'none';
        }
    }

    return listToUse;
}


/**
 * Calcula a entropia da senha (em bits) baseada no modo.
 * @param {HTMLInputElement} capitalizeWords - Referência ao checkbox.
 * @param {HTMLInputElement} includePassphraseDigits - Referência ao checkbox.
 */
function calculateStrength(password, mode, charSetSize, passphraseArray = null, capitalizeWords, includePassphraseDigits, effectiveWordList = null) {
    if (password.length === 0) return 0;
    let entropy = 0;
    
    if (mode === 'char') {
        entropy = password.length * Math.log2(charSetSize);
    } else if (mode === 'passphrase' && effectiveWordList) {
        const listSize = effectiveWordList.length;
        
        // Entropia baseada no tamanho da lista efetiva
        const numWordsInArray = passphraseArray ? passphraseArray.filter(item => effectiveWordList.includes(item.toLowerCase())).length : password.split(/[^a-zA-ZáàãâéèêíìîóòõôúùûçÁÀÃÂÉÈÊÍÌÎÓÒÕÔÚÙÛÇ]+/).filter(w => effectiveWordList.includes(w.toLowerCase())).length;
        
        entropy = numWordsInArray * Math.log2(listSize); 
        
        if (capitalizeWords.checked) {
            entropy += numWordsInArray * 1; 
        }
        
        const doIncludeDigits = includePassphraseDigits.checked;
        if (doIncludeDigits && passphraseArray) {
            // Conta quantos elementos no array são dígitos puros
            const numDigitsIncluded = passphraseArray.filter(item => /^\d+$/.test(item)).length;

            if (numDigitsIncluded > 0) {
                 // Cálculo de entropia de dígitos
                 const totalDigitEntropy = passphraseArray.reduce((acc, item) => {
                     const match = item.match(/^(\d+)$/);
                     if (match) {
                         const n = match[1].length;
                         return acc + (n * Math.log2(10));
                     }
                     return acc;
                 }, 0);
                 
                 // Adiciona a entropia da posição dos dígitos
                 const numElements = passphraseArray.length;
                 const positionEntropy = Math.log2(numElements); 
                 
                 entropy += totalDigitEntropy + (numDigitsIncluded * positionEntropy);
            }
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
    
    // Obtém a lista efetiva para o cálculo de entropia da Passphrase
    let effectiveWordList = null;
    if (mode === 'passphrase') {
        // Obtém o elemento customDictWarning do objeto passphraseInputs
        const customDictWarningElement = passphraseInputs.customDictWarning;
        
        // Passa o elemento customDictWarning para a função getEffectiveWordList para que ela atualize o aviso
        effectiveWordList = getEffectiveWordList(passphraseInputs.customWordlist, customDictWarningElement);
        charSetSize = effectiveWordList ? effectiveWordList.length : 0;
    }

    const entropy = calculateStrength(
        password, 
        mode, 
        charSetSize, 
        passphraseArray, 
        capitalizeWords, 
        includePassphraseDigits,
        effectiveWordList 
    );
    let strength = "";
    let width = 0;
    let className = "";

    // 1. Lógica de cálculo e classificação
    if (entropy === 0 || password === t.displayDefault || password.includes(t.errorSelectChar) || password.includes(t.errorInvalidWords)) {
        strengthBar.style.width = "0%";
        strengthText.textContent = t.tooShort; 
        strengthBar.className = `strength-bar`;
        
        // ARIA: Valores de acessibilidade
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

    // ARIA: Configuração de acessibilidade para a barra
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
    const { passwordDisplay, numWordsNumberInput, separatorInput, capitalizeWords, includePassphraseDigits, customWordlist, customDictWarning } = inputs;

    const numWords = parseInt(numWordsNumberInput.value); 
    
    // 🚨 ATUALIZAÇÃO: Sanitização e imposição de separador seguro
    let separator = separatorInput.value.trim();
    const defaultSeparator = '-';

    if (separator === '') {
        separator = defaultSeparator;
        // Atualiza o campo de input e salva as configurações para dar feedback ao usuário
        separatorInput.value = separator; 
        savePassphraseSettings(inputs); 
    }
    
    const doCapitalize = capitalizeWords.checked;
    const doIncludeDigits = includePassphraseDigits.checked;
    
    // Obtém a lista de palavras que será utilizada (customizada ou Diceware)
    const effectiveWordList = getEffectiveWordList(customWordlist, customDictWarning);

    let passphraseArray = [];

    // 1. VALIDAÇÃO
    if (!effectiveWordList || numWords < 3 || numWords > 10 || effectiveWordList.length === 0) { 
        passwordDisplay.value = t.errorInvalidWords; 
        updateStrengthIndicator("", 'passphrase', 0, null, strengthInputs.strengthBar, strengthInputs.strengthText);
        return;
    }
    
    // 2. Gera as palavras usando a lista efetiva
    for (let i = 0; i < numWords; i++) {
        let word = effectiveWordList[getRandomSecureIndex(effectiveWordList.length)];
        if (doCapitalize) {
            word = capitalizeFirstLetter(word);
        }
        passphraseArray.push(word);
    }
    
    // 3. Inclui o dígito
    if (doIncludeDigits) {
        const numDigits = getRandomSecureIndex(3) + 1; 
        const maxNumber = 10**numDigits - 1; 
        const digit = getRandomSecureIndex(maxNumber + 1); 
        const digitString = String(digit).padStart(numDigits, '0'); 
        const insertIndex = getRandomSecureIndex(passphraseArray.length + 1); 
        passphraseArray.splice(insertIndex, 0, digitString);
    }

    // 4. Junta
    const finalPassphrase = passphraseArray.join(separator);
    
    passwordDisplay.value = finalPassphrase;
    // 5. Atualiza a força usando a lista EFETIVA
    updateStrengthIndicator(finalPassphrase, 'passphrase', effectiveWordList.length, passphraseArray, strengthInputs.strengthBar, strengthInputs.strengthText, strengthInputs.charInputs, inputs);
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
    
    if (passwordDisplay.value === "" || passwordDisplay.value.includes("Clique em GERAR") || passwordDisplay.value.includes("Select")) {
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
    
    // 🔑 NOVO: Salva o modo atual
    localStorage.setItem('generatorMode', currentMode);

    // Chama a geração para que o indicador de força atualize corretamente
    generatePassword(elements);
}


// --- 7. HISTÓRICO, COPIAR E TOAST (Acessa o DOM via closure ou getElementById pontual) ---

function saveToHistory(password) {
    if (!password || password.includes(t.displayDefault) || password.includes(t.errorSelectChar) || password.includes(t.errorInvalidWords)) return; 
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


// --- 9. LÓGICA DE INTERNACIONALIZAÇÃO (i18n) e PERSISTÊNCIA ---

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
        } else if (el.tagName === 'TEXTAREA') {
            if (key === 'customDictPlaceholder') {
                el.setAttribute('placeholder', text);
            }
        } else {
            el.textContent = text;
        }
    });

    document.title = t.title;
    
    // Atualiza o display padrão
    if (elements.passwordDisplay.value === "" || elements.passwordDisplay.value.includes("Clique em GERAR") || elements.passwordDisplay.value.includes("Select")) {
        elements.passwordDisplay.value = t.displayDefault;
    }

    // Garante que o texto do botão de Gerar e Força seja atualizado
    // switchMode é chamado aqui, o que por sua vez chama generatePassword, atualizando a força.
    switchMode(elements); 
    
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

// 🔑 NOVO: FUNÇÃO PARA CARREGAR CONFIGURAÇÕES
function loadSettings(elements) {
    // Busca as configurações do localStorage. Usa um objeto vazio como fallback.
    const charSettings = JSON.parse(localStorage.getItem('charSettings') || '{}');
    const passphraseSettings = JSON.parse(localStorage.getItem('passphraseSettings') || '{}');
    const mode = localStorage.getItem('generatorMode') || 'char';

    // 1. Carrega Modo
    if (mode === 'passphrase') {
        elements.modePassphrase.checked = true;
    } else {
        elements.modeChar.checked = true;
    }

    // 2. Carrega Configurações de Caracteres
    // Usa valores padrão (12 e true) se não houver no storage.
    elements.lengthNumberInput.value = charSettings.length || 12;
    elements.lengthRangeInput.value = charSettings.length || 12;

    // Nota: Checkboxes devem ter um fallback explícito para true ou false.
    // O operador || pode não funcionar bem para booleanos armazenados como false.
    elements.charInputs.includeUppercase.checked = charSettings.includeUppercase !== false;
    elements.charInputs.includeLowercase.checked = charSettings.includeLowercase !== false;
    elements.charInputs.includeNumbers.checked = charSettings.includeNumbers !== false;
    elements.charInputs.includeSymbols.checked = charSettings.includeSymbols || false;
    elements.charInputs.includeAccentedChars.checked = charSettings.includeAccentedChars || false;
    elements.charInputs.excludeAmbiguous.checked = charSettings.excludeAmbiguous || false;
    
    // 3. Carrega Configurações de Passphrase
    // Usa valores padrão (4 e '-') se não houver no storage.
    elements.numWordsNumberInput.value = passphraseSettings.numWords || 4;
    elements.numWordsRangeInput.value = passphraseSettings.numWords || 4;
    
    // Garante que o separador não seja vazio no carregamento
    elements.passphraseInputs.separatorInput.value = passphraseSettings.separator && passphraseSettings.separator.trim() !== '' ? passphraseSettings.separator : '-';
    elements.passphraseInputs.capitalizeWords.checked = passphraseSettings.capitalizeWords || false;
    elements.passphraseInputs.includePassphraseDigits.checked = passphraseSettings.includePassphraseDigits !== false;

    // Carrega Dicionário Personalizado
    elements.passphraseInputs.customWordlist.value = passphraseSettings.customWordlist || '';
}

// 🔑 NOVO: FUNÇÃO PARA SALVAR CONFIGURAÇÕES DE CARACTERE
function saveCharSettings(inputs) {
    const settings = {
        length: parseInt(inputs.lengthNumberInput.value),
        includeUppercase: inputs.includeUppercase.checked,
        includeLowercase: inputs.includeLowercase.checked, 
        includeNumbers: inputs.includeNumbers.checked,
        includeSymbols: inputs.includeSymbols.checked,
        includeAccentedChars: inputs.includeAccentedChars.checked,
        excludeAmbiguous: inputs.excludeAmbiguous.checked,
    };
    localStorage.setItem('charSettings', JSON.stringify(settings));
}

// 🔑 NOVO: FUNÇÃO PARA SALVAR CONFIGURAÇÕES DE PASSPHRASE
function savePassphraseSettings(inputs) {
    // 💡 Sanitiza o separador antes de salvar
    let separatorValue = inputs.separatorInput.value.trim();
    if (separatorValue === '') {
        separatorValue = '-';
        inputs.separatorInput.value = separatorValue; // Atualiza o input para persistir o visual
    }
    
    const settings = {
        numWords: parseInt(inputs.numWordsNumberInput.value),
        separator: separatorValue,
        capitalizeWords: inputs.capitalizeWords.checked,
        includePassphraseDigits: inputs.includePassphraseDigits.checked,
        customWordlist: inputs.customWordlist.value // Salva o conteúdo do textarea
    };
    localStorage.setItem('passphraseSettings', JSON.stringify(settings));
}


// --- 10. INICIALIZAÇÃO E OUVINTES DE EVENTOS (Listeners) ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. 🎯 REUNIÃO DE TODAS AS REFERÊNCIAS DO DOM
    
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
    
    // Dicionário Personalizado
    // 💡 customDictWarning deve ser o ID do elemento de alerta, que foi alterado no index.html.
    const customWordlist = document.getElementById('custom-wordlist');
    const customDictWarning = document.getElementById('custom-dict-alert'); 

    // Indicador de Força
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');

    // Tema
    const themeToggle = document.getElementById('theme-toggle');

    // Histórico
    const clearHistoryButton = document.getElementById('clear-history-button');

    // Seletor de Idioma
    const languageSelect = document.getElementById('language-select');

    // 2. 💡 Organiza as referências em objetos
    // Inclui lengthRangeInput e numWordsRangeInput para as funções de salvar.
    const charInputs = { 
        passwordDisplay, lengthNumberInput, lengthRangeInput,
        excludeAmbiguous, includeUppercase, includeLowercase, 
        includeNumbers, includeSymbols, includeAccentedChars 
    };
    
    const passphraseInputs = { 
        passwordDisplay, numWordsNumberInput, numWordsRangeInput,
        separatorInput, capitalizeWords, includePassphraseDigits, 
        customWordlist, customDictWarning
    };
    
    const strengthInputs = { strengthBar, strengthText, charInputs, passphraseInputs }; 
    
    const elements = { 
        passwordDisplay, generateButton, copyButton, modeChar, modePassphrase, 
        charSettingsDiv, passphraseSettingsDiv, languageSelect, themeToggle, 
        lengthRangeInput, lengthNumberInput, numWordsRangeInput, numWordsNumberInput,
        charInputs, passphraseInputs, strengthInputs
    };

    // 3. Inicialização
    loadTheme();
    
    // 🔑 NOVO: Carrega as configurações ANTES de aplicar as traduções e o modo
    loadSettings(elements); 
    
    languageSelect.value = currentLang; 
    applyTranslations(currentLang, elements);
    
    // 4. OUVINTES DE EVENTOS (Listeners)
    
    // Modo (Caracteres/Passphrase)
    modeChar.addEventListener('change', () => switchMode(elements));
    modePassphrase.addEventListener('change', () => switchMode(elements));

    // Comprimento/Número de Palavras
    lengthRangeInput.addEventListener('input', () => { 
        syncLengthInputs(lengthRangeInput, lengthRangeInput, lengthNumberInput); 
        saveCharSettings(charInputs); // 🔑 NOVO: Salva após a mudança
        // Recalcula a força sem gerar nova senha
        updateStrengthIndicator(passwordDisplay.value, currentMode, 0, null, strengthBar, strengthText, charInputs, passphraseInputs); 
    });
    lengthNumberInput.addEventListener('input', () => { 
        syncLengthInputs(lengthNumberInput, lengthRangeInput, lengthNumberInput); 
        saveCharSettings(charInputs); // 🔑 NOVO: Salva após a mudança
        // Recalcula a força sem gerar nova senha
        updateStrengthIndicator(passwordDisplay.value, currentMode, 0, null, strengthBar, strengthText, charInputs, passphraseInputs); 
    });
    numWordsRangeInput.addEventListener('input', () => { 
        syncNumWordsInputs(numWordsRangeInput, numWordsRangeInput, numWordsNumberInput); 
        savePassphraseSettings(passphraseInputs); // 🔑 NOVO: Salva após a mudança
        // Recalcula a força sem gerar nova senha
        updateStrengthIndicator(passwordDisplay.value, currentMode, 0, null, strengthBar, strengthText, charInputs, passphraseInputs); 
    });
    numWordsNumberInput.addEventListener('input', () => { 
        syncNumWordsInputs(numWordsNumberInput, numWordsRangeInput, numWordsNumberInput); 
        savePassphraseSettings(passphraseInputs); // 🔑 NOVO: Salva após a mudança
        // Recalcula a força sem gerar nova senha
        updateStrengthIndicator(passwordDisplay.value, currentMode, 0, null, strengthBar, strengthText, charInputs, passphraseInputs); 
    });
    
    // 4.1. Listeners de Caracteres (Salvar e Recalcular Força)
    [includeUppercase, includeLowercase, includeNumbers, includeSymbols, includeAccentedChars, excludeAmbiguous].forEach(input => {
        input.addEventListener('change', () => {
            saveCharSettings(charInputs);
            updateStrengthIndicator(passwordDisplay.value, currentMode, 0, null, strengthBar, strengthText, charInputs, passphraseInputs);
        });
    });

    // 4.2. Listeners de Passphrase (Salvar e Recalcular Força)
    [separatorInput, capitalizeWords, includePassphraseDigits].forEach(input => {
        input.addEventListener('change', () => {
            savePassphraseSettings(passphraseInputs);
            // O updateStrengthIndicator será chamado via generatePassword, 
            // que é chamado por switchMode (se o modo mudar) ou pelo generateButton. 
            // Aqui, apenas salvamos. A mudança de input no Passphrase mode não recalcula
            // a força da senha *atual*, apenas garante que a próxima senha use o novo separador.
            // Para ser consistente com outros inputs, vamos chamar:
            updateStrengthIndicator(passwordDisplay.value, currentMode, 0, null, strengthBar, strengthText, charInputs, passphraseInputs);
        });
    });

    // Listener especial para o customWordlist (textarea)
    customWordlist.addEventListener('input', () => {
        savePassphraseSettings(passphraseInputs);
        // Recalcula a força imediatamente, pois a mudança na lista altera a entropia
        updateStrengthIndicator(passwordDisplay.value, currentMode, 0, null, strengthBar, strengthText, charInputs, passphraseInputs);
    });

    // 4.3. Listeners de Ação
    generateButton.addEventListener('click', () => generatePassword(elements));

    copyButton.addEventListener('click', () => {
        // Evita copiar a mensagem de placeholder ou erro
        if (passwordDisplay.value && passwordDisplay.value !== t.displayDefault && !passwordDisplay.value.includes(t.errorSelectChar) && !passwordDisplay.value.includes(t.errorInvalidWords)) {
            copyToClipboard(passwordDisplay.value, copyButton);
        }
    });

    themeToggle.addEventListener('click', toggleTheme);

    clearHistoryButton.addEventListener('click', clearHistory);

    languageSelect.addEventListener('change', (e) => switchLanguage(e.target.value, elements));

    // 5. Chamada de Força Inicial
    // Garante que a força inicial seja calculada com o valor carregado/padrão,
    // caso o switchMode inicial não tenha gerado uma senha (ex: se o valor for t.displayDefault).
    updateStrengthIndicator(elements.passwordDisplay.value, currentMode, 0, null, strengthBar, strengthText, charInputs, passphraseInputs); 

}); // Fechamento do document.addEventListener('DOMContentLoaded')