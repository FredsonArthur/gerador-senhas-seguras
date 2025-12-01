// --- 1. CONJUNTOS DE CARACTERES ---
const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numberChars = "0123456789";
const symbolChars = "!@#$%^&*()_+[]{}|;:,.<>?/~`"; 
const accentedChars = "áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇ";
// NOVO: Caracteres considerados ambíguos para leitura
const ambiguousChars = "il1Lo0O"; 

// --- 2. REFERÊNCIAS AO DOM ---
const lengthInput = document.getElementById('length');
const includeUppercase = document.getElementById('include-uppercase');
const includeLowercase = document.getElementById('include-lowercase');
const includeNumbers = document.getElementById('include-numbers');
const includeSymbols = document.getElementById('include-symbols');
const includeAccentedChars = document.getElementById('include-accented-chars');
const excludeAmbiguous = document.getElementById('exclude-ambiguous'); // NOVO
const passwordDisplay = document.getElementById('password-display');
const generateButton = document.getElementById('generate-button');
const copyButton = document.getElementById('copy-button');
const strengthBar = document.getElementById('strength-bar'); 
const strengthText = document.getElementById('strength-text');
const toastContainer = document.getElementById('toast-container');
const themeToggleBtn = document.getElementById('theme-toggle'); // NOVO


// --- 3. LÓGICA DE TEMA (DARK MODE) ---

/**
 * Inicializa e gerencia a persistência do Modo Escuro.
 */
(function initializeTheme() {
    const currentTheme = localStorage.getItem('theme');
    
    // Aplica o tema salvo (se existir)
    if (currentTheme === "dark") {
      document.body.classList.add("dark-mode");
      themeToggleBtn.textContent = "☀️"; // Ícone de sol para tema escuro
    } else {
      themeToggleBtn.textContent = "🌙"; // Ícone de lua para tema claro
    }

    // Listener para alternar o tema
    themeToggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      
      let theme = "light";
      if (document.body.classList.contains("dark-mode")) {
        theme = "dark";
        themeToggleBtn.textContent = "☀️";
      } else {
        themeToggleBtn.textContent = "🌙";
      }
      // Salva a preferência
      localStorage.setItem("theme", theme);
    });
})();


// --- 4. FUNÇÕES DE LÓGICA ---

function calculateStrength(password, range) {
    if (password.length === 0) return 0;
    const length = password.length;
    const entropy = length * Math.log2(range);
    return entropy;
}

function updateStrengthIndicator(password, allChars) {
    const entropy = calculateStrength(password, allChars.length);
    let strength = "";
    let width = 0;
    let className = "";

    if (entropy < 40) {
        strength = "Fraca";
        width = (entropy / 40) * 25; 
        className = "strength-weak";
    } else if (entropy < 60) {
        strength = "Média";
        width = 25 + ((entropy - 40) / 20) * 25; 
        className = "strength-medium";
    } else if (entropy < 80) {
        strength = "Forte";
        width = 50 + ((entropy - 60) / 20) * 25; 
        className = "strength-strong";
    } else {
        strength = "Muito Forte";
        width = 75 + Math.min(25, (entropy - 80) / 10);
        className = "strength-very-strong";
    }

    strengthBar.style.width = width.toFixed(2) + "%";
    strengthBar.className = `strength-bar ${className}`;
    strengthText.textContent = `${strength} (${entropy.toFixed(1)} bits)`;
    
    if (password.length === 0) {
        strengthBar.style.width = "0%";
        strengthText.textContent = "";
    }
}

/**
 * Função Auxiliar para remover caracteres ambíguos de uma string
 */
function removeAmbiguous(charSet) {
    // Regex global para remover 'i', 'l', '1', 'L', 'o', '0', 'O'
    const regex = new RegExp(`[${ambiguousChars}]`, 'g');
    return charSet.replace(regex, '');
}


function generatePassword() {
    const length = parseInt(lengthInput.value);
    const isAmbiguousExcluded = excludeAmbiguous.checked;

    let allChars = "";
    let password = "";
    let requiredChars = []; 

    // Função interna para processar o conjunto (adicionar e filtrar se necessário)
    const processCharSet = (charSet) => {
        if (isAmbiguousExcluded) {
            return removeAmbiguous(charSet);
        }
        return charSet;
    };

    // Constrói a string e o array de requisitos, aplicando o filtro de ambíguos
    if (includeUppercase.checked) {
        const chars = processCharSet(upperCaseChars);
        if(chars.length > 0) { allChars += chars; requiredChars.push(chars); }
    }
    if (includeLowercase.checked) {
        const chars = processCharSet(lowerCaseChars);
        if(chars.length > 0) { allChars += chars; requiredChars.push(chars); }
    }
    if (includeNumbers.checked) {
        const chars = processCharSet(numberChars);
        if(chars.length > 0) { allChars += chars; requiredChars.push(chars); }
    }
    if (includeSymbols.checked) {
        // Símbolos (mantidos, mas aplicamos o filtro caso haja sobreposição acidental)
        const chars = processCharSet(symbolChars);
        if(chars.length > 0) { allChars += chars; requiredChars.push(chars); }
    }
    if (includeAccentedChars.checked) {
        // Acentuados (mantidos, não ambíguos)
        allChars += accentedChars;
        requiredChars.push(accentedChars);
    }
    
    // Validação
    if (allChars.length === 0) {
        passwordDisplay.value = "Opções insuficientes!";
        updateStrengthIndicator("", 0);
        return;
    }
    
    // 1. Garante um de cada tipo
    for (const charSet of requiredChars) {
        const randomIndex = Math.floor(Math.random() * charSet.length);
        password += charSet[randomIndex];
    }
    
    // 2. Preenche o restante
    const remainingLength = length - requiredChars.length;
    for (let i = 0; i < remainingLength; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars[randomIndex];
    }

    // 3. Embaralha
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    passwordDisplay.value = password;
    updateStrengthIndicator(password, allChars);
}


// --- 5. FUNÇÃO DE TOAST ---

function showToast(message) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => { toast.classList.add('show'); }, 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.remove(); }, 500); 
    }, 3000); 
}

// --- 6. LISTENERS DE EVENTOS ---

generateButton.addEventListener('click', generatePassword);

// Garante que a senha seja regerada ao mudar as configurações
const settingCheckboxes = document.querySelectorAll('.settings input[type="checkbox"], #length');
settingCheckboxes.forEach(input => {
    input.addEventListener('change', generatePassword);
});


// Listener do Botão Copiar
copyButton.addEventListener('click', () => {
    // Validação básica
    if (passwordDisplay.value === "" || passwordDisplay.value.includes("Opções") || passwordDisplay.value.includes("Clique")) return;

    passwordDisplay.select();
    passwordDisplay.setSelectionRange(0, 99999); 

    try {
        navigator.clipboard.writeText(passwordDisplay.value);
        
        // Feedback Visual
        copyButton.innerHTML = "✅ Copiado!";
        copyButton.classList.add('copied');
        showToast("Senha copiada com sucesso!");
        
        setTimeout(() => {
            copyButton.innerHTML = "Copiar";
            copyButton.classList.remove('copied');
        }, 1500); 

    } catch (err) {
        showToast("Erro ao copiar.");
    }
});

document.addEventListener('DOMContentLoaded', generatePassword);