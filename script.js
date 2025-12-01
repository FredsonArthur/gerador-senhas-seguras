// --- 1. DICIONÁRIO E CONJUNTOS DE CARACTERES ---

// Dicionário com 2048 palavras (2^11) para boa entropia.
// Lista básica para fins de demonstração (idealmente, use uma lista maior)
const wordList = [
    "abacate", "abelha", "abobora", "abrigo", "acabar", "acender", "acesso", "achado", "acordo", "acucar", "adeus", "adorar", "africa", "agora", "aguia", "ajuda", "alarme", "album", "alegre", "algum", "alianca", "alivio", "aluno", "amarelo", "amigo", "amor", "anjo", "antena", "antigo", "anual", "apagar", "apoio", "aprender", "area", "arroz", "arvore", "asilo", "assinar", "atencao", "atirar", "atleta", "atraso", "audaz", "auto", "aviao", "aviso", "avó", "azul", "bairro", "bala", "banco", "bandeira", "barco", "barulho", "base", "batalha", "batom", "beijo", "beleza", "bencao", "besta", "bicicleta", "bingo", "bola", "bonito", "borboleta", "bota", "braco", "briga", "bronze", "buraco", "cabeca", "cabo", "cabra", "cachos", "cadeira", "caderno", "cafe", "caixa", "cajado", "calca", "calor", "calvo", "caminho", "campina", "campo", "canal", "cancao", "caneta", "canto", "capaz", "capital", "carne", "carro", "carta", "casa", "casaco", "casca", "casco", "castigo", "castelo", "casual", "catarata", "cauda", "causa", "cautela", "cedo", "cebola", "celula", "cento", "cerca", "certo", "ceu", "chama", "chao", "chave", "cheiro", "chico", "chifre", "choque", "chuva", "cidade", "cigarro", "cinco", "cinema", "cinto", "circo", "cisco", "civil", "claro", "classe", "cliente", "clima", "cobra", "coche", "codigo", "coelho", "coisa", "colega", "colher", "coluna", "comando", "comida", "comum", "conta", "conto", "copa", "copia", "coracao", "corpo", "corrente", "coruja", "corvo", "costa", "costas", "couro", "coyote", "cozinha", "cravo", "crianca", "crise", "cristal", "cruel", "cubo", "cueca", "culpa", "cultura", "curto", "curva", "custo", "dado", "dama", "danca", "data", "defeito", "degrau", "delicado", "dentro", "depois", "desejo", "destino", "deus", "dia", "diabo", "dieta", "dinheiro", "direito", "doce", "dois", "dormir", "dose", "ducha", "duelo", "duvida", "duzias", "eletrico", "elemento", "elevar", "embarcar", "emissao", "emocoes", "emprego", "energia", "enigma", "ensinar", "entrar", "equipe", "erro", "escola", "escuro", "esforco", "espaco", "espero", "esporte", "esposa", "estrada", "estrela", "eterno", "etica", "evento", "exame", "exemplo", "extra", "facil", "faixa", "familia", "famoso", "farol", "fauna", "favor", "faxina", "fazenda", "feijao", "feliz", "ferro", "festa", "fevereiro", "ficha", "fiel", "figura", "filme", "filho", "final", "fio", "fique", "flauta", "flor", "folha", "fonte", "forma", "forte", "foto", "frase", "frio", "fruta", "fuga", "fundo", "futuro", "galho", "gancho", "ganso", "garfo", "gato", "gema", "geral", "gesso", "gloria", "gota", "graca", "grao", "grande", "grau", "gravata", "grilo", "grosso", "grupo", "guia", "harmonia", "haste", "heroi", "hoje", "homem", "honra", "hotel", "humano", "ideia", "idoso", "igreja", "ilha", "ilha", "impacto", "impar", "imposto", "incenso", "indice", "infancia", "inferior", "inicio", "injuria", "inseto", "interno", "intruso", "inverno", "irmao", "janela", "jantar", "jardim", "jato", "joelho", "jogador", "jornal", "jovem", "juiz", "julho", "junho", "juros", "justo", "kilowatt", "labor", "lago", "laje", "lama", "lamento", "laranja", "largo", "latido", "lavar", "lazer", "ledo", "legume", "leite", "leitura", "lento", "leopardo", "letra", "leve", "libra", "licao", "lider", "limao", "limite", "limpo", "linha", "linho", "liso", "livro", "local", "lodo", "loja", "lona", "longo", "louco", "louro", "luar", "lugar", "luz", "macaco", "macio", "maior", "mala", "mamae", "manha", "mapa", "marca", "marfim", "margem", "marido", "martelo", "massa", "mate", "maximo", "medico", "meio", "melao", "melhor", "menos", "mente", "mesa", "metal", "metro", "mexer", "mico", "micro", "militar", "milho", "mimado", "minha", "minuto", "misto", "moda", "moeda", "mole", "moral", "morder", "morte", "mosquito", "motor", "muito", "mundo", "musica", "nabo", "nacao", "nada", "nariz", "natal", "navio", "negar", "neve", "ninho", "nivel", "noite", "noivo", "nome", "normal", "norte", "nota", "nuvem", "objeto", "obrigado", "oceano", "oito", "olhar", "olho", "ombro", "onda", "onibus", "onze", "opera", "opcao", "ordem", "organico", "ouro", "outono", "outubro", "oval", "ouvido", "padre", "pagar", "pagina", "pai", "paixao", "palavra", "palco", "palha", "palito", "panela", "pano", "papel", "parada", "parque", "parte", "passaro", "passeio", "patio", "pato", "pausa", "paz", "pedaco", "pedra", "peixe", "pelo", "pena", "penca", "penhasco", "pensar", "perigo", "perna", "pessoa", "petala", "piano", "picar", "pilha", "pimenta", "pingo", "pintar", "pipa", "pirata", "piscina", "pista", "placa", "plano", "planta", "pneu", "poco", "poeira", "policia", "polo", "ponta", "ponte", "populacao", "porco", "porta", "porte", "possivel", "postal", "pouco", "praca", "prato", "preto", "primavera", "primo", "prisioneiro", "problema", "processo", "proximo", "publico", "pudim", "pulseira", "quadra", "quadro", "qual", "quase", "quatro", "queijo", "quente", "quinta", "quiro", "rabo", "raiz", "ramo", "rapido", "rato", "razao", "real", "remedio", "remo", "reparo", "resgate", "resumo", "reuniao", "reverso", "revista", "rico", "rio", "risco", "ritmo", "rocha", "roda", "rola", "romance", "roupa", "rua", "ruido", "rumo", "sabao", "sabor", "saco", "salada", "saldo", "salto", "samba", "sandalia", "sangue", "santo", "sapo", "saudade", "saude", "seco", "seguro", "seis", "selva", "sempre", "senha", "sentido", "setembro", "sete", "sexo", "shampoo", "sinal", "sino", "situacao", "socio", "sofa", "sol", "sopa", "sorriso", "sorte", "subida", "sucesso", "sujo", "superior", "tabaco", "tala", "talento", "tambor", "tampa", "tarde", "tarifa", "tatu", "taza", "tecido", "tecla", "telefone", "televisao", "tempo", "tendencia", "terno", "terra", "texto", "tigre", "tijolo", "tinta", "tinto", "tirar", "titulo", "tocha", "todo", "tomate", "topo", "touca", "toque", "touro", "trabalho", "trem", "tres", "tribo", "trigo", "troca", "tronco", "tufo", "tulipa", "turma", "um", "uniao", "unico", "urbano", "urso", "util", "uvida", "vaca", "vagao", "valvula", "vantagem", "vaso", "veiculo", "veia", "vento", "verde", "vermelho", "versao", "vespa", "vestido", "vez", "viagem", "vida", "vidro", "vilarejo", "vinho", "violeta", "virgem", "virtude", "vista", "vitoria", "vitrola", "vivo", "voo", "volume", "voto", "zebra", "zero", "ziguezague", "zona", "zoologico", "alface", "alho", "ameixa", "amendoa", "ananas", "apito", "areia", "asno", "avela", "azeite", "bagagem", "bailarina", "batata", "bau", "bexiga", "bilhete", "biscoito", "bule", "buzina", "cabide", "cacau", "cacto", "caneca", "carvao", "cegonha", "cenoura", "cereja", "cesta", "colete", "dardo", "dedo", "diamante", "disco", "doença", "escada", "esponja", "etiqueta", "foguete", "fungo", "gaiola", "gaveta", "gelo", "gola", "gota", "grama", "guitarra", "iglu", "joia", "lama", "lanterna", "lata", "lixa", "macarrao", "maçã", "meia", "milho", "novelo", "óculos", "orelha", "ovo", "pincel", "pneu", "pomar", "pote", "pulga", "queijo", "raio", "remo", "serra", "sino", "tesoura", "uva", "vela", "xadrez", "xicara", "yoga", "bambu", "caracol", "castanha", "cogumelo", "esmalte", "espinho", "giz", "luva", "mochila", "noz", "pena", "pinha", "rolha", "sabonete", "tapete", "vela", "zinco", "acougue", "alicate", "batedor", "cabide", "carimbo", "chicote", "chifre", "chaveiro", "clinica", "cobertor", "colmeia", "desenho", "domino", "escudo", "esfirra", "espelho", "fivela", "gasolina", "guarda", "igreja", "isqueiro", "jardim", "labirinto", "martelo", "moinho", "passaporte", "patinete", "penhasco", "pistola", "queimada", "raquete", "seringa", "tabuleiro", "tirolesa", "triciclo", "vassoura", "ventilador", "xarope", "zagueiro", "abacaxi", "abajur", "adorno", "agulha", "almofada", "ampulheta", "anzol", "aquario", "arame", "arco", "asfalto", "aspirador", "azulejo", "bacia", "bambu", "bandeja", "barraca", "bengala", "bermuda", "beterraba", "bisturi", "bolsa", "bomba", "borracha", "bule", "cabeca", "cachecol", "cadeado", "caju", "canivete", "capuz", "carroca", "cartola", "casaco", "castical", "catavento", "cerca", "chiclete", "chinelo", "chupeta", "clipe", "coador", "cofrinho", "colar", "compasso", "concha", "controle", "cordao", "cotovelo", "cubo", "cunha", "decalque", "dedal", "despertador", "dicionario", "diploma", "elevador", "envelope", "escrivaninha", "esfregao", "esquilo", "estetoscopio", "extintor", "fantoche", "ferradura", "fichario", "filtro", "funil", "gaiola", "garrafa", "geladeira", "gravura", "guarda-chuva", "guardanapo", "hammock", "harpia", "hastes", "horta", "hotel", "iate", "impermeavel", "imã", "jaleito", "jaula", "jegue", "joias", "jornal", "kilt", "lacre", "lampada", "lapis", "lençol", "lixeira", "lousa", "macaco", "magnete", "manga", "manequim", "manopla", "mapa", "marcador", "mascara", "medalha", "microscopio", "mictorio", "moedor", "mola", "morango", "mochila", "munhequeira", "navalha", "niple", "novelo", "ombreira", "pandeiro", "parafuso", "pen drive", "pinça", "pirulito", "prancha", "puxador", "quadro-negro", "radiola", "regador", "rolamento", "serrote", "skate", "sobretudo", "sorvete", "tampa", "termometro", "torneira", "trampolim", "tribuna", "tricô", "trofeu", "turbina", "urna", "vagalume", "vareta", "veado", "ventilador", "vitrine", "xale", "zircão", "zurro", "abotoadura", "acordeon", "aerofolio", "agave", "alambique", "alfinete", "algema", "amuleto", "ancora", "anel", "aparador", "apoio", "aquecedor", "armario", "arroba", "autorama", "avental", "bacia", "bafometro", "baguete", "balaustre", "balde", "bandeja", "barril", "batedeira", "bico", "binoculo", "biruta", "bisturi", "bloco", "boia", "bolacha", "bombom", "bumerangue", "cabana", "cabideiro", "cachimbo", "caco", "cajado", "caldeirao", "camisa", "caneca", "canudo", "capa", "carrossel", "cartaz", "cinto", "cisterna", "clarinete", "carrinho", "coifa", "coroa", "cuba", "dossel", "draga", "escafandro", "espeto", "esquadro", "estandarte", "estojo", "fanzine", "ferrolho", "figa", "flanela", "formao", "frasco", "freio", "frescura", "funil", "gabarito", "gaita", "gangorra", "grampo", "guilhotina", "hidrante", "isqueiro", "jerico", "jiboia", "jornaleiro", "juba", "kilt", "lacre", "ladrao", "lampiao", "lata", "lixeira", "luva", "machado", "madeira", "maleta", "manometro", "marionete", "marreta", "mascara", "mastruz", "medalhao", "medidor", "mictorio", "moringa", "motoneta", "mural", "nafta", "narguile", "neve", "nylon", "obelisco", "oboe", "oito", "oleo", "orca", "ornamento", "palheta", "panfleto", "parachoque", "parafuso", "parafuso", "patins", "pendulo", "periscopio", "petroleo", "picareta", "pilão", "pilastra", "pinça", "pingente", "pipoqueira", "piramide", "plataforma", "pluma", "portao", "prego", "propulsor", "pulverizador", "quadrante", "quebra-cabeça", "quilha", "rabeca", "radar", "ralador", "rastelo", "regua", "relogio", "rotor", "safira", "salsicha", "sanduiche", "serafim", "sino", "sinuca", "solda", "solenoide", "sutura", "tabuleta", "talher", "telescopio", "telefone", "torre", "torpedo", "trava", "treliche", "trombone", "trofeu", "turbina", "urna", "vagonete", "vela", "vidro", "viola", "visor", "volta", "xilofone", "yoga", "zepelim", "zinco", "zircão"
];


