let rawConcerts = [];

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

function processAndRender(concertsList) {
    // 1. Gruppieren nach Bandname
    const groupedBands = {};

    concertsList.forEach(c => {
        const bandName = c.artist.trim();
        if (!groupedBands[bandName]) {
            groupedBands[bandName] = [];
        }
        groupedBands[bandName].push(c);
    });

    // 2. Innerhalb der Bands die Konzerte nach Datum sortieren (Neueste zuerst)
    for (const band in groupedBands) {
        groupedBands[band].sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // 3. Bandnamen alphabetisch sortieren
    const sortedBandNames = Object.keys(groupedBands).sort((a, b) => 
        a.localeCompare(b, 'de', { sensitivity: 'base' })
    );

    // 4. HTML generieren
    const container = document.getElementById('band-list-container');
    if (sortedBandNames.length === 0) {
        container.innerHTML = "<p style='padding:20px;'>Keine Bands gefunden.</p>";
        return;
    }

    container.innerHTML = sortedBandNames.map(bandName => {
        const concerts = groupedBands[bandName];
        const count = concerts.length;

        // Details für die ausgeklappte Ansicht generieren
        const detailsHtml = concerts.map(c => {
            const year = c.date ? new Date(c.date).getFullYear() : '----';
            const stars = c.rating ? "★".repeat(c.rating) + "☆".repeat(5 - c.rating) : '';
            
            return `
                <div class="concert-detail-item">
                    <div class="concert-meta">
                        <span class="year-tag">${year}</span>
                        <span>📍 ${c.location}</span>
                        <span class="rating">${stars}</span>
                    </div>
                    ${c.notes ? `<div class="notes">"${c.notes}"</div>` : ''}
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

// Funktion zum Auf- und Zuklappen
function toggleBand(headerElement) {
    const row = headerElement.parentElement;
    const details = row.querySelector('.band-details');
    
    // Wenn die Zeile schon offen ist, schließen
    if (row.classList.contains('active')) {
        row.classList.remove('active');
        details.style.maxHeight = null;
        headerElement.querySelector('.toggle-icon').textContent = "➕";
    } else {
        // Option/Feature: Alle anderen schließen (wenn gewünscht, sonst Zeilen auskommentieren)
        // document.querySelectorAll('.band-row').forEach(r => {
        //     r.classList.remove('active');
        //     r.querySelector('.band-details').style.maxHeight = null;
        //     r.querySelector('.toggle-icon').textContent = "➕";
        // });

        row.classList.add('active');
        details.style.maxHeight = details.scrollHeight + "px";
        headerElement.querySelector('.toggle-icon').textContent = "➖";
    }
}

// Live-Suche (filtert die alphabetische Bandliste)
document.getElementById('search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    const filteredRaw = rawConcerts.filter(c => 
        c.artist.toLowerCase().includes(searchTerm) ||
        c.location.toLowerCase().includes(searchTerm) ||
        (c.notes && c.notes.toLowerCase().includes(searchTerm))
    );
    
    processAndRender(filteredRaw);
});

window.addEventListener('DOMContentLoaded', loadConcerts);