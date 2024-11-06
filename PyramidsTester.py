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
    def __init__(self):
        self.rows = [[{'card': None, 'type': 'empty'}] * i for i in range(1, 8)]

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
    def __init__(self):
        self.deck = Deck()
        self.pyramid = Pyramid()
        self.stack = []
        
        self.pyramid.dealPyramid(self.deck)
        self.drawCard()
        self.update()

    def drawCard(self):
        if len(self.deck.cards) > 0:
            self.stack.append(self.deck.draw_card())
            self.update()
            return True
        return False
    
    def canPlay(self, card):
        if card.rank == 1:
            return self.stack[-1].rank in [2, 13]
        elif card.rank == 13:
            return self.stack[-1].rank in [12, 1]
        else:
            return abs(card.rank - self.stack[-1].rank) == 1
        
    def update(self):
        self.pyramid.revealCards()
        self.legalMoves = [card for card in self.pyramid.getFaceUpCards() if self.canPlay(card)]
        

    
    def playCard(self, card):
        if card in self.legalMoves:
            self.stack.append(card)
            self.pyramid.removeCard(card)
            self.update()
            return True
        return False
    
    def play(self):
        if len(self.legalMoves) > 0:
            self.playCard(random.choice(self.legalMoves))
            return True
        elif self.drawCard():
            return True
        return False



gamesToPlay = 100000
wins = 0
gameData = []

for i in range(gamesToPlay):
    canPlay = True
    game = Game()
    while canPlay:
        canPlay = game.play()
    gameData.append(len(game.pyramid.getFaceUpCards())+len(game.pyramid.getFaceDownCards()))
    
wins = gameData.count(0)
print(f'Games played: {gamesToPlay}')
print(f'Games won: {wins}')
print(f'Win rate: {wins/gamesToPlay*100:.2f}%')
print(f'Average number of cards left: {sum(gameData)/len(gameData):.2f}')
