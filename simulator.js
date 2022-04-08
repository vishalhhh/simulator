let siteMap;
let visitedMap;
let currentDirection;
let currentPosition;
let commandList;
let countMap;
let costMap;
let visitCountMap;
let unclearedCount;
// credits
const perUnitCredit = 1;
const unclearedUnitCredit = 3;


window.onload = () => {
    document.getElementById("actionButtons").style.display = 'none';
    document.getElementById("cost-report-id").style.display = 'none';
    document.getElementById('reset-button').disabled = true;
    // initialize
    currentDirection = 'right';
    currentPosition = [0, -1];
    commandList = [];
    countMap = new Map();
    costMap = new Map([['o', 0], ['r', 0], ['t', 0]]);
    visitCountMap = new Map();
    unclearedCount = 0;
}

const loadSiteMapFile = () => {
    let fileToLoad = document.getElementById("fileToLoad").files[0];
    let fileReader = new FileReader();
    if (fileToLoad) {
        fileReader.onload = function (fileLoadedEvent) {
            let siteMapArray = fileLoadedEvent.target.result.split(/\n|\r/g);
            siteMap = [];
            for (let i = 0; i < siteMapArray.length; i++) {
                if ([...siteMapArray[i]].length > 0)
                siteMap.push([...siteMapArray[i]]);
            }
            manageDisplay();
            setSite();
            actionButtons();
        };
        fileReader.readAsText(fileToLoad, "UTF-8");
    }

}

const manageDisplay = () => {
    if (siteMap.length > 0) {
        document.getElementById('reset-button').disabled = false;
        document.getElementById("site").style.display = 'flex';
        document.getElementById("warning-message").style.display = 'none';
        document.getElementById("bull").style.display = 'block';
        document.getElementById("command-report-id").style.display = 'flex';
        document.getElementById("actionButtons").style.display = 'block';
        document.getElementById("cost-report-id").style.display = 'block';
    }
}

const actionButtons = () => {
    const leftButton = document.querySelector('#left-button');
    const rightButton = document.querySelector('#right-button');
    const advanceButton = document.querySelector('#advance-button');
    const quitButton = document.querySelector('#quit-button');

    // make buttons disabled on load
    if (commandList.length === 0) {
        leftButton.disabled = true;
        rightButton.disabled = true;
    }

    leftButton.addEventListener('click', () => {
        let bull = document.getElementById('bull-id');
        if (bull.style.transform === 'rotate(-90deg)') {
            bull.style.transform = 'rotateY(180deg)';
            currentDirection = 'left';
        } else if (bull.style.transform === 'rotateY(180deg)') {
            bull.style.transform = 'rotate(90deg)';
            currentDirection = 'down';
        } else if (bull.style.transform === 'rotate(90deg)') {
            bull.style.transform = 'rotate(0deg)';
            currentDirection = 'right';
        } else {
            bull.style.transform = 'rotate(-90deg)';
            currentDirection = 'up';
        }
        commandList.push('Left')
        generateCommandList('Left');
    })

    rightButton.addEventListener('click', () => {
        let bull = document.getElementById('bull-id');
        if (bull.style.transform === 'rotate(90deg)') {
            bull.style.transform = 'rotateY(180deg)';
            currentDirection = 'left';
        } else if (bull.style.transform === 'rotateY(180deg)') {
            bull.style.transform = 'rotate(-90deg)';
            currentDirection = 'up';
        } else if (bull.style.transform === 'rotate(-90deg)') {
            bull.style.transform = 'rotate(0deg)';
            currentDirection = 'right';
        } else {
            bull.style.transform = 'rotate(90deg)';
            currentDirection = 'down';
        }
        commandList.push('Right')
        generateCommandList('Right');
    })

    advanceButton.addEventListener('click', () => {
        commandList.push('Advance');
        generateCommandList('Advance');
        //make buttons active
        document.getElementById('bull').style.display = 'none'; // hide bullzoer from default position.
        leftButton.disabled = false;
        rightButton.disabled = false;
        r = currentPosition[0];
        c = currentPosition[1];
        // make is visited with opacity
        if (commandList.length > 1) {
            let currentSquare = getCurrentSquare(r, c);
            currentSquare.style.opacity = '0.3';
        }
        if (currentDirection === 'left') {
            let tempCol = c - 1;
            if (tempCol > -1) {
                if (siteMap[r][tempCol]) {
                    c = tempCol;
                    updateOperation();
                }
            }
        } else if (currentDirection === 'right') {
            let tempCol = c + 1;
            if (siteMap[r][tempCol]) {
                c = tempCol;
                updateOperation();
            }
        } else if (currentDirection === 'up') {
            let tempRow = r - 1;
            if (tempRow > -1) {
                if (siteMap[tempRow][c]) {
                    r = tempRow;
                    updateOperation();
                }
            }
        } else if (currentDirection === 'down') {
            let tempRow = r + 1;
            if (siteMap[tempRow][c]) {
                r = tempRow;
                updateOperation();
            }
        }
    })

    quitButton.addEventListener('click', () => {
        commandList.push('Quit')
        generateCommandList('Quit');
        endSimulation();
    })
}

