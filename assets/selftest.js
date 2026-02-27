(async function () {
  const results = [];
  const assert = (name, pass, detail = '') => {
    results.push({ name, pass, detail });
    console[pass ? 'log' : 'error'](`${pass ? 'PASS' : 'FAIL'}: ${name}${detail ? ` | ${detail}` : ''}`);
  };

  const keys = ['velora_theme', 'velora_demo_mode'];
  keys.forEach((k) => assert(`localStorage key exists: ${k}`, !!localStorage.getItem(k)));

  try {
    const base = (window.VeloraApp && VeloraApp.getRootPrefix) ? VeloraApp.getRootPrefix() : './';
    const howtos = await fetch(`${base}velora/artifacts/howtos.json`).then((r) => r.json());
    assert('howtos.json is array', Array.isArray(howtos), `type=${typeof howtos}`);

    const chunks = await fetch(`${base}velora/artifacts/rag_chunks.json`).then((r) => r.json());
    const found = chunks.filter((c) => JSON.stringify(c).toLowerCase().includes('segment'));
    assert('rag search returns results for segment', found.length > 0, `matches=${found.length}`);
  } catch (e) {
    assert('artifact fetch', false, e.message);
  }

  const passCount = results.filter((r) => r.pass).length;
  console.log(`Self-test complete: ${passCount}/${results.length} checks passed.`);
  return results;
})();
