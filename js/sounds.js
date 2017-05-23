var BubbleShoot = window.BubbleShoot || {}
BubbleShoot.Sounds = (function () {
    //tablica dźwięków
    let soundObjects = []
    //inicjalizacja dźwięku przy realizacji kodu
    for (let i = 0; i < 10; i++) {
        soundObjects.push(new Audio())
    }
    //numer wyknywanego dźwięku
    let curSoundNum = 0,
    //obiekt do odtwarzania dźwięku
        Sounds = {
        //metoda odtwarzająca
        play: function (url, volume) {
            if (Modernizr.audio) {
                //pobieramy dźwięk z tablicy
                let sound = soundObjects[curSoundNum]
                    //ustawiamy jego właściwość src na adres pliku do odtworzenia
                    sound.src = url
                    //ustawiamy głośność
                    sound.volume = volume
                    //odtwarzamy dźwięk
                    sound.play()
                    //iterujemy aby odtworzyć kolejny dźwięk
                    curSoundNum++
                    //sprawdzamy czy nr aktualnego dźwięku nie jest większy niż liczba dźwięków w tablicy
                if (curSoundNum >= soundObjects.length) {
                    curSoundNum = curSoundNum % soundObjects.length
                }
            }
        }
    }
    return Sounds
})()