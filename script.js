// --- script.js - CÓDIGO FINAL, LIMPO E OTIMIZADO (Lógica Pura) ---

// NOTA: Para rodar este script, você precisaria de um arquivo 'translations.js' 
// que defina 'translations' e 'wordLists' (dicionários de palavras), além do HTML e CSS.

// --- 1. CONFIGURAÇÕES E VARIÁVEIS GLOBAIS (NÃO dependem do DOM) ---

// CONSTANTE PARA A VALIDAÇÃO DE ENTROPIA
// Requisito mínimo de palavras no dicionário para considerar a Passphrase segura (8 bits de entropia log2(256)=8).
const MIN_WORDS_REQUIRED = 256; 

// NOTA: 'translations' e 'wordLists' são carregados globalmente a partir de 'translations.js'

let generatedPasswords = []; // Array para armazenar o histórico de senhas geradas na sessão
const MAX_HISTORY = 10;      // Limite de itens no histórico
let currentMode = 'char';    // Modo inicial de geração: 'char' (caractere) ou 'passphrase'

// Variáveis de escopo global para acesso seguro aos textos de tradução.
// São atualizadas pela função applyTranslations.
let t; 
let activeWordList; 
// Carrega o idioma salvo no Local Storage ou define 'pt-br' como padrão
let currentLang = localStorage.getItem('language') || 'pt-br';

// --- 2. CONJUNTOS DE CARACTERES ---
const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    accented: 'áàãâéèêíìîóòõôúùûç',
    // Caracteres que podem ser facilmente confundíveis visualmente
    ambiguous: 'lIO0' 
};

// --- 3. FUNÇÕES UTILITY CORE ---

/**
 * Gera um número inteiro aleatório entre min (inclusivo) e max (inclusivo).
 * @param {number} min 
 * @param {number} max 
 * @returns {number} 
 */
