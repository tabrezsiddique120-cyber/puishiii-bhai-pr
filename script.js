const offerText = document.querySelector("#offerText");
const charCount = document.querySelector("#charCount");
const analyzeBtn = document.querySelector("#analyzeBtn");
const sampleBtn = document.querySelector("#sampleBtn");
const clearBtn = document.querySelector("#clearBtn");
const formMessage = document.querySelector("#formMessage");
const resultSymbol = document.querySelector("#resultSymbol");
const resultTitle = document.querySelector("#resultTitle");
const resultSummary = document.querySelector("#resultSummary");
const riskScore = document.querySelector("#riskScore");
const riskMeter = document.querySelector("#riskMeter");
const meterFill = document.querySelector("#meterFill");
const flagCount = document.querySelector("#flagCount");
const flagsList = document.querySelector("#flagsList");
const highlightBox = document.querySelector("#highlightBox");
const themeToggle = document.querySelector("#themeToggle");

const sampleOffer = `We are looking for motivated students to join our remote internship program.
Earn $1500 per month with no experience required.

To secure your seat, pay a registration fee of $49 today.
Send your bank account details and date of birth for verification.
Limited seats! Apply now before it's too late!`;

const rules = [
  {
    id: "upfront-fees",
    title: "Upfront payment request",
    weight: 30,
    patterns: [
      /\bregistration fee\b/ig, /\bprocessing fee\b/ig, /\bpay (?:a |the )?(?:fee|deposit)\b/ig,
      /\bsecurity fee\b/ig, /\bpay to (?:secure|confirm|reserve)\b/ig, /\btraining fee\b/ig,
      /\bpayment to secure\b/ig, /\bpay us\b/ig
    ],
    explanation: "Requests to pay money to obtain or secure a job are a major warning sign. Verify directly with the company through independently found contact details."
  },
  {
    id: "urgency",
    title: "Pressure or artificial urgency",
    weight: 15,
    patterns: [
      /\blimited seats\b/ig, /\bapply now\b/ig, /\bact now\b/ig, /\bimmediately\b/ig,
      /\bonly today\b/ig, /\blast chance\b/ig, /\bbefore it'?s too late\b/ig, /\bwithin \d+ hours?\b/ig
    ],
    explanation: "Pressure to act quickly can stop you from checking details. Slow down and verify the offer before replying."
  },
  {
    id: "sensitive-data",
    title: "Sensitive personal or financial data",
    weight: 25,
    patterns: [
      /\bbank account details?\b/ig, /\bcard number\b/ig, /\bpasswords?\b/ig,
      /\bdate of birth\b/ig, /\bgovernment id\b/ig, /\baadhaar\b/ig, /\bpan card\b/ig,
      /\bsend your (?:id|documents|bank details|personal details)\b/ig, /\botp\b/ig
    ],
    explanation: "Be cautious about sharing sensitive information before verifying the employer and understanding why the information is needed."
  },
  {
    id: "unrealistic-pay",
    title: "Potentially unrealistic pay claims",
    weight: 15,
    patterns: [
      /\bearn \$?\d{3,}(?:,\d{3})*(?:\.\d{2})? per (?:day|hour)\b/ig,
      /\b\$?\d{4,}(?:,\d{3})*(?:\.\d{2})? per month\b/ig,
      /\bguaranteed (?:income|earnings|salary|profit)\b/ig,
      /\bno experience required\b/ig,
      /\bget rich quick\b/ig
    ],
    explanation: "Very high pay combined with vague duties or no experience requirements deserves extra scrutiny. Pay alone does not prove an offer is fraudulent."
  },
  {
    id: "vague-role",
    title: "Vague role or guaranteed outcome",
    weight: 10,
    patterns: [
      /\bguaranteed job\b/ig, /\b100% placement\b/ig, /\bno interview required\b/ig,
      /\bearn from home easily\b/ig, /\bno work required\b/ig
    ],
    explanation: "Vague responsibilities or guaranteed outcomes can be misleading. Ask for a written job description, supervisor details, and clear terms."
  }
];

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function findMatches(text, rule) {
  const matches = [];
  for (const pattern of rule.patterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      matches.push({ text: match[0], index: match.index, end: match.index + match[0].length });
      if (match[0].length === 0) pattern.lastIndex++;
    }
  }
  // Keep only unique matches for this rule.
  const unique = new Map();
  matches.forEach((match) => unique.set(`${match.index}:${match.end}`, match));
  return [...unique.values()].sort((a, b) => a.index - b.index);
}

function analyseOffer(text) {
  const findings = rules
    .map((rule) => ({ ...rule, matches: findMatches(text, rule) }))
    .filter((rule) => rule.matches.length > 0);

  // This is a heuristic indicator, not a statistical probability.
  const rawScore = findings.reduce((total, finding) => total + finding.weight, 0);
  const score = Math.min(rawScore, 95);
  const level = score >= 55 ? "High risk indicators" : score >= 25 ? "Some warning signs" : score > 0 ? "A few warning signs" : "No common flags detected";

  return { findings, score, level };
}