const updateOperation = () => {
    const visitCount = visitedSquare(visitedMap[r][c], siteMap[r][c]);
    if (visitCount > 0) {
        visitedMap[r][c] = visitCount;
        calculateCost(visitCount, siteMap[r][c]);
        currentPosition = [r, c];
        moveBulldozer(r, c);
    }
}

const endSimulation = () => {
    document.querySelector('#left-button').disabled = true;
    document.querySelector('#right-button').disabled = true;
    document.querySelector('#advance-button').disabled = true;
    document.querySelector('#quit-button').disabled = true;
    document.getElementById('end').style.display = 'block';
}

const calculateCost = (visitCount, squareType) => {
    // manage costMap
    costMap.set(squareType, costMap.get(squareType) + visitCount);

    document.getElementById("plainCountId").textContent = countMap.get('o');
    document.getElementById("rockyCountId").textContent = countMap.get('r');
    document.getElementById("treeCountId").textContent = countMap.get('t');
    document.getElementById("protectedCountId").textContent = countMap.get('T');


    let cleared = 0;
    visitedMap.forEach((row) => {
        cleared = cleared + row.filter(count => count > 0).length;
    })
    unclearedCount = siteMap.length * siteMap[0].length - cleared;
    document.getElementById("unclearCountId").textContent = unclearedCount;

    // visits for squareTypes
    if (squareType === 'o') {
        document.getElementById('visitedPlainCountId').textContent = visitCountMap.get('o');
    } else if (squareType === 'r') {
        document.getElementById('visitedRockyCountId').textContent = visitCountMap.get('r');
    } else if (squareType === 't') {
        document.getElementById('visitedTreeCountId').textContent = visitCountMap.get('t');
    }
    // block type cost
    document.getElementById('plainCostId').textContent = `$${costMap.get('o') * perUnitCredit}`;
    document.getElementById('rockyCostId').textContent = `$${costMap.get('r') * perUnitCredit}`;
    document.getElementById('treeCostId').textContent = `$${costMap.get('t') * perUnitCredit}`;
    document.getElementById('unclearCostId').textContent = `$${unclearedCount * unclearedUnitCredit}`;

    document.getElementById('totalCostId').textContent = `$${((costMap.get('o') + costMap.get('r') + costMap.get('t')) * perUnitCredit) + unclearedCount * unclearedUnitCredit}`;
}

