
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

                // QUESTIONS

// Fonction pour créer une question selon la difficulté
function createQuestion(word, difficulty, vocab) {
    switch(difficulty) {
        case 'easy':
            // 50% QCM, 50% Vrai/Faux
            return Math.random() > 0.5 
                ? createQCM(word, 4, vocab)
                : createTrueFalse(word, vocab);
        
        case 'medium':
            // QCM avec 3 choix
            return createQCM(word, 3, vocab);
        
        case 'hard':
            // Question où il faut écrire la réponse (FR → EN)
            return createWriteAnswer(word);
        
        default:
            return createQCM(word, 4, vocab);
    }
}

// Fonction pour créer une question Vrai/Faux
function createTrueFalse(word, vocab) {
    // 50% de chances d'avoir la bonne traduction
    const isCorrect = Math.random() > 0.5;
    
    let proposedTranslation;
    if (isCorrect) {
        proposedTranslation = word.fr;
    } else {
        // Prendre une mauvaise traduction au hasard
        const otherWords = vocab.filter(w => w.fr !== word.fr);
        const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
        proposedTranslation = randomWord.fr;
    }
    
    return {
        type: 'trueFalse',
        question: `"${word.en}" signifie "${proposedTranslation}"`,
        correctAnswer: isCorrect
    };
}

// Fonction pour créer une question à écrire (difficile)
function createWriteAnswer(word) {
    return {
        type: 'write',
        question: word.fr, // On donne le français
        correctAnswer: word.en.toLowerCase().trim() // La réponse attendue en anglais
    };
}

// Fonction pour démarrer le quiz
function startQuiz() {
    // Générer les questions
    currentQuestions = generateQuestions(currentTheme, currentDifficulty);
    currentQuestionIndex = 0;
    score = 0;
    
    // Afficher la section quiz
    showSection('quiz');
    
    // Afficher la première question
    displayQuestion();
}

                // AFFICHER

// Fonction pour afficher une question
function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    // Mettre à jour le numéro de question et le score
    document.getElementById('question-number').textContent = `Question ${currentQuestionIndex + 1}/${totalQuestions}`;
    document.getElementById('score').textContent = `Score: ${score}`;
    
    // Afficher la question
    document.getElementById('question-text').textContent = question.question;
    
    // Cacher le feedback et le bouton suivant
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    buttons.next.style.display = 'none';
    
    // Réinitialiser les containers
    const choicesContainer = document.getElementById('choices-container');
    const writeContainer = document.getElementById('write-container');
    choicesContainer.innerHTML = '';
    choicesContainer.style.display = 'none';
    writeContainer.style.display = 'none';
    
    // Afficher selon le type de question
    if (question.type === 'qcm') {
        displayQCM(question);
    } else if (question.type === 'trueFalse') {
        displayTrueFalse(question);
    } else if (question.type === 'write') {
        displayWriteAnswer(question);
    }

    // Dans displayQuestion(), ajoute ça à la fin :
const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;
document.getElementById('progress-bar').style.width = progressPercent + '%';
}

// Afficher une question QCM
function displayQCM(question) {
    const choicesContainer = document.getElementById('choices-container');
    choicesContainer.style.display = 'block';
    
    question.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice;
        button.addEventListener('click', () => checkAnswer(index));
        choicesContainer.appendChild(button);
    });
}

// Afficher une question Vrai/Faux
function displayTrueFalse(question) {
    const choicesContainer = document.getElementById('choices-container');
    choicesContainer.style.display = 'block';
    
    const trueBtn = document.createElement('button');
    trueBtn.className = 'choice-btn';
    trueBtn.textContent = 'Vrai ✓';
    trueBtn.addEventListener('click', () => checkAnswer(true));
    
    const falseBtn = document.createElement('button');
    falseBtn.className = 'choice-btn';
    falseBtn.textContent = 'Faux ✗';
    falseBtn.addEventListener('click', () => checkAnswer(false));
    
    choicesContainer.appendChild(trueBtn);
    choicesContainer.appendChild(falseBtn);
}

