function checkAnswer() {
    const userAnswer = document.getElementById('userAnswer').value.trim();
    const correctAnswer = "Men talabaman."; // To'g'ri javob

    const responseDiv = document.getElementById('response');

    if (userAnswer === "") {
        responseDiv.innerHTML = "Please enter your translation.";
        responseDiv.style.color = "red";
        return;
    }

    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        responseDiv.innerHTML = "Correct! Well done.";
        responseDiv.style.color = "green";
    } else {
        responseDiv.innerHTML = "Oops! The correct answer is: " + correctAnswer;
        responseDiv.style.color = "red";
    }
}
