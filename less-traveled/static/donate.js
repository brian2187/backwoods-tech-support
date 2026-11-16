(function () {
  const panel = document.getElementById("donate");
  if (!panel) return;
  const status = document.getElementById("donate-status");
  const amts = document.getElementById("donate-amts");
  const custom = document.getElementById("donate-custom");
  const paypal = document.getElementById("donate-paypal");
  let amount = 20;

  function desk() {
    try {
      return atob("bW9vcmVibW9vcmVAaG90bWFpbC5jb20=");
    } catch {
      return "";
    }
  }

  function paypalUrl(n) {
    const biz = desk();
    if (!biz) return "";
    const q = new URLSearchParams({
      business: biz,
      currency_code: "USD",
      item_name: "Less Traveled donation",
      no_recurring: "0",
    });
    if (n) q.set("amount", String(n));
    return "https://www.paypal.com/donate/?" + q.toString();
  }

  function setStatus(msg) {
    if (status) status.textContent = msg;
  }

  function stripeUrl() {
    if (amount) {
      const preset = panel.getAttribute("data-stripe-" + amount);
      if (preset) return preset;
    }
    return panel.getAttribute("data-stripe-custom") || "";
  }

  function applyAmount(n) {
    const v = Number(n);
    amount = v > 0 ? Math.round(v) : 0;
    if (amts) {
      amts.querySelectorAll("[data-amt]").forEach((b) => {
        b.classList.toggle("on", amount && Number(b.getAttribute("data-amt")) === amount);
      });
    }
    if (paypal) {
      const url = paypalUrl(amount);
      paypal.href = url || "https://www.paypal.com/donate";
    }
    const pay = stripeUrl();
    panel.querySelectorAll("[data-stripe-go]").forEach((a) => {
      if (pay) a.setAttribute("href", pay);
    });
    const preset = amount && panel.getAttribute("data-stripe-" + amount);
    if (status) {
      if (amount && !preset) {
        status.textContent =
          "Stripe checkout is $1 each. Set Qty to " +
          amount +
          " on Stripe. PayPal uses $" +
          amount +
          ".";
      } else if (amount) {
        status.textContent = "Tap a method to open Stripe checkout for $" + amount + ".";
      }
    }
    const cash = document.getElementById("donate-cashapp");
    if (cash && amount) {
      const base = cash.getAttribute("href").split("?")[0].replace(/\/\d+$/, "");
      cash.href = base + "/" + amount;
    }
  }

  async function copyText(text) {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
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

  if (paypal) {
    paypal.addEventListener("click", (e) => {
      const url = paypalUrl(amount);
      if (!url) {
        e.preventDefault();
        setStatus("PayPal checkout could not be prepared. Try again, or write us.");
        return;
      }
      paypal.href = url;
    });
  }

  panel.addEventListener("click", (e) => {
    const a = e.target.closest("[data-stripe-go]");
    if (!a) return;
    const url = stripeUrl();
    if (!url) {
      e.preventDefault();
      setStatus("Stripe checkout could not be prepared. Try again, or write us.");
      return;
    }
    a.href = url;
  });

  panel.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    e.preventDefault();
    const el = document.getElementById(btn.getAttribute("data-copy"));
    const text = el ? el.textContent.trim() : "";
    const ok = await copyText(text);
    const coin = btn.getAttribute("data-copy") === "doge-addr" ? "Dogecoin" : "Bitcoin";
    setStatus(
      ok
        ? "Copied the " + coin + " address. In Coinbase tap Send, paste it, and confirm."
        : text
    );
  });

  applyAmount(amount);
})();
