//sprawdza czhy BobbleShot istnieje i przypisuje go do zmiennej
var BubbleShoot = window.BubbleShoot || {}
//dafiniuje BubbleGame.ui
BubbleShoot.ui = (function ($) {

    var ui = {
        //odstępy między bombelkami
        BUBBLE_DIMS: 44,
        ROW_HEIGHT: 38,
        init: function () {

        },
        hideDialog: function () {
            $(".dialog").slideUp(500)
        },
        //pobieranie pozycji kursora
        getMouseCoords: function (e) {
            let coords = {
                x: e.pageX,
                y: e.pageY
            }
            return coords
        },
        //pobieranie pozycji bombelka
        getBubbleCoords: function (bubble) {
            let bubbleCoords = bubble.position()
                bubbleCoords.left += ui.BUBBLE_DIMS / 2
                bubbleCoords.top += ui.BUBBLE_DIMS / 2
            return bubbleCoords
        },
        
        //pobieranie konta strzelania
        getBubbleAngle: function (bubble, e) {
            let mouseCoords = ui.getMouseCoords(e),
                bubbleCoords = ui.getBubbleCoords(bubble),
                gameCoords = $("#game").position(),
                boardLeft = 148,
                browserWidth = window.innerWidth
                document.body.clientWidth
            let page = document.getElementById("page"),
                style =  window.getComputedStyle(page),
                styleString = style.marginLeft
            if(browserWidth > 3022){
            var varMatginLeft = styleString.slice(0, 4)  
            }
            else if(browserWidth > 1127){
            var varMatginLeft = styleString.slice(0, 3)
            }
            else if(browserWidth > 1037){
            var varMatginLeft = styleString.slice(0, 2)
            }
            else{
            var varMatginLeft = styleString.slice(0, 1)
            }
            var intMarginLeft = parseInt(varMatginLeft, 10)
            
            //obliczanie działa nie poprawnie z pzeglandarka firefox na rozdielczociach wiekrzych niz 1024px na x px
            
    var angle = Math.atan((mouseCoords.x - bubbleCoords.left - boardLeft - intMarginLeft)
            / (bubbleCoords.top + gameCoords.top - mouseCoords.y));
            if(mouseCoords.y > bubbleCoords.top + gameCoords.top){
                angle += Math.PI;
            }
            return angle;
        },
        //wystrzeliwywanie bombelka (animacja)
        fireBubble: function (bubble, coords, duration) {
            bubble.setState(BubbleShoot.BubbleState.FIRING)
            //funkcja po zakończeniu animacji ustawiająca bombelek na siadce planszy
            var complete = function () {
                //sprawdzanie czy bombelek trafił w planszę
                if (typeof (bubble.getRow()) != 'undefined') {
                    //czyszczenie definicji przejścia 
                    bubble.getSprite().css(Modernizr.prefixed("transition"), "")
                    //zapisanie nowej pozycji bombelka
                    bubble.getSprite().css({
                        left: bubble.getCoords().left - ui.BUBBLE_DIMS / 2,
                        top: bubble.getCoords().top - ui.BUBBLE_DIMS / 2
                    })
                    bubble.setState(BubbleShoot.BubbleState.ON_BOARD)
                } else {
                    bubble.setState(BubbleShoot.BubbleState.FIRED)
                }
            }
            //sprawdzenie czy przeglondarka wspier przejścia CSS
            if (Modernizr.csstransitions && !BubbleShoot.Renderer) {
                //dodanie ewentualnych prefiksów dla różnych przeglondarek
                bubble.getSprite().css(Modernizr.prefixed("transition"), "all " +
                    (duration / 1000) + "s linear")
                //animacja przejścia CSS natywnie wywołanego w js
                bubble.getSprite().css({
                    left: coords.x - ui.BUBBLE_DIMS / 2,
                    top: coords.y - ui.BUBBLE_DIMS / 2
                })
                //opuźnienie czasowe na czas trwania animacji
                setTimeout(complete, duration)
                //animacja przejścia w JS
            } else {
                bubble.getSprite().animate({
                    left: coords.x - ui.BUBBLE_DIMS / 2,
                    top: coords.y - ui.BUBBLE_DIMS / 2
                }, {
                    duration: duration,
                    easing: "linear",
                    complete: complete
                })
            }
        },
        //rysowanie tablicy
        drawBoard: function (board) {
            //pobranie żędów i kolumn tablicy
            let rows = board.getRows(),
                gameArea = $("#board")
            // iteracja po tablicy za pomoca pętli 
            for (let i = 0; i < rows.length; i++) {
                let row = rows[i]
                for (let j = 0; j < row.length; j++) {
                    let bubble = row[j]
                    //sprawdzanie warunków czy w tablicy znajduje się juz bombelek
                    if (bubble) {
                        //pobranie obiektu sprite
                        let sprite = bubble.getSprite()
                        //dodanie sprite na planszę
                        gameArea.append(sprite)
                        let left = j * ui.BUBBLE_DIMS / 2,
                            top = i * ui.ROW_HEIGHT
                        sprite.css({
                            left: left,
                            top: top
                        })
                    }
                }
            }
        },
        drawBubblesRemaining: function (numBubbles) {
            $("#bubbles_remaining").text('You Have : ' +numBubbles+ 'bubbles')
        },
        //drawScore i HighScore pobierają ze zmiennych wartości i wpisuja je w poszczególne divy
        drawScore: function (score) {
            $("#score").text(score)
        },
        drawHighScore: function (highScore) {
            $("#high_score").text(highScore)
        },
        //pobiera aktualny level i dodaje do niego 1 bo levele w zmiennej zaczynają się od 0
        drawLevel: function (level) {
            $("#level").text(level + 1)
        },
        endGame: function (hasWon, score) {
            //gdy gra się zakończy nie będziemy mogli strzelać bombelkami
            $("#game").unbind("click")
            $("#game").unbind("mousemove")
            //aktualizujemy liczbę pozostałych bombelków na 0
            BubbleShoot.ui.drawBubblesRemaining(0)
            //piszemy komunikat w zależności od przebiegu rozgrywki
            if (hasWon) {
                $(".level_complete").show()
                $(".level_failed").hide()
            } else {
                $(".level_complete").hide()
                $(".level_failed").show()
                //rozwijanie okna dialogowego po zakończeniu poziomu
            }
            $("#end_game").slideDown(500)
            $("#final_score_value").text(score)
        }
    }
    return ui
})(jQuery)