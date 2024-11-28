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
        def __init__(self, position):
            rowAdjustment = [0, 1, 3, 6, 10, 15, 21]
            pointsByRow = [502, 27, 17, 12, 7, 4, 3]

            self.position = position
            self.index = rowAdjustment[position[0]] + position[1] + 1
            self.points = pointsByRow[position[0]]

            self.card = None
            self.type = 'EMPTY'

            self.children = []
            self.parents = []

            self.descendants = []
            self.ancestors = []

        def __str__(self):
            if self.type == 'FACE_UP':
                return str(self.card)
            elif self.type == 'FACE_DOWN':
                return '🂠'
            elif self.type == 'EMPTY':
                return '⬜'
            
        def ancestorCount(self):
            return sum([len(generation) for generation in self.ancestors])

        def update(self):
            if self.type == 'FACE_DOWN':
                if all(child.type == 'EMPTY' for child in self.children):
                    self.type = 'FACE_UP'

        def clear(self):
            self.card = None
            self.type = 'EMPTY'

    def __init__(self):
        self.rows = []
        self.spaces = []
        for i in range(7):
            row = []
            for j in range(i+1):
                space = self.Space((i, j))
                row.append(space)
                self.spaces.append(space)
            self.rows.append(row)

        self.mapSpaces()

    def mapSpaces(self):
        for space in self.spaces:
            for generationOffset in range(1, space.position[0]+1):
                generation = []
                for j in range(max(0, space.position[1]-generationOffset), min(space.position[1], space.position[0]-generationOffset)+1):
                    generation.append(
                        self.rows[space.position[0]-generationOffset][j])
                space.ancestors.append(generation)
                if generationOffset == 1:
                    space.parents = generation

            for generationOffset in range(1, 7-space.position[0]):
                generation = []
                for j in range(space.position[1], min(space.position[0]+generationOffset, space.position[1]+generationOffset)+1):
                    generation.append(
                        self.rows[space.position[0]+generationOffset][j])
                space.descendants.append(generation)
                if generationOffset == 1:
                    space.children = generation

    def dealPyramid(self, deck):
        for space in self.spaces:
            space.card = deck.draw_card()
            space.type = 'FACE_DOWN'
        self.revealCards()

    def revealCards(self):
        for space in self.spaces:
            space.update()

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

    def findRevealedSpaces(self, sequence):
        emptySpaces = [space for space in self.spaces if space.type == 'EMPTY']
        spacesToPlay = list(map(self.getSpaceByCard, sequence))
        spacesRevealed = []
        spacesPlayed = []

        for space in spacesToPlay:
            spacesPlayed.append(space)
            revealedSpaces = [parent for parent in space.parents if (not any(parent in sublist for sublist in spacesRevealed)) and parent.type == 'FACE_DOWN' and all(
                child in emptySpaces + spacesPlayed for child in parent.children)]
            spacesRevealed.append(revealedSpaces)

        return spacesRevealed


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
        if self.pyramid.cardsLeft() == 0:
            self.hasWon = True
            self.gameOver = True

    def playCard(self, card):
        if card in self.legalMoves:
            space = self.pyramid.getSpaceByCard(card)
            self.stack.append(card)
            space.clear()
            self.points += space.points + 2*self.consecutivePlays
            self.consecutivePlays += 1
            self.update()
            return True
        return False

    def play(self):
        #print(self.stack[-1])
        #self.pyramid.printPyramid()
        #print('-------------------')
        #print('')
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
        plays = findConsecutivePlays(stack[-1], pyramid.getFaceUpCards())
        print(plays)
        [pyramid.findRevealedSpaces(play) for play in plays]
        return random.choice(legalMoves)
    
class AdvacedStrategy(Strategy):
    def chooseMove(legalMoves, pyramid, stack, consecutivePlays):
        plays = findConsecutivePlays(stack[-1], pyramid.getFaceUpCards())
        fullDeck = [Card(suit, rank) for suit in ['Hearts', 'Diamonds', 'Clubs', 'Spades'] for rank in range(1, 14)]
        seenCards = stack+pyramid.getFaceUpCards()
        remainingCards = [card for card in fullDeck if card not in seenCards]

        plays = [Play(remainingCards, consecutivePlays, pyramid, play) for play in plays]
        random.shuffle(plays)
        sortedPlays = sorted(plays, key=lambda play: (play.totalRevealed, play.cardsRevealed[0], pyramid.getSpaceByCard(play.sequence[0]).position[0]), reverse=True)
        return sortedPlays[0].sequence[0]
    

class SuperAdvacedStrategy(Strategy):
    def chooseMove(legalMoves, pyramid, stack, consecutivePlays):
        plays = findConsecutivePlays(stack[-1], pyramid.getFaceUpCards())
        fullDeck = [Card(suit, rank) for suit in ['Hearts', 'Diamonds', 'Clubs', 'Spades'] for rank in range(1, 14)]
        seenCards = stack+pyramid.getFaceUpCards()
        remainingCards = [card for card in fullDeck if card not in seenCards]

        plays = [Play(remainingCards, consecutivePlays, pyramid, play) for play in plays]
        random.shuffle(plays)
        sortedPlays = sorted(plays, key=lambda play: (play.totalRevealed, play.cardsRevealed[0], play.totalDraws, play.ancestorCount[0]), reverse=True)
        return sortedPlays[0].sequence[0]


class Play:
    def __init__(self, remainingCards, consecutivePlays, pyramid, sequence):
        self.sequence = sequence
        self.cardsRevealed = list(map(len, pyramid.findRevealedSpaces(sequence)))
        self.ancestorCount = [pyramid.getSpaceByCard(card).ancestorCount() for card in sequence]

        self.possibleContinuations = [card for card in remainingCards if Game.canPlay(sequence[-1], card)]
        self.remainingFaceUpCards = [card for card in pyramid.getFaceUpCards() if card not in sequence]
        self.possibleDraws = [card for card in remainingCards if any(Game.canPlay(card, faceUpCard) for faceUpCard in self.remainingFaceUpCards)]

        self.totalRevealed = sum(self.cardsRevealed)
        self.totalAncestors = sum(self.ancestorCount)
        self.totalContinuations = len(self.possibleContinuations)
        self.totalDraws = len(self.possibleDraws)





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
    while not game.gameOver:
        game.play()
    return (game.points, game.pyramid.cardsLeft())


if __name__ == '__main__':

    gamesToPlay = 1000000

    wins = 0

    stragety = AdvacedStrategy

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