function getRandomInt(min, max) {
    // Usa Math.floor e (max - min + 1) para garantir a inclusão de 'max'
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Embaralha (algoritmo Fisher-Yates) um array.
 * É essencial para misturar a ordem dos caracteres na senha e evitar padrões previsíveis 
 * (ex: todos os números no final).
 * @param {Array<string>} array - O array a ser embaralhado.
 * @returns {Array<string>} O array embaralhado.
 */
function shuffleArray(array) {
    let shuffled = [...array]; 
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = getRandomInt(0, i); 
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Cria o conjunto final de caracteres permitido (charset) baseado nas opções do usuário.
 * @param {Object} inputs - Objeto contendo os estados dos checkboxes.
 * @returns {string} O conjunto de caracteres combinados.
 */
function getCharSet(inputs) {
    let charset = '';
    // Concatena os conjuntos de caracteres selecionados
    if (inputs.includeLowercase.checked) charset += charSets.lowercase;
    if (inputs.includeUppercase.checked) charset += charSets.uppercase;
    if (inputs.includeNumbers.checked) charset += charSets.numbers;
    if (inputs.includeSymbols.checked) charset += charSets.symbols;
    if (inputs.includeAccentedChars.checked) charset += charSets.accented;

    // Remove caracteres ambíguos se a opção estiver marcada
    if (inputs.excludeAmbiguous.checked) {
        // Cria uma regex para remover os caracteres ambíguos do conjunto final
        const regex = new RegExp('[' + charSets.ambiguous.replace(/([\[\]\\])/g, '\\$1') + ']', 'g');
        charset = charset.replace(regex, '');
    }

    return charset;
}

// --- 4. FUNÇÕES DE SEGURANÇA E FORÇA (ENTROPIA) ---

/**
 * Calcula a entropia da senha em bits, baseada na fórmula:
 * Entropia = Comprimento * log2(Tamanho do Conjunto)
 * @param {number} poolSize - O tamanho do conjunto de caracteres ou palavras (ex: 62 para a+A+0-9).
 * @param {number} length - O comprimento da senha ou número de palavras.
 * @returns {number} A entropia em bits, arredondada.
 */
function calculateEntropy(poolSize, length) {
    if (poolSize === 0 || length === 0) return 0;
    return Math.round(length * Math.log2(poolSize));
}

/**
 * Atualiza visualmente a barra e o texto da força da senha.
 * @param {string} password - A senha a ser avaliada.
 * @param {string} mode - Modo de geração ('char' ou 'passphrase').
 * @param {number} charSetSize - Tamanho do conjunto de caracteres (modo char).
 * @param {number} wordPoolSize - Tamanho do dicionário de palavras (modo passphrase).
 * @param {HTMLElement} bar - O elemento da barra de progresso.
 * @param {HTMLElement} text - O elemento do texto da força.
 * @param {Object} charInputs - Opções de caractere (para validação).
 * @param {Object} passphraseInputs - Opções de passphrase (para validação).
 */
function updateStrengthIndicator(password, mode, charSetSize, wordPoolSize, bar, text, charInputs, passphraseInputs) {
    let entropy = 0;
    let poolSize = 0;
    let length = 0;
    const MAX_ENTROPY = 128; // Entropia máxima para 100% da barra (padrão de referência)

    if (mode === 'char') {
        poolSize = charSetSize;
        length = parseInt(charInputs.lengthNumber.value, 10);
        entropy = calculateEntropy(poolSize, length);

        // Se o charset for 0, é um erro de configuração (força 0)
        if (poolSize === 0) {
            text.textContent = t.strengthError;
            bar.style.width = '0%';
            bar.className = 'strength-bar strength-weak';
            bar.setAttribute('aria-valuenow', 0);
            return;
        }

    } else if (mode === 'passphrase') {
        poolSize = wordPoolSize;
        length = parseInt(passphraseInputs.numWordsNumber.value, 10);
        
        // Fatores de aumento do pool (simplificação)
        let totalPoolSize = poolSize;
        if (passphraseInputs.capitalizeWords.checked) {
            totalPoolSize *= 2; // Capitalização duplica as possibilidades
        }
        if (passphraseInputs.includePassphraseDigits.checked) {
            totalPoolSize += 10; // Adiciona o pool de dígitos (0-9)
        }

        // Validação de segurança: Dicionário customizado muito pequeno
        if (poolSize < MIN_WORDS_REQUIRED) {
            text.textContent = t.errorInvalidWords;
            bar.style.width = '0%';
            bar.className = 'strength-bar strength-weak';
            bar.setAttribute('aria-valuenow', 0);
            return;
        }
        
        entropy = calculateEntropy(totalPoolSize, length);
    }

    // Classificação da Força em Bits (Critérios Comuns)
    let strengthText;
    let barClass;

    if (entropy < 40) {
        strengthText = t.strengthWeak;
        barClass = 'strength-weak';
    } else if (entropy < 60) {
        strengthText = t.strengthMedium;
        barClass = 'strength-medium';
    } else if (entropy < 80) {
        strengthText = t.strengthStrong;
        barClass = 'strength-strong';
    } else {
        strengthText = t.strengthVeryStrong;
        barClass = 'strength-very-strong';
    }

    // 3. Atualização da UI
    let percentage = Math.min((entropy / MAX_ENTROPY) * 100, 100); 

    text.textContent = `${strengthText} (${entropy} bits)`;
    bar.style.width = `${percentage}%`;
    bar.className = `strength-bar ${barClass}`;
    bar.setAttribute('aria-valuenow', entropy); // Atualiza para acessibilidade
}

// --- 5. FUNÇÕES DE GERAÇÃO DE SENHA ---

/**
 * Gera uma senha tradicional baseada em caracteres aleatórios.
 * @param {Object} inputs - Objeto contendo os inputs do modo char.
 * @param {HTMLElement} display - O elemento de exibição da senha.
 * @returns {Object} {password: string, charset: string}
 */
function generateCharacterPassword(inputs, display) {
    const length = parseInt(inputs.lengthNumber.value, 10);
    const charSet = getCharSet(inputs);

    // Validação: se o conjunto de caracteres estiver vazio
    if (charSet.length === 0) {
        display.value = t.errorSelectChar;
        return { password: t.errorSelectChar, charset: '' };
    }

    let passwordArray = [];
    const charSetLength = charSet.length;

    // Gera a senha caractere por caractere
    for (let i = 0; i < length; i++) {
        const randomIndex = getRandomInt(0, charSetLength - 1);
        passwordArray.push(charSet[randomIndex]);
    }

    // A senha gerada pode ser embaralhada para garantir máxima aleatoriedade
    const password = shuffleArray(passwordArray).join('');
    display.value = password;

    return { password: password, charset: charSet };
}

/**
 * Gera uma passphrase (senha de palavras) baseada em um dicionário.
 * @param {Object} inputs - Objeto contendo os inputs do modo passphrase.
 * @param {HTMLElement} display - O elemento de exibição da senha.
 * @returns {Object} {password: string, wordPool: string[]}
 */
function generatePassphrase(inputs, display) {
    const numWords = parseInt(inputs.numWordsNumber.value, 10);
    const separator = inputs.separator.value || '';
    const capitalizeWords = inputs.capitalizeWords.checked;
    const includeDigits = inputs.includePassphraseDigits.checked;
    
    // Usa a lista de palavras ativa (padrão do idioma ou customizada)
    const wordPool = activeWordList; 
    
    // Validação de segurança: Tamanho mínimo do dicionário
    if (wordPool.length < MIN_WORDS_REQUIRED) {
        display.value = t.errorInvalidWords;
        return { password: t.errorInvalidWords, wordPool: [] };
    }

    let phrase = [];
    const poolSize = wordPool.length;

    // 1. Seleciona as palavras aleatórias
    for (let i = 0; i < numWords; i++) {
        const randomIndex = getRandomInt(0, poolSize - 1);
        let word = wordPool[randomIndex];

        // 2. Aplica Capitalização
        if (capitalizeWords) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        
        phrase.push(word);
    }

    // 3. Aplica o Separador
    let password = phrase.join(separator);

    // 4. Inclui Dígitos Aleatórios
    if (includeDigits) {
        // Gera 1 a 3 dígitos aleatórios
        const numDigits = getRandomInt(1, 3); 
        let digits = '';
        for (let i = 0; i < numDigits; i++) {
            digits += getRandomInt(0, 9);
        }

        // Escolhe um ponto aleatório para inserção (entre as palavras ou nas extremidades)
        const insertionPoints = numWords + 1; 
        const insertionIndex = getRandomInt(0, insertionPoints - 1);
        
        let passwordArray = password.split(separator);
        
        // Insere os dígitos como um "item" na posição aleatória
        passwordArray.splice(insertionIndex, 0, digits); 
        
        password = passwordArray.join(separator);
    }
    
    display.value = password;

    return { password: password, wordPool: wordPool };
}

// --- 6. FUNÇÕES DE UI E EVENTOS ---

/**
 * Função principal para gerar a senha e atualizar a força.
 * Decide qual modo usar e chama a função de geração apropriada.
 * @param {Object} elements - Objeto contendo todos os elementos DOM relevantes.
 */
function generatePassword(elements) {
    const { 
        passwordDisplay, strengthBar, strengthText, charInputs, passphraseInputs,
        modeChar
    } = elements;

    // Determina o modo atual
    currentMode = modeChar.checked ? 'char' : 'passphrase';

    let result = { password: '', charset: '', wordPool: [] };
    
    if (currentMode === 'char') {
        result = generateCharacterPassword(charInputs, passwordDisplay);
        // Atualiza a força usando o tamanho do charset
        updateStrengthIndicator(result.password, currentMode, result.charset.length, 0, strengthBar, strengthText, charInputs, passphraseInputs);
    } else {
        result = generatePassphrase(passphraseInputs, passwordDisplay);
        // Atualiza a força usando o tamanho do dicionário
        updateStrengthIndicator(result.password, currentMode, 0, result.wordPool.length, strengthBar, strengthText, charInputs, passphraseInputs);
    }

    // Adiciona ao histórico apenas se não for uma mensagem de erro
    if (result.password !== t.errorSelectChar && result.password !== t.errorInvalidWords) {
        addToHistory(result.password);
    }
}

/**
 * Alterna entre o tema claro e escuro, salva a preferência e atualiza o ícone.
 */
function toggleTheme() {
    const body = document.body;
    const isDarkMode = body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.getElementById('theme-toggle').querySelector('span').textContent = isDarkMode ? '☀️' : '🌙';
}

/**
 * Copia o texto para a área de transferência e mostra um feedback (botão e toast).
 * @param {string} text - O texto a ser copiado.
 * @param {HTMLElement} button - O botão que acionou a cópia.
 */
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        // Feedback no botão
        button.textContent = t.copied;
        button.classList.add('copied');
        
        // Retorna ao estado original
        setTimeout(() => {
            button.textContent = t.copy;
            button.classList.remove('copied');
        }, 1500);

        showToast(t.copiedToast);
    }).catch(err => {
        console.error('Erro ao copiar: ', err);
        showToast(t.errorCopy);
    });
}

