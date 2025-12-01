/* --- script.js - VERSÃO COM VALIDAÇÃO E SINCRONIZAÇÃO REINTEGRADA --- */

// --- 1. CONFIGURAÇÕES E VARIÁVEIS GLOBAIS ---
const wordList = [
    "abacate", "abelha", "abobora", "abrigo", "acabar", "acender", "acesso", "achado", "acordo", "acucar", "adeus", "adorar", "africa", "agora", "aguia", "ajuda", "alarme", "album", "alegre", "algum", "alianca", "alivio", "aluno", "amarelo", "amigo", "amor", "anjo", "antena", "antigo", "anual", "apagar", "apoio", "aprender", "area", "arroz", "arvore", "asilo", "assinar", "atencao", "atirar", "atleta", "atraso", "audaz", "auto", "aviao", "aviso", "avó", "azul", "bairro", "bala", "banco", "bandeira", "barco", "barulho", "base", "batalha", "batom", "beijo", "beleza", "bencao", "besta", "bicicleta", "bingo", "bola", "bonito", "borboleta", "bota", "braco", "briga", "bronze", "buraco", "cabeca", "cabo", "cabra", "cachos", "cadeira", "caderno", "cafe", "caixa", "cajado", "calca", "calor", "calvo", "caminho", "campina", "campo", "canal", "cancao", "caneta", "canto", "capaz", "capital", "carne", "carro", "carta", "casa", "casaco", "casca", "casco", "castigo", "castelo", "casual", "catarata", "cauda", "causa", "cautela", "cedo", "cebola", "celula", "cento", "cerca", "certo", "ceu", "chama", "chao", "chave", "cheiro", "chico", "chifre", "choque", "chuva", "cidade", "cigarro", "cinco", "cinema", "cinto", "circo", "cisco", "civil", "claro", "classe", "cliente", "clima", "cobra", "coche", "codigo", "coelho", "coisa", "colega", "colher", "coluna", "comando", "comida", "comum", "conta", "conto", "copa", "copia", "coracao", "corpo", "corrente", "coruja", "corvo", "costa", "costas", "couro", "coyote", "cozinha", "cravo", "crianca", "crise", "cristal", "cruel", "cubo", "cueca", "culpa", "cultura", "curto", "curva", "custo", "dado", "dama", "danca", "data", "defeito", "degrau", "delicado", "dentro", "depois", "desejo", "destino", "deus", "dia", "diabo", "dieta", "dinheiro", "direito", "doce", "dois", "dormir", "dose", "ducha", "duelo", "duvida", "duzias", "eletrico", "elemento", "elevar", "embarcar", "emissao", "emocoes", "emprego", "energia", "enigma", "ensinar", "entrar", "equipe", "erro", "escola", "escuro", "esforco", "espaco", "espero", "esporte", "esposa", "estrada", "estrela", "eterno", "etica", "evento", "exame", "exemplo", "extra", "facil", "faixa", "familia", "famoso", "farol", "fauna", "favor", "faxina", "fazenda", "feijao", "feliz", "ferro", "festa", "fevereiro", "ficha", "fiel", "figura", "filme", "filho", "final", "fio", "fique", "flauta", "flor", "folha", "fonte", "forma", "forte", "foto", "frase", "frio", "fruta", "fuga", "fundo", "futuro", "galho", "gancho", "ganso", "garfo", "gato", "gema", "geral", "gesso", "gloria", "gota", "graca", "grao", "grande", "grau", "gravata", "grilo", "grosso", "grupo", "guia", "harmonia", "haste", "heroi", "hoje", "homem", "honra", "hotel", "humano", "ideia", "idoso", "igreja", "ilha", "ilha", "impacto", "impar", "imposto", "incenso", "indice", "infancia", "inferior", "inicio", "injuria", "inseto", "interno", "intruso", "inverno", "irmao", "janela", "jantar", "jardim", "jato", "joelho", "jogador", "jornal", "jovem", "juiz", "julho", "junho", "juros", "justo", "kilowatt", "labor", "lago", "laje", "lama", "lamento", "laranja", "largo", "latido", "lavar", "lazer", "ledo", "legume", "leite", "leitura", "lento", "leopardo", "letra", "leve", "libra", "licao", "lider", "limao", "limite", "limpo", "linha", "linho", "liso", "livro", "local", "lodo", "loja", "lona", "longo", "louco", "louro", "luar", "lugar", "luz", "macaco", "macio", "maior", "mala", "mamae", "manha", "mapa", "marca", "marfim", "margem", "marido", "martelo", "massa", "mate", "maximo", "medico", "meio", "melao", "melhor", "menos", "mente", "mesa", "metal", "metro", "mexer", "mico", "micro", "militar", "milho", "mimado", "minha", "minuto", "misto", "moda", "moeda", "mole", "moral", "morder", "morte", "mosquito", "motor", "muito", "mundo", "musica", "nabo", "nacao", "nada", "nariz", "natal", "navio", "negar", "neve", "ninho", "nivel", "noite", "noivo", "nome", "normal", "norte", "nota", "nuvem", "objeto", "obrigado", "oceano", "oito", "olhar", "olho", "ombro", "onda", "onibus", "onze", "opera", "opcao", "ordem", "organico", "ouro", "outono", "outubro", "oval", "ouvido", "padre", "pagar", "pagina", "pai", "paixao", "palavra", "palco", "palha", "palito", "panela", "pano", "papel", "parada", "parque", "parte", "passaro", "passeio", "patio", "pato", "pausa", "paz", "pedaco", "pedra", "peixe", "pelo", "pena", "penca", "penhasco", "pensar", "perigo", "perna", "pessoa", "petala", "piano", "picar", "pilha", "pimenta", "pingo", "pintar", "pipa", "pirata", "piscina", "pista", "placa", "plano", "planta", "pneu", "poco", "poeira", "policia", "polo", "ponta", "ponte", "populacao", "porco", "porta", "porte", "possivel", "postal", "pouco", "praca", "prato", "preto", "primavera", "primo", "prisioneiro", "problema", "processo", "proximo", "publico", "pudim", "pulseira", "quadra", "quadro", "qual", "quase", "quatro", "queijo", "quente", "quinta", "quiro", "rabo", "raiz", "ramo", "rapido", "rato", "razao", "real", "remedio", "remo", "reparo", "resgate", "resumo", "reuniao", "reverso", "revista", "rico", "rio", "risco", "ritmo", "rocha", "roda", "rola", "romance", "roupa", "rua", "ruido", "rumo", "sabao", "sabor", "saco", "salada", "saldo", "salto", "samba", "sandalia", "sangue", "santo", "sapo", "saudade", "saude", "seco", "seguro", "seis", "selva", "sempre", "senha", "sentido", "setembro", "sete", "sexo", "shampoo", "sinal", "sino", "situacao", "socio", "sofa", "sol", "sopa", "sorriso", "sorte", "subida", "sucesso", "sujo", "superior", "tabaco", "tala", "talento", "tambor", "tampa", "tarde", "tarifa", "tatu", "taza", "tecido", "tecla", "telefone", "televisao", "tempo", "tendencia", "terno", "terra", "texto", "tigre", "tijolo", "tinta", "tinto", "tirar", "titulo", "tocha", "todo", "tomate", "topo", "touca", "toque", "touro", "trabalho", "trem", "tres", "tribo", "trigo", "troca", "tronco", "tufo", "tulipa", "turma", "um", "uniao", "unico", "urbano", "urso", "util", "uvida", "vaca", "vagao", "valvula", "vantagem", "vaso", "veiculo", "veia", "vento", "verde", "vermelho", "versao", "vespa", "vestido", "vez", "viagem", "vida", "vidro", "vilarejo", "vinho", "violeta", "virgem", "virtude", "vista", "vitoria", "vitrola", "vivo", "voo", "volume", "voto", "zebra", "zero", "ziguezague", "zona", "zoologico", "alface", "alho", "ameixa", "amendoa", "ananas", "apito", "areia", "asno", "avela", "azeite", "bagagem", "bailarina", "batata", "bau", "bexiga", "bilhete", "biscoito", "bule", "buzina", "cabide", "cacau", "cacto", "caneca", "carvao", "cegonha", "cenoura", "cereja", "cesta", "colete", "dardo", "dedo", "diamante", "disco", "doença", "escada", "esponja", "etiqueta", "foguete", "fungo", "gaiola", "gaveta", "gelo", "gola", "gota", "grama", "guitarra", "iglu", "joia", "lama", "lanterna", "lata", "lixa", "macarrao", "maçã", "meia", "milho", "novelo", "óculos", "orelha", "ovo", "pincel", "pneu", "pomar", "pote", "pulga", "queijo", "raio", "remo", "serra", "sino", "tesoura", "uva", "vela", "xadrez", "xicara", "yoga", "bambu", "caracol", "castanha", "cogumelo", "esmalte", "espinho", "giz", "luva", "mochila", "noz", "pena", "pinha", "rolha", "sabonete", "tapete", "vela", "zinco", "acougue", "alicate", "batedor", "cabide", "carimbo", "chicote", "chifre", "chaveiro", "clinica", "cobertor", "colmeia", "desenho", "domino", "escudo", "esfirra", "espelho", "fivela", "gasolina", "guarda", "igreja", "isqueiro", "jardim", "labirinto", "martelo", "moinho", "passaporte", "patinete", "penhasco", "pistola", "queimada", "raquete", "seringa", "tabuleiro", "tirolesa", "triciclo", "vassoura", "ventilador", "xarope", "zagueiro", "abacaxi", "abajur", "adorno", "agulha", "almofada", "ampulheta", "anzol", "aquario", "arame", "arco", "asfalto", "aspirador", "azulejo", "bacia", "bambu", "bandeja", "barraca", "bengala", "bermuda", "beterraba", "bisturi", "bolsa", "bomba", "borracha", "bule", "cabeca", "cachecol", "cadeado", "caju", "canivete", "capuz", "carroca", "cartola", "casaco", "castical", "catavento", "cerca", "chiclete", "chinelo", "chupeta", "clipe", "coador", "cofrinho", "colar", "compasso", "concha", "controle", "cordao", "cotovelo", "cubo", "cunha", "decalque", "dedal", "despertador", "dicionario", "diploma", "elevador", "envelope", "escrivaninha", "esfregao", "esquilo", "estetoscopio", "extintor", "fantoche", "ferradura", "fichario", "filtro", "funil", "gaiola", "garrafa", "geladeira", "gravura", "guarda-chuva", "guardanapo", "hammock", "harpia", "hastes", "horta", "hotel", "iate", "impermeavel", "imã", "jaleito", "jaula", "jegue", "joias", "jornal", "kilt", "lacre", "lampada", "lapis", "lençol", "lixeira", "lousa", "macaco", "magnete", "manga", "manequim", "manopla", "mapa", "marcador", "mascara", "medalha", "microscopio", "mictorio", "moedor", "mola", "morango", "mochila", "munhequeira", "navalha", "niple", "novelo", "ombreira", "pandeiro", "parafuso", "pen drive", "pinça", "pirulito", "prancha", "puxador", "quadro-negro", "radiola", "regador", "rolamento", "serrote", "skate", "sobretudo", "sorvete", "tampa", "termometro", "torneira", "trampolim", "tribuna", "tricô", "trofeu", "turbina", "urna", "vagalume", "vareta", "veado", "ventilador", "vitrine", "xale", "zircão", "zurro", "abotoadura", "acordeon", "aerofolio", "agave", "alambique", "alfinete", "algema", "amuleto", "ancora", "anel", "aparador", "apoio", "aquecedor", "armario", "arroba", "autorama", "avental", "bacia", "bafometro", "baguete", "balaustre", "balde", "bandeja", "barril", "batedeira", "bico", "binoculo", "biruta", "bisturi", "bloco", "boia", "bolacha", "bombom", "bumerangue", "cabana", "cabideiro", "cachimbo", "caco", "cajado", "caldeirao", "camisa", "caneca", "canudo", "capa", "carrossel", "cartaz", "cinto", "cisterna", "clarinete", "carrinho", "coifa", "coroa", "cuba", "dossel", "draga", "escafandro", "espeto", "esquadro", "estandarte", "estojo", "fanzine", "ferrolho", "figa", "flanela", "formao", "frasco", "freio", "frescura", "funil", "gabarito", "gaita", "gangorra", "grampo", "guilhotina", "hidrante", "isqueiro", "jerico", "jiboia", "jornaleiro", "juba", "kilt", "lacre", "ladrao", "lampiao", "lata", "lixeira", "luva", "machado", "madeira", "maleta", "manometro", "marionete", "marreta", "mascara", "mastruz", "medalhao", "medidor", "mictorio", "moringa", "motoneta", "mural", "nafta", "narguile", "neve", "nylon", "obelisco", "oboe", "oito", "oleo", "orca", "ornamento", "palheta", "panfleto", "parachoque", "parafuso", "parafuso", "patins", "pendulo", "periscopio", "petroleo", "picareta", "pilão", "pilastra", "pinça", "pingente", "pipoqueira", "piramide", "plataforma", "pluma", "portao", "prego", "propulsor", "pulverizador", "quadrante", "quebra-cabeça", "quilha", "rabeca", "radar", "ralador", "rastelo", "regua", "relogio", "rotor", "safira", "salsicha", "sanduiche", "serafim", "sino", "sinuca", "solda", "solenoide", "sutura", "tabuleta", "talher", "telescopio", "telefone", "torre", "torpedo", "trava", "treliche", "trombone", "trofeu", "turbina", "urna", "vagonete", "vela", "vidro", "viola", "visor", "volta", "xilofone", "yoga", "zepelim", "zinco", "zircão"
];

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


