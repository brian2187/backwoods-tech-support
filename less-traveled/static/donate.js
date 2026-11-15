(function () {
  const panel = document.getElementById("donate");
  if (!panel) return;
  const status = document.getElementById("donate-status");
  const amts = document.getElementById("donate-amts");
  const custom = document.getElementById("donate-custom");
  const paypal = document.getElementById("donate-paypal");
  const card = document.getElementById("donate-card");
  const apple = document.getElementById("donate-apple");
  const google = document.getElementById("donate-google");
  const btcLink = document.getElementById("donate-btc");
  const dogeLink = document.getElementById("donate-doge");
  const btcAddr = document.getElementById("btc-addr");
  const dogeAddr = document.getElementById("doge-addr");
  const basePaypal = panel.getAttribute("data-paypal") || "";
  const baseCard = panel.getAttribute("data-card") || basePaypal;
  let amount = 25;

  function withAmount(url, n) {
    if (!url) return url;
    const clean = url.replace(/([?&])amount=\d+/g, "$1").replace(/[?&]$/, "");
    if (!n) return clean;
    return clean + (clean.indexOf("?") >= 0 ? "&" : "?") + "amount=" + n;
  }

  function setStatus(msg) {
    if (status) status.textContent = msg;
  }

  function applyAmount(n) {
    const v = Number(n);
    amount = v > 0 ? Math.round(v) : 0;
    if (amts) {
      amts.querySelectorAll("[data-amt]").forEach((b) => {
        b.classList.toggle("on", amount && Number(b.getAttribute("data-amt")) === amount);
      });
    }
    const wallet = withAmount(basePaypal, amount);
    const billing = withAmount(baseCard, amount);
    if (paypal) paypal.href = wallet;
    if (apple) apple.href = wallet;
    if (google) google.href = wallet;
    if (card) card.href = billing;
    if (btcLink && btcAddr) {
      btcLink.href = "bitcoin:" + btcAddr.textContent.trim();
    }
    if (dogeLink && dogeAddr) {
      dogeLink.href = "dogecoin:" + dogeAddr.textContent.trim();
    }
    const cash = document.getElementById("donate-cashapp");
    if (cash && amount) {
      const base = cash.getAttribute("href").split("?")[0].replace(/\/\d+$/, "");
      cash.href = base + "/" + amount;
    }
  }

  if (amts) {
    amts.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-amt]");
      if (!btn) return;
      if (custom) custom.value = "";
      applyAmount(btn.getAttribute("data-amt"));
    });
  }
  if (custom) {
    custom.addEventListener("input", () => {
      applyAmount(custom.value);
    });
  }

  panel.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    const el = document.getElementById(btn.getAttribute("data-copy"));
    const text = el ? el.textContent.trim() : "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied. Paste it in your wallet.");
    } catch {
      setStatus(text);
    }
  });

  applyAmount(amount);
})();
