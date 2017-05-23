(function (jQuery) {
    //domyslne watrości gravitacja i max-Y
    let defaults = {
        gravity: 1.3,
        maxY: 800
    }
    //kolejka przechowywuje spadające obiekty
    let toMove = []
    //stempel czasowy od poprzednio wyrenderowanej klatki
    let prevTime
    //dodaje nowe elementy do kolejki animacji i przypisuje im wartości
    jQuery.fn.kaboom = function (settings) {
        //tworzymy obiekt  wartościami domyślnymi
        let config = $.extend({}, defaults, settings)
        //dodanie opużnienia w przypadku pustej animacji
        if (toMove.length == 0) {
            prevTime = Date.now()
            requestAnimationFrame(moveAll)
        }
        // wartości poczatkowych w px/swk
        let dx = Math.round(Math.random() * 14) - 7,
            dy = Math.round(Math.random() * 7) + 7
        //dodanie obiektu do kolejki
        toMove.push({
            elm: this,
            dx: dx,
            dy: dy,
            x: this.position().left,
            y: this.position().top,
            config: config
        })
    }
    //obsługuje animacje
    let moveAll = function () {
        //pobieramy aktualny stampel czasowy
        let newTime = Date.now(),
        // obliczamy ile mineło od ostatniej wyrenderowanej klatki
            elapsed = newTime - prevTime,
        //obliczamy proporcję na podstawie faktycznego czasu
            frameProportion = elapsed / 25
        //przygotowanie do wyrenderowania kolejnej klatki aktualizacja stempla czasowego
        prevTime = newTime
        //tablica elementów  które zostaną przemieszczone poa max-Y
        let stillToMove = []
        //poryszamy się po tablicy sierot
        for (let i = 0; i < toMove.length; i++) {
            let obj = toMove[i]
            //współrzędne przemieszczania się i grawitacji
            obj.x += obj.dx * frameProportion
            obj.y -= obj.dy * frameProportion
            obj.dy -= obj.config.gravity * frameProportion
            //sprawdzanie czy bombelek juz nie spadł
            if (obj.y < obj.config.maxY) {
                obj.elm.css({
                    top: Math.round(obj.y),
                    left: Math.round(obj.x)
                })
                stillToMove.push(obj)
                //jeżeli nie spadł przekazywane mu sa jego własciwosci
            } else if (obj.config.callback) {
                obj.config.callback()
            }
        }
        //przekazanie tablicy do kolejki sierot
        toMove = stillToMove
        if (toMove.length > 0)
        //określamy szybkość animacji
            requestAnimationFrame(moveAll)
    }
})(jQuery)