// --- 3. REFERÊNCIAS AO DOM (REAJUSTADAS PARA SINCRONIZAÇÃO DE INPUTS) ---

// Elementos de Entrada/Saída
const passwordDisplay = document.getElementById('password-display');
const generateButton = document.getElementById('generate-button');
const copyButton = document.getElementById('copy-button');

// Range Sliders (IDs Corretos para sincronização)
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

// Indicador de Força
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');

// Tema
const themeToggle = document.getElementById('theme-toggle');

// Histórico
const historyList = document.getElementById('password-history-list');
const clearHistoryButton = document.getElementById('clear-history-button');
const historyStatus = document.getElementById('history-status');


// --- 4. FUNÇÕES DE UTILIDADE E SEGURANÇA (MELHORIA 3 MANTIDA) ---

/**
 * Retorna um índice seguro e aleatório dentro do limite especificado.
 * Usa crypto.getRandomValues para segurança criptográfica.
 * @param {number} max - O limite máximo (comprimento da string ou array).
 * @returns {number} Um índice inteiro e seguro.
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
 * Embaralha uma string (ou array) de forma criptograficamente segura usando o algoritmo Fisher-Yates.
 * @param {string} string - A string a ser embaralhada.
 * @returns {string} A string embaralhada.
 */
function secureShuffle(string) {
    let array = string.split('');
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        // Escolhe um elemento restante de forma segura.
        randomIndex = getRandomSecureIndex(currentIndex);
        currentIndex -= 1;

        // E troca-o pelo elemento atual.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array.join('');
}