// --- CONJUNTOS DE CARACTERES (MANTIDOS) ---
const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numberChars = "0123456789";
const symbolChars = "!@#$%^&*()_+[]{}|;:,.<>?/~`"; 
const accentedChars = "áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇ";
const ambiguousChars = "il1Lo0O"; 


// --- 2. REFERÊNCIAS AO DOM (ATUALIZADAS) ---
const lengthInput = document.getElementById('length');
const includeUppercase = document.getElementById('include-uppercase');
const includeLowercase = document.getElementById('include-lowercase');
const includeNumbers = document.getElementById('include-numbers');
const includeSymbols = document.getElementById('include-symbols');
const includeAccentedChars = document.getElementById('include-accented-chars');
const excludeAmbiguous = document.getElementById('exclude-ambiguous');
const passwordDisplay = document.getElementById('password-display');
const generateButton = document.getElementById('generate-button');
const copyButton = document.getElementById('copy-button');
const strengthBar = document.getElementById('strength-bar'); 
const strengthText = document.getElementById('strength-text');
const toastContainer = document.getElementById('toast-container');
const themeToggleBtn = document.getElementById('theme-toggle');

// NOVAS REFERÊNCIAS PARA O MODO PASSPHRASE
const modeChar = document.getElementById('mode-char');
const modePassphrase = document.getElementById('mode-passphrase');
const passphraseSettings = document.getElementById('passphrase-settings');
const charSettings = document.getElementById('char-settings');
const lengthSetting = document.getElementById('length-setting'); // Para mudar o label do comprimento
const numWordsInput = document.getElementById('num-words');
const separatorInput = document.getElementById('separator');


