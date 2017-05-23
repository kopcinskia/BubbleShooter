var BubbleShoot = window.BubbleShoot || {}
//klasa zwracajaca metode zwracajaca obiekt sprite
BubbleShoot.Bubble = (function ($) {
    //określanie stanów w jakich morze się bombelek znajdować 
    BubbleShoot.BubbleState = {
        //oczekiwanie na wystrzelenie
        CURRENT: 1,
        //jest częścią planszy
        ON_BOARD: 2,
        //przemieszczanie się
        FIRING: 3,
        //pękanie
        POPPING: 4,
        //spadanie
        FALLING: 5,
        //po pęknięciu - nie musi być renderowany
        POPPED: 6,
        //nie trafienie w plansze - nie musi być renderowany
        FIRED: 7,
        //po spadnięciu - nie musi być renderowany
        FALLEN: 8
    }
    //nadanie wartości bombelkowi
    let Bubble = function (row, col, type, sprite) {
        let that = this
        let state
        let stateStart = Date.now()
        //pobieranie stanu
        this.getState = function () {
            return state
        }
        //ustawienie stanu
        this.setState = function (stateIn) {
            state = stateIn
            //określenie stempel czasowy
            stateStart = Date.now()
        }
        //określamy ile bombelek znajdował się w danym stanie
        this.getTimeInState = function () {
            return Date.now() - stateStart
        }
        this.getType = function () {
            return type
        }
        this.getSprite = function () {
            return sprite
        }
        this.getCol = function () {
            return col
        }
        this.setCol = function (colIn) {
            col = colIn
        }
        this.getRow = function () {
            return row
        }
        this.setRow = function (rowIn) {
            row = rowIn
        }
        //poieranie współrzędnych tablicy (x,y) środka bombelka
        this.getCoords = function () {

            let coords = {
                //x = kolumna pomnożona przez połowę szeerokości sprayta bombelka
                left: that.getCol() * BubbleShoot.ui.BUBBLE_DIMS / 2 +
                    BubbleShoot.ui.BUBBLE_DIMS / 2,
                //y = wiersz pomnorzony przez połowę wysokość bombelka
                top: that.getRow() * BubbleShoot.ui.ROW_HEIGHT + BubbleShoot.
                ui.BUBBLE_DIMS / 2
                //do obu wsp. dodajemy promień bombelka celem znaleźienia jego środka
            }
            return coords
        }
        //animacji dzięki szybkim przeskakiwaniem przez klatki obrazka
        this.animatePop = function () {
            //obliczenie typu bombelka
            let top = type * that.getSprite().height()
            //obrut bombelka o kąt aby animacje nie były takie same
            this.getSprite().css(Modernizr.prefixed("transform"), "rotate(" + (Math.random() * 360) + "deg)")
            //opuźniamy czas animacji preskakując po klatkach

            setTimeout(function () {
                that.getSprite().css("background-position", "-50px -" + top + "px")
            }, 100)
            setTimeout(function () {
                that.getSprite().css("background-position", "-100px -" + top + "px")
            }, 200)
            setTimeout(function () {
                that.getSprite().css("background-position", "-150px -" + top + "px")
            }, 300)
            setTimeout(function () {
                that.getSprite().remove()
            }, 400)
        }

    }
    //konstruktor zwracajacy
    Bubble.create = function (rowNum, colNum, type) {
        //losowanie rodzaju bombelka
        if (type === undefined) {
            type = Math.floor(Math.random() * 8)
        }
        //powtórne sprawdzenie czy obiekt render został załadowany
        if (!BubbleShoot.Renderer) {
            var sprite = $(document.createElement("div"))
            sprite.addClass("bubble")
            //konstrukcja odwołania się do klasy
            sprite.addClass("bubble_" + type)
            //jeżeli obiekt jest załatowany tworzymy nowy obiekt sprite
        } else {
            let sprite = new BubbleShoot.Sprite()
        }
        sprite.addClass("bubble")
        sprite.addClass("bubble_" + type)
        //zwrócenie bombelków ze zmiennymi
        let bubble = new Bubble(rowNum, colNum, type, sprite)
        return bubble
    }
    return Bubble
})(jQuery)