// --- 5. LÓGICA DE FORÇA DA SENHA ---

/**
 * Calcula a Entropia (bits) com base no modo e no tamanho do conjunto.
 */
function calculateStrength(password, mode, charSetSize) {
    if (password.length === 0) return 0;

    let entropy;
    if (mode === 'char') {
        entropy = password.length * Math.log2(charSetSize);
    } else if (mode === 'passphrase') {
        // Assume que o charSetSize é o tamanho da wordList
        const numWords = password.split(separatorInput.value).length;
        entropy = numWords * Math.log2(charSetSize); 
    }
    return entropy > 0 ? entropy : 0;
}

/**
 * Avalia e atualiza a força da senha na UI.
 */
function updateStrengthIndicator(password, mode, charSetSize) {
    const entropy = calculateStrength(password, mode, charSetSize);
    let strength = "";
    let width = 0;
    let className = "";

    if (entropy === 0) {
        strengthBar.style.width = "0%";
        strengthText.textContent = "";
        return;
    }

    // Mapeamento de Força (Baseado na entropia)
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
        width = 75 + Math.min(25, (entropy - 80) / 20); // Limita o máximo
        className = "strength-very-strong";
    }
    
    strengthBar.style.width = Math.min(width, 100).toFixed(2) + "%";
    strengthBar.className = `strength-bar ${className}`;
    strengthText.textContent = `${strength} (${entropy.toFixed(1)} bits)`;
}


