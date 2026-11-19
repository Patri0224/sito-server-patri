document.addEventListener('DOMContentLoaded', () => {
    caricaLista();
    inizializzaAutocompletamento();
});

// Gestione tendina suggerimenti mentre digiti
function inizializzaAutocompletamento() {
    const inputNome = document.getElementById('input-nome');
    const boxSuggerimenti = document.getElementById('lista-suggerimenti');

    inputNome.addEventListener('input', async () => {
        const testo = inputNome.value.trim();
        
        if (testo.length === 0) {
            boxSuggerimenti.innerHTML = '';
            boxSuggerimenti.classList.add('hidden');
            return;
        }

        try {
            const risposta = await fetch(`/api/suggerimenti?q=${encodeURIComponent(testo)}`);
            const suggerimenti = await risposta.json();

            if (suggerimenti.length === 0) {
                boxSuggerimenti.innerHTML = '';
                boxSuggerimenti.classList.add('hidden');
                return;
            }

            boxSuggerimenti.innerHTML = '';
            suggerimenti.forEach(item => {
                const div = document.createElement('div');
                div.className = 'suggerimento-item';
                div.innerHTML = `
                    <span>${item.nome}</span>
                    <span class="suggerimento-count">x${item.utilizzi}</span>
                `;
                // Quando clicchi un suggerimento, lo inserisce nell'input e chiude il menu
                div.onclick = () => {
                    inputNome.value = item.nome;
                    boxSuggerimenti.classList.add('hidden');
                };
                boxSuggerimenti.appendChild(div);
            });

            boxSuggerimenti.classList.remove('hidden');
        } catch (errore) {
            console.error("Errore suggerimenti:", errore);
        }
    });

    // Chiude la tendina se clicchi fuori
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-wrapper')) {
            boxSuggerimenti.classList.add('hidden');
        }
    });
}

// 1. Legge la lista attuale
async function caricaLista() {
    try {
        const risposta = await fetch('/api/spesa');
        const prodotti = await risposta.json();
        
        const contenitore = document.getElementById('lista-prodotti');
        const btnSvuota = document.getElementById('btn-svuota');
        
        contenitore.innerHTML = '';

        if (prodotti.length === 0) {
            contenitore.innerHTML = '<p class="messaggio-vuoto">La lista è vuota! Frigo pieno. 🥳</p>';
            btnSvuota.classList.add('hidden');
            return;
        }

        btnSvuota.classList.remove('hidden');

        prodotti.forEach(prodotto => {
            const badgePrio = prodotto.priorita ? `<span class="badge badge-prio">Prio: ${prodotto.priorita}</span>` : '';
            const badgeStato = prodotto.quantita ? `<span class="badge badge-stato">${prodotto.quantita}</span>` : '';

            contenitore.innerHTML += `
                <div class="card">
                    <div class="info-prodotto">
                        <div class="nome-prodotto">${prodotto.nome}</div>
                        ${badgePrio}
                        ${badgeStato}
                    </div>
                    <button class="btn-elimina" onclick="eliminaProdotto('${prodotto.nome.replace(/'/g, "\\'")}')">Elimina</button>
                </div>
            `;
        });
    } catch (errore) {
        console.error("Errore durante il caricamento della lista:", errore);
    }
}

// 2. Aggiunge un prodotto
async function aggiungiProdotto() {
    const inputNome = document.getElementById('input-nome');
    const selectPrio = document.getElementById('select-priorita');
    const selectStato = document.getElementById('select-quantita');
    const boxSuggerimenti = document.getElementById('lista-suggerimenti');

    const nome = inputNome.value.trim();
    const priorita = selectPrio.value;
    const quantita = selectStato.value;

    if (!nome) {
        alert("Scrivi prima cosa vuoi comprare!");
        return;
    }

    await fetch('/api/spesa/aggiungi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, priorita, quantita })
    });

    inputNome.value = '';
    selectPrio.value = '';
    selectStato.value = '';
    boxSuggerimenti.classList.add('hidden');
    caricaLista();
}

// 3. Elimina un singolo elemento
async function eliminaProdotto(nomeProdotto) {
    await fetch('/api/spesa/elimina-singolo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeProdotto })
    });
    caricaLista();
}

// 4. Svuota tutta la lista
async function svuotaTutto() {
    if (confirm("Vuoi davvero cancellare l'intera lista della spesa?")) {
        await fetch('/api/spesa/svuota-tutto', { method: 'POST' });
        caricaLista();
    }
}