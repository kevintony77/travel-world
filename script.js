
/* =========================
   IMPORT DATA
========================= */
import { countryData } from "./countryData.js";

/* =========================
   GLOBAL VARIABLES
========================= */
let countries;
const keys = Object.keys(countryData)
let country1;
let country2;

function getRandomTarget(startNode, graph, min, max) {
    let queue = [[startNode, 0]]
    let visited = new Set([[startNode]])
    let validTargets = []

    while (queue.length > 0) {
        let [current, dist] = queue.shift()
        if (dist >= min && dist <= max) {
            validTargets.push(current)
        }

        if (dist < max) {
            for (let neighbour of graph[current] ||[]) {
                if (!visited.has(neighbour)) {
                    visited.add(neighbour)
                    queue.push([neighbour, dist + 1])
                }
            }
        }
    }
    if (validTargets.length > 0) {
        return validTargets[Math.floor(Math.random() * validTargets.length)]
    } else {
        return null;
    }
}

// Logic to pick the pair
let found = false;
while (!found) {
    country1 = keys[Math.floor(Math.random() * keys.length)];
    country2 = getRandomTarget(country1, countryData, 3, 5);

    if (country2) {
        found = true;
    }
}


console.log(country1, country2)
const inputBox = document.querySelector('.country-names');
const dropdown = document.getElementById("dropdown");
const guessButton = document.querySelector('.guess-btn-js');

const el = document.querySelector('.content');
const frame = document.querySelector('.frame');
const toggleBoundary = document.querySelector('.toggle-boundary')
toggleBoundary.addEventListener('click', ()=>{
    if(toggleBoundary.classList.contains('enabled')){
        toggleBoundary.classList.remove('enabled');
        toggleBoundary.classList.add('disabled')
        document.querySelector('.world-map').style.fill = '#00000000'
    } else{
        toggleBoundary.classList.remove('disabled');
        toggleBoundary.classList.add('enabled')
        document.querySelector('.world-map').style.fill = '#353532'
    }
})
const toggleMap = document.querySelector('.toggle-map')
toggleMap.addEventListener('click', ()=>{
    if(toggleMap.classList.contains('enabled')){
        toggleMap.classList.remove('enabled');
        toggleMap.classList.add('disabled')
        document.querySelector('.world-map').style.stroke = 'none'
    } else{
        toggleMap.classList.remove('disabled');
        toggleMap.classList.add('enabled')
        console.log('hi')
        document.querySelector('.world-map').style.stroke = 'white'
    }
})

let guesses = [];

let isDragging = false;
let lastX, lastY;
let currentX = 0;
let currentY = 0;

/* =========================
   LOAD SVG MAP
========================= */
fetch('world-final.svg')
    .then(res => res.text())
    .then(svg => {
        el.innerHTML = svg;
        countries = el.querySelectorAll('.country');
        focusOnTwoCountries(country1, country2);
    });

/* =========================
   CENTER BETWEEN 2 COUNTRIES
========================= */
function focusOnTwoCountries(country1, country2) {

    const el1 = document.querySelector(`.${country1}`);
    const el2 = document.querySelector(`.${country2}`);

    document.querySelectorAll(`.${country1}`).forEach(el => el.style.fill = '#AEF359');
    document.querySelectorAll(`.${country2}`).forEach(el => el.style.fill = '#AEF359');

    if (!el1 || !el2) return;

    const box1 = el1.getBBox();
    const box2 = el2.getBBox();

    const centerX = (box1.x + box1.width / 2 + box2.x + box2.width / 2) / 2;
    const centerY = (box1.y + box1.height / 2 + box2.y + box2.height / 2) / 2;

    const frameRect = frame.getBoundingClientRect();

    currentX = frameRect.width / 2 - centerX;
    currentY = frameRect.height / 2 - centerY;

    clampPosition();
    update();
}

/* =========================
   BFS WIN CHECK
========================= */
function canWin(start, end, guesses, neighbours) {
    const allowed = new Set(guesses);
    const queue = [start];
    const visited = new Set([start]);

    while (queue.length > 0) {
        const current = queue.shift();

        if (current == end) return true;

        for (const next of neighbours[current] || []) {
            if (!visited.has(next) && allowed.has(next) || next === end) {
                visited.add(next);
                queue.push(next);
            }
        }
    }
    return false;
}

/* =========================
   DROPDOWN AUTOCOMPLETE
========================= */
inputBox.addEventListener("input", () => {

    const value = inputBox.value.toLowerCase();
    dropdown.innerHTML = "";

    if (!value) return;

    const matches = Object.keys(countryData).filter(c =>
        c.toLowerCase().includes(value)
    );

    matches.forEach(country => {
        const div = document.createElement("div");
        div.classList.add('drop-element');
        div.textContent = country;

        if (matches.length == 1) div.style.border = 'none';

        div.addEventListener("click", () => {
            inputBox.value = country;
            dropdown.innerHTML = "";
        });

        dropdown.appendChild(div);
    });
});

/* =========================
   GUESS FUNCTION
========================= */
function guessCountry() {

    const value = inputBox.value.toLowerCase();
    if (!value) return;

    if (!guesses.includes(value)
        && document.querySelector(`.${value}`)
        && value !== country1
        && value !== country2) {

        guesses.push(value);

        document.querySelectorAll(`.${value}`).forEach(el => {
            el.style.fill = '#c1dea7';
        });
    }

    const win = canWin(country1, country2, guesses, countryData);

    if (win) alert("YOU WIN!");

    dropdown.innerHTML = '';
    inputBox.value = '';
}

/* =========================
   EVENTS
========================= */
guessButton.addEventListener('click', guessCountry);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        guessCountry();
    }
});

/* =========================
   DRAGGING MAP
========================= */
el.addEventListener('pointerdown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    el.setPointerCapture(e.pointerId);
});

el.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    currentX += dx;
    currentY += dy;

    clampPosition();
    update();

    lastX = e.clientX;
    lastY = e.clientY;
});

el.addEventListener('pointerup', () => {
    isDragging = false;
});

/* =========================
   TRANSFORM HELPERS
========================= */
function update() {
    el.style.transform = `translate(${currentX}px, ${currentY}px)`;
}

function clampPosition() {
    const frameRect = frame.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const minX = frameRect.width - elRect.width;
    const minY = frameRect.height - elRect.height;

    currentX = Math.min(0, Math.max(currentX, minX));
    currentY = Math.min(0, Math.max(currentY, minY));
}
