import multiprocessing as mp
import random
import matplotlib.pyplot as plt

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
    def __init__(self):
        self.rows = [[{'card': None, 'type': 'empty'}]
                     * i for i in range(1, 8)]

    def dealPyramid(self, deck):
        for row in self.rows:
            for i in range(len(row)):
                if len(row) < 7:
                    row[i] = {'card': deck.draw_card(), 'type': 'face_down'}
                else:
                    row[i] = {'card': deck.draw_card(), 'type': 'face_up'}

    def revealCards(self):
        for i in range(len(self.rows)-1):
            for j in range(len(self.rows[i])):
                if self.rows[i][j]['type'] == 'face_down':
                    if self.rows[i+1][j]['type'] == 'empty' and self.rows[i+1][j+1]['type'] == 'empty':
                        self.rows[i][j]['type'] = 'face_up'

    def removeCard(self, card):
        for i in range(len(self.rows)):
            for j in range(len(self.rows[i])):
                if self.rows[i][j]['card'] == card:
                    self.rows[i][j] = {'card': None, 'type': 'empty'}
                    return True

    def getFaceUpCards(self):
        face_up_cards = []
        for row in self.rows:
            for card in row:
                if card['type'] == 'face_up':
                    face_up_cards.append(card['card'])
        return face_up_cards

    def getFaceDownCards(self):
        face_down_cards = []
        for row in self.rows:
            for card in row:
                if card['type'] == 'face_down':
                    face_down_cards.append(card['card'])
        return face_down_cards

    def cardsLeft(self):
        return len(self.getFaceUpCards()) + len(self.getFaceDownCards())

    def getCardPosition(self, card):
        for i in range(len(self.rows)):
            for j in range(len(self.rows[i])):
                if self.rows[i][j]['card'] == card:
                    return (i, j)

    def countRevealedCards(self, cards):
        count = 0
        for i in range(len(self.rows)):
            for j in range(len(self.rows[i])-1):
                if self.rows[i][j]['type'] == 'face_down':
                    if (self.rows[i+1][j]['type'] == 'empty' or (self.rows[i+1][j]['type'] == 'face_up' and self.rows[i+1][j]['card'] in cards)) and (self.rows[i+1][j+1]['type'] == 'empty' or (self.rows[i+1][j+1]['type'] == 'face_up' and self.rows[i+1][j+1]['card'] in cards)):
                        count += 1
        return count

    def printPyramid(self):
        printRows = [[None] * i for i in range(1, 8)]
        for i in range(len(self.rows)):
            for j in range(len(self.rows[i])):
                if self.rows[i][j]['type'] == 'face_up':
                    printRows[i][j] = self.rows[i][j]['card']
                elif self.rows[i][j]['type'] == 'face_down':
                    printRows[i][j] = '🂠'
                elif self.rows[i][j]['type'] == 'empty':
                    printRows[i][j] = '⬜'
        for row in printRows:
            print(row)


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
            row = self.pyramid.getCardPosition(card)[0]
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
        return random.choice(legalMoves)


class BasicStragety(Strategy):
    def chooseMove(legalMoves, pyramid, stack, consecutivePlays):
        consecutivePlays = findConsecutivePlays(stack[-1], pyramid)
        revealedCards = [pyramid.countRevealedCards(
            play) for play in consecutivePlays]
        maxRevealedCards = max(revealedCards)
        bestCards = []
        for i in range(len(revealedCards)):
            if revealedCards[i] == maxRevealedCards:
                bestCard = consecutivePlays[i][0]
                if bestCard not in bestCards:
                    bestCards.append(bestCard)
        revealedCards = [pyramid.countRevealedCards(
            [card]) for card in bestCards]
        maxRevealedCards = max(revealedCards)
        bestCard = random.choice([bestCards[i] for i in range(
            len(bestCards)) if revealedCards[i] == maxRevealedCards])
        return bestCard


class AdvancedStragety(Strategy):
    def chooseMove(legalMoves, pyramid, stack, consecutivePlays):
        consecutivePlays = findConsecutivePlays(stack[-1], pyramid)
        revealedCards = [pyramid.countRevealedCards(
            play) for play in consecutivePlays]
        maxRevealedCards = max(revealedCards)
        bestCards = []
        for i in range(len(revealedCards)):
            if revealedCards[i] == maxRevealedCards:
                bestCard = consecutivePlays[i][0]
                if bestCard not in bestCards:
                    bestCards.append(bestCard)
        revealedCards = [pyramid.countRevealedCards(
            [card]) for card in bestCards]
        maxRevealedCards = max(revealedCards)
        bestCards = [bestCards[i] for i in range(
            len(bestCards)) if revealedCards[i] == maxRevealedCards]
        rows = [pyramid.getCardPosition(card)[0] for card in bestCards]
        maxRow = max(rows)
        bestCard = random.choice(
            [bestCards[i] for i in range(len(bestCards)) if rows[i] == maxRow])
        return bestCard


class ExtraBasicStragety(Strategy):
    def chooseMove(legalMoves, pyramid, stack, consecutivePlays):
        consecutivePlays = findConsecutivePlays(stack[-1], pyramid)
        revealedCards = [pyramid.countRevealedCards(
            play) for play in consecutivePlays]
        maxRevealedCards = max(revealedCards)
        bestCards = []
        for i in range(len(revealedCards)):
            if revealedCards[i] == maxRevealedCards:
                bestCard = consecutivePlays[i][0]
                if bestCard not in bestCards:
                    bestCards.append(bestCard)
        return random.choice(bestCards)


def findConsecutivePlays(stackCard, pyramid, playedCards=[]):
    consecutivePlays = []

    faceUpCards = pyramid.getFaceUpCards()

    for card in faceUpCards:
        if card in playedCards:
            continue

        if Game.canPlay(stackCard, card):
            playedCards.append(card)

            newPlay = [card]
            subsequentPlays = findConsecutivePlays(
                card, pyramid, playedCards)

            if len(subsequentPlays) > 0:
                for play in subsequentPlays:
                    consecutivePlays.append(newPlay + play)
            else:
                consecutivePlays.append(newPlay)

            playedCards.remove(card)

    return consecutivePlays


def playGame(strategy):
    game = Game(strategy)
    while not game.gameOver:
        canPlay = game.play()
    return (game.points, game.pyramid.cardsLeft())


if __name__ == '__main__':

    gamesToPlay = 1000

    wins = 0

    stragety = AdvancedStragety
    
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

    ## make a histogram of gamePoints
    plt.hist(gamePoints, bins=1000)
    plt.xlabel('Points')
    plt.ylabel('Frequency')
    plt.title('Histogram of points')
    plt.show()