/**
 * Exibe uma notificação pop-up temporária (toast).
 * @param {string} message - A mensagem a ser exibida.
 */
function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    toastContainer.appendChild(toast);
    
    // Força o repaint/reflow para garantir que a transição de entrada funcione
    void toast.offsetWidth; 
    toast.classList.add('show');

    // Remove o toast após o tempo definido
    setTimeout(() => {
        toast.classList.remove('show');
        // Remove do DOM após o término da transição de saída
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3000);
}

// --- 7. FUNÇÕES DE HISTÓRICO ---

/**
 * Adiciona uma senha gerada à lista do histórico.
 * @param {string} password - A senha gerada.
 */
function addToHistory(password) {
    // Adiciona no início
    generatedPasswords.unshift(password); 
    if (generatedPasswords.length > MAX_HISTORY) {
        generatedPasswords.pop(); // Remove o mais antigo se exceder o limite
    }
    
    // Salva no localStorage para persistência na sessão
    localStorage.setItem('passwordHistory', JSON.stringify(generatedPasswords));
    
    renderHistory();
}

/**
 * Limpa todo o histórico de senhas (lista JS e Local Storage).
 */
function clearHistory() {
    generatedPasswords = [];
    localStorage.removeItem('passwordHistory');
    renderHistory();
    showToast(t.historyClearedToast);
}