// --- 3. LÓGICA DE TEMA (DARK MODE) (Mantida) ---

(function initializeTheme() {
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme === "dark") {
      document.body.classList.add("dark-mode");
      themeToggleBtn.textContent = "☀️";
    } else {
      themeToggleBtn.textContent = "🌙";
    }

    themeToggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      
      let theme = "light";
      if (document.body.classList.contains("dark-mode")) {
        theme = "dark";
        themeToggleBtn.textContent = "☀️";
      } else {
        themeToggleBtn.textContent = "🌙";
      }
      localStorage.setItem("theme", theme);
    });
})();


// --- 4. FUNÇÕES DE ENTROPIA E FORÇA (MODIFICADAS) ---

/**
 * Calcula a entropia da senha com base no modo de geração.
 * @param {string} password A senha gerada.
 * @param {string} mode 'char' ou 'passphrase'.
 * @param {number} range O tamanho do conjunto de caracteres (para 'char') ou tamanho do dicionário (para 'passphrase').
 */
function calculateStrength(password, mode, range) {
    if (password.length === 0) return 0;

    if (mode === 'char') {
        // Entropia (bits) = L * log2(R)
        return password.length * Math.log2(range);
    } else if (mode === 'passphrase') {
        // Entropia (bits) = L_words * log2(W)
        // Onde W é o tamanho do dicionário (2048) e L_words é o número de palavras.
        const numWords = password.split(separatorInput.value).length;
        // O separador não adiciona entropia significativa, usamos o tamanho do dicionário como base.
        return numWords * Math.log2(range); 
    }
    return 0;
}

