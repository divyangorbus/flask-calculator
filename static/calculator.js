const display = document.getElementById("display");
const hint = document.getElementById("hint");

let current = "0";
let stored = null;
let operator = null;
let fresh = true;

function show(value) {
  display.textContent = value;
}

function setHint(message, isError = false) {
  hint.textContent = message;
  hint.classList.toggle("error", isError);
}

function inputDigit(digit) {
  if (fresh) {
    current = digit === "." ? "0." : digit;
    fresh = false;
  } else if (digit === "." && current.includes(".")) {
    return;
  } else if (current === "0" && digit !== ".") {
    current = digit;
  } else {
    current += digit;
  }
  show(current);
}

function setOperator(nextOp) {
  if (operator && !fresh) {
    runEquals().then(() => {
      stored = current;
      operator = nextOp;
      fresh = true;
      highlightOp(nextOp);
    });
    return;
  }
  stored = current;
  operator = nextOp;
  fresh = true;
  highlightOp(nextOp);
}

function highlightOp(op) {
  document.querySelectorAll(".op").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.op === op);
  });
}

async function runEquals() {
  if (!operator || stored === null) {
    return;
  }

  const payload = { left: stored, right: current, op: operator };
  try {
    const res = await fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.ok) {
      setHint(data.error, true);
      return;
    }
    const labels = { "+": "+", "-": "−", "*": "×", "/": "÷" };
    const expr = `${payload.left} ${labels[payload.op] || payload.op} ${payload.right}`;
    current = data.display;
    stored = null;
    operator = null;
    fresh = true;
    highlightOp(null);
    show(current);
    setHint(`${expr} = ${data.display}`);
  } catch {
    setHint("Could not reach the Flask server.", true);
  }
}

function clearAll() {
  current = "0";
  stored = null;
  operator = null;
  fresh = true;
  highlightOp(null);
  show(current);
  setHint("Results are calculated on the server.");
}

function toggleSign() {
  if (current === "0") {
    return;
  }
  current = current.startsWith("-") ? current.slice(1) : `-${current}`;
  show(current);
}

function percent() {
  current = String(Number(current) / 100);
  show(current);
}

document.querySelector(".keys").addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn) {
    return;
  }
  if (btn.dataset.digit !== undefined) {
    inputDigit(btn.dataset.digit);
  } else if (btn.dataset.op) {
    setOperator(btn.dataset.op);
  } else if (btn.dataset.action === "equals") {
    runEquals();
  } else if (btn.dataset.action === "clear") {
    clearAll();
  } else if (btn.dataset.action === "sign") {
    toggleSign();
  } else if (btn.dataset.action === "percent") {
    percent();
  }
});

document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (/^[0-9.]$/.test(key)) {
    inputDigit(key);
  } else if (["+", "-", "*", "/"].includes(key)) {
    setOperator(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    runEquals();
  } else if (key === "Escape") {
    clearAll();
  } else if (key === "Backspace" && !fresh) {
    current = current.length > 1 ? current.slice(0, -1) : "0";
    if (current === "-") {
      current = "0";
    }
    show(current);
  }
});

(function applyUrlCalculation() {
  const params = new URLSearchParams(window.location.search);
  const left = params.get("left");
  const right = params.get("right");
  const op = params.get("op");
  if (left === null || right === null || !op) {
    return;
  }
  stored = left;
  current = right;
  operator = op;
  show(right);
  highlightOp(op);
  runEquals();
})();

(function themeToggle() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) {
    return;
  }

  function isDark() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function render() {
    const dark = isDark();
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.textContent = dark ? "Light theme" : "Dark theme";
  }

  toggle.addEventListener("click", () => {
    if (isDark()) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("calculator-theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("calculator-theme", "dark");
    }
    render();
  });

  render();
})();