/**
 * Renderiza o histórico de senhas na UI.
 */
function renderHistory() {
    const list = document.getElementById('password-history-list');
    const status = document.getElementById('history-status');
    const historyHeader = document.querySelector('.history-header');

    list.innerHTML = ''; 

    if (generatedPasswords.length === 0) {
        // Exibe status e oculta o cabeçalho/botão limpar
        status.textContent = t.historyEmpty;
        status.style.display = 'block';
        historyHeader.style.display = 'none'; 
        return;
    }

    // Oculta status e exibe o cabeçalho
    status.style.display = 'none';
    historyHeader.style.display = 'flex'; 

    generatedPasswords.forEach(password => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        // Elemento da senha
        const passText = document.createElement('span');
        passText.className = 'history-password';
        passText.textContent = password;

        // Botão Copiar
        const copyBtn = document.createElement('button');
        copyBtn.className = 'history-copy-btn';
        copyBtn.textContent = t.copy;
        copyBtn.title = t.copyHistoryTitle;

        // Listener de cópia
        copyBtn.addEventListener('click', () => {
            copyToClipboard(password, copyBtn);
        });

        item.appendChild(passText);
        item.appendChild(copyBtn);
        list.appendChild(item);
    });
}

/**
 * Carrega o histórico salvo no localStorage ao iniciar.
 */
function loadHistory() {
    const savedHistory = localStorage.getItem('passwordHistory');
    if (savedHistory) {
        try {
            generatedPasswords = JSON.parse(savedHistory);
        } catch (e) {
            console.error('Erro ao carregar histórico: ', e);
            generatedPasswords = [];
        }
    }
    renderHistory();
}

// --- 8. FUNÇÕES DE INTERNACIONALIZAÇÃO (i18n) E TEMA ---

/**
 * Aplica as strings de tradução ao HTML com base nos atributos data-i18n.
 * @param {string} lang - O código do idioma (ex: 'pt-br').
 * @param {Object} elements - Objeto contendo os elementos DOM relevantes.
 */
