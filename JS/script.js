const versionNames = {
    "FormWin11": "Windows 11",
    "FormWin10": "Windows 10",
    "FormWin8": "Windows 8",
    "FormWin7": "Windows 7",
    "FormSpecial": "Strumenti Speciali"
};

const architectureNames = {
    "x64": "64-bit",
    "x32": "32-bit",
    "x86": "32-bit",
    "Arm64": "ARM 64-bit"
};

const editionNames = {
    "Stock": "Standard",
    "Lite": "Lite",
    "ltsc": "LTSC"
};

function parseKeyInfo(key) {
    const isSha = key.includes('Sha256');
    let baseKey = isSha ? key.replace('Sha256', '') : key;
    
    const versionMatch = key.match(/^(10|11|7|8)/);
    const version = versionMatch ? versionMatch[1] : '';
    
    let architecture = '';
    if (baseKey.includes('x64')) architecture = 'x64';
    else if (baseKey.includes('x32') || baseKey.includes('x86')) architecture = 'x32';
    else if (baseKey.includes('Arm64')) architecture = 'Arm64';
    
    let edition = 'Stock';
    if (baseKey.includes('Lite')) edition = 'Lite';
    else if (baseKey.includes('ltsc')) edition = 'ltsc';
    
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

function createDisplayName(keyInfo) {
    let name = `Windows ${keyInfo.version}`;
    
    if (keyInfo.specificVersion) {
        name += ` ${keyInfo.specificVersion}`;
    }
    
    name += ` ${editionNames[keyInfo.edition] || keyInfo.edition}`;
    name += ` ${architectureNames[keyInfo.architecture] || keyInfo.architecture}`;
    
    return name;
}


function findMatchingSHA(urlKey, isoEntries) {
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

function createIsoCards() {
    const container = document.getElementById('iso-container');
    container.innerHTML = '';
    
    const versionFilter = document.getElementById('version-filter').value;
    const languageFilter = document.getElementById('language-filter').value;
    const editionFilter = document.getElementById('edition-filter').value;
    const searchFilter = document.getElementById('search').value.toLowerCase();
    
    let hasResults = false;
    
    if (versionFilter === 'all' || versionFilter === 'special') {
        createSpecialLinks();
        hasResults = true;
    }
    
    for (const [formKey, formData] of Object.entries(isoData)) {
        if (formKey === "FormSpecial") {
            continue;
        }
        
        const versionName = versionNames[formKey];
        const versionId = formKey.toLowerCase().replace('formwin', 'win');
        
        if (versionFilter !== 'all' && versionFilter !== versionId) {
            continue;
        }
        
        for (const [language, isoEntries] of Object.entries(formData)) {
            if (languageFilter !== 'all' && languageFilter !== language) {
                continue;
            }
            
            for (const [key, url] of Object.entries(isoEntries)) {
                const keyInfo = parseKeyInfo(key);
                
                if (keyInfo.isSha || !url || url === 'sha') {
                    continue;
                }
                
                const displayName = createDisplayName(keyInfo);
                
                if (editionFilter !== 'all' && editionFilter !== keyInfo.edition) {
                    continue;
                }
                
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
    
    document.getElementById('loading').classList.add('hidden');
}

async function calculateSHA256(file) {
    return new Promise((resolve, reject) => {
        const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB
        if (file.size > MAX_FILE_SIZE) {
            reject(new Error('File troppo grande. Dimensione massima consentita: 10GB'));
            return;
        }

        const reader = new FileReader();
        let chunksProcessed = 0;
        const chunkSize = 4 * 1024 * 1024;
        const totalChunks = Math.ceil(file.size / chunkSize);
        
        crypto.subtle.digest('SHA-256', new ArrayBuffer(0))
            .then(hashBuffer => {
                let hash = new Uint8Array(hashBuffer);
                
                function processChunk(chunkIndex) {
                    if (chunkIndex >= totalChunks) {
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
                        
                        crypto.subtle.digest('SHA-256', new Uint8Array([...hash, ...new Uint8Array(arrayBuffer)]))
                            .then(newHashBuffer => {
                                hash = new Uint8Array(newHashBuffer);
                                chunksProcessed++;
                                
                                updateProgress(chunksProcessed, totalChunks);
                                
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
                
                processChunk(0);
            })
            .catch(error => {
                reject(new Error('Impossibile inizializzare l\'hash SHA256: ' + error.message));
            });
    });
}

function updateProgress(current, total) {
    const resultDiv = document.getElementById('verification-result');
    const percentage = Math.round((current / total) * 100);
    resultDiv.innerHTML = `Calcolo SHA256 in corso... ${percentage}% (${current}/${total} chunk)`;
}

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
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Verifica SHA256';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    createIsoCards();
    
    document.getElementById('version-filter').addEventListener('change', createIsoCards);
    document.getElementById('language-filter').addEventListener('change', createIsoCards);
    document.getElementById('edition-filter').addEventListener('change', createIsoCards);
    document.getElementById('search').addEventListener('input', createIsoCards);
    
    document.getElementById('verify-btn').addEventListener('click', verifySHA256);
    
    document.getElementById('sha-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifySHA256();
        }
    });
});