// Afficher une question à écrire
function displayWriteAnswer(question) {
    const writeContainer = document.getElementById('write-container');
    writeContainer.style.display = 'block';
    
    const input = document.getElementById('answer-input');
    input.value = '';
    input.disabled = false;  // ← Réactive l'input !
    input.focus();
    
    const submitBtn = document.getElementById('submit-answer');
    submitBtn.disabled = false;  // ← Réactive le bouton !
    
    // Retirer les anciens event listeners
    const newSubmitBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
    
    // Ajouter le nouveau event listener
    newSubmitBtn.addEventListener('click', () => {
        const userAnswer = input.value.toLowerCase().trim();
        checkAnswer(userAnswer);
    });
    
    // Permettre de valider avec Entrée
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const userAnswer = input.value.toLowerCase().trim();
            checkAnswer(userAnswer);
        }
    });
}

            // VERIFIER LA REPONSE

// Fonction pour vérifier la réponse
function checkAnswer(userAnswer) {
    const question = currentQuestions[currentQuestionIndex];
    let isCorrect = false;
    
    // Vérifier selon le type de question
    if (question.type === 'qcm') {
        isCorrect = userAnswer === question.correctAnswer;
    } else if (question.type === 'trueFalse') {
        isCorrect = userAnswer === question.correctAnswer;
    } else if (question.type === 'write') {
        isCorrect = userAnswer === question.correctAnswer;
    }
    
    // Mettre à jour le score
    if (isCorrect) {
        score++;
        document.getElementById('score').textContent = `Score: ${score}`;
    }
    
    // Afficher le feedback
    showFeedback(isCorrect, question);
    
    // Désactiver les boutons de réponse
    disableAnswerButtons();
    
    // Afficher le bouton "Question suivante"
    buttons.next.style.display = 'block';
}

// Afficher le feedback (correct/incorrect)
function showFeedback(isCorrect, question) {
    const feedback = document.getElementById('feedback');
    
    if (isCorrect) {
        feedback.textContent = '✓ Correct !';
        feedback.className = 'feedback correct';
    } else {
        // Afficher la bonne réponse selon le type
        let correctAnswerText = '';
        
        if (question.type === 'qcm') {
            correctAnswerText = question.choices[question.correctAnswer];
        } else if (question.type === 'trueFalse') {
            correctAnswerText = question.correctAnswer ? 'Vrai' : 'Faux';
        } else if (question.type === 'write') {
            correctAnswerText = question.correctAnswer;
        }
        
        feedback.textContent = `✗ Incorrect ! La bonne réponse était : ${correctAnswerText}`;
        feedback.className = 'feedback incorrect';
    }
}

// Désactiver les boutons de réponse après avoir répondu
function disableAnswerButtons() {
    // Désactiver les boutons QCM/Vrai-Faux
    const choiceBtns = document.querySelectorAll('.choice-btn');
    choiceBtns.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
        btn.style.opacity = '0.6';
    });
    
    // Désactiver l'input et le bouton pour les questions à écrire
    const input = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-answer');
    input.disabled = true;
    submitBtn.disabled = true;
}

// Bouton "Question suivante"
buttons.next.addEventListener('click', () => {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < totalQuestions) {
        // Il reste des questions
        displayQuestion();
    } else {
        // Quiz terminé
        showResults();
    }
});

// Afficher les résultats finaux
function showResults() {
    showSection('results');
    
    document.getElementById('final-score').textContent = score;
    
    const percentage = (score / totalQuestions) * 100;
    const messageElement = document.getElementById('result-message');
    
    if (percentage === 100) {
        messageElement.textContent = '🏆 Parfait ! Tu maîtrises ce vocabulaire !';
        messageElement.style.color = '#4CAF50';
    } else if (percentage >= 80) {
        messageElement.textContent = '👏 Excellent travail ! Continue comme ça !';
        messageElement.style.color = '#8BC34A';
    } else if (percentage >= 60) {
        messageElement.textContent = '👍 Pas mal ! Encore un peu de révision et ce sera parfait !';
        messageElement.style.color = '#FFC107';
    } else if (percentage >= 40) {
        messageElement.textContent = '💪 Continue à réviser, tu vas y arriver !';
        messageElement.style.color = '#FF9800';
    } else {
        messageElement.textContent = '📚 N\'hésite pas à revoir le vocabulaire et recommence !';
        messageElement.style.color = '#FF5722';
    }
}