function applyTranslations(lang, elements) {
    // Define o objeto de tradução ativo (variável global t)
    t = translations[lang]; 
    if (!t) return;

    // Itera sobre todos os elementos com data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            // Lógica específica para diferentes tipos de tags/atributos
            if (el.tagName === 'TITLE') {
                el.textContent = t[key];
            } else if (el.tagName === 'INPUT' && el.type === 'text') {
                el.placeholder = t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });

    // Atualiza textos específicos (títulos, placeholders, etc.)
    document.getElementById('generate-button').textContent = t.generate;
    document.getElementById('password-display').placeholder = t.displayDefault;
    document.getElementById('copy-button').title = t.copyTitle;
    document.getElementById('clear-history-button').title = t.clearHistoryTitle;

    // Re-renderiza o histórico para traduzir o status
    renderHistory();

    // Atualiza a lista de palavras ativas para o modo Passphrase
    activeWordList = (wordLists && wordLists[lang]) ? wordLists[lang] : [];

    // Garante que o indicador de força reflita a mudança de idioma/lista de palavras
    updateStrengthIndicator(elements.passwordDisplay.value, currentMode, 
        elements.charInputs.getCharSet(elements.charInputs).length, 
        activeWordList.length, 
        elements.strengthBar, elements.strengthText, elements.charInputs, elements.passphraseInputs
    );
}

/**
 * Altera o idioma da aplicação e salva a preferência.
 * @param {string} lang - O novo idioma.
 * @param {Object} elements - Objeto contendo os elementos DOM relevantes.
 */
function switchLanguage(lang, elements) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    applyTranslations(lang, elements);
    // Força a regeneração para atualizar a senha/placeholder com o novo idioma
    generatePassword(elements); 
}

/**
 * Carrega a preferência de tema do usuário ao iniciar (Claro/Escuro).
 */
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').querySelector('span').textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-toggle').querySelector('span').textContent = '🌙';
    }
}

// --- 9. FUNÇÕES DE PERSISTÊNCIA E MODO (Local Storage) ---

/**
 * Salva as configurações do modo Caractere no Local Storage.
 * @param {Object} inputs - Objeto contendo os inputs do modo char.
 */
function saveCharSettings(inputs) {
    const settings = {
        length: inputs.lengthNumber.value,
        uppercase: inputs.includeUppercase.checked,
        // ... (outros checkboxes)
        lowercase: inputs.includeLowercase.checked,
        numbers: inputs.includeNumbers.checked,
        symbols: inputs.includeSymbols.checked,
        accented: inputs.includeAccentedChars.checked,
        ambiguous: inputs.excludeAmbiguous.checked
    };
    localStorage.setItem('charSettings', JSON.stringify(settings));
}

/**
 * Carrega as configurações do modo Caractere do Local Storage.
 * @param {Object} inputs - Objeto contendo os inputs do modo char.
 */
function loadCharSettings(inputs) {
    const savedSettings = localStorage.getItem('charSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        // Aplica os valores salvos
        inputs.lengthNumber.value = settings.length;
        inputs.lengthRange.value = settings.length;
        inputs.includeUppercase.checked = settings.uppercase;
        inputs.includeLowercase.checked = settings.lowercase;
        inputs.includeNumbers.checked = settings.numbers;
        inputs.includeSymbols.checked = settings.symbols;
        inputs.includeAccentedChars.checked = settings.accented;
        inputs.excludeAmbiguous.checked = settings.ambiguous;
    }
}

/**
 * Salva as configurações do modo Passphrase no Local Storage.
 * @param {Object} inputs - Objeto contendo os inputs do modo passphrase.
 */
function savePassphraseSettings(inputs) {
    const settings = {
        numWords: inputs.numWordsNumber.value,
        separator: inputs.separator.value,
        capitalize: inputs.capitalizeWords.checked,
        includeDigits: inputs.includePassphraseDigits.checked,
        customWordlist: inputs.customWordlist.value 
    };
    localStorage.setItem('passphraseSettings', JSON.stringify(settings));
}

/**
 * Carrega as configurações do modo Passphrase e valida a lista de palavras customizada.
 * @param {Object} inputs - Objeto contendo os inputs do modo passphrase.
 */
function loadPassphraseSettings(inputs) {
    const savedSettings = localStorage.getItem('passphraseSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        inputs.numWordsNumber.value = settings.numWords;
        inputs.numWordsRange.value = settings.numWords;
        inputs.separator.value = settings.separator;
        inputs.capitalizeWords.checked = settings.capitalize;
        inputs.includePassphraseDigits.checked = settings.includeDigits;
        inputs.customWordlist.value = settings.customWordlist;
    }
    
    // Valida a lista customizada ao carregar
    validateCustomWordlist(inputs);
}

