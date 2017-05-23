//sprawdzamy czy BoobleShot istnieje, przypisanie do zmiennej JS
var BubbleShoot = window.BubbleShoot || {}
//definiuje BubbleShot.Game
BubbleShoot.Game = (function ($) {
    //przypisanie funkcji do wartości Game
    let Game = function () {
        //inicjacja zmiennej
        let curBubble,
            board,
            numBubbles,
        //tablica przechowywująca stany wszystkich bombelków
            bubbles = [],
            MAX_BUBBLES = 201,
        //liczba punktów za każdy pęknięty bombelek
            POINTS_PER_BUBBLE = 50,
        //aktualny poziom
            level = 0,
        //aktualny wynik
            score = 0,
        //najlepszy wynik
            highScore = 0,
        //czas klatki animacji
            requestAnimationID,
        //maksymalna liczba rzędów przy której gracz przegrywa
            MAX_ROWS = 11
        //tworzymy metodę o nazwię init
        this.init = function () {
            if (BubbleShoot.Renderer) {
                BubbleShoot.Renderer.init(function () {
                    $(".but_start_game").click("click", startGame)
                })
            } else {
                $(".but_start_game").bind("click", startGame)
            }
            //jeżeli magazyn lokalny jest wspierany i high_score istnieje
            if (window.localStorage && localStorage.getItem("high_score")) {
                //przypisujemy wartości highScore wartość z magazyny i wyświetlamy jako liczbę
                highScore = parseInt(localStorage.getItem("high_score"))
            }
            //wyświetlamy najlepszy wynik
            BubbleShoot.ui.drawHighScore(highScore)
        }
        //dodajemy metodę prywatną o nazwie start game
        let startGame = function () {
            //losujemy tło gry
            let images = ['./img/bubble.jpg', './img/bubbles-bubble-water-macro-86440.jpeg', './img/drop-of-water-drip-blade-of-grass-blossom-55818.jpeg', './img/soap-bubble-colorful-ball-soapy-water.jpg'],
                i = Math.floor(Math.random() * images.length),
                gameBackground = document.getElementById('game')
            gameBackground.style.background = 'url('+ images[i]+')center'
            gameBackground.style.backgroundSize = 'cover'
            //dodajemy funkcję odwrotną abu uniknąć podwujnych kliknięć podczas zanikania okna
            $(".but_start_game").unbind("click")
            //przypisanie liczby bombelków do wystrzeleni
            // if (level == 5) {
            //     numBubbles = 150
            // } else if (level > 16) {
            //     numBubbles = 30
            // } else if (level >= 7) {
            //     numBubbles = 40 - (level - 5)
            // } else {
           numBubbles = MAX_BUBBLES - level * 5;
            // }
            //wywołanie funkcji zamykania okna
            BubbleShoot.ui.hideDialog()
            //pobieramy tablicę do zmiennej 
            board = new BubbleShoot.Board()
            //zasilamy tablicę stanów wartościami 
            bubbles = board.getBubbles()
            //dodanie nowego bombelka na plansze
            curBubble = getNextBubble()
            //sprawdzenie czy render istnieje
            if (BubbleShoot.Renderer) {
                if (!requestAnimationID)
                //ustawiamy czas odrysowanie 1 klatki
                    requestAnimationID = requestAnimationFrame(renderFrame)
            } else {
                //rysowanie tablicy na planszy         
                BubbleShoot.ui.drawBoard(board)
            }
            curBubble = getNextBubble();
            //kliknięcie i strzelenie bombelkiem
            $("#game").bind("click", clickGameScreen)
            //aktualizujemy wyniki i poziom
            BubbleShoot.ui.drawScore(score)
            BubbleShoot.ui.drawLevel(level)

        },
        //dodanie kolejnego bombelka na pozycje strzelecką
            getNextBubble = function () {
            let bubble = BubbleShoot.Bubble.create()
            //dodajemy bomblek do tablicy stanów
            bubbles.push(bubble)
            bubble.setState(BubbleShoot.BubbleState.CURRENT) 
            bubble.getSprite().addClass("cur_bubble")
            //pobieranie współrzędnych z ui.js do wytenderowania bombelka
            let top = 430,
                left = ($("#board").width() - BubbleShoot.ui.BUBBLE_DIMS) / 2
            bubble.getSprite().css({
                top: top,
                left: left
            })
            $("#board").append(bubble.getSprite())
            //wyświetla liczbę pozostałych bombelków
            BubbleShoot.ui.drawBubblesRemaining(numBubbles)
            numBubbles--
            return bubble
        },
        //strzelanie bombelkami
            clickGameScreen = function (e) {
            var angle = BubbleShoot.ui.getBubbleAngle(curBubble.getSprite(), e),
                duration = 750,
                distance = 1000,
            //inicjacja kolizji
                collision = BubbleShoot.CollisionDetector.findIntersection(curBubble,
                board, angle)
            //sprawdzenie czy kolizja wystąpiła
            if (collision) {
                var coords = collision.coords
                //przyklejenie się bombelka w miejscu kolizji
                duration = Math.round(duration * collision.distToCollision / distance)
                //metoda precyzująca docelowe miejsca na tablicy
                board.addBubble(curBubble, coords)
                //pobieramy grupe bombelków
                let group = board.getGroup(curBubble, {})
                //sprawdzamy czy grupa liczy więcej niż 3 bombelki
                if (group.list.length >= 3) {
                    //metoda pękania
                    popBubbles(group.list, duration)
                    //sprawdzenie czy poziom powinien się już skończyć
                    //pobieramy górny rząd
                    let topRow = board.getRows()[0],
                        topRowBubbles = []
                    //sprawdzamy w pętli ilość bombelków w górnym rzędzie
                    for (let i = 0; i < topRow.length; i++) {
                        if (topRow[i])
                            topRowBubbles.push(topRow[i])
                    }
                    //jeżeli mamy w nim  5 lub mniej bombelków
                    if (topRowBubbles.length <= 5) {
                        //wszystkie górne bombelki pękają
                        popBubbles(topRowBubbles, duration)
                        //dodajemy je do listy bombelków (doliczamy je do punktacji)
                        group.list.concat(topRowBubbles)
                    }
                    //pobieramy powstałe sieroty
                    let orphans = board.findOrphans(),
                    //opuźnienie usuniecia sierot
                        delay = duration + 400 + 60 * group.list.length
                    //animacja uzunięcia sierot
                    dropBubbles(orphans, delay)
                    //tworzymy toblice wszystkich skasowanych bombelków
                    let popped = [].concat(group.list, orphans),
                    //przemnarzamy punkty za bombelka przez tablicę
                        points = popped.length * POINTS_PER_BUBBLE
                    //dodajemy wynik do nagromadzonych juz punktów
                    score += points
                    //wynik aktualizujemy dopiero po zniknięciu bombelków
                    setTimeout(function () {
                        BubbleShoot.ui.drawScore(score)
                    }, delay)
                }
                //jezleli grupa nie liczy więcej niż 3 bombelki zapisujemy położenie nowego bombelka
            } else {
                let distX = Math.sin(angle) * distance,
                    distY = Math.cos(angle) * distance,
                    bubbleCoords = BubbleShoot.ui.getBubbleCoords(curBubble.getSprite()),
                    coords = {
                    x: bubbleCoords.left + distX,
                    y: bubbleCoords.top - distY
                }
            }
            //animacja strzału i pobranie kolejnego bombelka na pozycję
            BubbleShoot.ui.fireBubble(curBubble, coords, duration)
            //sprawdzenie czy gracz nie przekroczył maksymalnej dozwolonej liczby rzędów
            if (board.getRows().length > MAX_ROWS) {
                endGame(false)
                //sprawdzamy czy graczowi nie skończyły się bombelki
            } else if (numBubbles == 0) {
                endGame(false)
                //sprawdzamy czy plansza nie jest pusta
            } else if (board.isEmpty()) {
                endGame(true)
                //jeżeli nic nie następuje pobieramy kolejny bombelek
            } else {
                curBubble = getNextBubble(board)
            }
        },
        //metoda pękania bombelków
            popBubbles = function (bubbles, delay) {
            //sprawdzamy każdy obiekt w pętli
            $.each(bubbles, function () {
                let bubble = this
                //wywołujemy animacje dla każdego obiektu po kolei
                setTimeout(function () {
                    bubble.setState(BubbleShoot.BubbleState.POPPING)
                    //animacja właściwa
                    bubble.animatePop()
                    setTimeout(function () {
                        bubble.setState(BubbleShoot.BubbleState.POPPED)
                    }, 400)
                    //w momęcie pękania każdego bombelka odtwarzamy dźwięk z losową głośnością
                    BubbleShoot.Sounds.play("mp3/pop.mp3", Math.random() * .5 + .5)
                }, delay)
                //informujemy plansze że obiekt powinien zostać usunięty
                board.popBubbleAt(this.getRow(), this.getCol())
                setTimeout(function () {
                    bubble.getSprite().remove()
                    //poczekanie na koniec animacji
                }, delay + 400)
                delay += 60
            })
        },
        //animacja usunięcia sierot
            dropBubbles = function (bubbles, delay) {
            $.each(bubbles, function () {
                let bubble = this
                //usuwa bombelki z planszy
                board.popBubbleAt(bubble.getRow(), bubble.getCol())
                setTimeout(function () {
                    bubble.setState(BubbleShoot.BubbleState.FALLING)
                    //animacja spadania ich z ekranu
                    bubble.getSprite().kaboom({
                        callback: function () {
                            //usuwanie bombelków z pamięci
                            bubble.getSprite().remove()
                            bubble.setState(BubbleShoot.BubbleState.FALLEN)
                        }
                    })
                }, delay)
            })
        },
        //metoda oczekiwania na narysowanie kolejnej kladki
            renderFrame = function () {
            $.each(bubbles, function () {
                //jeżeli metoda jest zdefiniowana
                if (this.getSprite().updateFrame)
                //wywołujemy ją 
                    this.getSprite().updateFrame()
            })
            BubbleShoot.Renderer.render(bubbles)
            requestAnimationID = requestAnimationFrame(renderFrame)
        },
        //metoda kończenia gry / okno przejścia między poziomami
            endGame = function (hasWon) {
            //sprawdzenie punktacji i porównanie z najlepszym wynikiem
            if (score > highScore) {
                //nadpisanie najlepszego wyniku
                highScore = score
                //pokazanie najlepszego wyniku w oknie
                $("#new_high_score").show()
                //gratulacje jeśli wynik został pobity
                BubbleShoot.ui.drawHighScore(highScore)
                //sprawdzenie czy zmienna lokalna jest wspierana przez przeglondarkę
                if (window.localStorage) {
                    //zapisywanie wyniku
                    localStorage.setItem("high_score", highScore)
                }
                //jeżeli nie komunikat jest ukryty
            } else {
                $("#new_high_score").hide()
                //sprawdzanie czy gracz wygrał
            }
            if (hasWon) {
                //jeśli tak dodanie kolejnego levelu
                level++
            } else {
                //jeśli nie zerujemy level i punkty
                score = 0
                level = 0
            }
            //przypisujemy zdarzenie do przycisku
            $(".but_start_game").click("click", startGame)
            //czyścimy tablicę
            $("#board .bubble").remove()
            //włączamy metodę końca gry
            BubbleShoot.ui.endGame(hasWon, score)
        }
    }
    //wybieranie aktualizowania animacji w canvas
    window.requestAnimationFrame = Modernizr.prefixed("requestAnimationFrame",
        window) || function (callback) {
        window.setTimeout(function () {
            callback()
        }, 40)
    }
    return Game
})(jQuery)