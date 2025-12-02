// translations.js

// Usamos 'var' para garantir que estes objetos estejam acessíveis globalmente
// para o script.js, que será carregado logo em seguida.

var translations = {
    "pt-br": {
        // Títulos e Modos
        title: "🔐 Gerador de Senhas Seguras",
        modeChar: "Modo **Caracteres**",
        modePassphrase: "Modo **Passphrase**",

        // Botões e Display
        displayDefault: "Clique em GERAR para começar",
        generateButton: "GERAR SENHA",
        copy: "Copiar",
        copied: "Senha copiada! 🎉",
        failedCopy: "Erro ao copiar a senha.",

        // Força da Senha
        strengthLabel: "Força da Senha:",
        tooShort: "Curta demais",
        weak: "Fraca",
        medium: "Média",
        strong: "Forte",
        veryStrong: "Muito Forte",

        // Configurações de Caracteres
        configCharTitle: "⚙️ Configurações de Caracteres",
        lengthLabel: "Comprimento da Senha:",
        includeUppercase: "Incluir **Maiúsculas** (A-Z)",
        includeLowercase: "Incluir **Minúsculas** (a-z)",
        includeNumbers: "Incluir **Números** (0-9)",
        includeSymbols: "Incluir **Símbolos** (!@#$...) (Recomendado)",
        includeAccentedChars: "Incluir **Acentos** (áéíóúçãõ)",
        excludeAmbiguous: "Excluir Ambíguos (l, I, 1, o, 0)",
        
        // Configurações de Passphrase
        configPassphraseTitle: "📝 Configurações de Passphrase",
        numWords: "Número de Palavras:",
        separator: "Separador:",
        capitalizeWords: "Capitalizar a primeira letra de cada palavra",
        includePassphraseDigits: "Incluir dígito(s) aleatório(s)",

        // Histórico
        historyTitle: "📜 Histórico da Sessão",
        historyClear: "Limpar Histórico",
        historyNote: "*O histórico é temporário e é apagado ao fechar a aba.*",
        historyEmpty: "Nenhuma senha gerada ainda.",
        historyPasswordCopied: "Copiado!"
    },
    "en-us": {
        // Titles and Modes
        title: "🔐 Secure Password Generator",
        modeChar: "**Character** Mode",
        modePassphrase: "**Passphrase** Mode",

        // Buttons and Display
        displayDefault: "Click GENERATE to start",
        generateButton: "GENERATE PASSWORD",
        copy: "Copy",
        copied: "Password copied! 🎉",
        failedCopy: "Failed to copy password.",

        // Password Strength
        strengthLabel: "Password Strength:",
        tooShort: "Too Short",
        weak: "Weak",
        medium: "Medium",
        strong: "Strong",
        veryStrong: "Very Strong",

        // Character Settings
        configCharTitle: "⚙️ Character Settings",
        lengthLabel: "Password Length:",
        includeUppercase: "Include **Uppercase** (A-Z)",
        includeLowercase: "Include **Lowercase** (a-z)",
        includeNumbers: "Include **Numbers** (0-9)",
        includeSymbols: "Include **Symbols** (!@#$...) (Recommended)",
        includeAccentedChars: "Include **Accented** Chars (áéíóúçãõ)",
        excludeAmbiguous: "Exclude Ambiguous (l, I, 1, o, 0)",
        
        // Passphrase Settings
        configPassphraseTitle: "📝 Passphrase Settings",
        numWords: "Number of Words:",
        separator: "Separator:",
        capitalizeWords: "Capitalize first letter of each word",
        includePassphraseDigits: "Include random digit(s)",

        // History
        historyTitle: "📜 Session History",
        historyClear: "Clear History",
        historyNote: "*History is temporary and is cleared when closing the tab.*",
        historyEmpty: "No passwords generated yet.",
        historyPasswordCopied: "Copied!"
    }
};

// --- Implementação do wordLists (Usando 'var' para escopo global) ---

var wordLists = {
    'pt-br': [
        // Substitua com sua lista de 7776 palavras em português
        // Exemplo:
        "abelha", "acaso", "água", "ajuda", "andar", "anexo", "apelo", "ar", 
        // ... (7768 palavras restantes)
    ],
    'en-us': [
        // Substitua com sua lista de 7776 palavras em inglês (Diceware)
        // Exemplo:
        "able", "acorn", "agent", "alias", "album", "alien", "angel", "aqua",
        // ... (7768 palavras restantes)
    ]
};