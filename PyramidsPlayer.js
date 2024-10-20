// ==UserScript==
// @name         Neopets Pyramids Board Reader Enhanced
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Reads the board state of Neopets Pyramids, logs it to the console, maintains an internal structured representation with integer ranks, and provides functions to interact with specific board positions, the draw pile, and the stack.
// @author       YourName
// @match        https://www.neopets.com/games/pyramids/pyramids.phtml*
// @grant GM_setValue
// @grant GM_getValue
// @grant GM.setValue
// @grant GM.getValue
// @grant GM_deleteValue
// ==/UserScript==

(function () {
    'use strict';


    const minClickTiming = 1000;
    const maxClickTiming = 2000;

    function delay() {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                resolve(); // Signal that the operation is complete
            }, Math.round(minClickTiming + Math.random() * (maxClickTiming - minClickTiming)));
        });
    }

    class Card {

        constructor(img) {
            this.source = img.getAttribute('src');
            if (this.source.includes('pyramid.gif')) {
                this.type = 'FACEDOWN';
            } else if (this.source.includes('blank.gif')) {
                this.type = 'EMPTY';
            } else {
                this.type = 'FACEUP';

                const cardName = this.source.split('/').pop().replace('.gif', ''); // e.g., "10_spades" or "J_hearts"

                const [rankStr, suit] = cardName.split('_');
                let rank = parseInt(rankStr, 10);
                if (rank === 14) {
                    rank = 1;
                }
                this.suit = suit;
                this.rank = rank;
            }
            const parent = img.parentElement;
            if (parent && parent.tagName.toLowerCase() === 'a') {
                this.link = parent;
            }
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

        click() {
            if (this.link) {
                this.link.click();
            } else {
                console.warn(`Card ${this.displayName()} is not clickable!`);
            }
        }
    }

    class Board {

        constructor(mainGameBoardElement) {
            this.mainGameBoard = mainGameBoardElement;
            this.consecutivePlays = 0;
            this.gamePoints = 0;
            this.cardsInPile = 0;
            this.highScore = 0;
            this.drawPile = null;
            this.stackCard = null; // { rank: Number, suit: String }
            this.pyramidCards = []; // Array of card objects { position: Number, rank: Number, suit: String }

            this.parseTopStats();
            this.parseCards();
        }

        parseTopStats() {
            // Locate the top statistics table
            const statsTable = this.mainGameBoard.querySelector('table[cellpadding="2"][cellspacing="1"][width="550"]');
            const rows = statsTable.querySelectorAll('tr');

            // Assuming the second row contains the data
            const dataRow = rows[1];
            const dataCells = dataRow.querySelectorAll('td');

            // Extract and parse the statistics
            this.consecutivePlays = parseInt(dataCells[0].textContent.trim(), 10) || 0;
            this.gamePoints = parseInt(dataCells[1].textContent.trim(), 10) || 0;
            this.cardsInPile = parseInt(dataCells[2].textContent.trim(), 10) || 0;
            this.highScore = parseInt(dataCells[3].textContent.trim(), 10) || 0;
        }

        parseCards() {
            // Locate the main game area table
            const gameAreaTable = this.mainGameBoard.querySelector('table[cellpadding="3"][cellspacing="0"][width="550"][height="450"]');
            const gameAreaRows = gameAreaTable.querySelectorAll('tr');

            // Parse draw pile and stack card
            const stackCardRow = gameAreaRows[0]; // Assuming first row contains draw pile and stack card
            const stackCardCell = stackCardRow.querySelector('td[align="center"][valign="top"]');
            const stackImages = stackCardCell.querySelectorAll('img');

            this.drawPile = new Card(stackImages[0]); // Assuming the first image is the draw pile
            this.stackCard = new Card(stackImages[1]); // Assuming the second image is the draw pile

            // Parse the pyramid cards from the nested table
            const pyramidNestedTable = gameAreaRows[1].querySelector('table[cellpadding="0"][cellspacing="0"][width="400"]');
            const pyramidRows = pyramidNestedTable.querySelectorAll('tr');
            pyramidRows.forEach((tr, rowIndex) => {
                const rowData = [];
                const imgs = tr.querySelectorAll('img');
                imgs.forEach((img, colIndex) => {
                    let card = new Card(img);
                    card.row = rowIndex;
                    card.col = colIndex;
                    rowData.push(card);
                });
                this.pyramidCards.push(rowData);
            });
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
                const rowDisplay = row.map(card => {
                    return card.displayName();
                }).join(' ');
                console.log(`Row ${rowIndex + 1}: ${rowDisplay}`);
            });
            console.groupEnd();

            console.groupEnd();
        }

        getCardByPos(row, col) {
            return this.pyramidCards.flat().find((element) => element.row == row && element.col == col);
        }

        getFaceUpCards() {
            return this.pyramidCards.flat().filter((element) => element.type === 'FACEUP');
        }

        getFaceDownCards() {
            return this.pyramidCards.flat().filter((element) => element.type === 'FACEDOWN');
        }

        getEmptyCards() {
            return this.pyramidCards.flat().filter((element) => element.type === 'EMPTY');
        }

        draw() {
            if (this.drawPile.link && this.cardsInPile > 0) {
                this.drawPile.click();
                console.log("Clicked on draw pile!");
            } else {
                console.error("Draw pile link not found!");
            }
        }
    }

    function canPlay(card, stackCard) {
        if (stackCard.rank === 1) { // Ace
            return card.rank === 2 || card.rank === 13; // Ace can be played on King or 2
        } else if (stackCard.rank === 13) { // King
            return card.rank === 12 || card.rank === 1; // King can be played on Queen or Ace
        } else {
            return card.rank === stackCard.rank + 1 || card.rank === stackCard.rank - 1;
        }
    }

    /**
     * Recursively constructs all possible consecutive play sequences.
     * @param {Object} stackCard - The current stack card, with properties 'rank' and 'suit'.
     * @param {Set} playedCards - A set of positions already played in the current sequence.
     * @returns {Array} - An array of consecutive play sequences, each sequence is an array of face up cards.
     */
    function findConsecutivePlays(stackCard, board, playedCards = new Set()) {
        let sequences = [];

        const faceUpCards = board.getFaceUpCards();

        for (let i = 0; i < faceUpCards.length; i++) {
            let card = faceUpCards[i];

            // Skip if the card is already played in the current sequence
            if (playedCards.has(card)) continue;

            if (canPlay(card, stackCard)) {

                playedCards.add(card); // Mark the card as played

                let newSequence = [card]; // Start a new sequence with this position
                let subsequentSequences = findConsecutivePlays(card, board, playedCards); // Recursively find further plays

                if (subsequentSequences.length > 0) { // Append the current position to each subsequent sequence
                    subsequentSequences.forEach(seq => {
                        sequences.push(newSequence.concat(seq));
                    });
                } else {
                    sequences.push(newSequence); // No further plays, so this is a complete sequence
                }
                playedCards.delete(card); // Unmark the card for other sequences
            }
        }
        return sequences;
    }

    function pickMove(board) {
        const possiblePlays = findConsecutivePlays(board.stackCard, board);

        if (possiblePlays.length === 0) {
            return board.drawPile;
        } else {
            const cardsRevealed = possiblePlays.map((play) => {
                const faceDownCards = board.getFaceDownCards();
                let revealedCards = 0;
                for (let i = 0; i < faceDownCards.length; i++) {
                    let card = faceDownCards[i];
                    let leftCard = board.getCardByPos(card.row + 1, card.col);
                    let rightCard = board.getCardByPos(card.row + 1, card.col + 1);

                    if ((leftCard.type === 'EMPTY' || play.includes(leftCard)) && (rightCard.type === 'EMPTY' || play.includes(rightCard))) {
                        revealedCards++;
                    }
                }
                return revealedCards;
            });
            return possiblePlays[cardsRevealed.indexOf(Math.max(...cardsRevealed))][0];
        }
    }

    function addStatsTable(mainGameBoard, gameHistory) {

        const columnWidths = ['150', '125', '125', '150']

        // Create a new row to hold the stats table and buttons
        const newRow = mainGameBoard.insertRow(-1);
        const newCell = newRow.insertCell(0);

        // Create the inner table
        const customStatsTable = document.createElement('table');
        customStatsTable.setAttribute('border', '0');
        customStatsTable.setAttribute('cellpadding', '2');
        customStatsTable.setAttribute('cellspacing', '1');
        customStatsTable.setAttribute('width', '550');

        // Create the header row
        const headerRow = document.createElement('tr');
        headerRow.setAttribute('bgcolor', 'lightgrey');

        const headers = ['Games Recorded', 'Games Won', 'Win Rate', 'Average Score'];
        headers.forEach((headerText, headerIndex) => {
            const th = document.createElement('td');
            th.setAttribute('align', 'center');
            th.setAttribute('width', columnWidths[headerIndex]);
            th.innerHTML = `<b>${headerText}</b>`;
            headerRow.appendChild(th);
        });
        customStatsTable.appendChild(headerRow);

        // Create the data row
        const dataRow = document.createElement('tr');
        dataRow.setAttribute('bgcolor', 'white');

        let statValues;
        const gamesRecorded = gameHistory.length;
        if (gamesRecorded === 0) {
            statValues = ['0', '0', 'N/A', 'N/A'];
        } else {
            const gamesWon = gameHistory.filter((element) => element.won).length;
            const winRate = gamesWon * 100 / gamesRecorded;

            let totalScore = 0;
            for (let i = 0; i < gameHistory.length; i++) {
                totalScore += gameHistory[i].score;
            }
            const avgScore = totalScore / gamesRecorded;

            statValues = [gamesRecorded.toString(), gamesWon.toString(), `${winRate.toFixed(2)}%`, Math.round(avgScore).toString()];
        }

        statValues.forEach((value, valueIndex) => {
            const td = document.createElement('td');
            td.setAttribute('align', 'center');
            td.setAttribute('width', columnWidths[valueIndex]);
            td.innerText = value;
            dataRow.appendChild(td);
        });
        customStatsTable.appendChild(dataRow);

        
        newCell.appendChild(customStatsTable); 
    }

    function addCustomButtons(mainGameBoard, isRunning) {
        const buttonsDiv = document.createElement('div');
        buttonsDiv.style.marginTop = '10px';
        buttonsDiv.style.marginBottom = '10px';
        buttonsDiv.style.textAlign = 'center';

        // Create Toggle Script button
        const toggleButton = document.createElement('button');
        toggleButton.innerText = isRunning ? 'Disable Autoplay' : 'Enable Autoplay';
        toggleButton.setAttribute('style', 'margin-right: 10px; cursor: pointer;');

        // Create Clear History button
        const clearButton = document.createElement('button');
        clearButton.innerText = 'Clear History';
        clearButton.setAttribute('style', 'cursor: pointer;');

        // Attach event listeners
        toggleButton.addEventListener('click', async function () {
            await GM.setValue('isRunning', !isRunning);
            location.reload();
        });
        clearButton.addEventListener('click', async function () {
            localStorage.removeItem('PyramidsGameHistory');
            location.reload();
        });

        buttonsDiv.appendChild(toggleButton);
        buttonsDiv.appendChild(clearButton);


        mainGameBoard.parentNode.insertBefore(buttonsDiv, mainGameBoard.nextSibling);
    }

    // Wait until the DOM is fully loaded before initializing
    window.addEventListener('load', async function () {
        const isRunning = await GM.getValue("isRunning", false);

        const gameHistory = JSON.parse(localStorage.getItem('PyramidsGameHistory')) || [];
        console.log(gameHistory);

        const mainGameBoard = document.querySelector('table[border="0"][width="550"][cellpadding="0"][cellspacing="1"][bgcolor="black"]');
        const collectLink = document.querySelector('a[href^="pyramids.phtml?action=collect"]');
        const playAgainButton = document.querySelector('input[type="submit"][value="Play Pyramids Again!"]');

        let gameBoard;

        if (mainGameBoard) {
            gameBoard = new Board(mainGameBoard);
            addStatsTable(mainGameBoard, gameHistory);
            addCustomButtons(mainGameBoard, isRunning);
        }

        if (isRunning) {

            await delay();

            if (playAgainButton) {
                playAgainButton.click();
            } else if (mainGameBoard && collectLink) {
                let cardsLeft = gameBoard.getFaceDownCards().length + gameBoard.getFaceUpCards().length;
                let won = (cardsLeft === 0);
                let gameStats = { score: gameBoard.gamePoints, cardsLeft, won };
                gameHistory.push(gameStats);
                localStorage.setItem('PyramidsGameHistory', JSON.stringify(gameHistory));
                collectLink.click();
            } else if (mainGameBoard) {
                const nextMove = pickMove(gameBoard);
                nextMove.click();
            } else {
                await GM.deleteValue('isRunning');
            }
        }
    });

})();