/**
 * Valida a lista de palavras customizada. Se for válida, ela se torna a 'activeWordList'.
 * Caso contrário, reverte para a lista padrão do idioma e exibe um alerta.
 * @param {Object} inputs - Objeto contendo os inputs do modo passphrase.
 */
function validateCustomWordlist(inputs) {
    const listText = inputs.customWordlist.value.trim();
    const alertEl = document.getElementById('custom-dict-alert');
    
    // 1. Reverte para a lista padrão (do idioma)
    activeWordList = (wordLists && wordLists[currentLang]) ? wordLists[currentLang] : [];
    alertEl.style.display = 'none';

    if (listText === '') {
        return; 
    }

    // 2. Processa a lista customizada (quebra de linha/espaço, filtra vazios e remove duplicatas)
    const customList = listText.split(/[\n\s]+/)
                               .filter(word => word.length > 0)
                               .filter((value, index, self) => self.indexOf(value) === index); 

    // 3. Validação de segurança: Tamanho mínimo de palavras
    if (customList.length < MIN_WORDS_REQUIRED) {
        alertEl.textContent = t.errorDictTooSmall.replace('{minWords}', MIN_WORDS_REQUIRED);
        alertEl.style.display = 'block';
        // Mantém a lista padrão ativa, pois a customizada é insegura
        return;
    }

    // 4. Se for válida e grande o suficiente, a lista customizada se torna a lista ativa
    activeWordList = customList;
    alertEl.textContent = t.successDictUsed.replace('{count}', customList.length);
    alertEl.style.display = 'block';
}


/**
 * Troca a visualização entre as configurações de caractere e passphrase.
 * @param {string} mode - O novo modo ('char' ou 'passphrase').
 * @param {Object} elements - Objeto contendo os elementos DOM relevantes.
 */
function switchMode(mode, elements) {
    const charSettings = document.getElementById('char-settings');
    const passphraseSettings = document.getElementById('passphrase-settings');
    currentMode = mode;
    
    if (mode === 'char') {
        charSettings.style.display = 'block';
        passphraseSettings.style.display = 'none';
        loadCharSettings(elements.charInputs); 
    } else {
        charSettings.style.display = 'none';
        passphraseSettings.style.display = 'block';
        loadPassphraseSettings(elements.passphraseInputs);
    }
    
    localStorage.setItem('currentMode', mode);
    
    // Força a geração da senha para atualizar o display e a força
    generatePassword(elements);
}

// --- 10. INICIALIZAÇÃO DA APLICAÇÃO ---

