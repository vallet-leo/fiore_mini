const jeux = JSON.parse(Android.loadZhogo());
const langs = JSON.parse(Android.loadLangs());

// State management

let state = JSON.parse(localStorage.getItem('fioremini_state')) || {
    touchStart: null,
    mode: 'all',
    pieces: jeux,
    idx: jeux.length - 1,
    lang: 'fr',
    preferredSource: 'getty',
    source: 'getty'
};

// Constants
const sections = ["intros", "lutte", "daga","spada_daga","spada1h","spada2"];
const manuscriptDict = { "getty": "🄶", "novati": "🄽", "paris": "🄿", "morgan": "🄼" };

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
    var a = correctMovedPages(x, version);
    var b = correctMovedPages(y, version);

    return a.localeCompare(b);
}

function correctMovedPages(x, version) {
    a = x[version]
    if (version.startsWith("getty")) {
        if (a.startsWith("38")) a = a.replace("38", "14x");
    }
    if (version.startsWith("novati")) {
        if (a.startsWith("08a")) a = a.replace("08a", "06x");
    }
    if (version.startsWith("paris")) {
        if (a.startsWith("16")) a = a.replace("16", "15wy");
        if (a.startsWith("17")) a = a.replace("17", "15wz");
        if (a.startsWith("18")) a = a.replace("18", "15wx");
        if (a.startsWith("19")) a = a.replace("19", "15ww");
        if (a.startsWith("20")) a = a.replace("20", "15xw");
        if (a.startsWith("21")) a = a.replace("21", "15xx");
        if (a.startsWith("22")) a = a.replace("22", "15yx");
        if (a.startsWith("23")) a = a.replace("23", "15yw");
        if (a.startsWith("24")) a = a.replace("24", "15xy");
        if (a.startsWith("25")) a = a.replace("25", "15xz");
    }
    if (version.startsWith("morgan")) {
        if (a.startsWith("16r-t")) a = a.replace("16r-t", "14x");
        if (a.startsWith("16")) a = a.replace("16", "14x");
        if (a.startsWith("18")) a = a.replace("18", "15x");
    }
    return a;
}

function selectSource() {
    if (state.pieces[state.idx].hasOwnProperty(state.preferredSource + '_ref')){
        return state.preferredSource;
    }
    const hasGettyVer =  (state.pieces[state.idx].hasOwnProperty('getty_ref')) && (state.pieces[state.idx].getty_ref !== '');
    const hasNovatiVer = (state.pieces[state.idx].hasOwnProperty('novati_ref')) && (state.pieces[state.idx].novati_ref !== '');
    const hasMorganVer = (state.pieces[state.idx].hasOwnProperty('morgan_ref')) && (state.pieces[state.idx].morgan_ref !== '');

    return hasGettyVer ? 'getty' : (hasNovatiVer? 'novati' : (hasMorganVer? 'morgan' : 'paris'));
}

// Event Handlers

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem('fioremini_theme', newTheme);
}

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
    state.preferredSource = source;
    state.lang = lang;
    closeAllDropdowns();
    updateUI();
}

