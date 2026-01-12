const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwo71pHuK6fKtt-lh4YfZULtdDBgP_E2-fgkoo7vR509OmKP3n3wXgygfByVPP8NGAI/exec";
const TOTAL_NUMEROS = 300;
const DESTINO_LAT = -15.8029082;
const DESTINO_LNG = -47.9050624;

let numerosOcupados = [];
let userLocation = null;
let countdownTimer = null;

// Inicializar emojis flutuantes e contagem regressiva ao carregar a página
window.addEventListener("load", () => {
  criarEmojisflutuantes();
  iniciarContagemRegressiva();
  
  // Abrir cronômetro automaticamente após um pequeno delay
  setTimeout(() => {
    abrirCountdownAutomatico();
  }, 500);
});

// Iniciar imediatamente também (garantia dupla)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarContagemRegressiva);
} else {
  iniciarContagemRegressiva();
}

// ============ CONTAGEM REGRESSIVA ============
function iniciarContagemRegressiva() {
  // Data do evento: 08/02/2026 às 07:00
  const targetDate = new Date("2026-02-08T07:00:00-03:00").getTime();

  function atualizarContador() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance > 0) {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const daysEl = document.getElementById("days");
      const hoursEl = document.getElementById("hours");
      const minutesEl = document.getElementById("minutes");
      const secondsEl = document.getElementById("seconds");

      if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
      if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
      if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
    } else {
      // Evento já passou
      const daysEl = document.getElementById("days");
      const hoursEl = document.getElementById("hours");
      const minutesEl = document.getElementById("minutes");
      const secondsEl = document.getElementById("seconds");

      if (daysEl) daysEl.textContent = "00";
      if (hoursEl) hoursEl.textContent = "00";
      if (minutesEl) minutesEl.textContent = "00";
      if (secondsEl) secondsEl.textContent = "00";
    }
  }

  // Atualizar imediatamente
  atualizarContador();
  // Atualizar a cada segundo
  setInterval(atualizarContador, 1000);
}

function selectMode(mode) {
  document
    .querySelectorAll(".option-card")
    .forEach((c) => c.classList.remove("active"));
  event.currentTarget.classList.add("active");

  const hiddenArea = document.getElementById("hidden-area");
  hiddenArea.classList.remove("hidden");
  hiddenArea.scrollIntoView({ behavior: "smooth" });

  const playlistBox = document.getElementById("playlist-box");
  const numberArea = document.getElementById("number-selection-area");
  const formTitle = document.getElementById("form-title");
  const finalModeInput = document.getElementById("final-mode");
  const finalNumberInput = document.getElementById("final-number");

  if (mode === "correr") {
    finalModeInput.value = "correr";
    playlistBox.classList.remove("hidden");
    formTitle.innerText = "Escolha seu número!";

    numberArea.classList.remove("hidden");
    finalNumberInput.setAttribute("required", "true");
    carregarNumeros();
  } else {
    finalModeInput.value = "torcida";
    playlistBox.classList.add("hidden");
    formTitle.innerText = "A torcida é fundamental!";

    numberArea.classList.add("hidden");
    finalNumberInput.value = "";
    finalNumberInput.removeAttribute("required"); //
  }
}

function carregarNumeros() {
  const grid = document.getElementById("numbers-grid");
  const loading = document.getElementById("loading-numbers");

  grid.innerHTML = "";
  loading.style.display = "block";

  fetch(SHEET_URL)
    .then((response) => response.json())
    .then((data) => {
      numerosOcupados = data.numerosUsados || [];
      loading.style.display = "none";
      gerarGrid();
    })
    .catch((err) => {
      console.error(err);
      loading.innerHTML =
        "Erro ao carregar números. Tente recarregar a página.";
    });
}

function gerarGrid() {
  const grid = document.getElementById("numbers-grid");
  const inputHidden = document.getElementById("final-number");

  for (let i = 1; i <= TOTAL_NUMEROS; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "num-btn";
    btn.innerText = i;

    if (numerosOcupados.includes(i)) {
      btn.classList.add("taken");
      btn.disabled = true;
      btn.title = "Indisponível";
    } else {
      btn.onclick = function () {
        document
          .querySelectorAll(".num-btn")
          .forEach((b) => b.classList.remove("selected"));

        this.classList.add("selected");

        inputHidden.value = i;
      };
    }
    grid.appendChild(btn);
  }
}

document.getElementById("rsvp-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const btn = document.querySelector(".cta-button");
  const originalText = btn.innerHTML;
  const mode = document.getElementById("final-mode").value;
  const numero = document.getElementById("final-number").value;

  if (mode === "correr" && !numero) {
    alert("Por favor, escolha um número disponível no quadro!");
    return;
  }

  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Confirmando...';
  btn.disabled = true;

  const data = {
    nome: document.getElementById("nome").value,
    modalidade: mode,
    numero: numero,
  };

  fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(data),
  })
    .then(() => {
      // LANÇAR CONFETES! 🎉
      lancarConfetes();

      document.querySelector(".form-container").innerHTML = `
            <div style="text-align:center; padding:30px;">
                <i class="fa-solid fa-circle-check" style="font-size:4rem; color:var(--primary); animation: scaleIn 0.5s ease-out;"></i>
                <h2 style="color:#333; margin-top: 15px;">Confirmado! 🎉</h2>
                <p style="font-size: 1.1rem; color: var(--text-gray);">Nos vemos no parque!</p>
                ${
                  mode === "correr"
                    ? `<p style="font-weight:bold; font-size:1.4rem; color:var(--primary); margin-top: 15px; animation: pulse 1s infinite;">Seu número: ${numero}</p>`
                    : ""
                }
            </div>
        `;
    })
    .catch((err) => {
      alert("Erro ao enviar. Tente novamente.");
      btn.innerHTML = originalText;
      btn.disabled = false;
    });
});