// --- 6. LÓGICA DE GERAÇÃO (COM VALIDAÇÃO DE CARACTERES) ---

/**
 * Remove caracteres ambíguos de um conjunto de caracteres.
 */
function removeAmbiguous(charSet) {
    const regex = new RegExp('[' + charSets.ambiguous.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + ']', 'g');
    return charSet.replace(regex, '');
}

/**
 * Geração de Senha por Caractere (Melhoria 2 implementada)
 */
function generateCharacterPassword() {
    // Obtém o valor do input numérico, que é a fonte de verdade
    const length = parseInt(lengthNumberInput.value);
    const isAmbiguousExcluded = excludeAmbiguous.checked;

    let allChars = "";
    let password = "";
    let requiredChars = []; 
    
    const processCharSet = (charSet) => {
        if (isAmbiguousExcluded) {
            return removeAmbiguous(charSet);
        }
        return charSet;
    };

    // 1. Constrói o conjunto de caracteres e os caracteres obrigatórios
    if (includeUppercase.checked) {
        const chars = processCharSet(charSets.uppercase);
        if(chars.length > 0) { allChars += chars; requiredChars.push(chars); }
    }
    if (includeLowercase.checked) {
        const chars = processCharSet(charSets.lowercase);
        if(chars.length > 0) { allChars += chars; requiredChars.push(chars); }
    }
    if (includeNumbers.checked) {
        const chars = processCharSet(charSets.numbers);
        if(chars.length > 0) { allChars += chars; requiredChars.push(chars); }
    }
    if (includeSymbols.checked) {
        const chars = processCharSet(charSets.symbols);
        if(chars.length > 0) { allChars += chars; requiredChars.push(chars); }
    }
    if (includeAccentedChars.checked) {
        const chars = processCharSet(charSets.accented);
        if(chars.length > 0) { allChars += chars; requiredChars.push(chars); }
    }
    
    // *** MELHORIA 2: VALIDAÇÃO DE CARACTERES ***
    if (allChars.length === 0) {
        passwordDisplay.value = "**Selecione Pelo Menos um Tipo de Caractere!**";
        updateStrengthIndicator("", 'char', 0);
        return;
    }
    
    // 2. Garante que os caracteres obrigatórios sejam incluídos primeiro
    for (const charSet of requiredChars) {
        const randomIndex = getRandomSecureIndex(charSet.length);
        password += charSet[randomIndex];
    }
    
    // 3. Preenche o restante do comprimento e embaralha (mantendo a segurança)
    const remainingLength = length - requiredChars.length;
    let lastChar = password.slice(-1); 
    
    for (let i = 0; i < remainingLength; i++) {
        let newChar;
        let attempts = 0;
        
        // Evita repetição trivial de caracteres (ex: 'aaa')
        do {
            const randomIndex = getRandomSecureIndex(allChars.length);
            newChar = allChars[randomIndex];
            attempts++;
            // Se só houver 1 char disponível, evita loop infinito
            if (allChars.length === 1 && attempts > 1) break; 
        } while (newChar === lastChar); 

        password += newChar;
        lastChar = newChar; 
    }

    // 4. Embaralha para que os caracteres obrigatórios não fiquem sempre no início
    password = secureShuffle(password);
    
    passwordDisplay.value = password;
    updateStrengthIndicator(password, 'char', allChars.length);
    saveToHistory(password);
}


