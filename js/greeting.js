function updateGreeting() {
    const now = new Date();
    const hours = now.getHours();
    let greeting = "";

    if (hours >= 5 && hours < 12) {
        greeting = "Xayrli tong!";
    } else if (hours >= 12 && hours < 17) {
        greeting = "Xayrli kun!";
    } else if (hours >= 17 && hours < 20) {
        greeting = "Xayrli kech!";
    } else if (hours >= 20 && hours < 23) {
        greeting = "Xayrli oqshom!";
    } else {
        greeting = "Xayrli tun!";
    }

    document.getElementById('greeting').textContent = greeting;
}

// Har soniyada yangilash uchun
setInterval(updateGreeting, 1000);
updateGreeting();
