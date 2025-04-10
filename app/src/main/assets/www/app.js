

const jeux = JSON.parse(Android.loadZhogo());
const intros = JSON.parse(Android.loadIntros());

// State management

let state = {
    touchStart: null,
    mode: 'all',
    pieces: jeux,
    idx: 0,
    lang: 'fr',
    preferredSource: 'getty'
};

// Constants
const sectionDict = { "daga": "🔪", "spada_daga": "🔪🗡️", "spada1h": "🗡️", "spada2": "⚔️" };
const manuscriptDict = { "getty": "🇬", "novati": "🇳", "paris": "🇵", "morgan": "🇲" };

// DOM Elements
const versionSelector = document.getElementById('version-selector');
const sectionSelector = document.getElementById('section-selector');
const maitreSelector = document.getElementById('maitre-selector');
const jeuSelector = document.getElementById('jeu-selector');
const imageContainer = document.getElementById('image-container');
const galleryImage = document.getElementById('gallery-image');
const zhogoCont = document.getElementById('image-text');
const zhogoText = document.getElementById('jeu-texte');
const zhogoNote = document.getElementById('jeu-notes');
const slider = document.getElementById('piece-slider');

// Dropdown Elements
const versionDropdown = document.getElementById('version-dropdown');
const sectionDropdown = document.getElementById('section-dropdown');
const maitreDropdown = document.getElementById('maitre-dropdown');
const jeuDropdown = document.getElementById('jeu-dropdown');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');

// Helper Functions
function getUniqueMaitres() {
    return [...new Set(state.pieces
        .filter(p => state.pieces[state.idx].section === p.section)
        .map(p => p.maitre))].sort((a, b) => a - b);
}

function getUniqueJeux() {
    return [...new Set(state.pieces
        .filter(p => state.pieces[state.idx].section === p.section)
        .filter(p => state.pieces[state.idx].maitre === p.maitre)//.map(p => p.jeu)
        )].sort((a, b) => a - b).map((item, index) => [index+1, item]);
}

function compareCorrectMovedPages(x, y, version) {
    var a = x[version];
    var b = y[version];
    if (version.startsWith("getty")) {
        if (a.startsWith("38")) a = a.replace("38", "14x");
        if (b.startsWith("38")) b = b.replace("38", "14x");
    }
    if (version.startsWith("novati")) {
        if (a.startsWith("08a")) a = a.replace("08a", "06x");
        if (b.startsWith("08a")) b = b.replace("08a", "06x");
    }
    return a.localeCompare(b);
}

// Event Handlers

function closeAllDropdowns() {
    closeAllDropdownsExcept("")								 
    slider.classList.add('show');
}

function closeAllDropdownsExcept(d) {
    [versionDropdown, sectionDropdown, maitreDropdown, jeuDropdown].forEach(dropdown =>  {
        if (dropdown !== d) {
            dropdown.classList.remove('show');
            state['show' + dropdown] = false;
        } else {
            dropdown.classList.toggle('show');
            state['show' + dropdown] = !state['show' + dropdown];
            if(dropdown.classList.contains('show')){
                slider.classList.remove('show');
            } else {
                slider.classList.add('show');
            }
        }
    });
}

function handleVersionSelect(source, lang) {
    console.log(source, lang);
    state.preferredSource = source;
    state.lang = lang;
    closeAllDropdowns();
    updateUI();
}

function handleSectionSelect(section) {
    const index = state.pieces.findIndex(piece => piece.section === section);
    if (index !== -1) {
        state.idx = index;
        updateUI();
    }
    closeAllDropdowns();
}

function handleMaitreSelect(maitre) {
    const index = state.pieces.findIndex(piece => 
        piece.maitre === maitre && state.pieces[state.idx].section === piece.section
    );
    if (index !== -1) {
        state.idx = index;
        updateUI();
    }
    closeAllDropdowns();
}

function handleJeuSelect(jeu) {
    const master_index = state.pieces.findIndex(piece => (piece.maitre === state.pieces[state.idx].maitre) && (state.pieces[state.idx].section == piece.section));
    const current_jeu = state.idx - master_index +1
    const index = state.idx + jeu - current_jeu;
    if (index !== -1) {
        state.idx = index;
        updateUI();
    }
    closeAllDropdowns();
}

