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
const includeAccentedChars = document.getElementById('include-accented-chars'); // NOVO ELEMENTO
const passwordDisplay = document.getElementById('password-display');
const generateButton = document.getElementById('generate-button');
const copyButton = document.getElementById('copy-button');
const strengthBar = document.getElementById('strength-bar'); // NOVO ELEMENTO
const strengthText = document.getElementById('strength-text'); // NOVO ELEMENTO


// --- 3. FUNÇÕES DE LÓGICA ---

/**
 * Calcula a entropia (força) da senha usando a fórmula de Shannon.
 * Entropia (bits) = log2(R^L) = L * log2(R)
 * Onde L é o comprimento da senha e R é o tamanho do conjunto de caracteres (range).
 */
function calculateStrength(password, range) {
    if (password.length === 0) return 0;
    
    const length = password.length;
    
    // O range (R) é o tamanho do conjunto de caracteres que foi usado.
    // Usamos o 'range' passado como argumento (o tamanho da string 'allChars').
    
    // Calcula a Entropia (bits)
    // Math.log2() é o logaritmo na base 2.
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

    // Mapeamento da força com base na entropia (em bits)
    // Fontes recomendam: 40 (fraca), 60 (média), 80+ (forte)
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
        width = 75 + Math.min(25, (entropy - 80) / 10); // Limita em 100%
        className = "strength-very-strong";
    }

    // Aplica os estilos ao DOM
    strengthBar.style.width = width.toFixed(2) + "%";
    strengthBar.className = `strength-bar ${className}`;
    strengthText.textContent = `${strength} (${entropy.toFixed(1)} bits)`;
    
    // Limpa o indicador se a senha estiver vazia (em caso de erro)
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
    let requiredChars = []; // Para garantir pelo menos um de cada tipo selecionado

    // Constrói a string de caracteres possíveis e o array de caracteres obrigatórios
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
    // NOVO: Adiciona caracteres acentuados
    if (includeAccentedChars.checked) {
        allChars += accentedChars;
        requiredChars.push(accentedChars);
    }
    
    // --- LÓGICA DE GERAÇÃO ---
    if (allChars.length === 0) {
        passwordDisplay.value = "Selecione pelo menos uma opção!";
        updateStrengthIndicator("", 0);
        return;
    }
    
    // 1. Garante que todos os tipos selecionados estejam presentes (melhoria de segurança)
    for (const charSet of requiredChars) {
        const randomIndex = Math.floor(Math.random() * charSet.length);
        password += charSet[randomIndex];
    }
    
    // 2. Preenche o restante do comprimento com caracteres aleatórios
    const remainingLength = length - requiredChars.length;
    for (let i = 0; i < remainingLength; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars[randomIndex];
    }

    // 3. Embaralha a senha para que os caracteres obrigatórios não fiquem sempre no início
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    passwordDisplay.value = password;
    
    // 4. Atualiza o indicador de força
    updateStrengthIndicator(password, allChars);
}

// --- 4. LISTENERS DE EVENTOS ---

// Listener para o botão "Gerar"
generateButton.addEventListener('click', generatePassword);

// Listener para o botão "Copiar" (melhoria de feedback)
copyButton.addEventListener('click', () => {
    if (passwordDisplay.value === "" || passwordDisplay.value.includes("Selecione")) return;

    passwordDisplay.select();
    passwordDisplay.setSelectionRange(0, 99999); 

    try {
        navigator.clipboard.writeText(passwordDisplay.value);
        
        // Feedback visual
        copyButton.textContent = "Copiado!";
        setTimeout(() => {
            copyButton.textContent = "Copiar";
        }, 1500); 
    } catch (err) {
        alert("Falha ao copiar. Tente selecionar o texto manualmente.");
    }
});

// Opcional: Gera uma senha inicial ao carregar a página
document.addEventListener('DOMContentLoaded', generatePassword);