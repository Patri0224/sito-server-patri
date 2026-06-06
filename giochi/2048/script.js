function generateGrid() {
    const container = document.getElementById('grid-container');
    const size = parseInt(document.getElementById('grid-size').value);

    // Svuota la griglia precedente
    container.innerHTML = '';

    // Imposta le colonne e le righe dinamiche tramite i CSS Grid di JavaScript
    container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    // Doppio ciclo per generare righe e colonne
    for (let riga = 1; riga <= size; riga++) {
        for (let colonna = 1; colonna <= size; colonna++) {

            // Crea l'elemento cella
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.id = `${riga}${colonna}`;

            // Aggiunge la cella al contenitore
            container.appendChild(cell);
        }
    }
    spawnCells()
}
function spawnCells() {
    const size = parseInt(document.getElementById('grid-size').value);

    const allCells = Array.from(document.querySelectorAll('.cell'));
    const emptyCells = allCells.filter(cell => cell.textContent.trim() === '');

    if (emptyCells.length === 0) {
        return;
    }

    const spawnPercentage = { 3: 75, 4: 100, 5: 175, 6: 250, 7: 325, 8: 400, 9: 475, 10: 550 };

    const exactSpawns = spawnPercentage[size] / 100;

    let finalSpawnsCount = Math.floor(exactSpawns);
    const probabilityOfExtra = exactSpawns - finalSpawnsCount;

    if (Math.random() < probabilityOfExtra) {
        finalSpawnsCount++;
    }

    const actualSpawnsToCreate = Math.min(finalSpawnsCount, emptyCells.length);

    for (let i = 0; i < actualSpawnsToCreate; i++) {
        if (emptyCells.length === 0) break;

        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const targetCell = emptyCells.splice(randomIndex, 1)[0];

        const cellValue = Math.random() < 0.20 ? 4 : 2;

        targetCell.textContent = cellValue;

        targetCell.classList.remove('val-2', 'val-4', 'val-8', 'val-16', 'val-32', 'val-64');
        targetCell.classList.add(`val-${cellValue}`);
    }
}


// ==========================================
// 1. ASCOLTATORE TASTIERA (WASD & FRECCETTE)
// ==========================================
window.addEventListener('keydown', (event) => {
    const validKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'KeyQ', 'KeyE'];
    if (validKeys.includes(event.code)) {
        event.preventDefault();
    }

    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            mossa('w');
            break;
        case 'KeyA':
        case 'ArrowLeft':
            mossa('a');
            break;
        case 'KeyS':
        case 'ArrowDown':
            mossa('s');
            break;
        case 'KeyD':
        case 'ArrowRight':
            mossa('d');
            break;
        case 'KeyQ':
            mossa('s');
            mossa('a');
            break;
        case 'KeyE':
            mossa('w');
            mossa('d');
            mossa('s');
            mossa('a');
            break;
    }
});

// ==========================================
// 2. ASCOLTATORE TOUCH (SWIPE PER TELEFONI)
// ==========================================
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const minSwipeDistance = 40;

window.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (event) => {
    touchEndX = event.changedTouches[0].clientX;
    touchEndY = event.changedTouches[0].clientY;

    gestisciSwipe();
}, { passive: true });
// Impedisce l'aggiornamento della pagina (pull-to-refresh) durante il movimento del dito
window.addEventListener('touchmove', function(event) {
    // Applichiamo il blocco solo se l'utente sta scorrendo sul body o sul gioco,
    // lasciando liberi eventuali altri elementi se necessario.
    if (event.touches.length === 1) {
        event.preventDefault();
    }
}, { passive: false }); // NOTA: 'passive: false' è fondamentale per permettere a preventDefault() di funzionare

function gestisciSwipe() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0) {
                mossa('d');
            } else {
                mossa('a');
            }
        }
    } else {
        if (Math.abs(diffY) > minSwipeDistance) {
            if (diffY > 0) {
                mossa('s');
            } else {
                mossa('w');
            }
        }
    }
}

