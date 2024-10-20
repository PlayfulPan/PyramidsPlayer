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


    let board = [];
    let stack;

    function parseCardName(cardName) {
        const [rankStr, suit] = cardName.split('_');
        let rank = parseInt(rankStr, 10);

        if (rank === 14) {
            rank = 1;
        }

        return { rank, suit };
    }

    function getSuitSymbol(suit) {
        const suitSymbols = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };

        return suitSymbols[suit.toLowerCase()] || '';
    }

    function displayRank(rank) {
        const displayRankMapping = {
            1: 'A',
            11: 'J',
            12: 'Q',
            13: 'K'
        };

        return displayRankMapping[rank] || rank.toString();
    }

    function getCardInfo(img) {
        const src = img.getAttribute('src');

        if (src.includes('pyramid.gif')) {
            // Face Down Card
            return { type: 'BACK' };
        } else if (src.includes('blank.gif')) {
            // Empty Space
            return { type: 'EMPTY' };
        } else {
            // Face Up Card
            const cardName = src.split('/').pop().replace('.gif', ''); // e.g., "10_spades" or "J_hearts"
            const { rank, suit } = parseCardName(cardName);

            const parent = img.parentElement;
            if (parent && parent.tagName.toLowerCase() === 'a') {
                return { type: 'CARD', rank, suit, link: parent };
            } else {
                return { type: 'CARD', rank, suit };
            }
        }
    }

    function parseBoard() {
        const table = document.querySelector('table[width="400"]');
        if (!table) {
            console.warn("Neopets Pyramids game table not found.");
            return;
        }

        board = [];
        const rows = table.querySelectorAll('tr');

        rows.forEach((tr, rowIndex) => {
            const rowData = [];
            const imgs = tr.querySelectorAll('img');

            imgs.forEach((img, columnIndex) => {
                let cardInfo = getCardInfo(img);
                cardInfo.row = rowIndex;
                cardInfo.col = columnIndex;
                rowData.push(cardInfo);
            });

            board.push(rowData);
        });
    }

    /**
     * Logs the internal board state to the console in a structured format without centering.
     * @param {Array} board - The current board state.
     */
    function logBoardState() {
        console.group("Neopets Pyramids Board State");
        board.forEach((row, rowIndex) => {
            const rowDisplay = row.map(card => {
                if (card.type === 'BACK') return '🂠'; // Face Down Card
                if (card.type === 'EMPTY') return '⬜'; // Empty Space
                if (card.type === 'CARD') return `${displayRank(card.rank)}${getSuitSymbol(card.suit)}`; // Face Up Card with Rank and Suit Symbol
                return '❓'; // Unknown Card Type
            }).join(' ');

            console.log(`Row ${rowIndex + 1}: ${rowDisplay}`);
        });
        console.groupEnd();
    }

    /**
     * Clicks on the draw pile.
     */
    function clickDrawPile() {
        const drawPileLink = document.querySelector('a[href*="action=draw"]');
        if (drawPileLink) {
            console.log("Clicking on the draw pile!");
            drawPileLink.click();
        } else {
            console.error("Draw pile link not found!");
        }
    }

    /**
     * Identifies and returns the face-up card on the stack.
     * @returns {Object|null} - An object containing rank and suit of the stack card, or null if not found.
     */
    function parseStackCard() {
        // Locate the first <tr> in the main game area
        const mainGameArea = document.querySelector('tbody > tr:nth-child(1) > td[align="center"][valign="top"]');
        if (!mainGameArea) {
            console.error("Main game area not found.");
            return null;
        }

        const imgs = mainGameArea.querySelectorAll('img');
        if (imgs.length < 2) {
            console.error("Stack card not found.");
            return null;
        }

        const stackImg = imgs[1]; // The second image is the stack card
        const stackCard = getCardInfo(stackImg);

        if (stackCard.type !== 'CARD') {
            console.error("No face up stack card!");
            return null;
        }

        stack = stackCard;
        return stackCard;

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
    function findConsecutivePlays(stackCard, playedCards = new Set()) {
        let sequences = [];

        const faceUpCards = board.flat().filter((element) => element.type === 'CARD');

        for (let i = 0; i < faceUpCards.length; i++) {
            let card = faceUpCards[i];

            // Skip if the card is already played in the current sequence
            if (playedCards.has(card)) continue;

            if (canPlay(card, stackCard)) {
                // Mark the card as played
                playedCards.add(card);

                // Start a new sequence with this position
                let newSequence = [card];

                // Recursively find further plays
                let subsequentSequences = findConsecutivePlays(card, playedCards);

                if (subsequentSequences.length > 0) {
                    // Append the current position to each subsequent sequence
                    subsequentSequences.forEach(seq => {
                        sequences.push(newSequence.concat(seq));
                    });
                } else {
                    // No further plays, so this is a complete sequence
                    sequences.push(newSequence);
                }

                // Unmark the card for other sequences
                playedCards.delete(card);
            }
        }
        return sequences;
    }

    function getCardByPos(row, col) {
        return board.flat().find((element) => element.row == row && element.col == col);
    }

    function countRevealedCards(play) {
        const faceDownCards = board.flat().filter((card) => card.type === 'BACK');
        let revealedCards = 0;

        for (let i = 0; i < faceDownCards.length; i++) {
            let card = faceDownCards[i];
            let leftCard = getCardByPos(card.row + 1, card.col);
            let rightCard = getCardByPos(card.row + 1, card.col + 1);

            if ((leftCard.type === 'EMPTY' || play.includes(leftCard)) && (rightCard.type === 'EMPTY' || play.includes(rightCard))) {
                revealedCards++;
            }
        }
        return revealedCards;
    }

    function makeMove() {
        const possiblePlays = findConsecutivePlays(stack);

        if (possiblePlays.length === 0) {
            clickDrawPile();
        } else {
            const cardsRevealed = possiblePlays.map((play) => countRevealedCards(play));
            const bestCard = possiblePlays[cardsRevealed.indexOf(Math.max(...cardsRevealed))][0];
            console.log(`Clicking ${displayRank(bestCard.rank)}${getSuitSymbol(bestCard.suit)}!`);
            bestCard.link.click();
        }
    }



    // Wait until the DOM is fully loaded before initializing
    window.addEventListener('load', async function () {
        const isRunning = await GM.getValue("isRunning", false);

        const playAgainButton = document.querySelector('input[type="submit"][value="Play Pyramids Again!"]');
        const mainGameTable = document.querySelector('table[border="0"][width="550"][cellpadding="0"][cellspacing="1"][bgcolor="black"]');
        const collectLink = document.querySelector('a[href^="pyramids.phtml?action=collect"]');

        const customButton = document.createElement('button');

        if (isRunning) {
            customButton.textContent = 'Disable Autoplay';
        } else {
            customButton.textContent = 'Enable Autoplay';
        }

        customButton.addEventListener('click', async function () {
            await GM.setValue('isRunning', !isRunning);
            location.reload();
        });

        if (playAgainButton) {
            customButton.style.display = 'block'; // Ensures the button starts on a new line
            customButton.style.marginTop = '10px'; // Adds spacing above the button
            playAgainButton.parentNode.insertBefore(customButton, playAgainButton.nextSibling);
        } else if (mainGameTable) {
            // Create a container div to center the button
            const containerDiv = document.createElement('div');
            containerDiv.style.textAlign = 'center';
            containerDiv.style.marginTop = '10px'; // Adds spacing above the button
            customButton.style.padding = '10px 20px';
            customButton.style.fontSize = '16px';
            customButton.style.cursor = 'pointer';

            // Append the button to the container div
            containerDiv.appendChild(customButton);

            // Insert the container div after the target table
            mainGameTable.parentNode.insertBefore(containerDiv, mainGameTable.nextSibling);
        }

        if (isRunning) {

            await delay();

            if (playAgainButton) {
                playAgainButton.click();
            } else if (mainGameTable && collectLink) {
                collectLink.click();
            } else if (mainGameTable) {
                parseBoard();
                parseStackCard();
                makeMove();
            } else {
                await GM.deleteValue('isRunning');
            }
        }
    });

})();