/**
 * Inicializa a aplicação após o carregamento do DOM.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Mapeamento de Elementos DOM para fácil acesso
    const elements = {
        // Display & Força
        passwordDisplay: document.getElementById('password-display'),
        copyButton: document.getElementById('copy-button'),
        strengthBar: document.getElementById('strength-bar'),
        strengthText: document.getElementById('strength-text'),
        generateButton: document.getElementById('generate-button'),
        
        // Controles Globais
        themeToggle: document.getElementById('theme-toggle'),
        languageSelect: document.getElementById('language-select'),
        
        // Modos
        modeChar: document.getElementById('mode-char'),
        modePassphrase: document.getElementById('mode-passphrase'),
        
        // Histórico
        clearHistoryButton: document.getElementById('clear-history-button'),

        // Inputs do Modo Caractere (agrupados)
        charInputs: {
            lengthRange: document.getElementById('length-range'),
            lengthNumber: document.getElementById('length-number'),
            includeUppercase: document.getElementById('include-uppercase'),
            includeLowercase: document.getElementById('include-lowercase'),
            includeNumbers: document.getElementById('include-numbers'),
            includeSymbols: document.getElementById('include-symbols'),
            includeAccentedChars: document.getElementById('include-accented-chars'),
            excludeAmbiguous: document.getElementById('exclude-ambiguous'),
            getCharSet: getCharSet // Inclui a função utilitária
        },
        
        // Inputs do Modo Passphrase (agrupados)
        passphraseInputs: {
            numWordsRange: document.getElementById('num-words-range'),
            numWordsNumber: document.getElementById('num-words-number'),
            separator: document.getElementById('separator'),
            capitalizeWords: document.getElementById('capitalize-words'),
            includePassphraseDigits: document.getElementById('include-passphrase-digits'),
            customWordlist: document.getElementById('custom-wordlist'),
        }
    };
    
    const { 
        passwordDisplay, strengthBar, strengthText, generateButton, copyButton, themeToggle, languageSelect,
        modeChar, modePassphrase, charInputs, passphraseInputs, clearHistoryButton
    } = elements;

    // 2. Carregamento de Preferências e Estado Inicial
    
    loadThemePreference(); // Carrega tema
    loadHistory(); // Carrega histórico
    loadCharSettings(charInputs); // Carrega configurações de caractere
    loadPassphraseSettings(passphraseInputs); // Carrega configurações de passphrase
    
    // Seta o idioma salvo e aplica as traduções
    languageSelect.value = currentLang;
    applyTranslations(currentLang, elements); 
    
    // Carrega o modo salvo ou usa o padrão 'char'
    const savedMode = localStorage.getItem('currentMode') || 'char'; 
    if (savedMode === 'passphrase') {
        modePassphrase.checked = true;
    } else {
        modeChar.checked = true;
    }
    
    // Aplica o modo e gera a primeira senha para preencher o display
    switchMode(savedMode, elements);


    // 3. Listeners de Configuração (Modo Caractere)
    
    // 3.1. Sincroniza Range e Number (Comprimento)
    charInputs.lengthRange.addEventListener('input', () => {
        charInputs.lengthNumber.value = charInputs.lengthRange.value;
        saveCharSettings(charInputs);
        generatePassword(elements);
    });
    charInputs.lengthNumber.addEventListener('input', () => {
        // Lógica de validação e sincronização inversa
        let value = parseInt(charInputs.lengthNumber.value, 10);
        if (value < 6) value = 6;
        if (value > 64) value = 64;
        charInputs.lengthRange.value = value;
        charInputs.lengthNumber.value = value;
        saveCharSettings(charInputs);
        generatePassword(elements);
    });
    
    // 3.2. Listeners para Checkboxes
    Object.values(charInputs).forEach(input => {
        if (input.type === 'checkbox') {
            input.addEventListener('change', () => {
                saveCharSettings(charInputs);
                generatePassword(elements);
            });
        }
    });

    // 4. Listeners de Configuração (Modo Passphrase)
    
    // 4.1. Sincroniza Range e Number (Número de Palavras)
    passphraseInputs.numWordsRange.addEventListener('input', () => {
        passphraseInputs.numWordsNumber.value = passphraseInputs.numWordsRange.value;
        savePassphraseSettings(passphraseInputs);
        generatePassword(elements);
    });
    passphraseInputs.numWordsNumber.addEventListener('input', () => {
        // Lógica de validação e sincronização inversa
        let value = parseInt(passphraseInputs.numWordsNumber.value, 10);
        if (value < 3) value = 3;
        if (value > 10) value = 10;
        passphraseInputs.numWordsRange.value = value;
        passphraseInputs.numWordsNumber.value = value;
        savePassphraseSettings(passphraseInputs);
        generatePassword(elements);
    });
    
    // 4.2. Listeners para Inputs e Checkboxes
    [passphraseInputs.separator, passphraseInputs.capitalizeWords, passphraseInputs.includePassphraseDigits].forEach(input => {
        input.addEventListener('change', () => {
            savePassphraseSettings(passphraseInputs);
            generatePassword(elements);
        });
    });

    // 4.3. Listener para a Troca de Modo (Radio Buttons)
    modeChar.addEventListener('change', () => switchMode('char', elements));
    modePassphrase.addEventListener('change', () => switchMode('passphrase', elements));

    // 4.4. Listener para a Lista Customizada (Validação e Força)
    passphraseInputs.customWordlist.addEventListener('input', () => {
        savePassphraseSettings(passphraseInputs);
        validateCustomWordlist(passphraseInputs);
        // Recalcula a força imediatamente, pois a mudança na lista altera a entropia
        updateStrengthIndicator(passwordDisplay.value, currentMode, 0, activeWordList.length, strengthBar, strengthText, charInputs, passphraseInputs);
    });

    // 5. Listeners de Ação
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

    // 6. Chamada Final de Inicialização
    // Garante que a primeira senha seja gerada e a força calculada corretamente
    // após todos os carregamentos e configurações iniciais.
    generatePassword(elements);
});