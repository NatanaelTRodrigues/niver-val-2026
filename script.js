const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwo71pHuK6fKtt-lh4YfZULtdDBgP_E2-fgkoo7vR509OmKP3n3wXgygfByVPP8NGAI/exec";
const TOTAL_NUMEROS = 300;

let numerosOcupados = [];

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
      document.querySelector(".form-container").innerHTML = `
            <div style="text-align:center; padding:30px;">
                <i class="fa-solid fa-circle-check" style="font-size:4rem; color:var(--primary);"></i>
                <h2 style="color:#333;">Confirmado!</h2>
                <p>Nos vemos no parque!</p>
                ${
                  mode === "correr"
                    ? `<p style="font-weight:bold; font-size:1.2rem; color:var(--primary);">Seu número: ${numero}</p>`
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

}