/* ==========================================================
   BARBEARIA ALPHA - JAVASCRIPT
   1. Configurações  2. Links do WhatsApp  3. Menu mobile
   4. Cabeçalho ao rolar  5. Ano do rodapé  6. Aberto/fechado agora  7. Botão flutuante
   ========================================================== */

/* 1. CONFIGURAÇÕES: edite aqui o número e a mensagem.
   Número no formato: código do país (55) + DDD + número, sem espaços, traços ou +. */
const WHATSAPP_NUMBER = "5541900000000"; // número FICTÍCIO (não existe). Para testar de verdade, use o SEU número
const TELEFONE_EXIBIDO = "(41) 90000-0000"; // texto que aparece no rodapé
const WHATSAPP_MESSAGE = "Olá! Gostaria de agendar um horário na Barbearia Alpha.";

/* 2. LINKS DO WHATSAPP
   Todo elemento com o atributo data-whatsapp recebe o link completo.
   encodeURIComponent transforma espaços e acentos em formato seguro para URL. */
// Se o link tiver data-servico (ex.: "Barba"), a mensagem já cita o serviço escolhido
function criarLinkWhatsapp(servico) {
  const mensagem = servico ? `Olá! Gostaria de agendar: ${servico}, na Barbearia Alpha.` : WHATSAPP_MESSAGE;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
}
document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.href = criarLinkWhatsapp(link.dataset.servico);
  link.target = "_blank";
  link.rel = "noopener noreferrer"; // segurança ao abrir nova aba
});

// Escreve o telefone no rodapé (assim você só edita o número neste arquivo)
document.querySelectorAll("[data-telefone]").forEach((el) => { el.textContent = TELEFONE_EXIBIDO; });

/* 3. MENU MOBILE: abre e fecha, e avisa leitores de tela via aria-expanded */
const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#menu");

function setMenu(open) {
  menu.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
}
toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false))); // fecha ao escolher
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu.classList.contains("open")) { setMenu(false); toggle.focus(); }
});
// Fecha ao tocar fora do menu e ao girar/redimensionar para tela grande
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
});
window.matchMedia("(min-width: 761px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

/* 4. CABEÇALHO: adiciona uma linha de borda depois que a página rola */
const header = document.querySelector(".site-header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 10);
}, { passive: true });

/* 5. ANO DO RODAPÉ: atualiza sozinho todo ano */
document.querySelector("#ano").textContent = new Date().getFullYear();

/* 6. ABERTO OU FECHADO AGORA
   Mesmos horários do HTML. Chave = dia da semana (0 = domingo); valor = [abre, fecha].
   Usa o fuso de São Paulo, para valer mesmo se o visitante estiver em outro lugar. */
const HORARIOS = { 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 20], 6: [9, 18] };

function atualizarStatus() {
  const els = document.querySelectorAll("[data-status]"); // hero e seção de horários
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo", weekday: "short", hour: "numeric", hour12: false,
  }).formatToParts(new Date());
  const dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dia = dias[partes.find((p) => p.type === "weekday").value];
  const hora = parseInt(partes.find((p) => p.type === "hour").value, 10) % 24; // "24" vira 0
  const h = HORARIOS[dia];
  const aberto = h && hora >= h[0] && hora < h[1];
  els.forEach((el) => {
    el.classList.toggle("open", aberto);
    el.classList.toggle("closed", !aberto);
    el.textContent = aberto
      ? `Aberto agora, fechamos às ${h[1]}h.`
      : "Fechado agora. Chame no WhatsApp e respondemos assim que abrirmos.";
  });
}
atualizarStatus();

/* 7. BOTÃO FLUTUANTE: aparece só quando não há outro botão de agendar na tela.
   IntersectionObserver avisa quando uma seção entra ou sai da área visível. */
const fab = document.querySelector(".fab");
const zonasComBotao = document.querySelectorAll(".hero, #localizacao, .site-footer");
const visiveis = new Set();
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => (e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target)));
    fab.classList.toggle("show", visiveis.size === 0);
  });
  zonasComBotao.forEach((z) => observer.observe(z));
} else {
  fab.classList.add("show"); // navegador antigo: mostra sempre
}