function renderHighlights(text, findings) {
  const allMatches = findings.flatMap((finding) =>
    finding.matches.map((match) => ({ ...match, ruleId: finding.id }))
  ).sort((a, b) => a.index - b.index || b.end - a.end);

  const selected = [];
  let lastEnd = -1;
  for (const match of allMatches) {
    if (match.index >= lastEnd) {
      selected.push(match);
      lastEnd = match.end;
    }
  }

  let output = "";
  let cursor = 0;
  for (const match of selected) {
    output += escapeHTML(text.slice(cursor, match.index));
    output += `<mark title="Potential warning sign">${escapeHTML(text.slice(match.index, match.end))}</mark>`;
    cursor = match.end;
  }
  output += escapeHTML(text.slice(cursor));
  return output;
}

function renderFindings(findings) {
  flagsList.replaceChildren();
  if (findings.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = "<span>✓</span><p>No phrases from our current warning-sign list were detected. This does not guarantee that the offer is safe—verify the company independently.</p>";
    flagsList.append(empty);
    return;
  }

  findings.forEach((finding) => {
    const card = document.createElement("article");
    card.className = "flag-card";

    const top = document.createElement("div");
    top.className = "flag-top";
    const title = document.createElement("span");
    title.className = "flag-name";
    title.textContent = finding.title;
    const weight = document.createElement("span");
    weight.className = "flag-weight";
    weight.textContent = `+${finding.weight} indicator points`;
    top.append(title, weight);

    const explanation = document.createElement("p");
    explanation.textContent = finding.explanation;

    const evidence = document.createElement("div");
    finding.matches.forEach((match) => {
      const chip = document.createElement("span");
      chip.className = "flag-evidence";
      chip.textContent = `“${match.text}”`;
      evidence.append(chip);
    });

    card.append(top, explanation, evidence);
    flagsList.append(card);
  });
}

function updateResultUI(text, result) {
  const { findings, score, level } = result;
  riskScore.textContent = `${score}/100`;
  riskMeter.setAttribute("aria-valuenow", String(score));
  meterFill.style.width = `${score}%`;
  flagCount.textContent = String(findings.length);
  resultTitle.textContent = level;
  resultSummary.textContent = findings.length
    ? `${findings.length} warning-sign category${findings.length === 1 ? "" : "ies"} detected. Review the evidence below before deciding what to do.`
    : "No listed patterns were detected. This is not proof that the offer is legitimate.";
  resultSymbol.textContent = score >= 55 ? "!" : score >= 25 ? "?" : score > 0 ? "!" : "✓";

  const color = score >= 55 ? "var(--red)" : score >= 25 ? "var(--amber)" : score > 0 ? "var(--amber)" : "var(--green)";
  meterFill.style.background = color;
  resultSymbol.style.color = color;
  resultSymbol.style.background = score >= 55 ? "var(--red-soft)" : score > 0 ? "var(--amber-soft)" : "var(--green-soft)";
  resultTitle.style.color = color;

  renderFindings(findings);
  highlightBox.innerHTML = renderHighlights(text, findings);
}

function runAnalysis() {
  const text = offerText.value.trim();
  if (!text) {
    formMessage.textContent = "Paste an offer first, or select “Try sample offer” to see how it works.";
    offerText.focus();
    return;
  }
  formMessage.textContent = "";
  updateResultUI(text, analyseOffer(text));
}

offerText.addEventListener("input", () => {
  charCount.textContent = `${offerText.value.length} / 5000`;
  formMessage.textContent = "";
});

analyzeBtn.addEventListener("click", runAnalysis);

sampleBtn.addEventListener("click", () => {
  offerText.value = sampleOffer;
  offerText.dispatchEvent(new Event("input"));
  runAnalysis();
});

clearBtn.addEventListener("click", () => {
  offerText.value = "";
  offerText.dispatchEvent(new Event("input"));
  formMessage.textContent = "";
  resultTitle.textContent = "Your results will appear here";
  resultTitle.style.color = "";
  resultSummary.textContent = "Paste an offer and select “Analyze offer” to check for warning signs.";
  resultSymbol.textContent = "?";
  resultSymbol.style.color = "";
  resultSymbol.style.background = "";
  riskScore.textContent = "—";
  riskMeter.setAttribute("aria-valuenow", "0");
  meterFill.style.width = "0";
  meterFill.style.background = "";
  flagCount.textContent = "0";
  flagsList.innerHTML = '<div class="empty-state"><span>✳</span><p>Your findings will show up here, with explanations and phrases to double-check.</p></div>';
  highlightBox.textContent = "Your analysed text will appear here. Highlighted phrases are potential warning signs, not proof of fraud.";
  offerText.focus();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  const dark = document.body.classList.contains("dark-theme");
  themeToggle.textContent = dark ? "☼" : "☾";
  themeToggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
});
