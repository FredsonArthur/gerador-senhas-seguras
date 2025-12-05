# 🔐 Gerador de Senhas Seguras

Este é um projeto simples e robusto desenvolvido em **HTML, CSS e JavaScript (Vanilla JS)** para criar senhas criptograficamente fortes. O gerador utiliza um cálculo de **entropia** (Shannon Entropy) para avaliar a força da senha em tempo real, garantindo que o usuário crie credenciais de alta segurança.

### ✨ Funcionalidades em Destaque

* **Entropia em Tempo Real:** Indica a força da senha em bits, baseada no comprimento e na variedade dos caracteres selecionados.
* **Geração Robusta:** Garante que pelo menos um caractere de cada tipo selecionado esteja presente na senha gerada e, em seguida, a embaralha.
* **Inclusão de Caracteres Especiais:** Suporta letras maiúsculas, minúsculas, números, símbolos e caracteres **acentuados** (ex: `áàãéè`), aumentando significativamente a complexidade.
* **Cópia Rápida:** Botão de cópia fácil com feedback visual.

---

## 🚀 Como Executar Localmente

Este projeto é totalmente frontend, portanto, não requer nenhum servidor complexo ou dependências de backend.

1.  **Clone o Repositório:**
    ```bash
    git clone [https://github.com/SEU-USUARIO/gerador-senhas-seguras.git](https://github.com/SEU-USUARIO/gerador-senhas-seguras.git)
    ```
2.  **Navegue até a Pasta:**
    ```bash
    cd gerador-senhas-seguras
    ```
3.  **Abra no Navegador:**
    Basta abrir o arquivo `index.html` em seu navegador favorito (Firefox, Chrome, Edge) ou usar a extensão **Live Server** no VS Code.

## 🛠️ Tecnologias Utilizadas

* **HTML5** (Estrutura)
* **CSS3** (Estilização)
* **JavaScript (Vanilla JS)** (Lógica de Geração e Cálculo de Entropia)

---

## ⚙️ Detalhes da Geração e Segurança

A força de uma senha é medida pela **Entropia** (em bits). Quanto maior o número de bits, mais tempo um atacante levaria para quebrá-la.

* **Fórmula:** A entropia é calculada como $E = L \times \log_2(R)$, onde $L$ é o comprimento e $R$ é o tamanho do conjunto de caracteres possíveis (Range).
* **Robustez Garantida:** Ao gerar a senha, o script primeiro seleciona *um* caractere de cada tipo ativado (ex: uma maiúscula, um número, um símbolo) e, em seguida, preenche o restante. Isso evita senhas fracas acidentais, garantindo a mistura dos tipos.
* **Critérios de Força (Entropia em Bits):**
    * **Fraca:** < 40 bits
    * **Média:** 40 a 59 bits
    * **Forte:** 60 a 79 bits
    * **Muito Forte:** 80+ bits

---

## 🤝 Como Contribuir

Contribuições, *issues* e pedidos de recursos são bem-vindos! Sinta-se à vontade para:

1.  Fazer um **Fork** do projeto.
2.  Criar uma **Branch** para sua feature (`git checkout -b feature/NovaFeature`).
3.  Fazer o **Commit** das suas alterações (`git commit -m 'feat: Adiciona NovaFeature'`).
4.  Fazer o **Push** para a branch (`git push origin feature/NovaFeature`).
5.  Abrir um **Pull Request**.

## 📝 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE.md](LICENSE.md) para mais detalhes.

---
Feito com ❤️ por **FREDSON ARTHUR**