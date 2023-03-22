/* Med document.queryselector(selector) kan vi hämta
 * de element som vi behöver från html dokumentet.
 * Vi spearar elementen i const variabler då vi inte kommer att
 * ändra dess värden.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
 * Viktigt: queryselector ger oss ett html element eller flera om det finns.
 */
const clickerButton = document.querySelector('#game-button');
const moneyTracker = document.querySelector('#money');
const mpsTracker = document.querySelector('#mps'); // money per second
const mpcTracker = document.querySelector('#mpc'); // money per click
const upgradesTracker = document.querySelector('#upgrades');
const upgradeList = document.querySelector('#upgradelist');
const soulsRebirthTracker = document.querySelector('#soulsIfRebirth')
const soulsTracker = document.querySelector('#souls')
const msgbox = document.querySelector('#msgbox');
const audioAchievement = document.querySelector('#swoosh');

/* Följande variabler använder vi för att hålla reda på hur mycket pengar som
 * spelaren, har och tjänar.
 * last används för att hålla koll på tiden.
 * För dessa variabler kan vi inte använda const, eftersom vi tilldelar dem nya
 * värden, utan då använder vi let.
 * Läs mer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
 */
let money = 0;
let moneyPerClick = 1;
let moneyPerSecond = 0;
let acquiredUpgrades = 0;
let souls = 0;
let soulsIfRebirth = 0;
let last = 0;
let doubleClick = 0;
let numberOfClicks = 0; // hur många gånger har spelare eg. klickat
let active = false; // exempel för att visa att du kan lägga till klass för att indikera att spelare får valuta

// likt upgrades skapas här en array med objekt som innehåller olika former
// av achievements.
// requiredSOMETHING är vad som krävs för att få dem

let achievements = [
    {
        description: 'Museet är redo att öppna, grattis! ',
        requiredUpgrades: 1,
        acquired: false,
    },
    {
        description: 'Nu börjar det likna något, fortsätt gräva!',
        requiredUpgrades: 10,
        acquired: false,
    },
    {
        description: 'Klickare, med licens att klicka!',
        requiredClicks: 10,
        acquired: false,
    },
    {
        description: 'Tac-2 god!',
        requiredClicks: 10000,
        acquired: false,
    },
];

/* Med ett valt element, som knappen i detta fall så kan vi skapa listeners
 * med addEventListener så kan vi lyssna på ett specifikt event på ett html-element
 * som ett klick.
 * Detta kommer att driva klickerknappen i spelet.
 * Efter 'click' som är händelsen vi lyssnar på så anges en callback som kommer
 * att köras vi varje klick. I det här fallet så använder vi en anonym funktion.
 * Koden som körs innuti funktionen är att vi lägger till moneyPerClick till
 * money.
 * Läs mer: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 */
clickerButton.addEventListener(
    'click',
    () => {
        // vid click öka score med moneyPerClick
        money += (moneyPerClick * (1 + (souls / 100)) * Math.pow(2, doubleClick));
        // håll koll på hur många gånger spelaren klickat
        numberOfClicks += 1;
        // console.log(clicker.score);
    },
    false
);

/* För att driva klicker spelet så kommer vi att använda oss av en metod som heter
 * requestAnimationFrame.
 * requestAnimationFrame försöker uppdatera efter den refresh rate som användarens
 * maskin har, vanligtvis 60 gånger i sekunden.
 * Läs mer: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
 * funktionen step används som en callback i requestanaimationframe och det är
 * denna metod som uppdaterar webbsidans text och pengarna.
 * Sist i funktionen så kallar den på sig själv igen för att fortsätta uppdatera.
 */
function step(timestamp) {
    moneyTracker.textContent = Math.round(money);
    mpsTracker.textContent = moneyPerSecond * (1 + (souls / 100));
    mpcTracker.textContent = (moneyPerClick * (1 + (souls / 100)) * Math.pow(2, doubleClick));
    upgradesTracker.textContent = acquiredUpgrades;
    soulsTracker.textContent = souls;
    soulsRebirthTracker.textContent = Math.floor(money / 100000)

    if (timestamp >= last + 1000) {
        money += moneyPerSecond * (1 + (souls / 100));
        last = timestamp;
    }

    if (moneyPerSecond > 0 && !active) {
        mpsTracker.classList.add('active');
        active = true;
    }

    // achievements, utgår från arrayen achievements med objekt
    // koden nedan muterar (ändrar) arrayen och tar bort achievements
    // som spelaren klarat
    // villkoren i första ifsatsen ser till att achivments som är klarade
    // tas bort. Efter det så kontrolleras om spelaren har uppfyllt kriterierna
    // för att få den achievement som berörs.
    achievements = achievements.filter((achievement) => {
        if (achievement.acquired) {
            return false;
        }
        if (
            achievement.requiredUpgrades &&
            acquiredUpgrades >= achievement.requiredUpgrades
        ) {
            achievement.acquired = true;
            message(achievement.description, 'achievement');
            return false;
        } else if (
            achievement.requiredClicks &&
            numberOfClicks >= achievement.requiredClicks
        ) {
            achievement.acquired = true;
            message(achievement.description, 'achievement');
            return false;
        }
        return true;
    });

    window.requestAnimationFrame(step);
}

