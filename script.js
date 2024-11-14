async function checkAnswer() {
    const userAnswer = document.getElementById('userAnswer').value.trim();  // Foydalanuvchidan javobni olish
    if (userAnswer === "") {
        alert("Please enter your answer.");  // Agar javob bo'lmasa, xabar berish
        return;
    }

    const responseDiv = document.getElementById('response');
    responseDiv.innerHTML = "Checking...";  // Javobni tekshirib bo'layotganini bildirish

    try {
        // Backendga so'rov yuborish (yangi yo'l '/check-text' deb to'g'irlash)
        const response = await fetch('http://localhost:3000/check-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: userAnswer })  // Foydalanuvchi kiritgan matnni yuborish
        });

        const data = await response.json();  // Backenddan javobni olish
        responseDiv.innerHTML = data.message;  // Javobni ekranda ko'rsatish
        responseDiv.style.color = data.correct ? "green" : "red";  // To'g'ri yoki noto'g'ri javobni rang bilan ko'rsatish
    } catch (error) {
        responseDiv.innerHTML = `Error: ${error.message}`;  // Xatolik yuzaga kelsa, xabarni ko'rsatish
        responseDiv.style.color = "red";
    }
}