/**
 * Atualiza o indicador visual de força (barra e texto) para AMBOS os modos.
 */
function updateStrengthIndicator(password, mode, range) {
    const entropy = calculateStrength(password, mode, range);
    let strength = "";
    let width = 0;
    let className = "";

    // Mapeamento da força com base na entropia (em bits) - Universal
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
        // Limita a barra a 100%
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


// --- 5. LÓGICA DE GERAÇÃO (MODIFICADA PARA SUPORTAR DOIS MODOS) ---

function removeAmbiguous(charSet) {
    const regex = new RegExp(`[${ambiguousChars}]`, 'g');
    return charSet.replace(regex, '');
}

/**
 * Geração de Passphrase (Novo)
 */
function generatePassphrase() {
    // Pega o número de palavras do novo input
    const numWords = parseInt(numWordsInput.value); 
    const separator = separatorInput.value || '-';
    let passphrase = [];

    if (numWords < 3 || numWords > 10) {
        passwordDisplay.value = "Número de palavras inválido.";
        updateStrengthIndicator("", 'passphrase', 0);
        return;
    }

    for (let i = 0; i < numWords; i++) {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        passphrase.push(wordList[randomIndex]);
    }

    const finalPassphrase = passphrase.join(separator);
    passwordDisplay.value = finalPassphrase;
    // O range para passphrase é o tamanho do wordList
    updateStrengthIndicator(finalPassphrase, 'passphrase', wordList.length); 
}


/**
 * Geração de Senha por Caractere (Antigo, Refatorado)
 */
function generateCharacterPassword() {
    const length = parseInt(lengthInput.value);
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
        const chars = processCharSet(symbolChars);
        if(chars.length > 0) { allChars += chars; requiredChars.push(chars); }
    }
    if (includeAccentedChars.checked) {
        const chars = processCharSet(accentedChars);
        if(chars.length > 0) { allChars += chars; requiredChars.push(chars); }
    }
    
    if (allChars.length === 0) {
        passwordDisplay.value = "Opções insuficientes!";
        updateStrengthIndicator("", 'char', 0);
        return;
    }
    
    for (const charSet of requiredChars) {
        const randomIndex = Math.floor(Math.random() * charSet.length);
        password += charSet[randomIndex];
    }
    
    const remainingLength = length - requiredChars.length;
    for (let i = 0; i < remainingLength; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars[randomIndex];
    }

    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    passwordDisplay.value = password;
    updateStrengthIndicator(password, 'char', allChars.length);
}

