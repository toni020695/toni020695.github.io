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

    // FIX: Wir berechnen die Statistiken JETZT IMMER auf Basis der kompletten Liste (rawConcerts)
    // statt auf der (eventuell durch die Suche gefilterten) concertsList.
    updateStatistics(rawConcerts);

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
            // Wenn das Jahr 1900 ist, wird "Unknown" angezeigt
            const displayYear = c.year === 1900 ? "Unknown" : c.year;

            return `
                <div class="concert-detail-item">
                    <div class="concert-meta">
                        <span class="year-tag">${displayYear}</span>
                        <span>📍 ${c.location}</span>
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

// 3. Funktion zur Berechnung der Statistiken (arbeitet jetzt autark auf der Gesamtliste)
function updateStatistics(fullList) {
    const totalShows = fullList.length;
    
    // Temporäre Gruppierung nur für die All-Time-Statistik
    const statsGrouped = {};
    fullList.forEach(c => {
        const name = c.artist.trim();
        statsGrouped[name] = (statsGrouped[name] || 0) + 1;
    });

    const totalArtists = Object.keys(statsGrouped).length;

    let maxCount = 0;
    let topArtist = "---";

    for (const artist in statsGrouped) {
        if (statsGrouped[artist] > maxCount) {
            maxCount = statsGrouped[artist];
            topArtist = artist;
        }
    }

    // Werte ins HTML schreiben
    document.getElementById('stat-shows-count').textContent = totalShows;
    document.getElementById('stat-artists-count').textContent = totalArtists;
    document.getElementById('stat-top-artist').textContent = topArtist;
    document.getElementById('stat-top-count').textContent = maxCount;
}

// 4. Funktion zum Auf- und Zuklappen der Band-Details
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

// 5. Live-Suche (filtert nach Bandnamen oder Location)
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
