const translations = {
    uz: {
        title: "1-Dars: Ingliz Alifbosi",
        alphabetTitle: "Ingliz tili alifbosi",
        note: "Harflar ustiga bosish orqali ularni talaffuzini eshitish mumkin!",
        vowelsTitle: "Unli harflar (Vowels):",
        vowelsNote: "Ingliz tilida 5 ta asosiy unli harf bor, ammo ular turli talaffuzda qo‘llaniladi.",
        consonantsTitle: "Undosh harflar (Consonants):",
        speakingTitle: "Gapirish",
        speakingNote: "Salomlashuv jumlalari bilan boshlang.",
    },
    en: {
        title: "Lesson 1: English Alphabet",
        alphabetTitle: "English Alphabet",
        note: "Click on letters to hear their pronunciation!",
        vowelsTitle: "Vowels:",
        vowelsNote: "English has 5 main vowels, but they are pronounced differently.",
        consonantsTitle: "Consonants:",
        speakingTitle: "Speaking",
        speakingNote: "Start with greeting phrases.",
    },
    ru: {
        title: "Урок 1: Английский Алфавит",
        alphabetTitle: "Английский алфавит",
        note: "Нажмите на буквы, чтобы услышать их произношение!",
        vowelsTitle: "Гласные буквы:",
        vowelsNote: "В английском языке 5 основных гласных, но они произносятся по-разному.",
        consonantsTitle: "Согласные буквы:",
        speakingTitle: "Разговорная речь",
        speakingNote: "Начните с фраз для приветствия.",
    },
};

document.getElementById('language-selector').addEventListener('change', function (event) {
    const selectedLanguage = event.target.value;
    const texts = translations[selectedLanguage];

    // Sahifadagi matnlarni yangilash
    document.querySelector('h1').innerText = texts.title;
    document.querySelector('#alphabet-section h2').innerText = texts.alphabetTitle;
    document.querySelector('#alphabet-section .word').innerText = texts.note;
    document.querySelector('#vowels-section h2').innerText = texts.vowelsTitle;
    document.querySelector('#vowels-section .word').innerText = texts.vowelsNote;
    document.querySelector('#consonants-section h2').innerText = texts.consonantsTitle;
    document.querySelector('#speaking-section h2').innerText = texts.speakingTitle;
    document.querySelector('#speaking-section .speaking-item .description strong').innerText = texts.speakingNote;
});
// Theme toggle button
const themeToggle = document.getElementById("theme-toggle");

// Check saved theme from localStorage
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "🌙"; // Show moon icon
}

// Toggle theme
themeToggle.onclick = function () {
    document.body.classList.toggle("dark-mode");

    // Update button icon
    if (document.body.classList.contains("dark-mode")) {
        themeToggle.textContent = "🌙"; // Moon icon for dark mode
        localStorage.setItem("theme", "dark");
    } else {
        themeToggle.textContent = "🌞"; // Sun icon for light mode
        localStorage.setItem("theme", "light");
    }
};
// Speak Alphabet Letter
function speakLetter(letter) {
    const speech = new SpeechSynthesisUtterance(letter);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
}

// Speak Word
function speakWord(word) {
    const speech = new SpeechSynthesisUtterance(word);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
}

// Speak Sentence
function speakSentence(sentence) {
    const speech = new SpeechSynthesisUtterance(sentence);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
}

// Speak Text
function speakText() {
    const text = document.getElementById("user-input").value;
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
}

// Save and manage tasks
const saveBtn = document.getElementById('save-btn');
const userInput = document.getElementById('user-input');
const tasksContainer = document.getElementById('tasks');
const checkBtn = document.getElementById('check-btn');
const confirmationMessage = document.getElementById('confirmation-message');
const chatgptLink = document.getElementById('chatgpt-link');
const savedTasksHeading = document.getElementById('saved-tasks-heading');

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasksContainer.innerHTML = '';
    savedTasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        taskItem.innerHTML = `
            <span>${index + 1}. ${task}</span>
            <button class="delete-btn" onclick="deleteTask(${index})">O'chirish</button>
        `;
        tasksContainer.appendChild(taskItem);
    });

    // Show or hide "check-btn" based on tasks
    if (savedTasks.length > 0) {
        checkBtn.style.display = 'inline-block';
        savedTasksHeading.style.display = 'block';
    } else {
        checkBtn.style.display = 'none';
        savedTasksHeading.style.display = 'none';
    }
}

// Save task button click event
saveBtn.onclick = function() {
    const task = userInput.value.trim();
    if (task) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        userInput.value = ''; // Clear input field
        loadTasks(); // Reload tasks
    } else {
        alert('Iltimos, javob yozing!');
    }
};

// Check button click event
checkBtn.onclick = function() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (savedTasks.length === 0) {
        alert('Hech qanday javob yozilmagan!');
        return;
    }

    // Prepare the text for clipboard
    let message = "Men yozgan gaplarimni tekshirib ber. Ular grammatik jihatdan toʻgʻrimi? Ular:\n";
    savedTasks.forEach((task, index) => {
        message += `${index + 1}. ${task}\n`;
    });

    // Copy to clipboard
    const el = document.createElement('textarea');
    el.value = message;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    // Show confirmation and ChatGPT link
    confirmationMessage.style.display = 'block';
    chatgptLink.style.display = 'block';
};

// Delete task
function deleteTask(index) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks(); // Reload tasks
}

    // Yilni olish va o'zgartirish
    document.getElementById('current-year').textContent = new Date().getFullYear();

// On window load, load tasks
window.onload = function() {
    loadTasks();
};
