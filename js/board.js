var BubbleShoot = window.BubbleShoot || {}
BubbleShoot.Board = (function ($) {
    //liczba wierszy
    let NUM_ROWS = 9,
    //liczba kolumn
        NUM_COLS = 32,
        Board = function () {
        let that = this,
        //funkcja tworzenie widoku 
            rows = createLayout()
        //publiczny dostęp do widok
        this.getRows = function () {
            return rows
        }
        //dodanie wystrzelonego bombelka do tablicy
        this.addBubble = function (bubble, coords) {
            //obliczamy nr rzedu
            let rowNum = Math.floor(coords.y / BubbleShoot.ui.ROW_HEIGHT),
            //obliczamy nr kolumny
                colNum = coords.x / BubbleShoot.ui.BUBBLE_DIMS * 2
            if (rowNum % 2 == 1)
                colNum -= 1
            colNum = Math.round(colNum / 2) * 2;
            if (rowNum % 2 == 0)
                colNum -= 1
            if (!rows[rowNum])
                rows[rowNum] = []
            //dodanie bombelka na odpowiednią pozycję
            rows[rowNum][colNum] = bubble
            //przekazanie wiersza
            bubble.setRow(rowNum)
            //przekazanie kolumny
            bubble.setCol(colNum)
        }
        //metoda przyjmuje nr rzedu i kolumny 
        this.getBubbleAt = function (rowNum, colNum) {
            //jeżeli nie ma bobelka zwraca null 
            if (!this.getRows()[rowNum])
                return null
            //i zwraca bombelek na tej pozyjcji
            return this.getRows()[rowNum][colNum]
        }
        //metoda przechodzi po pętli aby znaleźć takie same bombelki
        this.getBubblesAround = function (curRow, curCol) {
            let bubbles = []
            //sprawdzamy 3 sąsiednie kolumny
            for (let rowNum = curRow - 1; rowNum <= curRow + 1; rowNum++) {
                //sprawdzamy 2 rzędy po prawej i 2 rzędy po lewej
                for (let colNum = curCol - 2; colNum <= curCol + 2; colNum++) {
                    let bubbleAt = that.getBubbleAt(rowNum, colNum)
                    //sprawdzenie czy dany bombelek istnieje
                    if (bubbleAt && !(colNum == curCol && rowNum == curRow))
                        bubbles.push(bubbleAt)
                }
            }
            return bubbles
        }
        this.getGroup = function (bubble, found, differentColor) {

            let curRow = bubble.getRow()
            //jeżeli obiek found nie ma wpisu zwracamy pusta tablicę
            if (!found[curRow])
                found[curRow] = {}
            // jeżeli nie istanieje właściwaść list to ją tworzymy 
            if (!found.list)
                found.list = []
            //jeżeli obiekt już poprzednio został wykryty zwracamy found bez powtórnego dodawania bombelka
            if (found[curRow][bubble.getCol()]) {
                return found
            }
            //jeżeli nie odznaczamy lokalizacje jako sprawdzoną
            found[curRow][bubble.getCol()] = bubble
            //i zapisujemy bombelek na liście
            found.list.push(bubble)
            //pobieramy otaczające bombelki
            let curCol = bubble.getCol(),
                surrounding = that.getBubblesAround(curRow, curCol);
            //
            for (let i = 0; i < surrounding.length; i++) {
                let bubbleAt = surrounding[i]
                //jeżeli bombelek ma ten sam kolor co wystrzelony funkcja wywołuje samą siebie dzięki temu znajdujemy wszystkie bombelki 1 okloru
                if (bubbleAt.getType() == bubble.getType() || differentColor) {
                    found = that.getGroup(bubbleAt, found, differentColor)
                }
            }
            //niezależnie od rezultatu zwracamy wartość poszukiwań
            return found
        }
        //usunięcie bombelka w danej rzecie i kolumnie
        this.popBubbleAt = function (rowNum, colNum) {
            let row = rows[rowNum]
            delete row[colNum]
        }
        //tablica do wyszukiwania połączonych bombelków
        this.findOrphans = function () {
            //będzie lokalizować połączone bombelki
            let connected = [],
            //będzie zawierała zestaw wszystkich grup
                groups = [],
                rows = that.getRows()
            for (let i = 0; i < rows.length; i++) {
                connected[i] = []
            }
            //przechodzimy po górnym wierszu bo to do niego muszą być bombelki dołaczone
            for (let i = 0; i < rows[0].length; i++) {
                let bubble = that.getBubbleAt(0, i)
                //jeżeli jakis bombelek nie jest połączony z żadnym z samej góry jest dodawany do grupy m
                if (bubble && !connected[0][i]) {
                    let group = that.getGroup(bubble, {}, true)
                    //przechowywana tablica przechowywuje połączone bombelki
                    $.each(group.list, function () {
                        connected[this.getRow()][this.getCol()] = true
                    })
                }
            }
            //wyszukiwanie sierot
            let orphaned = []
            //przejście po obiektach i zwrócenie tablicy sierot
            for (let i = 0; i < rows.length; i++) {
                for (let j = 0; j < rows[i].length; j++) {
                    let bubble = that.getBubbleAt(i, j)
                    if (bubble && !connected[i][j]) {
                        orphaned.push(bubble)
                    }
                }
            }
            return orphaned
        }
        //zasilamy tabicę stanów wartościami
        this.getBubbles = function () {
            let bubbles = [],
                rows = this.getRows()
            for (let i = 0; i < rows.length; i++) {
                let row = rows[i]
                for (let j = 0; j < row.length; j++) {
                    let bubble = row[j]
                    if (bubble) {
                        bubbles.push(bubble)
                    }
                }
            }
            return bubbles
        }
        //sprawdza czy getBubbles zwróci jakieś obiekty
        this.isEmpty = function () {
            return this.getBubbles().length == 0
        }
        return this
    }
    let createLayout = function () {
        let rows = []
        //rysowanie szkieletu tablicy
        for (let i = 0; i < NUM_ROWS; i++) {
            let row = [],
            //obliczamy od którego momętu zaczynamy rysować 
                startCol = i % 2 == 0 ? 1 : 0
            for (let j = startCol; j < NUM_COLS; j += 2) {
                // dodanie obiektu bubble
                let bubble = BubbleShoot.Bubble.create(i, j)
                //ustawienie stanu bobmelków na tablicy na ON_BOARD
                bubble.setState(BubbleShoot.BubbleState.ON_BOARD)
                //jeśli obiekt render istnieje
                if (BubbleShoot.Renderer) {
                    //obliczamy miejsca w których bombelek ma być wyświetlony
                    let left = j * BubbleShoot.ui.BUBBLE_DIMS / 2,
                        top = i * BubbleShoot.ui.ROW_HEIGHT
                    //przypisanie wartości to srprite'a
                    bubble.getSprite().setPosition({
                        left: left,
                        top: top
                    })
                }
                row[j] = bubble
            }
            rows.push(row)
        }
        return rows
    }
    return Board
})(jQuery)