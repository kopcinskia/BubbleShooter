//początek biblioteki
var BubbleShoot = window.BubbleShoot || {}
BubbleShoot.CollisionDetector = (function ($) {
	var CollisionDetector = {
		//funkcja przyjmuję instancje klasy bubble, instancją klasy board i kąt pod którym wystrzeliwywujemy bombelek
		findIntersection: function (curBubble, board, angle) {
			//pobieramy tablicę po której będziemy iterowac i ustawiamy wartość domyslna zderzenia na null
			let rows = board.getRows(),
				collision = null,
			//pobieramy zmienne początkowej pozycji bombelka
				pos = curBubble.getSprite().position(),
				start = {
				left: pos.left + BubbleShoot.ui.BUBBLE_DIMS / 2,
				top: pos.top + BubbleShoot.ui.BUBBLE_DIMS / 2
			},
			//okraślamy przemieszczenie bombelka w lewo lub w prawo
				dx = Math.sin(angle),
				dy = -Math.cos(angle)
			//iterujemy po tablicy szukając bombelka z którym nastąpi kolizja
			for (let i = 0; i < rows.length; i++) {
				let row = rows[i]
				for (let j = 0; j < row.length; j++) {
					let bubble = row[j]
					//sprawdzamy czy na potencjalnym miejscu kolizji jest bombelek
					if (bubble) {
						let coords = bubble.getCoords(),
							distToBubble = {
							x: start.left - coords.left,
							y: start.top - coords.top
						}
						//wiersze mówięce z której strony dojdzie do kolizji
						let t = dx * distToBubble.x + dy * distToBubble.y,
							ex = -t * dx + start.left,
							ey = -t * dy + start.top,
						//jeżeli odległość distEC jest mniejsz niż podwójny promień to nasępuje kolizja
							distEC = Math.sqrt((ex - coords.left) * (ex - coords.left) +
							(ey - coords.top) * (ey - coords.top))
						if (distEC < BubbleShoot.ui.BUBBLE_DIMS * .75) {
							//odległośmiędzy środkiem uderzonego a bliższym punktem scieszki wystrzelonego bombelka
							let dt = Math.sqrt(BubbleShoot.ui.BUBBLE_DIMS * BubbleShoot.ui.BUBBLE_DIMS - distEC * distEC),
							//punkty  na lini przecinajacej srodek stacjinarnego sa obliczane jako przesunieie wzgledem sciezki wystrzelonego
								offset1 = {
								x: (t - dt) * dx,
								y: -(t - dt) * dy
							},
								offset2 = {
								x: (t + dt) * dx,
								y: -(t + dt) * dy
							},
							//inicjacja 2 pkt potecjalnego przeciecia
								distToCollision1 = Math.sqrt(offset1.x * offset1.x +
								offset1.y * offset1.y),
								distToCollision2 = Math.sqrt(offset2.x * offset2.x +
								offset2.y * offset2.y)
							//wtbor punkt przeciecia blizej startowej pozycj bombelka ruchomego
							if (distToCollision1 < distToCollision2) {
								let distToCollision = distToCollision1,
									dest = {
									x: offset1.x + start.left,
									y: offset1.y + start.top
								}
							} else {
								var distToCollision = distToCollision2,
									dest = {
									x: -offset2.x + start.left,
									y: offset2.y + start.top
								}
							}
							//jezeli znajdziemy kolizje przypisujemy do niej parametry końcowe
							if (!collision || collision.distToCollision > distToCollision) {
								collision = {
									bubble: bubble,
									distToCollision: distToCollision,
									coords: dest
								}
							}
						}
					}
				}
			}
			return collision
		}
	}
	return CollisionDetector
})(jQuery)