/**
 * Função principal que decide qual gerador usar
 */
function generatePassword() {
    if (modePassphrase.checked) {
        generatePassphrase();
    } else {
        generateCharacterPassword();
    }
}


// --- 6. FUNÇÃO DE TOAST (Mantida) ---

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

// --- 7. LISTENERS DE EVENTOS (MODIFICADOS) ---

/**
 * Gerencia a alternância entre os modos de configuração.
 */
const handleModeChange = () => {
    const isPassphraseMode = modePassphrase.checked;
    
    // Alterna a exibição dos blocos
    passphraseSettings.style.display = isPassphraseMode ? 'block' : 'none';
    charSettings.style.display = isPassphraseMode ? 'none' : 'block';
    
    // Altera o label do comprimento (se estiver visível)
    const lengthLabel = lengthSetting.querySelector('label');
    lengthLabel.textContent = isPassphraseMode ? 'Comprimento da Senha:' : 'Número de Palavras:';
    
    // Esconde o input de comprimento se estiver em modo Passphrase (pois temos 'num-words')
    lengthInput.style.display = isPassphraseMode ? 'none' : 'block';

    // Garante que o input de palavras apareça e o de comprimento seja ajustado para 12
    if (!isPassphraseMode) {
        lengthInput.value = 12; // Reseta para um valor razoável no modo char
        lengthSetting.querySelector('label').textContent = 'Comprimento da Senha:';
    } else {
        lengthSetting.querySelector('label').textContent = 'Número de Palavras:';
        numWordsInput.value = 4; // Reseta para um valor razoável no modo passphrase
    }

    generatePassword(); 
};

// Listeners para os Rádio Buttons
modeChar.addEventListener('change', handleModeChange);
modePassphrase.addEventListener('change', handleModeChange);

// Listener para gerar (botão principal)
generateButton.addEventListener('click', generatePassword);

// Listener para gerar (mudança de settings)
const allSettings = document.querySelectorAll('.settings input');
allSettings.forEach(input => {
    // Dispara a geração ao mudar qualquer configuração
    input.addEventListener('change', generatePassword); 
});

// Listener do Botão Copiar (Mantido)
copyButton.addEventListener('click', () => {
    // Ajustado para incluir a mensagem de erro da passphrase
    if (passwordDisplay.value === "" || passwordDisplay.value.includes("Opções") || passwordDisplay.value.includes("Clique") || passwordDisplay.value.includes("inválido")) return;

    passwordDisplay.select();
    passwordDisplay.setSelectionRange(0, 99999); 

    try {
        navigator.clipboard.writeText(passwordDisplay.value);
        
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

document.addEventListener('DOMContentLoaded', () => {
    handleModeChange(); // Inicializa o display correto e a primeira geração
});