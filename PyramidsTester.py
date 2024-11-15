import multiprocessing as mp
import random

# Card class representing each card in the deck


class Card:
    def __init__(self, suit, rank):
        self.suit = suit  # 'Hearts', 'Diamonds', 'Clubs', 'Spades'
        self.rank = rank  # 1-13, where 1 is Ace, 11 is Jack, etc.

    def __str__(self):
        rank_str = {11: 'J', 12: 'Q', 13: 'K', 1: 'A'}.get(
            self.rank, str(self.rank))
        suit_symbol = {'Hearts': '♥', 'Diamonds': '♦',
                       'Clubs': '♣', 'Spades': '♠'}[self.suit]
        return f"{rank_str}{suit_symbol}"

    def __eq__(self, other):
        if isinstance(other, Card):
            return self.suit == other.suit and self.rank == other.rank
        return False

    def __repr__(self):
        return self.__str__()

# Deck class to create and shuffle the deck of cards


class Deck:
    def __init__(self):
        suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades']
        ranks = list(range(1, 14))  # 1 to 13
        self.cards = [Card(suit, rank) for suit in suits for rank in ranks]
        random.shuffle(self.cards)

    def draw_card(self):
        return self.cards.pop()


class Pyramid:
    class Space:
        def __init__(self, location):
            rowAdjustment = [0, 1, 3, 6, 10, 15, 21]
            pointsByRow = [502, 27, 17, 12, 7, 4, 3]
            
            self.location = location
            self.position = rowAdjustment[location[0]] + location[1]+1
            self.points = pointsByRow[location[0]]

            self.card = None
            self.type = 'EMPTY'

            self.children = []
            self.parents = []

            self.decentants = []
            self.ancestors = []
        
        def __str__(self):
            if self.type == 'FACE_UP':
                return str(self.card)
            elif self.type == 'FACE_DOWN':
                return '🂠'
            elif self.type == 'EMPTY':
                return '⬜'
            
        def update(self):
            if self.type == 'FACE_DOWN':
                if all(child.type == 'EMPTY' for child in self.children):
                    self.type = 'FACE_UP'
        
        def clear(self):
            self.card = None
            self.type = 'EMPTY'

        def getDescendants(self):
            return list(set(self.children + [descendant for child in self.children for descendant in child.getDescendants()]))
        
        def getAncestors(self):
            return list(set(self.parents + [ancestor for parent in self.parents for ancestor in parent.getAncestors()]))
        
        def buildFamilyTree(self):
            self.decentants = self.getDescendants()
            self.ancestors = self.getAncestors()

    def __init__(self):
        self.rows = []
        self.spaces = []
        for i in range(7):
            row = []
            for j in range(i):
                space = self.Space((i, j))
                row.append(space)
                self.spaces.append(space)
            self.rows.append(row)
        
        for i in range(6):
            for j in range(i):
                self.rows[i][j].children.append(self.rows[i+1][j])
                self.rows[i][j].children.append(self.rows[i+1][j+1])
                self.rows[i+1][j].parents.append(self.rows[i][j])
                self.rows[i+1][j+1].parents.append(self.rows[i][j])

        for space in self.spaces:
            space.buildFamilyTree()

    def dealPyramid(self, deck):
        for space in self.spaces:
            space.card = deck.draw_card()
            space.type = 'FACE_DOWN'
        self.revealCards()

    def revealCards(self):
        for space in self.spaces:
            space.update()

    def removeCard(self, card):
        for space in self.spaces:
            if space.card == card:
                space.clear()
                break

    def getFaceUpCards(self):
        return [space.card for space in self.spaces if space.type == 'FACE_UP']

    def getFaceDownCards(self):
        return [space.card for space in self.spaces if space.type == 'FACE_DOWN']

    def printPyramid(self):
        printRows = [[str(space) for space in row] for row in self.rows]
        [print(row) for row in printRows]


    def cardsLeft(self):
        return len(self.getFaceUpCards()) + len(self.getFaceDownCards())

    def getSpaceByCard(self, card):
        for space in self.spaces:
            if space.card == card:
                return space

    def countRevealedCards(self, cards):
        emptySpaces = [space for space in self.spaces if space.type == 'EMPTY']
        spacesToPlay = list(map(self.getSpaceByCard, cards))
        cardsRevealed = []
        for space in spacesToPlay:
            emptySpaces.append(space)
            cardsRevealed.append(sum([1 for revealedSpace in self.spaces if (revealedSpace.type == 'FACE_DOWN' and all(child in emptySpaces for child in revealedSpace.children))]))
        return cardsRevealed[-1]

