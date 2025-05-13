 const player = document.getElementById("player");
    const game = document.getElementById("game");
    const platforms = document.querySelectorAll(".platform");

    let posX = 50;
    let posY = 100;
    let velX = 0;
    let velY = 0;
    let gravidade = 0.6;
    let pulando = false;
    let noChao = false;
    const velocidade = 4;
    const puloForca = 12;

    const teclas = {
      esquerda: false,
      direita: false,
      cima: false
    };

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") teclas.esquerda = true;
      if (e.key === "ArrowRight") teclas.direita = true;
      if (e.key === " " || e.key === "ArrowUp") teclas.cima = true;
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft") teclas.esquerda = false;
      if (e.key === "ArrowRight") teclas.direita = false;
      if (e.key === " " || e.key === "ArrowUp") teclas.cima = false;
    });

    function loop() {
      // Movimento lateral
      if (teclas.esquerda) velX = -velocidade;
      else if (teclas.direita) velX = velocidade;
      else velX = 0;

      // Pulo
      if (teclas.cima && noChao && !pulando) {
        velY = -puloForca;
        pulando = true;
        noChao = false;
      }

      velY += gravidade;

      posX += velX;
      posY += velY;

      // Limites da tela
      if (posX < 0) posX = 0;
      if (posX > game.clientWidth - 40) posX = game.clientWidth - 40;

      // Colisão com plataformas
      noChao = false;
      platforms.forEach(plataforma => {
        const plat = plataforma.getBoundingClientRect();
        const jog = player.getBoundingClientRect();
        const platTop = plataforma.offsetTop;
        const platLeft = plataforma.offsetLeft;
        const platRight = platLeft + plataforma.offsetWidth;
        const platBottom = platTop + plataforma.offsetHeight;

        const playerBottom = posY + 40;
        const playerRight = posX + 40;

        if (
          playerBottom >= platTop &&
          playerBottom <= platTop + 10 &&
          posX + 40 > platLeft &&
          posX < platRight &&
          velY >= 0
        ) {
          posY = platTop - 40;
          velY = 0;
          noChao = true;
          pulando = false;
        }
      });

      if (posY > game.clientHeight - 40) {
        posY = game.clientHeight - 40;
        velY = 0;
        noChao = true;
        pulando = false;
      }

      player.style.left = posX + "px";
      player.style.top = posY + "px";

      requestAnimationFrame(loop);
    }

    loop();

    const tabuleiro = document.getElementById("tabuleiro");
    const statusTexto = document.getElementById("status");
    let jogadorAtual = "X";
    let jogoAtivo = true;
    let matriz = Array(3).fill(null).map(() => Array(3).fill(""));

    function criarTabuleiro() {
      tabuleiro.innerHTML = "";
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const celula = document.createElement("div");
          celula.classList.add("celula");
          celula.dataset.linha = i;
          celula.dataset.coluna = j;
          celula.addEventListener("click", jogar);
          celula.textContent = matriz[i][j];
          tabuleiro.appendChild(celula);
        }
      }
    }

    function jogar(e) {
      if (!jogoAtivo) return;

      const i = e.target.dataset.linha;
      const j = e.target.dataset.coluna;

      if (matriz[i][j] !== "") return;

      matriz[i][j] = jogadorAtual;
      e.target.textContent = jogadorAtual;

      const celulas = document.querySelectorAll(".celula");

      if (verificarVitoria(i, j)) {
        statusTexto.textContent = `Jogador ${jogadorAtual} venceu!`;
        jogoAtivo = false;
        marcarVencedor(i, j);
        return;
      }

      if (verificarEmpate()) {
        statusTexto.textContent = "Empate!";
        jogoAtivo = false;
        return;
      }

      jogadorAtual = jogadorAtual === "X" ? "O" : "X";
      statusTexto.textContent = `Jogador atual: ${jogadorAtual}`;
    }

    function verificarVitoria(i, j) {
      i = parseInt(i);
      j = parseInt(j);
      const valor = matriz[i][j];

      // Linha, Coluna, Diagonais
      return (
        matriz[i].every(c => c === valor) ||
        matriz.every(linha => linha[j] === valor) ||
        (i === j && matriz.every((linha, idx) => linha[idx] === valor)) ||
        (i + j === 2 && matriz.every((linha, idx) => linha[2 - idx] === valor))
      );
    }

    function verificarEmpate() {
      return matriz.flat().every(c => c !== "");
    }

    function marcarVencedor(i, j) {
      const celulas = document.querySelectorAll(".celula");
      i = parseInt(i);
      j = parseInt(j);
      const valor = matriz[i][j];

      // Marcar linha
      if (matriz[i].every(c => c === valor)) {
        for (let col = 0; col < 3; col++) {
          celulas[i * 3 + col].classList.add("vencedor");
        }
        return;
      }

      // Marcar coluna
      if (matriz.every(linha => linha[j] === valor)) {
        for (let row = 0; row < 3; row++) {
          celulas[row * 3 + parseInt(j)].classList.add("vencedor");
        }
        return;
      }

      // Diagonal principal
      if (i === j && matriz.every((linha, idx) => linha[idx] === valor)) {
        for (let idx = 0; idx < 3; idx++) {
          celulas[idx * 3 + idx].classList.add("vencedor");
        }
        return;
      }

      // Diagonal secundária
      if (i + j === 2 && matriz.every((linha, idx) => linha[2 - idx] === valor)) {
        for (let idx = 0; idx < 3; idx++) {
          celulas[idx * 3 + (2 - idx)].classList.add("vencedor");
        }
      }
    }

    function reiniciar() {
      matriz = Array(3).fill(null).map(() => Array(3).fill(""));
      jogadorAtual = "X";
      jogoAtivo = true;
      statusTexto.textContent = "Jogador atual: X";
      criarTabuleiro();
    }

    criarTabuleiro();