/**
 * Geração de Passphrase
 */
function generatePassphrase() {
    // Obtém o valor do input numérico, que é a fonte de verdade
    const numWords = parseInt(numWordsNumberInput.value); 
    const separator = separatorInput.value || '-';
    let passphrase = [];

    if (numWords < 3 || numWords > 10) { // Validação simples
        passwordDisplay.value = "Número de palavras inválido (3-10).";
        updateStrengthIndicator("", 'passphrase', 0);
        return;
    }

    for (let i = 0; i < numWords; i++) {
        const randomIndex = getRandomSecureIndex(wordList.length);
        passphrase.push(wordList[randomIndex]);
    }

    const finalPassphrase = passphrase.join(separator);
    passwordDisplay.value = finalPassphrase;
    updateStrengthIndicator(finalPassphrase, 'passphrase', wordList.length); 
    saveToHistory(finalPassphrase);
}

/**
 * Função principal para gerar a senha/passphrase e atualizar a interface.
 */
function generatePassword() {
    // Reinicia o estado do botão copiar
    copyButton.textContent = 'Copiar';
    copyButton.classList.remove('copied');

    if (modePassphrase.checked) {
        generatePassphrase();
    } else {
        generateCharacterPassword();
    }
}


// --- 7. LÓGICA DE SINCRONIZAÇÃO (REINTEGRADA) ---

/**
 * Sincroniza o valor entre o input range e o input number (Comprimento).
 */
function syncLengthInputs(source) {
    const value = source.value;
    const min = parseInt(lengthNumberInput.min);
    const max = parseInt(lengthNumberInput.max);
    
    // Garantir que o valor digitado esteja dentro dos limites
    const safeValue = Math.min(Math.max(parseInt(value) || min, min), max);

    if (source === lengthRangeInput) {
        lengthNumberInput.value = safeValue;
    } else {
        lengthRangeInput.value = safeValue;
    }
    // Gera a senha após a sincronização
    generatePassword(); 
}