function toggleMagicEye() {
  const container = document.querySelector(".main-container");
  const icon = document.querySelector("#magic-btn i");

  // Alterna a classe que esconde
  container.classList.toggle("invisible");

  // Troca o ícone para dar feedback visual
  if (container.classList.contains("invisible")) {
    // Se escondeu, mostra ícone de "olho cortado" (para voltar)
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    // Se mostrou, volta o ícone normal
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

function toggleCountdown() {
  const countdown = document.querySelector(".countdown-section");
  const btn = document.getElementById("countdown-btn");

  countdown.classList.toggle("show");
  btn.classList.toggle("active");
  
  // Limpar o timer se a pessoa fechar manualmente
  if (!countdown.classList.contains("show") && countdownTimer) {
    clearTimeout(countdownTimer);
    countdownTimer = null;
  }
}

function abrirCountdownAutomatico() {
  const countdown = document.querySelector(".countdown-section");
  const btn = document.getElementById("countdown-btn");
  
  // Abrir o cronômetro
  countdown.classList.add("show");
  btn.classList.add("active");
  
  // Fechar automaticamente após 5 segundos
  countdownTimer = setTimeout(() => {
    countdown.classList.remove("show");
    btn.classList.remove("active");
    countdownTimer = null;
  }, 5000);
}

function tocarNoSite() {
  const container = document.getElementById("spotify-player-container");
  const actions = document.getElementById("playlist-actions");

  const PLAYLIST_ID = "6iHvN43pGY2sWin3lxi3FZ";

  // Monta o player do Spotify
  container.innerHTML = `
        <iframe style="border-radius:12px" 
            src="https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0" 
            width="100%" 
            height="152" 
            frameBorder="0" 
            allowfullscreen="" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy">
        </iframe>
    `;

  container.classList.remove("hidden");
  actions.style.display = "none";
}

// ============ FUNÇÕES DE INTERATIVIDADE JOVIAL ============

// Criar emojis flutuantes de fundo
function criarEmojisflutuantes() {
  const container = document.getElementById("floating-emojis");
  const emojis = ["🎈", "🎉", "🎊", "💚", "🏃", "✨", "🎵"];

  for (let i = 0; i < 8; i++) {
    const emoji = document.createElement("div");
    emoji.className = "emoji";
    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    emoji.style.left = Math.random() * 100 + "%";
    emoji.style.top = Math.random() * 100 + "%";
    emoji.style.animationDelay = Math.random() * 4 + "s";
    emoji.style.animationDuration = 3 + Math.random() * 2 + "s";
    container.appendChild(emoji);
  }
}

// Efeito de confetes ao confirmar presença
function lancarConfetes() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confetti = [];
  const colors = ["#00bfa5", "#e0f2f1", "#4dd0e1", "#26a69a", "#80cbc4"];

  // Criar 150 confetes
  for (let i = 0; i < 150; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 8 + 5,
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 10 - 5,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confetti.forEach((piece, index) => {
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate((piece.rotation * Math.PI) / 180);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
      ctx.restore();

      piece.y += piece.speedY;
      piece.x += piece.speedX;
      piece.rotation += piece.rotationSpeed;

      // Remover confetes que saíram da tela
      if (piece.y > canvas.height) {
        confetti.splice(index, 1);
      }
    });

    if (confetti.length > 0) {
      requestAnimationFrame(animate);
    } else {
      // Limpar canvas quando terminar
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}

// ============ FUNÇÕES DE GEOLOCALIZAÇÃO ============

// Obter localização do usuário
function obterLocalizacao() {
  if (!navigator.geolocation) {
    alert("Seu navegador não suporta geolocalização 😢");
    return;
  }

  const btn = document.querySelector(".btn-location");
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Localizando...';
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      atualizarLinksComLocalizacao();

      btn.innerHTML = '<i class="fa-solid fa-check"></i> Localização Obtida!';
      btn.style.background =
        "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)";

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        btn.style.background = "";
      }, 2000);
    },
    (error) => {
      console.error("Erro ao obter localização:", error);
      alert(
        "Não foi possível obter sua localização. Verifique as permissões do navegador."
      );
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }
  );
}

// Atualizar links de navegação com a localização do usuário
function atualizarLinksComLocalizacao() {
  if (!userLocation) return;

  const origem = `${userLocation.lat},${userLocation.lng}`;
  const destino = `${DESTINO_LAT},${DESTINO_LNG}`;

  // Google Maps
  document.getElementById(
    "google-maps-link"
  ).href = `https://www.google.com/maps/dir/?api=1&origin=${origem}&destination=${destino}&travelmode=driving`;

  // Waze
  document.getElementById(
    "waze-link"
  ).href = `https://waze.com/ul?ll=${DESTINO_LAT},${DESTINO_LNG}&navigate=yes&from=${origem}`;

  // Uber (já pega localização automaticamente)
  // Não precisa alterar
}
