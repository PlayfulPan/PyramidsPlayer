// ==UserScript==
// @name         Neopets Pyramids Player
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Plays Pyramids
// @author       Pan
// @match        https://www.neopets.com/games/pyramids/pyramids.phtml*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM_deleteValue
// ==/UserScript==

(function () {
    'use strict';

    function addCustomButtons(mainGameBoard) {
        const buttonsDiv = document.createElement('div');
        buttonsDiv.style.marginTop = '10px';
        buttonsDiv.style.marginBottom = '10px';
        buttonsDiv.style.textAlign = 'center';
        buttonsDiv.style.border = '1px solid #000';

        // Create Toggle Script button
        const toggleButton = document.createElement('button');
        toggleButton.innerText = 'Stop Script';
        toggleButton.setAttribute('style', 'margin-right: 10px; cursor: pointer;');

        


        // Create Clear History button
        const clearButton = document.createElement('button');
        clearButton.innerText = 'Clear History';
        clearButton.setAttribute('style', 'cursor: pointer; margin-right: 10px;');

        const myTextBox = document.createElement('input');
        myTextBox.setAttribute('type', 'text');
        myTextBox.setAttribute('id', 'myTextBox');
        myTextBox.setAttribute('value', '0');
        myTextBox.setAttribute('style', 'margin-right: 10px;');

        toggleButton.addEventListener('click', async function () {
            if (toggleButton.innerText === 'Start Script') {
                toggleButton.innerText = 'Stop Script';
            } else {
                toggleButton.innerText = 'Start Script';
            }
            console.log(myTextBox.value);
        });


        buttonsDiv.appendChild(toggleButton);
        buttonsDiv.appendChild(clearButton);
        buttonsDiv.appendChild(myTextBox);


        mainGameBoard.parentNode.insertBefore(buttonsDiv, mainGameBoard.nextSibling);
    }


    // Wait until the DOM is fully loaded before initializing
    window.addEventListener('load', function () {
        const mainGameBoard = document.querySelector('table[border="0"][width="550"][cellpadding="0"][cellspacing="1"][bgcolor="black"]');
        addCustomButtons(mainGameBoard);
    });
})();