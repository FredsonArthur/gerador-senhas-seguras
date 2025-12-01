// --- 1. CONJUNTOS DE CARACTERES ---
const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numberChars = "0123456789";
const symbolChars = "!@#$%^&*()_+[]{}|;:,.<>?/~`"; 
// NOVO CONJUNTO: Caracteres Acentuados (Maiúsculas e Minúsculas)
const accentedChars = "áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇ";

// --- 2. REFERÊNCIAS AO DOM ---
const lengthInput = document.getElementById('length');
const includeUppercase = document.getElementById('include-uppercase');
const includeLowercase = document.getElementById('include-lowercase');
const includeNumbers = document.getElementById('include-numbers');
const includeSymbols = document.getElementById('include-symbols');
const includeAccentedChars = document.getElementById('include-accented-chars');
const passwordDisplay = document.getElementById('password-display');
const generateButton = document.getElementById('generate-button');
const copyButton = document.getElementById('copy-button');
const strengthBar = document.getElementById('strength-bar'); 
const strengthText = document.getElementById('strength-text');
// NOVO ELEMENTO: Referência ao container do Toast
const toastContainer = document.getElementById('toast-container');


// --- 3. FUNÇÕES DE LÓGICA ---

/**
 * Calcula a entropia (força) da senha.
 */
function calculateStrength(password, range) {
    if (password.length === 0) return 0;
    const length = password.length;
    const entropy = length * Math.log2(range);
    return entropy;
}

/**
 * Atualiza o indicador visual de força (barra e texto).
 */
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
 * Função principal para gerar a senha
 */
function generatePassword() {
    const length = parseInt(lengthInput.value);
    let allChars = "";
    let password = "";
    let requiredChars = []; 

    if (includeUppercase.checked) {
        allChars += upperCaseChars;
        requiredChars.push(upperCaseChars);
    }
    if (includeLowercase.checked) {
        allChars += lowerCaseChars;
        requiredChars.push(lowerCaseChars);
    }
    if (includeNumbers.checked) {
        allChars += numberChars;
        requiredChars.push(numberChars);
    }
    if (includeSymbols.checked) {
        allChars += symbolChars;
        requiredChars.push(symbolChars);
    }
    if (includeAccentedChars.checked) {
        allChars += accentedChars;
        requiredChars.push(accentedChars);
    }
    
    if (allChars.length === 0) {
        passwordDisplay.value = "Selecione pelo menos uma opção!";
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

// --- 4. FUNÇÃO DE TOAST (NOVA) ---

/**
 * Cria e exibe a notificação flutuante
 */
function showToast(message) {
    // 1. Cria o elemento
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;

    // 2. Adiciona ao container
    toastContainer.appendChild(toast);

    // 3. Animação de entrada (pequeno delay para o CSS funcionar)
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // 4. Remove após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        // Espera a animação de saída terminar antes de remover do DOM
        setTimeout(() => {
            toast.remove();
        }, 500); 
    }, 3000); 
}

// --- 5. LISTENERS DE EVENTOS ---

generateButton.addEventListener('click', generatePassword);

// Listener do Botão Copiar (ATUALIZADO COM FEEDBACK VISUAL)
copyButton.addEventListener('click', () => {
    // Validação básica
    if (passwordDisplay.value === "" || passwordDisplay.value.includes("Selecione") || passwordDisplay.value.includes("Clique em Gerar")) return;

    passwordDisplay.select();
    passwordDisplay.setSelectionRange(0, 99999); 

    try {
        navigator.clipboard.writeText(passwordDisplay.value);
        
        // --- A. Feedback Visual no Botão ---
        copyButton.innerHTML = "✅ Copiado!"; // Muda texto/ícone
        copyButton.classList.add('copied');   // Muda cor (via CSS)

        // --- B. Feedback Visual Flutuante (Toast) ---
        showToast("Senha copiada para a área de transferência!");
        
        // --- C. Resetar Botão após 1.5s ---
        setTimeout(() => {
            copyButton.innerHTML = "Copiar";
            copyButton.classList.remove('copied');
        }, 1500); 

    } catch (err) {
        showToast("Erro ao copiar. Tente manualmente.");
    }
});

document.addEventListener('DOMContentLoaded', generatePassword);