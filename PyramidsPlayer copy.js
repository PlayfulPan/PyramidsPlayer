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

            // Update seen cards with face-up cards from the pyramid and stack
            this.updateSeenCards();

            // Generate unseen cards
            this.generateUnseenCards();
        }

        parseGameStats() {
            const statsTable = this.mainGameBoardElement.querySelector('table[cellpadding="2"][cellspacing="1"][width="550"]');
            const rows = statsTable.querySelectorAll('tr');

            const dataRow = rows[1]; // Assuming the second row contains the data
            const dataCells = dataRow.querySelectorAll('td');

            this.consecutivePlays = parseInt(dataCells[0].textContent.trim(), 10) || 0;
            this.gamePoints = parseInt(dataCells[1].textContent.trim(), 10) || 0;
            this.cardsInPile = parseInt(dataCells[2].textContent.trim(), 10) || 0;
            this.highScore = parseInt(dataCells[3].textContent.trim(), 10) || 0;
        }

        parseCards() {
            // Locate the main game area table
            const gameAreaTable = this.mainGameBoardElement.querySelector('table[cellpadding="3"][cellspacing="0"][width="550"][height="450"]');
            const gameAreaRows = gameAreaTable.querySelectorAll('tr');

            // Parse draw pile and stack card
            const stackCardRow = gameAreaRows[0]; // Assuming first row contains draw pile and stack card
            const stackCardCell = stackCardRow.querySelector('td[align="center"][valign="top"]');
            const stackImages = stackCardCell.querySelectorAll('img');

            const drawParent = stackImages[0].parentElement;
            if (drawParent && drawParent.tagName.toLowerCase() === 'a') {
                this.drawLink = drawParent;
            }

            this.stackCard = new Card(Card.parseCardData(stackImages[1])); // Assuming the second image is the stack card

            // Parse the pyramid cards from the nested table
            const pyramidNestedTable = gameAreaRows[1].querySelector('table[cellpadding="0"][cellspacing="0"][width="400"]');
            const pyramidRows = pyramidNestedTable.querySelectorAll('tr');

            this.pyramidCards = [];
            this.clickableCards = [];

            pyramidRows.forEach((tr) => {
                const rowData = [];
                const imgs = tr.querySelectorAll('img');

                imgs.forEach((img) => {
                    const cardData = Card.parseCardData(img);
                    const card = new Card(cardData);
                    rowData.push(card);

                    const parent = img.parentElement;
                    if (parent && parent.tagName.toLowerCase() === 'a') {
                        const clickableCard = new Card(cardData);
                        clickableCard.link = parent;
                        this.clickableCards.push(clickableCard);
                    }
                });
                this.pyramidCards.push(rowData);
            });
        }

        updateSeenCards() {
            // Add face-up pyramid cards to seen cards
            this.pyramidCards.flat().forEach(card => {
                if (card.type === 'FACEUP' && !this.seenCards.some(seenCard => seenCard.matches(card))) {
                    this.seenCards.push(card);
                }
            });

            // Add stack card to seen cards
            if (this.stackCard.type === 'FACEUP' && !this.seenCards.some(seenCard => seenCard.matches(this.stackCard))) {
                this.seenCards.push(this.stackCard);
            }
        }

        generateUnseenCards() {
            this.unseenCards = [];
            const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

            for (let rank = 1; rank <= 13; rank++) {
                for (let suit of suits) {
                    const card = new Card({ type: 'FACEUP', rank, suit });
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
            console.log(`Stack Card: ${this.stackCard.displayName()}`);
            console.groupEnd();

            // Print Pyramid Cards
            console.group("Pyramid Cards");
            this.pyramidCards.forEach((row, rowIndex) => {
                const rowDisplay = row.map(card => card.displayName()).join(' ');
                console.log(`Row ${rowIndex + 1}: ${rowDisplay}`);
            });
            console.groupEnd();

            console.groupEnd();
        }
    }

    class Pyramid {
        
        constuctor() {

        }

        static Space = class {
            constructor(position) {
                const rowAdjustment = [0, 1, 3, 6, 10, 15, 21]
                const pointsByRow = [502, 27, 17, 12, 7, 4, 3]

                this.position = position;
                this.index = rowAdjustment[position[0]] + position[1] + 1;
                this.points = pointsByRow[position[0]];

                this.card = null;
                this.type = 'EMPTY';

                this.children = [];
                this.parents = [];
                
            }
        }




    }

    class Card {
        constructor(cardData) {
            this.type = cardData.type;
            if (this.type === 'FACEUP') {
                this.rank = cardData.rank;
                this.suit = cardData.suit;
            }
        }

        static parseCardData(img) {
            const source = img.getAttribute('src');
            let cardData = {};

            if (source.includes('pyramid.gif')) {
                cardData.type = 'FACEDOWN';
            } else if (source.includes('blank.gif')) {
                cardData.type = 'EMPTY';
            } else {
                cardData.type = 'FACEUP';

                const cardName = source.split('/').pop().replace('.gif', ''); // e.g., "10_spades" or "J_hearts"
                const [rankStr, suit] = cardName.split('_');
                let rank = parseInt(rankStr, 10);
                if (rank === 14) {
                    rank = 1;
                }
                cardData.suit = suit;
                cardData.rank = rank;
            }

            return cardData;
        }

        displayName() {
            const suitSymbols = { 'hearts': '♥', 'diamonds': '♦', 'clubs': '♣', 'spades': '♠' };
            const rankSymbols = { 1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K' };

            switch (this.type) {
                case 'FACEDOWN':
                    return '🂠';
                case 'EMPTY':
                    return '⬜';
                case 'FACEUP':
                    return `${rankSymbols[this.rank]}${suitSymbols[this.suit]}`;
                default:
                    return '❓';
            }
        }

        matches(card) {
            if (this.type === 'FACEUP' && card.type === 'FACEUP') {
                return this.rank === card.rank && this.suit === card.suit;
            } else {
                return this.type === card.type;
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
