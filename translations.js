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
        
        // 🔑 CHAVES DE TEMPO E AVALIAÇÃO DE SEGURANÇA (Para Força Aprimorada) 🔑
        breakTimeLabel: "Tempo de Quebra Estimado:",
        time_seconds: "segundos",
        time_minutes: "minutos",
        time_hours: "horas",
        time_days: "dias",
        time_months: "meses",
        time_years: "anos",
        time_millions_years: "Milhões de Anos",
        
        // CHAVES DE ERRO E TOAST (Crucial para o script.js)
        errorSelectChar: "Selecione pelo menos um tipo de caractere.",
        errorInvalidWords: "O número de palavras é inválido (3-10).",

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
        
        // 🔑 NOVAS CHAVES DE DICIONÁRIO PERSONALIZADO 🔑
        customDictTitle: "📝 Dicionário Personalizado",
        customDictPlaceholder: "Cole sua lista de palavras aqui (separadas por nova linha). A lista deve ter no mínimo 256 palavras para segurança mínima.",
        customDictNote: "Se este campo estiver preenchido, ele **substituirá** o dicionário Diceware padrão.",
        customDictWarning: "Lista muito curta. Mínimo de 256 palavras recomendado.",
        
        // Histórico
        historyTitle: "📜 Histórico da Sessão",
        historyClear: "Histórico de senhas limpo.",
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
        
        // 🔑 NEW TIME AND SECURITY ASSESSMENT KEYS (For Enhanced Strength) 🔑
        breakTimeLabel: "Estimated Break Time:",
        time_seconds: "seconds",
        time_minutes: "minutes",
        time_hours: "hours",
        time_days: "days",
        time_months: "months",
        time_years: "years",
        time_millions_years: "Million Years",
        
        // ERROR AND TOAST KEYS (Crucial for script.js)
        errorSelectChar: "Select at least one character type.",
        errorInvalidWords: "The number of words is invalid (3-10).",

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

        // 🔑 NEW CUSTOM DICTIONARY KEYS 🔑
        customDictTitle: "📝 Custom Dictionary",
        customDictPlaceholder: "Paste your word list here (separated by new line). The list should have at least 256 words for minimum security.",
        customDictNote: "If this field is filled, it will **override** the default Diceware dictionary.",
        customDictWarning: "List too short. Minimum 256 words recommended.",
        
        // History
        historyTitle: "📜 Session History",
        historyClear: "Password history cleared.",
        historyNote: "*History is temporary and is cleared when closing the tab.*",
        historyEmpty: "No passwords generated yet.",
        historyPasswordCopied: "Copied!" 
    }
};

// --- Implementação do wordLists (Usando 'var' para escopo global) ---

var wordLists = {
    // ⚠️ ATENÇÃO: SUBSTITUA ESTES EXEMPLOS PELAS SUAS LISTAS DICARE COMPLETA DE 7776 PALAVRAS
    'pt-br': [
        "abelha", "acaso", "água", "ajuda", "andar", "anexo", "apelo", "ar", 
        "barco", "bazar", "beijo", "bloco", "buraco", "cabide", "cadeira", "caixa", 
        "chave", "chuva", "coelho", "copo", "corda", "corpo", "dados", "doce",
        // ... (Insira o restante da lista Diceware completa em português aqui)
    ],
    'en-us': [
        "able", "acorn", "agent", "alias", "album", "alien", "angel", "aqua",
        "bacon", "badge", "baker", "bamboo", "basic", "beard", "blitz", "breeze",
        "cabin", "cable", "calm", "candy", "chart", "chief", "clean", "color"
        // ... (Insira o restante da lista Diceware completa em inglês aqui)
    ]
};