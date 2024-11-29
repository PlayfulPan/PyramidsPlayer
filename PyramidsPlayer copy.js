// ==UserScript==
// @name         Neopets Pyramids Player
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Plays Pyramids
// @author       Pan
// @match        https://www.neopets.com/games/pyramids/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM_deleteValue
// ==/UserScript==

(function () {
    'use strict';

    var autoReload = GM_getValue('autoReload', false);
    var startNewGame = GM_getValue('startNewGame', false);
    var reloadDelay = GM_getValue('reloadDelay', 5000);
    var reloadTimeout = null;



    class Game {
        constructor(mainGameBoardElement, seenCards = []) {
            this.mainGameBoardElement = mainGameBoardElement;
            this.seenCards = seenCards;

            this.parseGameStats();
            this.parseCards();

            this.updateSeenCards();

            this.generateUnseenCards();
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

        updateSeenCards() {
            this.pyramid.getFaceUpCards().forEach(card => {
                if (!this.seenCards.some(seenCard => seenCard.matches(card))) {
                    this.seenCards.push(card);
                }
            });

            if (this.stackPile.type === 'FACE_UP' && !this.seenCards.some(seenCard => seenCard.matches(this.stackPile.card))) {
                this.seenCards.push(this.stackPile.card);
            }
        }

        generateUnseenCards() {
            this.unseenCards = [];
            const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

            for (let rank = 1; rank <= 13; rank++) {
                for (let suit of suits) {
                    const card = new Card(suit, rank);
                    if (!this.seenCards.some(seenCard => seenCard.matches(card))) {
                        this.unseenCards.push(card);
                    }
                }
            }
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

            return { space: space, stats: [totalRevealed, firstRevealed, possibleDraws.length, ancestorCount] };
        }

        chooseMove() {
            const possiblePlays = Game.findConsecutivePlays(this.stackPile.card, this.pyramid.getFaceUpCards());
            if (possiblePlays.length === 0) {
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
                                }
                            }
                        }
                    }
                    return best;
                });
                return bestPlay.space;
            }
        }

    }

    class Pyramid {

        constructor(pyramidRows) {
            this.rows = [];
            this.spaces = [];

            for (let i = 0; i < 7; i++) {
                let row = [];
                let imgs = pyramidRows[i].querySelectorAll('img');
                for (let j = 0; j < i + 1; j++) {
                    let space = new PyramidSpace(imgs[j], [i, j]);
                    row.push(space);
                    this.spaces.push(space);
                }
                this.rows.push(row);
            }

            this.mapSpaces();
        }

        mapSpaces() {
            for (let space of this.spaces) {
                for (let generationOffset = 1; generationOffset <= space.position[0]; generationOffset++) {
                    let generation = [];
                    for (
                        let j = Math.max(0, space.position[1] - generationOffset);
                        j <= Math.min(space.position[1], space.position[0] - generationOffset);
                        j++
                    ) {
                        generation.push(this.rows[space.position[0] - generationOffset][j]);
                    }
                    space.ancestors.push(generation);
                    if (generationOffset === 1) {
                        space.parents = generation;
                    }
                }

                for (let generationOffset = 1; generationOffset < 7 - space.position[0]; generationOffset++) {
                    let generation = [];
                    for (
                        let j = space.position[1];
                        j <= Math.min(space.position[0] + generationOffset, space.position[1] + generationOffset);
                        j++
                    ) {
                        generation.push(this.rows[space.position[0] + generationOffset][j]);
                    }
                    space.descendants.push(generation);
                    if (generationOffset === 1) {
                        space.children = generation;
                    }
                }
            }
        }

        getFaceUpCards() {
            return this.spaces
                .filter(space => space.type === 'FACE_UP')
                .map(space => space.card);
        }

        cardsLeft() {
            return this.spaces.filter(space => space.type !== 'EMPTY').length;
        }

        getSpaceByCard(card) {
            for (const space of this.spaces) {
                if (space.card === card) {
                    return space;
                }
            }
        }

        findRevealedSpaces(sequence) {
            const emptySpaces = this.spaces.filter(space => space.type === 'EMPTY');
            const spacesToPlay = sequence.map(card => this.getSpaceByCard(card));
            const spacesRevealed = [];
            const spacesPlayed = [];

            for (const space of spacesToPlay) {
                spacesPlayed.push(space);
                const revealedSpaces = space.parents.filter(parent => {
                    const notInRevealed = !spacesRevealed.some(sublist => sublist.includes(parent));
                    const isFaceDown = parent.type === 'FACE_DOWN';
                    const combinedSpaces = emptySpaces.concat(spacesPlayed);
                    const allChildrenCleared = parent.children.every(child => combinedSpaces.includes(child));
                    return notInRevealed && isFaceDown && allChildrenCleared;
                });
                spacesRevealed.push(revealedSpaces);
            }

            return spacesRevealed;
        }

        toString() {
            const printRows = this.rows.map(row => row.map(space => space.toString()));
            printRows.forEach(row => console.log(row));
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

    class PyramidSpace extends Space {
        constructor(img, position) {
            super(img);

            const rowAdjustment = [0, 1, 3, 6, 10, 15, 21]
            const pointsByRow = [502, 27, 17, 12, 7, 4, 3]

            this.position = position;
            this.index = rowAdjustment[position[0]] + position[1] + 1;
            this.points = pointsByRow[position[0]];

            this.children = [];
            this.parents = [];

            this.descendants = [];
            this.ancestors = [];
        }

        ancestorCount() {
            return this.ancestors.map(generation => generation.length).reduce((a, b) => a + b, 0);
        }

        ancestorsToString() {
            const ancestorStrings = this.ancestors.map(generation => generation.map(space => space.toString()));
            ancestorStrings.forEach(generation => console.log(generation));
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

    function addGUI(mainGameBoard) {

        const gui = document.createElement('div');

        gui.style.marginTop = '10px';
        gui.style.marginBottom = '10px';
        gui.style.textAlign = 'center';



        const delaySettings = document.createElement('div');



        const minClickDelayInput = document.createElement('input');
        minClickDelayInput.type = 'number';
        minClickDelayInput.min = 0;
        minClickDelayInput.id = 'minClickDelayInput';

        const minClickDelayLabel = document.createElement('label');
        minClickDelayLabel.textContent = 'Min. (ms): ';
        minClickDelayLabel.htmlFor = minClickDelayInput.id;

        const minClickDelayDiv = document.createElement('div');
        minClickDelayDiv.appendChild(minClickDelayLabel);
        minClickDelayDiv.appendChild(minClickDelayInput);


        const maxClickDelayInput = document.createElement('input');
        maxClickDelayInput.type = 'number';
        maxClickDelayInput.min = 0;
        maxClickDelayInput.id = 'minClickDelayInput';

        const maxClickDelayLabel = document.createElement('label');
        maxClickDelayLabel.textContent = 'Max. (ms): ';
        maxClickDelayLabel.htmlFor = minClickDelayInput.id;

        const maxClickDelayDiv = document.createElement('div');
        maxClickDelayDiv.appendChild(maxClickDelayLabel);
        maxClickDelayDiv.appendChild(maxClickDelayInput);





        delaySettings.appendChild(minClickDelayDiv);
        delaySettings.appendChild(maxClickDelayDiv);


        gui.append

        mainGameBoard.parentNode.insertBefore(gui, mainGameBoard.nextSibling);

    }


    function scheduleReload(delay) {
        if (autoReload && !reloadTimeout) {
            reloadTimeout = setTimeout(() => {
                location.reload();
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

    // Wait until the DOM is fully loaded before initializing
    window.addEventListener('load', function () {
        const pageType = determinePageType();

        switch (pageType) {
            case 'ACTIVE_GAME':
                console.log('Active Game');
                const mainGameBoard = document.querySelector('table[border="0"][width="550"][cellpadding="0"][cellspacing="1"][bgcolor="black"]');
                addGUI(mainGameBoard);
                const game = new Game(mainGameBoard);
                game.logBoardState();
                console.log(game.chooseMove().toString());
                break;

            case 'CONTINUE_GAME':
                console.log('Continue Game');
                const continuePlayingButton = document.querySelector('input[type="submit"][value="Continue Playing"]');
                const cancelCurrentGameButton = document.querySelector('input[type="submit"][value="Cancel Current Game"]');
                if (startNewGame) {
                    cancelCurrentGameButton.click();
                }
                break;

            case 'START_GAME':
                console.log('Start Game');
                const playPyramidsButton = document.querySelector('input[type="submit"][value="Play Pyramids!"]');
                if (startNewGame) {
                    GM_deleteValue('startNewGame');
                    playPyramidsButton.click();
                }
                break;

            case 'GAME_OVER':
                console.log('Game Over');
                break;

            case 'UNKNOWN':
                console.log('Unknown Page');
                break;
        }
    });
})();
