let rawConcerts = [];

// 1. Daten aus der JSON-Datei laden
async function loadConcerts() {
    try {
        const response = await fetch('konzerte.json');
        rawConcerts = await response.json();
        
        processAndRender(rawConcerts);
    } catch (error) {
        console.error("Fehler beim Laden:", error);
        document.getElementById('band-list-container').innerHTML = "<p style='padding:20px;'>Fehler beim Laden der Liste.</p>";
    }
}

// 2. Daten verarbeiten, gruppieren, sortieren und anzeigen
function processAndRender(concertsList) {
    const groupedBands = {};

    // Nach Bandname gruppieren
    concertsList.forEach(c => {
        const bandName = c.artist.trim();
        if (!groupedBands[bandName]) {
            groupedBands[bandName] = [];
        }
        groupedBands[bandName].push(c);
    });

    // Innerhalb der Bands die Konzerte nach Jahr sortieren (Neueste zuerst)
    for (const band in groupedBands) {
        groupedBands[band].sort((a, b) => b.year - a.year);
    }

    // Bandnamen alphabetisch sortieren (A-Z)
    const sortedBandNames = Object.keys(groupedBands).sort((a, b) => 
        a.localeCompare(b, 'de', { sensitivity: 'base' })
    );

    const container = document.getElementById('band-list-container');
    if (sortedBandNames.length === 0) {
        container.innerHTML = "<p style='padding:20px;'>Keine Bands gefunden.</p>";
        return;
    }

    // HTML für die Tabelle generieren
    container.innerHTML = sortedBandNames.map(bandName => {
        const concerts = groupedBands[bandName];
        const count = concerts.length;

        // Details für die ausgeklappte Ansicht generieren
        const detailsHtml = concerts.map(c => {
            // Wenn es ein Festival war, hängen wir ein Zelt-Emoji an die Location
            const festivalBadge = c.festival ? ' ⛺' : '';
            
            return `
                <div class="concert-detail-item">
                    <div class="concert-meta">
                        <span class="year-tag">${c.year}</span>
                        <span>📍 ${c.location}${festivalBadge}</span>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="band-row">
                <div class="band-header" onclick="toggleBand(this)">
                    <div class="band-name-wrapper">
                        <span class="toggle-icon">➕</span>
                        <span class="band-name">${bandName}</span>
                    </div>
                    <span class="counter-badge">${count}x</span>
                </div>
                <div class="band-details">
                    ${detailsHtml}
                </div>
            </div>
        `;
    }).join('');
}

// 3. Funktion zum Auf- und Zuklappen der Band-Details
function toggleBand(headerElement) {
    const row = headerElement.parentElement;
    const details = row.querySelector('.band-details');
    
    if (row.classList.contains('active')) {
        row.classList.remove('active');
        details.style.maxHeight = null;
        headerElement.querySelector('.toggle-icon').textContent = "➕";
    } else {
        row.classList.add('active');
        details.style.maxHeight = details.scrollHeight + "px";
        headerElement.querySelector('.toggle-icon').textContent = "➖";
    }
}

// 4. Live-Suche (filtert nach Bandnamen oder Location)
document.getElementById('search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    const filteredRaw = rawConcerts.filter(c => 
        c.artist.toLowerCase().includes(searchTerm) ||
        c.location.toLowerCase().includes(searchTerm)
    );
    
    processAndRender(filteredRaw);
});

// Starten, sobald das DOM bereit ist
window.addEventListener('DOMContentLoaded', loadConcerts);