const visitedSquare = (visitCount, squareType) => {
    if (visitCount === 0 && squareType === 'o') {
        visitCount = visitCount + 1;
    } else if (visitCount === 0 && squareType === 't') {
        visitCount = visitCount + 2;
    } else if (visitCount === 0 && squareType === 'r') {
        visitCount = visitCount + 2;
    } else if (visitCount === 0 && squareType === 'T') {
        alert('Entered Protected Area. Simulation Ended.')
        calculateCost(visitCount, squareType);
        endSimulation();
        return;
    } else if (visitCount > 0) {
        visitCount = 1;
    }
    if (!visitCountMap.has(squareType)) {
        visitCountMap.set(squareType, 1);
    } else {
        visitCountMap.set(squareType, visitCountMap.get(squareType) + 1);
    }
    return visitCount;
}

const setSite = () => {
    visitedMap = Array(siteMap.length).fill().map(() => Array(siteMap[0].length).fill(0)); // create visitedMap 
    document.getElementById('site').style.width = `${siteMap[0].length * 50}px`;
    document.getElementById('site').style.height = `${siteMap.length * 50}px`;

    for (let r = 0; r < siteMap.length; r++) {
        for (let c = 0; c < siteMap[r].length; c++) {
            let tile = document.createElement('div');
            tile.id = r.toString() + '-' + c.toString();
            tile.classList.add('tile');
            tile = getBackground(siteMap[r][c], tile);
            document.getElementById('site').append(tile);
            // maintain a map for square type and its count
            if (!countMap.has(siteMap[r][c])) {
                countMap.set(siteMap[r][c], 1)
            } else {
                countMap.set(siteMap[r][c], countMap.get(siteMap[r][c]) + 1)
            }

        }
    }
    document.getElementById('upload-button').disabled = true;
}

const moveBulldozer = (r, c) => {
    //remove bulldozer from current location
    if (document.getElementById('bull-id')) {
        document.getElementById('bull-id').remove();
    }
    let currentSquare = getCurrentSquare(r, c);
    let divElement = document.createElement('div');
    divElement.id = 'bull-id';
    divElement.classList.add('show-bulldozer');

    if (currentDirection === 'up') {
        divElement.style.transform = 'rotate(-90deg)';
    } else if (currentDirection === 'down') {
        divElement.style.transform = 'rotate(90deg)';
    } else if (currentDirection === 'left') {
        divElement.style.transform = 'rotateY(180deg)';
    } else if (currentDirection === 'right') {
        divElement.style.transform = 'rotate(0deg)';
    }

    currentSquare.appendChild(divElement);
    document.getElementById(r.toString() + '-' + c.toString()).append(currentSquare);
}

const getCurrentSquare = (r,c) => {
    return document.getElementById(r.toString() + '-' + c.toString());
}

const generateCommandList = (item) => {

    if (commandList.length === 1) {
        document.getElementById('command-wrapper-id').style.display = 'inline-block';
    }
    let tr = document.createElement('tr');
    let td1 = document.createElement('td');
    let td2 = document.createElement('td');
    let text1 = document.createTextNode(commandList.length);
    let text2 = document.createTextNode(item);
    td1.appendChild(text1);
    td2.appendChild(text2);
    tr.appendChild(td1);
    tr.appendChild(td2);
    document.querySelector('#command-list-body').appendChild(tr);
}

const getBackground = (squareType, tile) => {
    switch (squareType) {
        case 'o':
            tile.style.background = "url('./assets/plain.jpg') no-repeat center";
            tile.style.backgroundSize = "100% 100%";
            break;
        case 't':
            tile.style.background = "url('./assets/trees.jpg') no-repeat center";
            tile.style.backgroundSize = "100% 100%";
            break;
        case 'r':
            tile.style.background = "url('./assets/rocky.jpg') no-repeat center";
            tile.style.backgroundSize = "100% 100%";
            break;
        case 'T':
            tile.style.background = "url('./assets/preserved.svg') no-repeat center";
            tile.style.backgroundSize = "100% 100%";
            break;
        default:
            break;
    }

    return tile;

}

const resetMap = () => {
    window.location.reload();
}





