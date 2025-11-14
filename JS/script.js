// Mappa per i nomi delle versioni
const versionNames = {
    "FormWin11": "Windows 11",
    "FormWin10": "Windows 10",
    "FormWin8": "Windows 8",
    "FormWin7": "Windows 7",
    "FormSpecial": "Strumenti Speciali"
};

// Mappa per i nomi delle architetture
const architectureNames = {
    "x64": "64-bit",
    "x32": "32-bit",
    "x86": "32-bit",
    "Arm64": "ARM 64-bit"
};

// Mappa per i tipi di edizione
const editionNames = {
    "Stock": "Standard",
    "Lite": "Lite",
    "ltsc": "LTSC"
};

// Funzione per estrarre informazioni dal nome della chiave
function parseKeyInfo(key) {
    const isSha = key.includes('Sha256');
    let baseKey = isSha ? key.replace('Sha256', '') : key;
    
    // Estrae la versione (10, 11, 7, 8)
    const versionMatch = key.match(/^(10|11|7|8)/);
    const version = versionMatch ? versionMatch[1] : '';
    
    // Estrae l'architettura
    let architecture = '';
    if (baseKey.includes('x64')) architecture = 'x64';
    else if (baseKey.includes('x32') || baseKey.includes('x86')) architecture = 'x32';
    else if (baseKey.includes('Arm64')) architecture = 'Arm64';
    
    // Estrae l'edizione
    let edition = 'Stock'; // Default
    if (baseKey.includes('Lite')) edition = 'Lite';
    else if (baseKey.includes('ltsc')) edition = 'ltsc';
    
    // Estrae la versione specifica (24H2, 25H2)
    let specificVersion = '';
    if (baseKey.includes('24h2') || baseKey.includes('24H2') || baseKey.includes('24H224H2')) specificVersion = '24H2';
    else if (baseKey.includes('25h2') || baseKey.includes('25H2') || baseKey.includes('25H225h2')) specificVersion = '25H2';
    
    return {
        isSha,
        version,
        architecture,
        edition,
        specificVersion
    };
}
function createSpecialLinks() {
    const specialLinks = [
        {
            key: "WinHubXLive",
            name: "WinHubX Live",
            description: "Ambiente live per ripristino e manutenzione",
            url: "https://devuploads.com/ucpfdcbe6bl3",
            icon: "fas fa-desktop"
        },
        {
            key: "DaRTWinHubX",
            name: "DaRT WinHubX", 
            description: "Diagnostic and Recovery Toolset",
            url: "https://devuploads.com/ucpfdcbe6bl3",
            icon: "fas fa-tools"
        },
        {
            key: "DriverRST",
            name: "Driver RST",
            description: "Intel Rapid Storage Technology Drivers",
            url: "https://github.com/MrNico98/WinHubX-Resource/releases/download/WinHubX-Risorse/DriverRST.zip",
            icon: "fas fa-microchip"
        }
    ];

    const container = document.getElementById('iso-container');
    
    specialLinks.forEach(link => {
        const card = document.createElement('div');
        card.className = 'iso-card';
        card.dataset.version = 'special';
        card.dataset.language = 'all';
        card.dataset.edition = 'special';
        card.dataset.name = link.name.toLowerCase();
        
        card.innerHTML = `
            <div class="iso-header">
                <div class="iso-icon">
                    <i class="${link.icon}"></i>
                </div>
                <div class="iso-title">${link.name}</div>
            </div>
            <div class="iso-details">
                <div class="iso-detail">
                    <span class="detail-label">Tipo:</span>
                    <span class="detail-value">Strumento speciale</span>
                </div>
                <div class="iso-detail">
                    <span class="detail-label">Descrizione:</span>
                    <span class="detail-value">${link.description}</span>
                </div>
            </div>
            <div class="iso-actions">
                <a href="${link.url}" class="btn btn-primary" target="_blank">
                    <i class="fas fa-download"></i> Scarica
                </a>
            </div>
        `;
        
        container.appendChild(card);
    });
}
// Funzione per creare un nome leggibile per l'ISO
function createDisplayName(keyInfo) {
    let name = `Windows ${keyInfo.version}`;
    
    if (keyInfo.specificVersion) {
        name += ` ${keyInfo.specificVersion}`;
    }
    
    name += ` ${editionNames[keyInfo.edition] || keyInfo.edition}`;
    name += ` ${architectureNames[keyInfo.architecture] || keyInfo.architecture}`;
    
    return name;
}

// Funzione per trovare lo SHA corrispondente a una chiave URL
function findMatchingSHA(urlKey, isoEntries) {
    // Mappatura diretta per i casi specifici problematici
    const specialCases = {
        '11Litex6425h2': '11Sha256Litex64 - 25H225h2',
        '11Stockx6425h2': '11Sha256Stockx64 - 25H225h2',
        '11Litex6424h2': '11Sha256Litex64 - 24H224H2',
        '11Stockx6424h2': '11Sha256Stockx6424h2'
    };
    
    // Se è un caso speciale, usa la mappatura diretta
    if (specialCases[urlKey] && isoEntries[specialCases[urlKey]]) {
        return isoEntries[specialCases[urlKey]];
    }
    
    // Per tutti gli altri casi, usa la logica normale
    const shaKey = urlKey.replace(/^(10|11|7|8)/, '$1Sha256');
    
    if (isoEntries[shaKey] && isoEntries[shaKey] !== 'sha' && isoEntries[shaKey] !== '') {
        return isoEntries[shaKey];
    }
    
    return 'Non disponibile';
}