// ==========================================
// 3. LA TUA FUNZIONE DI GESTIONE MOVIMENTO
// =========================================
let ultimoComandoTime = 0;
function mossa(direzione) {

const adesso = Date.now();
    if (adesso - ultimoComandoTime < 50) {
        return; 
    }
    ultimoComandoTime = adesso;
    const size = parseInt(document.getElementById('grid-size').value);
    let mossoQualcosa = false;

    for (let i = 1; i <= size; i++) {
        let linea = [];

        for (let j = 1; j <= size; j++) {
            // Se muoviamo in orizzontale (A, D) l'indice fisso è la riga (i), il variabile la colonna (j)
            // Se muoviamo in verticale (W, S) l'indice fisso è la colonna (i), il variabile la riga (j)
            let idCella = (direzione === 'a' || direzione === 'd') ? `${i}${j}` : `${j}${i}`;
            let cella = document.getElementById(idCella);

            let valore = cella.textContent.trim();
            linea.push(valore !== '' ? parseInt(valore) : 0);
        }

        // Memorizziamo la linea originale per capire alla fine se qualcosa si è mosso
        let lineaOriginale = [...linea];

        // --- FASE 2: Compattazione e Fusione ---
        // Se andiamo verso Destra (d) o Basso (s), la direzione di impatto è invertita,
        // quindi invertiamo l'array per processarlo sempre da "sinistra a destra"
        if (direzione === 'd' || direzione === 's') {
            linea.reverse();
        }

        // Sposta tutti i numeri a inizio array (elimina gli zeri temporaneamente)
        let numeri = linea.filter(val => val !== 0);

        // Fonde i numeri uguali adiacenti
        let lineaFusa = [];
        for (let k = 0; k < numeri.length; k++) {
            if (k < numeri.length - 1 && numeri[k] === numeri[k + 1]) {
                // Fusione! Raddoppia il valore
                lineaFusa.push(numeri[k] * 2);
                k++; // Salta il prossimo elemento perché è stato fuso
            } else {
                lineaFusa.push(numeri[k]);
            }
        }

        // Riempie il resto della linea con gli zeri per tornare alla dimensione corretta
        while (lineaFusa.length < size) {
            lineaFusa.push(0);
        }

        // Se avevamo invertito l'array all'inizio, lo rigiriamo per rimetterlo a posto
        if (direzione === 'd' || direzione === 's') {
            lineaFusa.reverse();
        }

        // Controlla se la linea è cambiata rispetto a prima
        if (JSON.stringify(lineaOriginale) !== JSON.stringify(lineaFusa)) {
            mossoQualcosa = true;
        }

        // --- FASE 3: Scrittura dei nuovi valori nella griglia ---
        for (let j = 1; j <= size; j++) {
            let idCella = (direzione === 'a' || direzione === 'd') ? `${i}${j}` : `${j}${i}`;
            let cella = document.getElementById(idCella);
            let nuovoValore = lineaFusa[j - 1];

            // Resetta le classi di valore vecchie
            cella.className = 'cell';

            if (nuovoValore === 0) {
                cella.textContent = '';
            } else {
                cella.textContent = nuovoValore;
                cella.classList.add(`val-${nuovoValore}`); // Assegna es. val-2, val-4, val-8...
            }
        }
    }

    // --- FASE 4: Spawn del nuovo blocco ---
    // Nel gioco originale, si genera un nuovo blocco SOLO se la mossa ha effettivamente
    // spostato o unito qualcosa. Se spingi contro il muro e non cambia nulla, non spawna niente.
    if (mossoQualcosa) {
        setTimeout(() => {
            spawnCells();
        }, 150);
    } else {
        // Se non è successo nulla, controlla se la griglia è piena per dichiarare il game over
        const allCells = Array.from(document.querySelectorAll('.cell'));
        const emptyCells = allCells.filter(cell => cell.textContent.trim() === '');
        if (emptyCells.length === 0) {
            //da a ogni cella un effetto di "shake" per indicare il game over
            allCells.forEach(cell => {
                cell.classList.add('lost');
            });
        }
    }
}
window.onload = generateGrid();