class Game:
    def __init__(self, strategy):
        self.strategy = strategy
        self.deck = Deck()
        self.pyramid = Pyramid()
        self.stack = []
        self.points = 0
        self.consecutivePlays = 0
        self.hasWon = False
        self.gameOver = False

        self.pyramid.dealPyramid(self.deck)
        self.drawCard()
        self.update()

    def drawCard(self):
        if len(self.deck.cards) > 0:
            self.stack.append(self.deck.draw_card())
            self.consecutivePlays = 0
            self.update()
            return True
        return False

    @staticmethod
    def canPlay(stackCard, card):
        if card.rank == 1:
            return stackCard.rank in [2, 13]
        elif card.rank == 13:
            return stackCard.rank in [12, 1]
        else:
            return abs(card.rank - stackCard.rank) == 1

    def update(self):
        self.pyramid.revealCards()
        self.legalMoves = [
            card for card in self.pyramid.getFaceUpCards() if Game.canPlay(self.stack[-1], card)]
        if len(self.legalMoves) == 0 and len(self.deck.cards) == 0:
            self.gameOver = True
        if len(self.pyramid.getFaceUpCards())+len(self.pyramid.getFaceDownCards()) == 0:
            self.hasWon = True
            self.gameOver = True

    def playCard(self, card):
        pointsByRow = [502, 27, 17, 12, 7, 4, 3]
        if card in self.legalMoves:
            row = self.pyramid.getSpaceByCard(card).location[0]
            self.stack.append(card)
            self.pyramid.removeCard(card)
            self.points += pointsByRow[row] + 2*self.consecutivePlays
            self.consecutivePlays += 1
            self.update()
            return True
        return False

    def play(self):
        if len(self.legalMoves) > 0:
            self.playCard(self.strategy.chooseMove(
                self.legalMoves, self.pyramid, self.stack, self.consecutivePlays))
            return True
        elif self.drawCard():
            return True
        return False


class Strategy:
    def chooseMove():
        raise NotImplementedError


class RandomStrategy(Strategy):
    def chooseMove(legalMoves, pyramid, stack, consecutivePlays):
        print(stack[-1])
        pyramid.printPyramid()
        print(findConsecutivePlays(stack[-1], pyramid.getFaceUpCards()))
        return random.choice(legalMoves)


def findConsecutivePlays(stackCard, faceUpCards):
    consecutivePlays = []

    for card in faceUpCards:

        if Game.canPlay(stackCard, card):
            newPlay = [card]
            subsequentPlays = findConsecutivePlays(
                card, [faceUpCard for faceUpCard in faceUpCards if faceUpCard != card])

            if len(subsequentPlays) > 0:
                for play in subsequentPlays:
                    consecutivePlays.append(newPlay + play)
            else:
                consecutivePlays.append(newPlay)

    return consecutivePlays


def playGame(strategy):
    game = Game(strategy)
    for space in game.pyramid.spaces:
        print(space.location, [ancestor.location for ancestor in space.decentants])
    while not game.gameOver:
        canPlay = game.play()
    return (game.points, game.pyramid.cardsLeft())


if __name__ == '__main__':

    gamesToPlay = 1

    wins = 0

    stragety = RandomStrategy
    
    with mp.Pool() as pool:
        
        results = pool.map(playGame, [stragety]*gamesToPlay)


    wins = sum([1 for result in results if result[1] == 0])
    gamePoints = [result[0] for result in results]
    cardsLeft = [result[1] for result in results]

    avgPoints = sum(gamePoints)/gamesToPlay
    avgCardsLeft = sum(cardsLeft)/gamesToPlay

    print(f'{stragety.__name__}:')
    print(f'Games played: {gamesToPlay}')
    print(f'Games won: {wins}')
    print(f'Win rate: {wins/gamesToPlay*100:.2f}%')
    print(f'Average points: {avgPoints:.2f}')
    print(f'Average number of cards left: {avgCardsLeft:.2f}')