function handleSectionSelect(section) {
    if (section == "intros") {
        handleReadIntro();
        return;
    }
    if (state.pieces[0].section == "intros"){
        handleSortClick(state.mode + "_ref");
    }
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

function handleReadIntro(){
    imageContainer.classList.add('hide');
    zhogoCont.classList.add('full-height');
    sidebar.classList.remove('open');
    state.pieces= [{    "section": "intros",
                        "maitre": "",
                        "jeu": "",
                        "getty_ref": "Intro",
                        "novati_ref": "Intro"}];
    state.idx = 0;
    
    slider.max = state.pieces.length - 1;
    maitreSelector.classList.add('hide');
    jeuSelector.classList.add('hide');
    closeAllDropdowns();
    updateUI();
}

function handleSortClick(version){
    imageContainer.classList.remove('hide');
    zhogoCont.classList.remove('full-height');
    maitreSelector.classList.remove('hide');
    jeuSelector.classList.remove('hide');
    if (!version.startsWith("all")){
        state.pieces = jeux.filter(piece => piece.hasOwnProperty(version) && (piece[version] != '')).sort((a, b) => compareCorrectMovedPages(a, b, version));
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
    if (state.idx > state.pieces.length -1) {
        state.idx = state.pieces.length -1;
    }
    const currentPiece = state.pieces[state.idx];
    const master_index = state.pieces.findIndex(piece => (piece.maitre === state.pieces[state.idx].maitre) && (state.pieces[state.idx].section == piece.section))
    const source = selectSource();
    const piece_ref = currentPiece[source.toLowerCase() + '_ref'];
    const img_ref = piece_ref.split('.')[0];

    state.source = source;

    // Update navigation items
    versionSelector.textContent = `${manuscriptDict[source]} ${currentPiece[source + '_ref']}`;
    sectionSelector.innerHTML = Android.getSvg(currentPiece.section);
    maitreSelector.textContent = "👑 " + currentPiece.maitre;
    jeuSelector.textContent = "🔸 " + (state.idx - master_index +1);

    // Update image and text
    galleryImage.src = `./img/${source}/${source}_${img_ref}.jpg`;
    zhogoText.innerHTML = langs[state.lang][source+"."+piece_ref];
    zhogoNote.textContent =  localStorage.getItem(`notes_${source}_${piece_ref}`) || "";
    localStorage.setItem('fioremini_state', JSON.stringify(state));
    updateDropdowns();
}

function updateDropdowns() {
    // Version dropdown
    versionDropdown.innerHTML = '';
    const hasGettyVer =  (state.pieces[state.idx].hasOwnProperty('getty_ref')) && (state.pieces[state.idx].getty_ref !== '');
    const hasNovatiVer = (state.pieces[state.idx].hasOwnProperty('novati_ref')) && (state.pieces[state.idx].novati_ref !== '');
    const hasMorganVer = (state.pieces[state.idx].hasOwnProperty('morgan_ref')) && (state.pieces[state.idx].morgan_ref !== '');
    const hasParisVer = (state.pieces[state.idx].hasOwnProperty('paris_ref')) && (state.pieces[state.idx].paris_ref !== '');

    ['fr', 'en', 'o'].forEach(lang => {
        if (hasGettyVer) {
            const li = document.createElement('li');
            li.textContent = `Getty | ${lang}`;
            li.onclick = () => handleVersionSelect('getty', lang);
            if ((lang === state.lang) && (state.source === 'getty')) li.classList.add('selected');
            versionDropdown.appendChild(li);
        }
    });
    if (hasNovatiVer && hasGettyVer) {
        const hr = document.createElement('hr');
        versionDropdown.appendChild(hr);
    }
    ['fr', 'en', 'o'].forEach(lang => {
        if (hasNovatiVer) {
            const li = document.createElement('li');
            li.textContent = `Novati | ${lang}`;
            li.onclick = () => handleVersionSelect('novati', lang);
            if ((lang === state.lang) && (state.source === 'novati')) li.classList.add('selected');
            versionDropdown.appendChild(li);
        }
    });
    if ((hasNovatiVer || hasGettyVer) && hasMorganVer) {
        const hr = document.createElement('hr');
        versionDropdown.appendChild(hr);
    }
    ['fr', 'en', 'o'].forEach(lang => {
        if (hasMorganVer) {
            const li = document.createElement('li');
            li.textContent = `Morgan | ${lang}`;
            li.onclick = () => handleVersionSelect('morgan', lang);
            if ((lang === state.lang) && (state.source === 'morgan')) li.classList.add('selected');
            versionDropdown.appendChild(li);
        }
    });
    if ((hasNovatiVer || hasGettyVer || hasMorganVer) && hasParisVer) {
        const hr = document.createElement('hr');
        versionDropdown.appendChild(hr);
    }
    ['fr', 'en', 'o'].forEach(lang => {
        if (hasParisVer) {
            const li = document.createElement('li');
            li.textContent = `Paris | ${lang}`;
            li.onclick = () => handleVersionSelect('paris', lang);
            if ((lang === state.lang) && (state.source === 'paris')) li.classList.add('selected');
            versionDropdown.appendChild(li);
        }
    });

    // Section dropdown
    sectionDropdown.innerHTML = '';
    sections.forEach(section => {
        const li = document.createElement('li');
        li.innerHTML = Android.getSvg(section);
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
slider.addEventListener('input', (e) => {state.idx = Number(e.target.value); updateUI();});
sidebarToggle.addEventListener('click', function() {sidebar.classList.toggle('open');});
galleryImage.addEventListener('error', () => {galleryImage.src = `./img/getty/getty_27v-d.jpg`;});
document.getElementById('close-sidebar').addEventListener('click', function() {sidebar.classList.remove('open'); });
document.getElementById('order-all').addEventListener('click', function() {handleSortClick("all")});
document.getElementById('order-getty').addEventListener('click', function() {handleSortClick("getty_ref")});
document.getElementById('order-novati').addEventListener('click', function() {handleSortClick("novati_ref")});
document.getElementById('order-morgan').addEventListener('click', function() {handleSortClick("morgan_ref")});
document.getElementById('order-paris').addEventListener('click', function() {handleSortClick("paris_ref")});
document.getElementById('switch-theme').addEventListener('click', function() {toggleDarkMode()});
zhogoNote.addEventListener('blur', (e) => {
    const currentPiece = state.pieces[state.idx];
    const id_img = state.source.toLowerCase() + '_ref';
    localStorage.setItem(`notes_${state.source}_${currentPiece[id_img]}`, e.target.textContent);

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

if (localStorage.getItem('fioremini_theme')=="light") {
    document.getElementById("checkbox").checked = true;
    toggleDarkMode();
}
if (state.pieces[0].section == "intros"){
    handleReadIntro();
}

//state.idx = state.pieces.length - 1;
slider.max = state.pieces.length - 1;
slider.value = state.idx;
updateUI();