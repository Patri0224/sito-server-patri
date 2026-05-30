// Esegui il caricamento iniziale dei dati appena la pagina è pronta
document.addEventListener('DOMContentLoaded', caricaLista);

// 1. Funzione per leggere la lista dal database e stamparla in HTML
async function caricaLista() {
    try {
        const risposta = await fetch('/api/spesa');
        const prodotti = await risposta.json();
        
        const contenitore = document.getElementById('lista-prodotti');
        const btnSvuota = document.getElementById('btn-svuota');
        
        contenitore.innerHTML = ''; // Svuota lo schermo prima di ridisegnare

        if (prodotti.length === 0) {
            contenitore.innerHTML = '<p class="messaggio-vuoto">La lista è vuota! Frigo pieno. 🥳</p>';
            btnSvuota.classList.add('hidden'); // Nasconde il tasto svuota tutto
            return;
        }

        btnSvuota.classList.remove('hidden'); // Mostra il tasto svuota tutto

        // Ciclo su ogni prodotto per generare i rettangoli (card)
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

// 2. Funzione per aggiungere un prodotto
async function aggiungiProdotto() {
    const inputNome = document.getElementById('input-nome');
    const selectPrio = document.getElementById('select-priorita');
    const selectStato = document.getElementById('select-quantita');

    const nome = inputNome.value.trim();
    const priorita = selectPrio.value;
    const quantita = selectStato.value;

    if (!nome) {
        alert("Scrivi prima cosa vuoi comprare!");
        return;
    }

    // Invia i dati a Node.js in formato JSON
    await fetch('/api/spesa/aggiungi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, priorita, quantita })
    });

    // Pulisce il form e rinfresca la lista a schermo
    inputNome.value = '';
    selectPrio.value = '';
    selectStato.value = '';
    caricaLista();
}

// 3. Funzione per eliminare un singolo elemento
async function eliminaProdotto(nomeProdotto) {
    await fetch('/api/spesa/elimina-singolo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeProdotto })
    });
    caricaLista(); // Aggiorna lo schermo
}

// 4. Funzione per spazzare via tutta la lista
async function svuotaTutto() {
    if (confirm("Vuoi davvero cancellare l'intera lista della spesa?")) {
        await fetch('/api/spesa/svuota-tutto', { method: 'POST' });
        caricaLista(); // Aggiorna lo schermo
    }
}