// Funzione per creare le card delle ISO
function createIsoCards() {
    const container = document.getElementById('iso-container');
    container.innerHTML = '';
    
    const versionFilter = document.getElementById('version-filter').value;
    const languageFilter = document.getElementById('language-filter').value;
    const editionFilter = document.getElementById('edition-filter').value;
    const searchFilter = document.getElementById('search').value.toLowerCase();
    
    let hasResults = false;
    
    // Aggiungi i link speciali PRIMA (solo se passano i filtri)
    if (versionFilter === 'all' || versionFilter === 'special') {
        createSpecialLinks();
        hasResults = true;
    }
    
    // Itera attraverso tutte le versioni di Windows, ma SALTA FormSpecial
    for (const [formKey, formData] of Object.entries(isoData)) {
        // SALTA completamente FormSpecial - già gestito sopra
        if (formKey === "FormSpecial") {
            continue;
        }
        
        const versionName = versionNames[formKey];
        const versionId = formKey.toLowerCase().replace('formwin', 'win');
        
        // Applica filtro versione
        if (versionFilter !== 'all' && versionFilter !== versionId) {
            continue;
        }
        
        // Itera attraverso le lingue
        for (const [language, isoEntries] of Object.entries(formData)) {
            // Applica filtro lingua
            if (languageFilter !== 'all' && languageFilter !== language) {
                continue;
            }
            
            // Crea le card per ogni URL (solo chiavi che non sono SHA e hanno un URL valido)
            for (const [key, url] of Object.entries(isoEntries)) {
                const keyInfo = parseKeyInfo(key);
                
                // Salta se è una chiave SHA o se l'URL è vuoto
                if (keyInfo.isSha || !url || url === 'sha') {
                    continue;
                }
                
                const displayName = createDisplayName(keyInfo);
                
                // Applica filtro edizione
                if (editionFilter !== 'all' && editionFilter !== keyInfo.edition) {
                    continue;
                }
                
                // Applica filtro di ricerca
                if (searchFilter && !displayName.toLowerCase().includes(searchFilter)) {
                    continue;
                }
                
                const shaValue = findMatchingSHA(key, isoEntries);
                
                const card = document.createElement('div');
                card.className = 'iso-card';
                card.dataset.version = versionId;
                card.dataset.language = language;
                card.dataset.edition = keyInfo.edition;
                card.dataset.name = displayName.toLowerCase();
                
                card.innerHTML = `
                    <div class="iso-header">
                        <div class="iso-icon">
                            <i class="fab fa-windows"></i>
                        </div>
                        <div class="iso-title">${displayName}</div>
                    </div>
                    <div class="iso-details">
                        <div class="iso-detail">
                            <span class="detail-label">Lingua:</span>
                            <span class="detail-value">${language === 'IT' ? 'Italiano' : 'Inglese'}</span>
                        </div>
                        <div class="iso-detail">
                            <span class="detail-label">SHA256:</span>
                            <span class="detail-value sha-value">${shaValue}</span>
                        </div>
                    </div>
                    <div class="iso-actions">
                        <a href="${url}" class="btn btn-primary" target="_blank" ${url ? '' : 'disabled'}>
                            <i class="fas fa-download"></i> Scarica
                        </a>
                        <button class="btn btn-outline copy-sha" data-sha="${shaValue}">
                            <i class="fas fa-copy"></i> Copia SHA
                        </button>
                    </div>
                `;
                
                container.appendChild(card);
                hasResults = true;
            }
        }
    }
    
    if (!hasResults) {
        container.innerHTML = '<div class="no-results">Nessun risultato trovato con i filtri applicati.</div>';
    }
    
    // Aggiunge event listener per i pulsanti di copia SHA
    document.querySelectorAll('.copy-sha').forEach(button => {
        button.addEventListener('click', function() {
            const sha = this.getAttribute('data-sha');
            if (sha && sha !== 'Non disponibile') {
                navigator.clipboard.writeText(sha).then(() => {
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check"></i> Copiato!';
                    this.classList.add('btn-success');
                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.classList.remove('btn-success');
                    }, 2000);
                });
            }
        });
    });
    
    // Nasconde il loading
    document.getElementById('loading').classList.add('hidden');
}