/* Här använder vi en listener igen. Den här gången så lyssnar iv efter window
 * objeket och när det har laddat färdigt webbsidan(omvandlat html till dom)
 * När detta har skett så skapar vi listan med upgrades, för detta använder vi
 * en forEach loop. För varje element i arrayen upgrades så körs metoden upgradeList
 * för att skapa korten. upgradeList returnerar ett kort som vi fäster på webbsidan
 * med appendChild.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
 * Efter det så kallas requestAnimationFrame och spelet är igång.
 */
window.addEventListener('load', (event) => {
    createUpgrades();
    window.requestAnimationFrame(step);
});


const createUpgrades = () => {
    upgradeList.innerHTML = "";
    upgrades.forEach((upgrade) => {
        upgradeList.appendChild(createCard(upgrade));
    });
}
/* En array med upgrades. Varje upgrade är ett objekt med egenskaperna name, cost
 * och amount. Önskar du ytterligare text eller en bild så går det utmärkt att
 * lägga till detta.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer
 */
upgrades = [
    {
        name: 'Sharpen sword',
        cost: 10,
        clicks: 1,
        ogCost: 10,
    },
    {
        name: 'Bow',
        cost: 69,
        amount: 2,
        ogCost: 69,
    },
    {
        name: 'Arrows',
        cost: 420,
        amount: 9,
        ogCost: 420,
    },
    {
        name: 'Party member',
        cost: 1000,
        amount: 100,
        ogCost: 1000,
    },
    {
        name: 'Upgrade weapons',
        cost: 1337,
        clicks: 15,
        ogCost: 1337,
    },
    {
        name: 'Combat Training',
        cost: 5000,
        doubleClick: 1,
        ogCost: 5000,
    },
    {
        name: 'Organised party',
        cost: 9999.99,
        amount: 1000,
        ogCost: 9999,
    },
    {
        name: 'Lern magic',
        cost: 69420,
        clicks: 1000,
        ogCost: 69420,
    },
    {
        name: 'Rebirth',
        cost: 100000,
        souls: 1,
    }
];

/* createCard är en funktion som tar ett upgrade objekt som parameter och skapar
 * ett html kort för det.
 * För att skapa nya html element så används document.createElement(), elementen
 * sparas i en variabel så att vi kan manipulera dem ytterligare.
 * Vi kan lägga till klasser med classList.add() och text till elementet med
 * textcontent = 'värde'.
 * Sedan skapas en listener för kortet och i den hittar vi logiken för att köpa
 * en uppgradering.
 * Funktionen innehåller en del strängar och konkatenering av dessa, det kan göras
 * med +, variabel + 'text'
 * Sist så fäster vi kortets innehåll i kortet och returnerar elementet.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
 */
function createCard(upgrade) {
    const card = document.createElement('div');
    card.classList.add('card');
    const header = document.createElement('p');
    header.classList.add('title');
    const cost = document.createElement('p');
    if (upgrade.amount) {
        header.textContent = `${upgrade.name}, +${upgrade.amount} Septims per sekund.`;
    } else if (upgrade.souls) {
        header.textContent = `${upgrade.name},  Start over. `;
    } else if (upgrade.doubleClick) {
        header.textContent = `${upgrade.name}, 2x Septims per click. `;
    } else {
        header.textContent = `${upgrade.name}, +${upgrade.clicks} Septims per klick.`;
    }
    cost.textContent = `Köp för ${upgrade.cost} Septims.`;

    card.addEventListener('click', (e) => {
        if (money >= upgrade.cost) {
            if (upgrade.souls) {
                moneyPerClick = 1;
                moneyPerSecond = 0;
                doubleClick = 0;
                message('Grattis du har rebirthat', 'success');
                souls += Math.floor(money / 100000)
                money = 0;
                for (let i = 0; i < upgrades.length - 1; i++) {
                    upgrades[i].cost = upgrades[i].ogCost;
                }
                createUpgrades();
            }
            else if (upgrade.doubleClick) {
                acquiredUpgrades++;
                money -= upgrade.cost;
                upgrade.cost *= 20;
                cost.textContent = 'Köp för ' + upgrade.cost + ' Septim';
                doubleClick += 1;
                message('Grattis du har köpt en uppgradering!', 'success');
            }
            else {
                acquiredUpgrades++;
                money -= upgrade.cost;
                upgrade.cost *= 1.3;
                cost.textContent = 'Köp för ' + upgrade.cost + ' Septim';
                moneyPerSecond += upgrade.amount ? upgrade.amount : 0;
                moneyPerClick += upgrade.clicks ? upgrade.clicks : 0;
                message('Grattis du har köpt en uppgradering!', 'success');
            }
        } else {
            message('Du har inte råd.', 'warning');
        }
    });

    card.appendChild(header);
    card.appendChild(cost);
    return card;
}

/* Message visar hur vi kan skapa ett html element och ta bort det.
 * appendChild används för att lägga till och removeChild för att ta bort.
 * Detta görs med en timer.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
 */
function message(text, type) {
    const p = document.createElement('p');
    p.classList.add(type);
    p.textContent = text;
    msgbox.appendChild(p);
    if (type === 'achievement') {
        audioAchievement.play();
    }
    setTimeout(() => {
        p.parentNode.removeChild(p);
    }, 2000);
}
