 // Motivatsiyalar ro'yxati
    const motivations = [
      "Kuchli bo'lish uchun, avvalo, zaif bo'lishni qabul qil.",
      "Hech kim mukammal emas, lekin har kim mukammallikka erishish yo‘lida harakat qilishi kerak.",
      "Hayotingni o'zgartirishning birinchi qadami — o'zingni o'zgartirishdir.",
      "Har bir katta muvaffaqiyat kichik harakatlardan boshlanadi.",
      "Muvaffaqiyatni o'z ichingda topasan, unga erishish esa sening qo'lingda.",
      "Yaxshi boshlanish — muvaffaqiyatning yarmisi.",
      "Yangi boshlovchi hech qachon oldinga intilmaslikni tasavvur qilmasin, chunki har bir katta o'zgarish kichik qadamlardan boshlanadi.",
      "Muvaffaqiyatga erishish uchun eng muhim narsa, boshlash va to'xtamaslikdir.",
      "Ko‘p muvaffaqiyatlar faqat o‘z orzulariga ishonadiganlar tomonidan qo‘lga kiritiladi.",
      "To‘xtamasdan harakat qil, va muvaffaqiyat seni kutmoqda.",
      "Yaxshi bo‘lish oson emas, ammo o‘zingni doimiy ravishda o‘zgartirishda ulug‘lik bor.",
      "O‘zingni sinash, o‘z orzularingni amalga oshirishning eng yaxshi usulidir.",
      "Eng katta muvaffaqiyat — o‘zini yengib, yangi imkoniyatlar yaratishdir.",
      "Muvaffaqiyat — bu faqatgina qat'iyatli va intilishli bo‘lganlarning qo‘lida.",
      "Hech narsa seni to‘xtata olmaydi, agar sen o‘z orzularingni birinchi o‘ringa qo‘ysang.",
      "Orzularni amalga oshirish uchun yolg‘iz faqat haqiqiy xohish kerak.",
      "Birinchi qadamni qo‘yish — bu yuksakliklarga erishishning boshlanishidir.",
      "Xatolarni qabul qil, ular seni yanada kuchliroq qiladi.",
      "Muvaffaqiyatli odamlar hech qachon o‘zgarmaydi, ular harakat qilishni hech qachon to‘xtatmaydi.",
      "Sabr va qat'iyat muvaffaqiyatning eng yaxshi usulidir.",
      "Sizni hech narsa to‘xtata olmaydi, faqat o‘zingizni to‘xtatmasangiz.",
      "Kelajakni o‘zgartirish uchun, hozirgi paytda harakat qilish kerak.",
      "Ishonch, harakat va orzu — muvaffaqiyatga erishishning uchta asosiy kaliti.",
      "Birinchi marta muvaffaqiyatsizlikka uchraganingda, tushkunlikka tushmang, bu keyingi muvaffaqiyatning boshlanishidir.",
      "To‘g‘ri vaqtni kutish — bu faqat qaror qabul qilishni kechiktirishdir. Bugun boshlash kerak.",
      "Xatolardan o‘rganish va davom etish muvaffaqiyatga olib keladi.",
      "Fikrlashni boshlagandan keyin, o‘zingni o‘zgartirganingda dunyo sen bilan o‘zgara boshlaydi.",
      "Muvaffaqiyatga erishishning eng muhim faktori — o‘z maqsadinga qattiq yopishishdir.",
      "Agar sen o‘z orzularingga ishonmasang, kimdir seni to‘g‘ri yo‘lga solishi mumkin.",
      "Yagona to‘siq — sening o‘zingning ishonching va qat'iyliging."
    ];

    // Motivatsiya matnini tasodifiy tarzda yangilash
    function changeMotivation() {
      const randomIndex = Math.floor(Math.random() * motivations.length);
      document.getElementById('motivation').textContent = motivations[randomIndex];
    }

    // Sahifa yuklanganda motivatsiyani yangilash
    window.onload = changeMotivation;