// Funzione per calcolare l'hash SHA256 di un file in modo efficiente
async function calculateSHA256(file) {
    return new Promise((resolve, reject) => {
        // Controlla la dimensione del file (max 10GB per sicurezza)
        const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB
        if (file.size > MAX_FILE_SIZE) {
            reject(new Error('File troppo grande. Dimensione massima consentita: 10GB'));
            return;
        }

        const reader = new FileReader();
        let chunksProcessed = 0;
        const chunkSize = 4 * 1024 * 1024; // 4MB per chunk
        const totalChunks = Math.ceil(file.size / chunkSize);
        
        // Inizializza l'hash
        crypto.subtle.digest('SHA-256', new ArrayBuffer(0))
            .then(hashBuffer => {
                let hash = new Uint8Array(hashBuffer);
                
                function processChunk(chunkIndex) {
                    if (chunkIndex >= totalChunks) {
                        // Tutti i chunk sono stati processati
                        const hashHex = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
                        resolve(hashHex);
                        return;
                    }
                    
                    const start = chunkIndex * chunkSize;
                    const end = Math.min(start + chunkSize, file.size);
                    const chunk = file.slice(start, end);
                    
                    const chunkReader = new FileReader();
                    
                    chunkReader.onload = function(e) {
                        const arrayBuffer = e.target.result;
                        
                        // Combina l'hash corrente con il nuovo chunk
                        crypto.subtle.digest('SHA-256', new Uint8Array([...hash, ...new Uint8Array(arrayBuffer)]))
                            .then(newHashBuffer => {
                                hash = new Uint8Array(newHashBuffer);
                                chunksProcessed++;
                                
                                // Aggiorna la barra di progresso se esiste
                                updateProgress(chunksProcessed, totalChunks);
                                
                                // Processa il prossimo chunk
                                setTimeout(() => processChunk(chunkIndex + 1), 0);
                            })
                            .catch(error => {
                                reject(new Error('Errore nel calcolo dell\'hash: ' + error.message));
                            });
                    };
                    
                    chunkReader.onerror = () => {
                        reject(new Error('Errore durante la lettura del chunk del file'));
                    };
                    
                    chunkReader.readAsArrayBuffer(chunk);
                }
                
                // Inizia il processing
                processChunk(0);
            })
            .catch(error => {
                reject(new Error('Impossibile inizializzare l\'hash SHA256: ' + error.message));
            });
    });
}

// Funzione per aggiornare il progresso
function updateProgress(current, total) {
    const resultDiv = document.getElementById('verification-result');
    const percentage = Math.round((current / total) * 100);
    resultDiv.innerHTML = `Calcolo SHA256 in corso... ${percentage}% (${current}/${total} chunk)`;
}

// Funzione per verificare l'hash SHA256
async function verifySHA256() {
    const fileInput = document.getElementById('file-input');
    const shaInput = document.getElementById('sha-input');
    const resultDiv = document.getElementById('verification-result');
    const verifyBtn = document.getElementById('verify-btn');
    
    if (!fileInput.files.length) {
        resultDiv.innerHTML = 'Seleziona un file ISO da verificare.';
        resultDiv.className = 'verification-result error';
        return;
    }
    
    if (!shaInput.value.trim()) {
        resultDiv.innerHTML = 'Inserisci un hash SHA256 da confrontare.';
        resultDiv.className = 'verification-result error';
        return;
    }
    
    const file = fileInput.files[0];
    const expectedSHA = shaInput.value.trim().toLowerCase();
    
    // Disabilita il pulsante durante il calcolo
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calcolo in corso...';
    
    resultDiv.innerHTML = 'Calcolo SHA256 in corso... 0%';
    resultDiv.className = 'verification-result';
    
    try {
        const calculatedSHA = await calculateSHA256(file);
        
        if (calculatedSHA === expectedSHA) {
            resultDiv.innerHTML = '<i class="fas fa-check-circle"></i> Verifica completata: gli hash corrispondono!';
            resultDiv.className = 'verification-result success';
        } else {
            resultDiv.innerHTML = `<i class="fas fa-times-circle"></i> Verifica fallita: gli hash non corrispondono.<br>
                                  <strong>Calcolato:</strong> ${calculatedSHA}<br>
                                  <strong>Atteso:</strong> ${expectedSHA}`;
            resultDiv.className = 'verification-result error';
        }
    } catch (error) {
        resultDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${error.message}`;
        resultDiv.className = 'verification-result error';
    } finally {
        // Riabilita il pulsante
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Verifica SHA256';
    }
}

// Inizializzazione della pagina
document.addEventListener('DOMContentLoaded', function() {
    // Crea le card delle ISO
    createIsoCards();
    
    // Aggiunge event listener per i filtri
    document.getElementById('version-filter').addEventListener('change', createIsoCards);
    document.getElementById('language-filter').addEventListener('change', createIsoCards);
    document.getElementById('edition-filter').addEventListener('change', createIsoCards);
    document.getElementById('search').addEventListener('input', createIsoCards);
    
    // Aggiunge event listener per il pulsante di verifica SHA256
    document.getElementById('verify-btn').addEventListener('click', verifySHA256);
    
    // Aggiunge event listener per permettere di premere Enter nel campo SHA
    document.getElementById('sha-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifySHA256();
        }
    });
});
