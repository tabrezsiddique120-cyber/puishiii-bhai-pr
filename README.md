# OfferTrap

OfferTrap is a browser-based prototype that helps students identify common warning signs in internship and job offers.

## Run it
1. Download or extract the project folder.
2. Open `index.html` in a browser, or use VS Code with Live Server.
3. Paste offer text and select **Analyze offer**. Use **Try sample offer** to test quickly.

## Tech
- HTML
- CSS
- Vanilla JavaScript
- No backend, framework, external library, or API required

## Current MVP
- Keyword/pattern-based warning-sign detection
- Risk indicator with a clear disclaimer
- Evidence phrases highlighted in the pasted text
- Verification checklist
- Sample offer, clear button, responsive layout, light/dark theme

## Important limitations
This is a learning prototype, not a fraud-verification service. It cannot verify company identities or determine whether an offer is genuine. The score is a heuristic indicator, not a statistical probability. Keyword rules may miss scams or flag legitimate wording. Verify companies independently and do not share money or sensitive information based only on this tool's output.

## Ideas for a future version
- Add editable test cases and improve the rule set
- Include a trusted verification resource guide
- Add optional local history only with clear user consent
- If a real company-verification API is added later, keep API secrets on a backend rather than in client-side JavaScript
