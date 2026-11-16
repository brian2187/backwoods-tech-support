(function () {
  const panel = document.getElementById("donate");
  if (!panel) return;
  const status = document.getElementById("donate-status");
  const amts = document.getElementById("donate-amts");
  const custom = document.getElementById("donate-custom");
  const paypal = document.getElementById("donate-paypal");
  const go = document.getElementById("donate-stripe-go");
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
    const preset = amount && panel.getAttribute("data-stripe-" + amount);
    if (go) {
      if (pay) go.setAttribute("href", pay);
      go.textContent = amount ? "Donate $" + amount + " with Stripe" : "Donate with Stripe";
    }
    if (amount && pay && !preset) {
      setStatus(
        "Stripe checkout is $1 each. Set quantity to " +
          amount +
          " on Stripe, or use PayPal for $" +
          amount +
          "."
      );
    } else if (amount && pay) {
      setStatus("Donate with Stripe opens checkout for $" + amount + ".");
    } else if (amount) {
      setStatus("Stripe checkout is not set for this amount. Use PayPal for $" + amount + ".");
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
      const v = String(custom.value || "").trim();
      if (!v) {
        applyAmount(20);
        return;
      }
      applyAmount(v);
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

  if (go) {
    go.addEventListener("click", (e) => {
      const url = stripeUrl();
      if (!url) {
        e.preventDefault();
        setStatus("Stripe checkout could not be prepared. Try again, or write us.");
        return;
      }
      go.href = url;
    });
  }

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