function handleImageClick(e) {
    const { clientX } = e;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const clickPosition = clientX - left;

    if (clickPosition < width / 2) {
        state.idx = state.idx > 0 ? state.idx - 1 : state.pieces.length - 1;
    } else {
        state.idx = state.idx < state.pieces.length - 1 ? state.idx + 1 : 0;
    }
    updateUI();
}

function handleTouchStart(e) {
    state.touchStart = e.touches[0].clientX;
}

function handleTouchEnd(e) {
    if (!state.touchStart) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = state.touchStart - touchEnd;

    if (Math.abs(diff) < 50) return;

    if (diff > 0) {
        state.idx = state.idx < state.pieces.length - 1 ? state.idx + 1 : 0;
    } else {
        state.idx = state.idx > 0 ? state.idx - 1 : state.pieces.length - 1;
    }
    state.touchStart = null;
    updateUI();
}

function handleReadIntro(source){
    imageContainer.classList.add('hide');
    zhogoCont.classList.add('full-height');
    sidebar.classList.remove('open');
    state.preferredSource = source;
    state.pieces= [{"getty_fr" : intros['intro.getty.fr'],"getty_en" : intros['intro.getty.en'],"getty_o" : intros['intro.getty.o'], "getty_ref" : "Intro",
                "novati_fr" : intros['intro.novati.fr'],"novati_en" : intros['intro.novati.en'],"novati_o" : intros['intro.novati.o'], "novati_ref" : "Intro"} ];
    state.idx = 0;
    
    slider.max = state.pieces.length - 1;
    sectionSelector.classList.add('hide');
    maitreSelector.classList.add('hide');
    jeuSelector.classList.add('hide');
    closeAllDropdowns();
    updateUI();
}

function handleSortClick(version){
    imageContainer.classList.remove('hide');
    zhogoCont.classList.remove('full-height');
    sectionSelector.classList.remove('hide');
    maitreSelector.classList.remove('hide');
    jeuSelector.classList.remove('hide');
    if (!version.startsWith("all")){
        state.pieces = jeux.filter(piece => piece[version] != '').sort((a, b) => compareCorrectMovedPages(a, b, version));
        state.preferredSource = version.split("_")[0];
        state.mode = version.split("_")[0];
    }
    else {
        state.pieces = jeux;
        state.mode = "all"
        state.preferredSource = "getty"
    }
    state.idx = 0;
    slider.max = state.pieces.length - 1;
    sidebar.classList.remove('open');
    updateUI();
  }

// UI Updates
function updateUI() {
    const currentPiece = state.pieces[state.idx];
    const master_index = state.pieces.findIndex(piece => (piece.maitre === state.pieces[state.idx].maitre) && (state.pieces[state.idx].section == piece.section))
    const source = currentPiece[state.preferredSource + '_ref'] !== '' ? 
        state.preferredSource : 
        (state.preferredSource === 'novati' ? 'getty' : 'novati');
    
    const id_img = source.toLowerCase() + '_ref';
    const id_txt = source.toLowerCase() + '_' + state.lang;

    // Update navigation items
    versionSelector.textContent = `${manuscriptDict[source]} ${currentPiece[source + '_ref']}`;
    sectionSelector.innerHTML = Android.getSvg(currentPiece.section);//textContent = sectionDict[currentPiece.section];
    maitreSelector.textContent = "👑 " + currentPiece.maitre;
    jeuSelector.textContent = "🔸 " + (state.idx - master_index +1);

    // Update image and text
    galleryImage.src = `./img/${source}/${source}_${currentPiece[id_img]}.jpg`;
    zhogoText.textContent = currentPiece[id_txt];
    zhogoNote.textContent =  localStorage.getItem(`notes_${source}_${currentPiece[id_img]}`) || "";

    updateDropdowns();
}

