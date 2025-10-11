
// Variables globales
let currentTheme = '';
let currentDifficulty = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let totalQuestions = 10; // Nombre de questions par quiz

// Récupération des éléments du DOM
const sections = {
    home: document.getElementById('home'),
    themeChoice: document.getElementById('theme-choice'),
    difficultyChoice: document.getElementById('difficulty-choice'),
    quiz: document.getElementById('quiz'),
    results: document.getElementById('results')
};

const buttons = {
    start: document.getElementById('startBtn'),
    themes: document.querySelectorAll('.theme-btn'),
    difficulties: document.querySelectorAll('.difficulty-btn'),
    next: document.getElementById('next-btn'),
    restart: document.getElementById('restart-btn')
};

// Fonction pour afficher/cacher les sections
function showSection(sectionName) {
    // Cache toutes les sections
    Object.values(sections).forEach(section => {
        section.classList.remove('active');
    });
    
    // Affiche la section demandée
    sections[sectionName].classList.add('active');
}

                        // ENVENT LISTENER


// Bouton "Commencer" sur la page d'accueil
buttons.start.addEventListener('click', () => {
    showSection('themeChoice');
});

// Boutons de choix du thème
buttons.themes.forEach(btn => {
    btn.addEventListener('click', () => {
        currentTheme = btn.dataset.theme;
        showSection('difficultyChoice');
    });
});

// Boutons de choix de difficulté
buttons.difficulties.forEach(btn => {
    btn.addEventListener('click', () => {
        currentDifficulty = btn.dataset.difficulty;
        startQuiz();
    });
});

// Bouton "Recommencer"
buttons.restart.addEventListener('click', () => {
    // Réinitialiser tout
    currentQuestionIndex = 0;
    score = 0;
    showSection('home');
});



// Fonction pour mélanger un tableau (algorithme Fisher-Yates)
function shuffleArray(array) {
    const shuffled = [...array]; // Copie du tableau pour ne pas modifier l'original
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Échange
    }
    return shuffled;
}

// Fonction pour générer les questions selon le thème et la difficulté
function generateQuestions(theme, difficulty) {
    // Récupérer le vocabulaire du thème choisi
    let vocab = vocabularyData[theme];
    
    // Mélanger le vocabulaire
    vocab = shuffleArray(vocab);
    
    // Prendre seulement 10 mots au hasard
    vocab = vocab.slice(0, totalQuestions);
    
    // Générer les questions selon la difficulté
    const questions = vocab.map(word => {
        return createQuestion(word, difficulty, vocab);
    });
    
    return questions;
}

// Fonction pour créer une question QCM
function createQCM(word, numChoices, vocab) {
    // Récupérer toutes les autres traductions possibles
    const otherWords = vocab.filter(w => w.fr !== word.fr);
    
    // Mélanger et prendre (numChoices - 1) mauvaises réponses
    const wrongAnswers = shuffleArray(otherWords)
        .slice(0, numChoices - 1)
        .map(w => w.fr);
    
    // Créer le tableau de choix avec la bonne réponse
    const choices = [...wrongAnswers, word.fr];
    
    // MÉLANGER les choix pour que la bonne réponse soit à une position aléatoire
    const shuffledChoices = shuffleArray(choices);
    
    // Trouver l'index de la bonne réponse après mélange
    const correctIndex = shuffledChoices.indexOf(word.fr);
    
    return {
        type: 'qcm',
        question: word.en,
        choices: shuffledChoices,
        correctAnswer: correctIndex // On garde l'index de la bonne réponse
    };
}