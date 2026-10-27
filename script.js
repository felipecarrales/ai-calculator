/* Calculadora Científica Moderna - script.js */
(function () {
    'use strict';

    const exprEl = document.getElementById('expr');
    const resultEl = document.getElementById('result');
    const historyList = document.getElementById('historyList');
    const historyEmpty = document.getElementById('historyEmpty');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const degBtn = document.getElementById('degBtn');
    const radBtn = document.getElementById('radBtn');

    let expression = '';
    let degreeMode = true;
    let justEvaluated = false;
    const HISTORY_KEY = 'calc_history_v1';
    const MAX_HISTORY = 30;

    function isOperator(ch) {
        return ['+', '-', '*', '/', '%', '^'].indexOf(ch) !== -1;
    }

    function degToRad(x) {
        return degreeMode ? (x * Math.PI) / 180 : x;
    }

    const ctx = {
        sin: (x) => Math.sin(degToRad(x)),
        cos: (x) => Math.cos(degToRad(x)),
        tan: (x) => Math.tan(degToRad(x)),
        sqrt: (x) => Math.sqrt(x),
        log: (x) => Math.log10(x),
        ln: (x) => Math.log(x),
        abs: (x) => Math.abs(x),
        factorial: (n) => {
            n = Math.floor(n);
            if (n < 0) return NaN;
            if (n > 170) return Infinity;
            let r = 1;
            for (let i = 2; i <= n; i++) r *= i;
            return r;
        },
        pi: Math.PI,
        e: Math.E,
    };

    const FUNC_NAMES = Object.keys(ctx).filter(k => typeof ctx[k] === 'function');

    function displayExpr() {
        let s = expression;
        s = s.replace(/\*/g, '×').replace(/\//g, '÷');
        return s;
    }

    function render() {
        exprEl.textContent = displayExpr();
        if (expression === '') {
            resultEl.textContent = '0';
        }
    }

    function loadHistory() {
        try {
            const raw = localStorage.getItem(HISTORY_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveHistory(list) {
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch (e) { }
    }

    function renderHistory() {
        const list = loadHistory();
        historyList.innerHTML = '';
        if (!list.length) {
            historyEmpty.style.display = 'block';
            return;
        }
        historyEmpty.style.display = 'none';
        list.forEach((item) => {
            const li = document.createElement('li');
            const e = document.createElement('div');
            e.className = 'history__expr';
            e.textContent = item.expr;
            const r = document.createElement('div');
            r.className = 'history__result';
            r.textContent = '= ' + item.result;
            li.appendChild(e);
            li.appendChild(r);
            li.addEventListener('click', () => {
                expression = item.exprRaw || item.expr;
                justEvaluated = false;
                render();
            });
            historyList.appendChild(li);
        });
    }

    function addToHistory(exprRaw, exprDisplay, result) {
        const list = loadHistory();
        list.unshift({ expr: exprDisplay, exprRaw: exprRaw, result: result });
        if (list.length > MAX_HISTORY) list.length = MAX_HISTORY;
        saveHistory(list);
        renderHistory();
    }

    function clearHistory() {
        saveHistory([]);
        renderHistory();
    }
    /* ---------- Evaluación ---------- */
    function sanitize(expr) {
        if (/[^0-9+\-*/%().,\s^a-zA-Z_]/.test(expr)) return null;
        return expr;
    }

    function evaluate() {
        if (expression.trim() === '') return;
        const clean = sanitize(expression);
        if (clean === null) {
            resultEl.textContent = 'Error';
            return;
        }
        let code = clean.replace(/\^/g, '**');
        try {
            const fn = new Function(...Object.keys(ctx), 'return ' + code);
            const value = fn(...Object.values(ctx));
            if (value === undefined) {
                resultEl.textContent = 'Error';
                return;
            }
            if (typeof value === 'number' && isNaN(value)) {
                resultEl.textContent = 'Error';
                return;
            }
            if (value === Infinity) {
                resultEl.textContent = '∞';
                addToHistory(expression, displayExpr(), '∞');
                expression = 'Infinity';
                justEvaluated = true;
                return;
            }
            if (value === -Infinity) {
                resultEl.textContent = '-∞';
                addToHistory(expression, displayExpr(), '-∞');
                expression = '-Infinity';
                justEvaluated = true;
                return;
            }
            if (typeof value === 'number' && !isFinite(value)) {
                resultEl.textContent = 'Error';
                return;
            }
            const formatted = formatNumber(value);
            resultEl.textContent = formatted;
            addToHistory(expression, displayExpr(), formatted);
            expression = String(value);
            justEvaluated = true;
        } catch (e) {
            resultEl.textContent = 'Error';
        }
    }

    function formatNumber(n) {
        if (typeof n !== 'number') return String(n);
        let s = (Math.round(n * 1e12) / 1e12).toString();
        if (s.indexOf('e') !== -1) return n.toExponential(6);
        return s;
    }

    /* ---------- Acciones de teclas ---------- */
    function appendValue(val) {
        if (justEvaluated) {
            if (/^[0-9.]$/.test(val) || val === 'pi' || val === 'e') {
                expression = '';
            }
            justEvaluated = false;
        }

        const last = expression.slice(-1);
        if (isOperator(val) && expression !== '' && isOperator(last)) {
            expression = expression.slice(0, -1) + val;
            render();
            return;
        }

        if ((val === '(' || FUNC_NAMES.some(f => val.startsWith(f + '(')) || val === 'pi' || val === 'e') &&
            expression !== '' && (/[0-9)]$/.test(expression))) {
            expression += '*';
        }

        if (val === 'pi' || val === 'e') {
            expression += val;
        } else if (val === '^') {
            expression += '^';
        } else {
            expression += val;
        }
        render();
    }

    function clearAll() {
        expression = '';
        justEvaluated = false;
        resultEl.textContent = '0';
        render();
    }

    function backspace() {
        if (justEvaluated) {
            expression = '';
            justEvaluated = false;
            resultEl.textContent = '0';
            render();
            return;
        }
        for (const f of FUNC_NAMES) {
            const token = f + '(';
            if (expression.endsWith(token)) {
                expression = expression.slice(0, -token.length);
                render();
                return;
            }
        }
        if (expression.endsWith('pi')) {
            expression = expression.slice(0, -2);
            render();
            return;
        }
        if (expression.endsWith('Infinity')) {
            expression = expression.slice(0, -8);
            render();
            return;
        }
        expression = expression.slice(0, -1);
        render();
    }

    /* ---------- Eventos ---------- */
    document.querySelectorAll('.key').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            const value = btn.getAttribute('data-value');
            if (action === 'clear') { clearAll(); return; }
            if (action === 'backspace') { backspace(); return; }
            if (action === 'equals') { evaluate(); return; }
            if (value !== null) appendValue(value);
        });
    });

    degBtn.addEventListener('click', () => {
        degreeMode = true;
        degBtn.classList.add('active');
        radBtn.classList.remove('active');
    });
    radBtn.addEventListener('click', () => {
        degreeMode = false;
        radBtn.classList.add('active');
        degBtn.classList.remove('active');
    });

    clearHistoryBtn.addEventListener('click', clearHistory);

    document.addEventListener('keydown', (e) => {
        const k = e.key;
        if (/^[0-9]$/.test(k)) { appendValue(k); e.preventDefault(); return; }
        if (k === '.') { appendValue('.'); e.preventDefault(); return; }
        if (k === '+') { appendValue('+'); e.preventDefault(); return; }
        if (k === '-') { appendValue('-'); e.preventDefault(); return; }
        if (k === '*') { appendValue('*'); e.preventDefault(); return; }
        if (k === '/') { appendValue('/'); e.preventDefault(); return; }
        if (k === '%') { appendValue('%'); e.preventDefault(); return; }
        if (k === '^') { appendValue('^'); e.preventDefault(); return; }
        if (k === '(') { appendValue('('); e.preventDefault(); return; }
        if (k === ')') { appendValue(')'); e.preventDefault(); return; }
        if (k === 'Enter' || k === '=') { evaluate(); e.preventDefault(); return; }
        if (k === 'Backspace') { backspace(); e.preventDefault(); return; }
        if (k === 'Escape' || k.toLowerCase() === 'c') { clearAll(); e.preventDefault(); return; }
    });

    renderHistory();
    render();
})();