function updateDropdowns() {
    // Version dropdown
    versionDropdown.innerHTML = '';
    ['fr', 'en', 'o'].forEach(lang => {
        if (state.pieces[state.idx].getty_ref !== '') {
            const li = document.createElement('li');
            li.textContent = `Getty | ${lang}`;
            li.onclick = () => handleVersionSelect('getty', lang);
            versionDropdown.appendChild(li);
        }
    });
    if (state.pieces[state.idx].novati_ref !== '' && state.pieces[state.idx].getty_ref !== '') {
        const hr = document.createElement('hr');
        versionDropdown.appendChild(hr);
    }
    ['fr', 'en', 'o'].forEach(lang => {
        if (state.pieces[state.idx].novati_ref !== '') {
            const li = document.createElement('li');
            li.textContent = `Novati | ${lang}`;
            li.onclick = () => handleVersionSelect('novati', lang);
            versionDropdown.appendChild(li);
        }
    });

    // Section dropdown
    sectionDropdown.innerHTML = '';
    Object.entries(sectionDict).forEach(([section, icon]) => {
        const li = document.createElement('li');
        li.textContent = `${icon} `; //${section}
        li.onclick = () => handleSectionSelect(section);
        sectionDropdown.appendChild(li);
    });

    // Maitre dropdown
    maitreDropdown.innerHTML = '';
    getUniqueMaitres().forEach(maitre => {
        const li = document.createElement('li');
        li.textContent = maitre;
        li.onclick = () => handleMaitreSelect(maitre);
        maitreDropdown.appendChild(li);
    });

    // Jeu dropdown
    jeuDropdown.innerHTML = '';
    getUniqueJeux().forEach(jeu => {
        const li = document.createElement('li');
        li.textContent = jeu[0];
        li.onclick = () => handleJeuSelect(jeu[0]);
        jeuDropdown.appendChild(li);
    });
}

// Event Listeners
imageContainer.addEventListener('click', handleImageClick);
imageContainer.addEventListener('touchstart', handleTouchStart);
imageContainer.addEventListener('touchend', handleTouchEnd);
versionSelector.addEventListener('click', (e) => {e.stopPropagation; closeAllDropdownsExcept(versionDropdown);});
sectionSelector.addEventListener('click', (e) => {e.stopPropagation; closeAllDropdownsExcept(sectionDropdown);});
maitreSelector.addEventListener('click', (e) => {e.stopPropagation; closeAllDropdownsExcept(maitreDropdown);});
jeuSelector.addEventListener('click', (e) => {e.stopPropagation; closeAllDropdownsExcept(jeuDropdown);});
slider.addEventListener('input', (e) => {state.idx = e.target.value; updateUI();});
sidebarToggle.addEventListener('click', function() {sidebar.classList.toggle('open');});
galleryImage.addEventListener('error', () => {galleryImage.src = `./img/getty/getty_27v-d.jpg`;});
document.getElementById('close-sidebar').addEventListener('click', function() {sidebar.classList.remove('open'); });
document.getElementById('order-all').addEventListener('click', function() {handleSortClick("all")});
document.getElementById('order-getty').addEventListener('click', function() {handleSortClick("getty_ref")});
document.getElementById('order-novati').addEventListener('click', function() {handleSortClick("novati_ref")});
document.getElementById('intro-getty').addEventListener('click', function() {handleReadIntro("getty")});
document.getElementById('intro-novati').addEventListener('click', function() {handleReadIntro("novati")});
zhogoNote.addEventListener('blur', (e) => {
    const currentPiece = state.pieces[state.idx];
    const source = currentPiece[state.preferredSource + '_ref'] !== '' ? 
        state.preferredSource : (state.preferredSource === 'novati' ? 'getty' : 'novati');
    const id_img = source.toLowerCase() + '_ref';
    localStorage.setItem(`notes_${source}_${currentPiece[id_img]}`, e.target.textContent);

});
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        closeAllDropdowns();
    }
    if (!sidebar.contains(e.target) && e.target !== sidebarToggle) {
        sidebar.classList.remove('open');
    }
    slider.value = state.idx;
});

// Initial UI setup

state.idx = state.pieces.length - 1;
slider.max = state.pieces.length - 1;
slider.value = state.idx;
updateUI();