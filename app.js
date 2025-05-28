// Variables
const songForm = document.getElementById('song-form');
const songList = document.getElementById('song-list');
const searchInput = document.getElementById('search');
const formTitle = document.getElementById('form-title');
const cancelEditBtn = document.getElementById('cancel-edit');
let songs = JSON.parse(localStorage.getItem('songs')) || [];
let isEditing = false;
let currentEditId = null;

// Función para renderizar canciones
function renderSongs(filter = "") {
    songList.innerHTML = ""; // Limpiar la lista
    const filteredSongs = songs.filter(song => song.title.toLowerCase().includes(filter.toLowerCase())); // Filtrar canciones
    filteredSongs.sort((a, b) => a.title.localeCompare(b.title)); // Ordenar alfabéticamente

    // Crear elementos para cada canción
    filteredSongs.forEach(song => {
        const li = document.createElement('li');
        li.className = "border p-4 rounded shadow flex justify-between items-center";
        li.innerHTML = `
            <div>
                <h3 class="text-lg font-bold">${song.title}</h3>
                <p class="text-sm text-gray-600">${song.author} | ${song.key} | ${song.bpm} BPM</p>
                <pre class="mt-2 text-sm text-gray-700">${song.body}</pre>
            </div>
            <div class="space-x-2">
                <button class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600" onclick="editSong(${song.id})">Editar</button>
                <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onclick="confirmDeleteSong(${song.id})">Eliminar</button>
                <button class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" onclick="downloadAsTxt(${song.id})">TXT</button>
                <button class="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600" onclick="downloadAsPdf(${song.id})">PDF</button>
            </div>
        `;
        songList.appendChild(li);
    });
}

// Guardar canciones en LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('songs', JSON.stringify(songs));
}

// Agregar o editar canción
songForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const key = document.getElementById('key').value;
    const bpm = document.getElementById('bpm').value;
    const body = document.getElementById('body').value;

    if (isEditing) {
        const song = songs.find(song => song.id === currentEditId);
        song.title = title;
        song.author = author;
        song.key = key;
        song.bpm = bpm;
        song.body = body;
        isEditing = false;
        currentEditId = null;
        cancelEditBtn.classList.add('hidden');
        formTitle.textContent = "Agregar Canción";
    } else {
        const id = Date.now();
        songs.push({ id, title, author, key, bpm, body });
    }

    saveToLocalStorage();
    renderSongs();
    songForm.reset();
});

// Confirmar y eliminar canción
function confirmDeleteSong(id) {
    const song = songs.find(song => song.id === id);
    const confirmed = confirm(`¿Desea eliminar la canción "${song.title}"?`);
    if (confirmed) {
        deleteSong(id);
    }
}

// Eliminar canción
function deleteSong(id) {
    songs = songs.filter(song => song.id !== id);
    saveToLocalStorage();
    renderSongs();
}

// Editar canción
function editSong(id) {
    const song = songs.find(song => song.id === id);
    document.getElementById('title').value = song.title;
    document.getElementById('author').value = song.author;
    document.getElementById('key').value = song.key;
    document.getElementById('bpm').value = song.bpm;
    document.getElementById('body').value = song.body;

    isEditing = true;
    currentEditId = id;
    cancelEditBtn.classList.remove('hidden');
    formTitle.textContent = "Editar Canción";
}

// Cancelar edición
cancelEditBtn.addEventListener('click', () => {
    isEditing = false;
    currentEditId = null;
    songForm.reset();
    cancelEditBtn.classList.add('hidden');
    formTitle.textContent = "Agregar Canción";
});

// Descargar como TXT
function downloadAsTxt(songId) {
    const song = songs.find(s => s.id === songId);
    if (!song) return;

    const content = `Título: ${song.title}
Autor: ${song.author}
Tonalidad: ${song.key}
BPM: ${song.bpm}

Letra:
${song.body}`;

    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${song.title}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
}

// Descargar como PDF
function downloadAsPdf(songId) {
    const song = songs.find(s => s.id === songId);
    if (!song) return;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text(song.title, 10, 10);
    pdf.setFontSize(12);
    pdf.text(`Autor: ${song.author}`, 10, 20);
    pdf.text(`Tonalidad: ${song.key}`, 10, 30);
    pdf.text(`BPM: ${song.bpm}`, 10, 40);

    pdf.setFontSize(10);
    pdf.text("Letra:", 10, 50);
    const lines = pdf.splitTextToSize(song.body, 180);
    pdf.text(lines, 10, 60);

    pdf.save(`${song.title}.pdf`);
}

// Buscar canción
searchInput.addEventListener('input', (e) => {
    renderSongs(e.target.value);
});

// Renderizar canciones al cargar
renderSongs();
