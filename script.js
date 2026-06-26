(() => {
  const DICTIONARY_PATH = "./br-utf8.txt";
  const LOCALE = "pt-BR";
  const MIN_BATCH_MS = 8;
  const MAX_REPETITIONS = 32768;
  const DEFAULT_PHRASE = `N\u00e3o atire o pau no gato
Porque isso
N\u00e3o se faz
O gatinho
\u00c9 nosso amigo
N\u00e3o devemos maltratar os animais
Jamais`;

  const collator = new Intl.Collator(LOCALE);
  const numberFormatter = new Intl.NumberFormat(LOCALE);
  let dictionaryPromise = null;

  function normalizeWord(word) {
    return word.trim().normalize("NFC").toLocaleLowerCase(LOCALE);
  }

  function tokenizePhrase(text) {
    return (text.normalize("NFC").match(/\p{L}+/gu) || []).map(normalizeWord);
  }

  function parseDictionary(text) {
    return text
      .split(/\r?\n/)
      .map(normalizeWord)
      .filter(Boolean);
  }

  function linearSearch(words, target) {
    for (let index = 0; index < words.length; index += 1) {
      if (words[index] === target) {
        return index;
      }
    }

    return -1;
  }

  function binarySearch(words, target) {
    let left = 0;
    let right = words.length - 1;

    while (left <= right) {
      const middle = left + Math.floor((right - left) / 2);
      const comparison = collator.compare(words[middle], target);

      if (comparison === 0) {
        return middle;
      }

      if (comparison < 0) {
        left = middle + 1;
      } else {
        right = middle - 1;
      }
    }

    return -1;
  }

  // Repeat the same search in batches so sub-millisecond operations remain measurable.
  function measureSearch(searchFn, words, target) {
    let repetitions = 1;
    let elapsedMs = 0;
    let result = -1;

    searchFn(words, target);

    while (repetitions <= MAX_REPETITIONS) {
      const startedAt = performance.now();

      for (let attempt = 0; attempt < repetitions; attempt += 1) {
        result = searchFn(words, target);
      }

      elapsedMs = performance.now() - startedAt;

      if (elapsedMs >= MIN_BATCH_MS || repetitions === MAX_REPETITIONS) {
        break;
      }

      repetitions *= 2;
    }

    return {
      found: result !== -1,
      averageMs: elapsedMs / repetitions,
    };
  }

  // Linear search uses the loaded list; binary search uses an ordered copy of it.
  async function loadDictionary() {
    if (!dictionaryPromise) {
      dictionaryPromise = (async () => {
        const response = await fetch(DICTIONARY_PATH);

        if (!response.ok) {
          throw new Error("Nao foi possivel carregar o arquivo br-utf8.txt.");
        }

        const text = await response.text();
        const linearWords = parseDictionary(text);
        const binaryWords = [...linearWords].sort(collator.compare);

        return {
          linearWords,
          binaryWords,
        };
      })().catch((error) => {
        dictionaryPromise = null;
        throw error;
      });
    }

    return dictionaryPromise;
  }

  function formatMs(value) {
    if (!Number.isFinite(value)) {
      return "-";
    }

    const decimals = value >= 1 ? 4 : 6;
    return `${value.toFixed(decimals)} ms`;
  }

  function formatCount(value) {
    return numberFormatter.format(value);
  }

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function buildComparisonText(linearTotal, binaryTotal) {
    if (!Number.isFinite(linearTotal) || !Number.isFinite(binaryTotal)) {
      return "Nao foi possivel montar o comparativo.";
    }

    if (linearTotal === binaryTotal) {
      return "Os dois algoritmos tiveram o mesmo tempo total para a frase.";
    }

    if (binaryTotal === 0) {
      return "A busca binaria ficou abaixo da precisao exibida nesta medicao.";
    }

    const ratio = linearTotal / binaryTotal;

    if (ratio >= 1) {
      return `Na frase analisada, a busca binaria foi cerca de ${ratio.toFixed(2)}x mais rapida do que a busca linear.`;
    }

    return `Na frase analisada, a busca linear foi cerca de ${(1 / ratio).toFixed(2)}x mais rapida do que a busca binaria.`;
  }

  function renderResults(rows) {
    const tbody = document.getElementById("resultBody");

    if (rows.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="empty">Nenhuma palavra valida foi informada.</td></tr>';
      return;
    }

    tbody.innerHTML = rows
      .map((row) => {
        const badgeClass = row.found ? "ok" : "fail";
        const badgeLabel = row.found ? "Sim" : "Nao";

        return `
          <tr>
            <td>${escapeHtml(row.word)}</td>
            <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
            <td>${formatMs(row.linearMs)}</td>
            <td>${formatMs(row.binaryMs)}</td>
          </tr>
        `;
      })
      .join("");
  }

  function updateSummary(dictionarySize, rows) {
    const linearTotal = rows.reduce((sum, row) => sum + row.linearMs, 0);
    const binaryTotal = rows.reduce((sum, row) => sum + row.binaryMs, 0);
    const wordCount = rows.length;

    document.getElementById("dictionaryCount").textContent = formatCount(dictionarySize);
    document.getElementById("phraseCount").textContent = formatCount(wordCount);
    document.getElementById("linearTotal").textContent = formatMs(linearTotal);
    document.getElementById("binaryTotal").textContent = formatMs(binaryTotal);
    document.getElementById("linearAverage").textContent = formatMs(linearTotal / wordCount);
    document.getElementById("binaryAverage").textContent = formatMs(binaryTotal / wordCount);
    document.getElementById("comparisonText").textContent = buildComparisonText(
      linearTotal,
      binaryTotal
    );
  }

  function setStatus(message) {
    document.getElementById("status").textContent = message;
  }

  function setBusy(isBusy) {
    document.getElementById("runButton").disabled = isBusy;
  }

  async function runAnalysis() {
    const phraseField = document.getElementById("phrase");
    const words = tokenizePhrase(phraseField.value);

    if (words.length === 0) {
      renderResults([]);
      setStatus("Informe uma frase com pelo menos uma palavra.");
      return;
    }

    setBusy(true);
    setStatus("Carregando dicionario...");

    try {
      const dictionary = await loadDictionary();
      const rows = words.map((word) => {
        const linear = measureSearch(linearSearch, dictionary.linearWords, word);
        const binary = measureSearch(binarySearch, dictionary.binaryWords, word);

        return {
          word,
          found: linear.found && binary.found,
          linearMs: linear.averageMs,
          binaryMs: binary.averageMs,
        };
      });

      renderResults(rows);
      updateSummary(dictionary.linearWords.length, rows);
      setStatus("Analise concluida.");
    } catch (error) {
      renderResults([]);
      setStatus(error.message);
      document.getElementById("comparisonText").textContent =
        "Falha ao carregar o dicionario.";
    } finally {
      setBusy(false);
    }
  }

  // Preload the exact phrase from the activity and run the comparison on page load.
  function initialize() {
    const phraseField = document.getElementById("phrase");
    phraseField.value = DEFAULT_PHRASE;
    document.getElementById("runButton").addEventListener("click", runAnalysis);
    void runAnalysis();
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      binarySearch,
      linearSearch,
      measureSearch,
      parseDictionary,
      tokenizePhrase,
    };
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
      initialize();
    }
  }
})();
