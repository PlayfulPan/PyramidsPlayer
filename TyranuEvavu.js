// ==UserScript==
// @name         Tyranu Evavu Player
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Plays Tyranu Evavu
// @author       Pan
// @match        https://www.neopets.com/games/tyranuevavu.phtml*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM_deleteValue
// ==/UserScript==

(function () {
    'use strict';

    class Game {
        constructor(mainGameBoardElement, unseenCards) {
            this.mainGameBoardElement = mainGameBoardElement;
            this.unseenCards = unseenCards;

            this.parseGameStats();
            this.parseCards();

            this.updateUnseenCards();
        }

        parseGameStats() {
            const dataCells = this.mainGameBoardElement.querySelector('table[cellpadding="2"][cellspacing="1"][width="550"]').querySelectorAll('tr')[1].querySelectorAll('td');

            this.consecutivePlays = parseInt(dataCells[0].textContent.trim(), 10) || 0;
            this.gamePoints = parseInt(dataCells[1].textContent.trim(), 10) || 0;
            this.cardsInPile = parseInt(dataCells[2].textContent.trim(), 10) || 0;
            this.highScore = parseInt(dataCells[3].textContent.trim(), 10) || 0;
        }

        parseCards() {
            const gameAreaRows = this.mainGameBoardElement.querySelector('table[cellpadding="3"][cellspacing="0"][width="550"][height="450"]').querySelectorAll('tr');

            const stackImages = gameAreaRows[0].querySelector('td[align="center"][valign="top"]').querySelectorAll('img');
            this.drawPile = new Space(stackImages[0]);
            this.stackPile = new Space(stackImages[1]);

            const pyramidRows = gameAreaRows[1].querySelector('table[cellpadding="0"][cellspacing="0"][width="400"]').querySelectorAll('tr');
            this.pyramid = new Pyramid(pyramidRows);
        }

        updateUnseenCards() {
            const revealedCards = this.pyramid.getFaceUpCards();
            revealedCards.push(this.stackPile.card);
            this.unseenCards = this.unseenCards.filter(card => !revealedCards.some(revealedCard => revealedCard.matches(card)));
        }

        logBoardState() {
            console.group("Neopets Pyramids Board State");

            // Print Game Statistics
            console.group("Game Statistics");
            console.log(`Consecutive Plays: ${this.consecutivePlays}`);
            console.log(`Game Points: ${this.gamePoints}`);
            console.log(`Cards In Pile: ${this.cardsInPile}`);
            console.log(`High Score: ${this.highScore}`);
            console.groupEnd();

            // Print Stack Card
            console.group("Stack Card");
            console.log(`Stack Card: ${this.stackPile.toString()}`);
            console.groupEnd();

            // Print Seen Cards
            console.group("Unseen Cards");
            console.log(this.unseenCards.map(card => card.toString()));
            console.groupEnd();

            // Print Pyramid Cards
            console.group("Pyramid Cards");
            this.pyramid.toString();
            console.groupEnd();

            console.groupEnd();
        }

        static findConsecutivePlays(stackCard, faceUpCards) {
            const consecutivePlays = [];

            for (const card of faceUpCards) {
                if (card.canPlayOn(stackCard)) {
                    const newPlay = [card];
                    const remainingFaceUpCards = faceUpCards.filter(faceUpCard => faceUpCard !== card);
                    const subsequentPlays = Game.findConsecutivePlays(card, remainingFaceUpCards);

                    if (subsequentPlays.length > 0) {
                        for (const play of subsequentPlays) {
                            consecutivePlays.push([...newPlay, ...play]);
                        }
                    } else {
                        consecutivePlays.push(newPlay);
                    }
                }
            }
            return consecutivePlays;
        }

        analyzePlay(play) {
            const revealedSpaces = this.pyramid.findRevealedSpaces(play).map(spaces => spaces.length);
            const totalRevealed = revealedSpaces.reduce((a, b) => a + b, 0);
            const firstRevealed = revealedSpaces[0];

            const space = this.pyramid.getSpaceByCard(play[0]);

            const ancestorCount = space.ancestorCount();

            const remainingFaceUpCards = this.pyramid.getFaceUpCards().filter(card => !play.some(playedCard => playedCard.matches(card)));
            const possibleDraws = this.unseenCards.filter(card => remainingFaceUpCards.some(faceUpCard => faceUpCard.canPlayOn(card)));

            return { space: space, stats: [totalRevealed, possibleDraws.length, play.length, firstRevealed, ancestorCount] };
        }

        chooseMove() {
            const possiblePlays = Game.findConsecutivePlays(this.stackPile.card, this.pyramid.getFaceUpCards());
            if (possiblePlays.length === 0 && this.drawPile.link) {
                return this.drawPile;
            } else {
                const playStats = possiblePlays.map(play => this.analyzePlay(play));
                const bestPlay = playStats.reduce((best, current) => {
                    if (current.stats[0] > best.stats[0]) {
                        return current;
                    } else if (current.stats[0] === best.stats[0]) {
                        if (current.stats[1] > best.stats[1]) {
                            return current;
                        } else if (current.stats[1] === best.stats[1]) {
                            if (current.stats[2] > best.stats[2]) {
                                return current;
                            } else if (current.stats[2] === best.stats[2]) {
                                if (current.stats[3] > best.stats[3]) {
                                    return current;
                                } else if (current.stats[3] === best.stats[3]) {
                                    if (current.stats[4] > best.stats[4]) {
                                        return current;
                                    }
                                }
                            }
                        }
                    }
                    return best;
                });
                return bestPlay.space;
            }
            return null;
        }

    }

    

    class Space {
        constructor(img = null) {
            this.card = null;
            this.type = 'EMPTY';
            this.link = null;

            if (img) {
                const cardData = Space.parseCardData(img);
                this.type = cardData.type;
                this.link = cardData.link;
                if (this.type === 'FACE_UP') {
                    this.card = new Card(cardData.suit, cardData.rank);
                }
            }
        }

        static parseCardData(img) {
            const source = img.getAttribute('src');
            let cardData = { type: 'EMPTY', suit: null, rank: null, link: null };

            if (source.includes('pyramid.gif')) {
                cardData.type = 'FACE_DOWN';
            } else if (source.includes('blank.gif') || source.includes('empty.gif')) {
                cardData.type = 'EMPTY';
            } else {
                cardData.type = 'FACE_UP';

                const cardName = source.split('/').pop().replace('.gif', ''); // e.g., "10_spades" or "J_hearts"
                const [rankStr, suit] = cardName.split('_');
                let rank = parseInt(rankStr, 10);
                if (rank === 14) {
                    rank = 1;
                }
                cardData.suit = suit;
                cardData.rank = rank;
            }

            const parent = img.parentElement;
            if (parent && parent.tagName.toLowerCase() === 'a') {
                cardData.link = parent;
            }

            return cardData;
        }

        toString() {
            switch (this.type) {
                case 'EMPTY':
                    return '⬜';
                case 'FACE_UP':
                    return this.card.toString();
                case 'FACE_DOWN':
                    return '🂠';
                default:
                    return '❓';
            }
        }
    }

    class Card {
        constructor(suit, rank) {
            this.rank = rank;
            this.suit = suit;
        }

        toString() {
            const suitSymbols = { 'hearts': '♥', 'diamonds': '♦', 'clubs': '♣', 'spades': '♠' };
            const rankSymbols = { 1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K' };

            return `${rankSymbols[this.rank]}${suitSymbols[this.suit]}`;
        }

        matches(card) {
            return this.rank === card.rank && this.suit === card.suit;
        }

        canPlayOn(card) {
            if (card.rank === 1) {
                return [2, 13].includes(this.rank);
            } else if (card.rank === 13) {
                return [12, 1].includes(this.rank);
            } else {
                return Math.abs(card.rank - this.rank) === 1;
            }
        }

    }

    var autoReload = GM_getValue('autoReload', false);
    var startNewGame = GM_getValue('startNewGame', false);
    var reloadTimeout = null;

    const minClickTiming = 250;
    const maxClickTiming = 750;
    const reloadDelay = Math.round(minClickTiming + Math.random() * (maxClickTiming - minClickTiming));

    var nextAction = null;
    var statObjects = [];
    var toggleButton = null;

    var gameHistory = JSON.parse(localStorage.getItem('PyramidsGameHistory')) || [];


    function addCustomButtons(mainGameBoard) {
        const buttonsDiv = document.createElement('div');
        buttonsDiv.style.marginTop = '10px';
        buttonsDiv.style.marginBottom = '10px';
        buttonsDiv.style.textAlign = 'center';

        // Create Toggle Script button
        toggleButton = document.createElement('button');
        toggleButton.innerText = autoReload ? 'Disable Autoplay' : 'Enable Autoplay';
        toggleButton.setAttribute('style', 'margin-right: 10px; cursor: pointer;');

        // Create Clear History button
        const clearButton = document.createElement('button');
        clearButton.innerText = 'Clear History';
        clearButton.setAttribute('style', 'cursor: pointer;');

        // Attach event listeners
        toggleButton.addEventListener('click', function () {
            autoReload = !autoReload;
            GM_setValue('autoReload', autoReload);
            toggleButton.innerText = autoReload ? 'Disable Autoplay' : 'Enable Autoplay';
            if (autoReload) {
                scheduleClick(nextAction, reloadDelay);
            } else {
                if (reloadTimeout) {
                    clearTimeout(reloadTimeout);
                    reloadTimeout = null;
                }
            }
        });

        clearButton.addEventListener('click', function () {
            localStorage.removeItem('PyramidsGameHistory');
            gameHistory = [];
            const statValues = processGameHistory();
            statValues.forEach((value, valueIndex) => {
                statObjects[valueIndex].innerText = value;
            });
        });

        buttonsDiv.appendChild(toggleButton);
        buttonsDiv.appendChild(clearButton);


        mainGameBoard.parentNode.insertBefore(buttonsDiv, mainGameBoard.nextSibling);
    }

    


    function scheduleClick(button, delay) {
        if (autoReload && !reloadTimeout) {
            reloadTimeout = setTimeout(() => {
                button.click();
            }, delay);
        }
    }

    function determinePageType() {
        const mainGameBoard = document.querySelector('table[border="0"][width="550"][cellpadding="0"][cellspacing="1"][bgcolor="black"]');
        const continueGameButton = document.querySelector('input[type="submit"][value="Continue Playing"]');
        const playPyramidsButton = document.querySelector('input[type="submit"][value="Play Pyramids!"]');
        const playPyramidsAgainButton = document.querySelector('input[type="submit"][value="Play Pyramids Again!"]');

        if (mainGameBoard) {
            return 'ACTIVE_GAME'; // Main game board 
        } else if (continueGameButton) {
            return 'CONTINUE_GAME'; // Continue game page
        } else if (playPyramidsButton) {
            return 'START_GAME'; // Start game page
        } else if (playPyramidsAgainButton) {
            return 'GAME_OVER'; // Game over page
        } else {
            return 'UNKNOWN';
        }
    }

    var unseenCards = GM_getValue('unseenCards', (() => {
        const suits = ['spades', 'clubs', 'diamonds', 'hearts'];
        const deck = [];

        for (let suit of suits) {
            for (let rank = 1; rank <= 13; rank++) {
                deck.push({ suit: suit, rank: rank });
            }
        }
        return deck;
    })()).map(cardData => new Card(cardData.suit, cardData.rank));

    // Add listener to stop autoplay when escape key is pressed
    window.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            autoReload = false;
            GM_setValue('autoReload', autoReload);
            if (reloadTimeout) {
                clearTimeout(reloadTimeout);
                reloadTimeout = null;
            }
            if (toggleButton) {
                toggleButton.innerText = 'Enable Autoplay';
            }
        }
    });


    // Wait until the DOM is fully loaded before initializing
    window.addEventListener('load', function () {
        const pageType = determinePageType();

        switch (pageType) {
            case 'ACTIVE_GAME':
                console.log('Active Game');
                const mainGameBoard = document.querySelector('table[border="0"][width="550"][cellpadding="0"][cellspacing="1"][bgcolor="black"]');
                addStatsTable(mainGameBoard);
                addCustomButtons(mainGameBoard);


                const game = new Game(mainGameBoard, unseenCards);
                GM_setValue('unseenCards', game.unseenCards);


                const collectLink = document.querySelector('a[href^="pyramids.phtml?action=collect"]');
                if (collectLink) {
                    nextAction = collectLink;
                    GM_deleteValue('unseenCards');
                    gameHistory.push({ score: game.gamePoints, cardsLeft: game.pyramid.cardsLeft(), won: (game.pyramid.cardsLeft() === 0) });
                    localStorage.setItem('PyramidsGameHistory', JSON.stringify(gameHistory));
                } else {
                    const move = game.chooseMove();
                    nextAction = move.link;
                }
                break;

            case 'CONTINUE_GAME':
                console.log('Continue Game');
                const continuePlayingButton = document.querySelector('input[type="submit"][value="Continue Playing"]');
                const cancelCurrentGameButton = document.querySelector('input[type="submit"][value="Cancel Current Game"]');
                if (startNewGame) {
                    nextAction = cancelCurrentGameButton;
                    GM_deleteValue('unseenCards');
                }
                break;

            case 'START_GAME':
                console.log('Start Game');
                const playPyramidsButton = document.querySelector('input[type="submit"][value="Play Pyramids!"]');
                if (startNewGame) {
                    GM_deleteValue('startNewGame');
                    GM_deleteValue('unseenCards');
                    nextAction = playPyramidsButton;
                }
                break;

            case 'GAME_OVER':
                console.log('Game Over');
                const playPyramidsAgainButton = document.querySelector('input[type="submit"][value="Play Pyramids Again!"]');
                nextAction = playPyramidsAgainButton;
                GM_deleteValue('unseenCards');
                break;

            case 'UNKNOWN':
                console.log('Unknown Page');
                if (autoReload) {
                    console.log('Starting new game!');
                    GM_setValue('startNewGame', true);
                    window.location.assign("https://www.neopets.com/games/pyramids/index.phtml");
                }
                break;
        }
        scheduleClick(nextAction, reloadDelay);
    });
})();