/**
 * Sincroniza o valor entre o input range e o input number (Palavras).
 */
function syncNumWordsInputs(source) {
    const value = source.value;
    const min = parseInt(numWordsNumberInput.min);
    const max = parseInt(numWordsNumberInput.max);

    // Garantir que o valor digitado esteja dentro dos limites
    const safeValue = Math.min(Math.max(parseInt(value) || min, min), max);

    if (source === numWordsRangeInput) {
        numWordsNumberInput.value = safeValue;
    } else {
        numWordsRangeInput.value = safeValue;
    }
    // Gera a senha após a sincronização
    generatePassword();
}


// --- 8. HISTÓRICO, COPIAR E TOAST (MANTIDOS E AJUSTADOS) ---

function saveToHistory(password) {
    // Não salva mensagens de erro
    if (!password || password.includes("Selecione") || password.includes("inválido")) return;

    let history = JSON.parse(sessionStorage.getItem('passwordHistory') || '[]');
    
    // Adiciona apenas se for diferente do último salvo
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

    if (history.length === 0) {
        historyStatus.style.display = 'block';
        return;
    }
    historyStatus.style.display = 'none';

    // Inverte a ordem para que o mais recente fique no topo da lista (graças ao CSS)
    history.slice().reverse().forEach((pwd) => {
        const item = document.createElement('div');
        item.classList.add('history-item');
        item.innerHTML = `
            <span class="history-password">${pwd}</span>
            <button class="history-copy-btn" data-password="${pwd}">Copiar</button>
        `;
        historyList.appendChild(item);
    });

    document.querySelectorAll('.history-copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pwdToCopy = e.target.getAttribute('data-password');
            navigator.clipboard.writeText(pwdToCopy);
            e.target.textContent = "✅ Copiado!";
            setTimeout(() => { e.target.textContent = "Copiar"; }, 1500);
        });
    });
}

function clearHistory() {
    sessionStorage.removeItem('passwordHistory');
    renderHistory(); 
    showToast("Histórico limpo!");
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


// --- 9. LISTENERS DE EVENTOS ---

// Listeners para sincronizar inputs de comprimento
lengthRangeInput.addEventListener('input', () => syncLengthInputs(lengthRangeInput));
lengthNumberInput.addEventListener('input', () => syncLengthInputs(lengthNumberInput));

// Listeners para sincronizar inputs de palavras
numWordsRangeInput.addEventListener('input', () => syncNumWordsInputs(numWordsRangeInput));
numWordsNumberInput.addEventListener('input', () => syncNumWordsInputs(numWordsNumberInput));

// Listener para alternar modos
const handleModeChange = () => {
    currentMode = modeChar.checked ? 'char' : 'passphrase';

    charSettingsDiv.style.display = currentMode === 'char' ? 'block' : 'none';
    passphraseSettingsDiv.style.display = currentMode === 'passphrase' ? 'block' : 'none';
    generateButton.textContent = currentMode === 'char' ? 'Gerar Senha' : 'Gerar Passphrase';
    
    // Gera uma nova senha no novo modo
    generatePassword();
};
modeChar.addEventListener('change', handleModeChange);
modePassphrase.addEventListener('change', handleModeChange);


// Listeners que regeneram a senha em tempo real ao mudar a configuração de caracteres
[includeUppercase, includeLowercase, includeNumbers, includeSymbols, 
 includeAccentedChars, excludeAmbiguous].forEach(checkbox => {
    checkbox.addEventListener('change', generatePassword);
});

// Listener para o separador da passphrase
separatorInput.addEventListener('input', () => {
    if (currentMode === 'passphrase') {
        generatePassword();
    }
});

// Outros Listeners
generateButton.addEventListener('click', generatePassword);
copyButton.addEventListener('click', () => copyToClipboard(passwordDisplay.value));
clearHistoryButton.addEventListener('click', clearHistory);


// Listener para alternar tema
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});


// --- 10. INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Carregar tema preferido
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }

    // 2. Inicializar os valores dos inputs numéricos com os ranges (sincronização inicial)
    // Isso garante que os valores numéricos sejam usados na primeira geração.
    syncLengthInputs(lengthRangeInput);
    syncNumWordsInputs(numWordsRangeInput);

    // 3. Inicializar modo e gerar a primeira senha
    handleModeChange(); 

    // 4. Renderizar histórico
    renderHistory();
});