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
