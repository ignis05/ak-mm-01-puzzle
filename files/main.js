//#region objects
var config = {
    borders: false, //ramki wokół fragmentó obrazka
    planszaSize: 600, //rozmiar planszy w px
    transitions: { //szyblość animacji dla autolosowania i rozgrywki
        fast: 0.01,
        slow: 0.5,
    },
    autolosowanie: true, //losowanie po generacji planszy
    cheats: false,  //zezwala na dowlone swapy
    digitsSrc: "digits", //sciezka ./gfx/{folder}/ - do obrazków z cyferkami
    timerSpeed: 1, //szybkość timera (1 - normalna, 2 - x2, 0.5 - x0.5, itd)
    timerRefresh: 1, // co ile odswieza sie timer (w ms)
    devmode: true, //klikniecia z alt/ctrl na obrazek
    sliderspeed: 3, //px per 5ms -czas przesunięcia: (1/x)s
}
var imgSource = {
    active: "testo.jpg",
    autoindex: 0,
    nextImg: () => {
        config.cheats = false;
        timer.reset()
        if (imgSource.autoindex == (imgSource.imgList.length - 1)) {
            imgSource.autoindex = 0;
        }
        else {
            imgSource.autoindex++;
        }
        console.log("switching image to: " + imgSource.autoindex);
        imgSource.active = imgSource.imgList[imgSource.autoindex];
        loadPage();
    },
    prevImg: () => {
        config.cheats = false;
        timer.reset()
        if (imgSource.autoindex == 0) {
            imgSource.autoindex = imgSource.imgList.length - 1;
        }
        else {
            imgSource.autoindex--;
        }
        console.log("switching image to: " + imgSource.autoindex);
        imgSource.active = imgSource.imgList[imgSource.autoindex];
        loadPage();
    },
    imgList: ["testo.jpg", "sprudo.png", "pepe.jpg", "win7.jpg", "dab.jpeg", "pipes.jpg", "rainbow.png", "siege.gif", "xd.gif",],
    notShuffling: true,
}
var plansza = {
    table: [], //zawiera pozycję fragmentów obrazka [i][j]
    generate: function (rozmiar) { //generuje plansze o podanym rozmiarze oraz odpowiednią tablicę
        //reset
        document.getElementById("main").innerHTML = ""
        var planszaBlok = document.createElement("div")
        planszaBlok.id = "plansza"
        planszaBlok.style.width = config.planszaSize + "px"
        planszaBlok.style.height = config.planszaSize + "px"
        document.getElementById("main").appendChild(planszaBlok)
        // start
        var iloscBlokow = rozmiar * rozmiar
        var blockSize = config.planszaSize / rozmiar
        for (let i = 0; i < iloscBlokow; i++) {
            var blok = document.createElement("div")
            blok.classList.add("block")
            blok.style.width = blockSize + "px"
            blok.style.height = blockSize + "px"
            blok.id = "blokID" + i
            //przesuniecie
            var przesuniecie = {
                x: (i % rozmiar) * (config.planszaSize / rozmiar),
                y: Math.floor(i / rozmiar) * (config.planszaSize / rozmiar),
            }
            blok.style.backgroundPosition = "-" + przesuniecie.x + "px " + "-" + przesuniecie.y + "px"
            blok.style.left = przesuniecie.x + "px"
            blok.style.top = przesuniecie.y + "px"
            //tło
            if (i == iloscBlokow - 1) { //czarny block
                blok.style.background = "black"
                blok.style.zIndex = 1
                blok.classList.add("emptyBlock")
            }
            else {
                blok.style.backgroundImage = "url('./gfx/" + imgSource.active + "')"
                blok.style.backgroundSize = config.planszaSize + "px " + config.planszaSize + "px"
                blok.style.backgroundRepeat = "repeat"
                blok.addEventListener("click", przesunMnie)
                if (config.borders) blok.style.border = "1px solid white"
            }
            document.getElementById("plansza").appendChild(blok)
        }

        //tablica
        plansza.refresh(rozmiar);
    },
    refresh: function (rozmiar) { //przeładowuje tablicę i ustawia jej rozmiar
        this.table = []
        var blockID = 0;
        for (let i = 0; i < rozmiar; i++) {
            plansza.table[i] = []
            for (let j = 0; j < rozmiar; j++) {
                plansza.table[i][j] = blockID
                blockID++
            }
        }
    },
    find: function (something) { //zwraca pozycję w tablicy bloku o danym numerze
        for (let i = 0; i < this.table.length; i++) {
            for (let j = 0; j < this.table[i].length; j++) {
                if (this.table[i][j] == something) return [i, j]
            }
        }
    },
    checkSwitch: function (index) { //spradza czy blok o podanym miejscu w tablicy (index = [i,j]) znajduje sie obok pustego bloku
        var isNear = false
        if (index[0] > 0) if (this.table[index[0] - 1][index[1]] == (plansza.table.length * plansza.table.length) - 1) isNear = "up"
        if (index[0] < this.table.length - 1) if (this.table[index[0] + 1][index[1]] == (plansza.table.length * plansza.table.length) - 1) isNear = "down"
        if (index[1] > 0) if (this.table[index[0]][index[1] - 1] == (plansza.table.length * plansza.table.length) - 1) isNear = "left"
        if (this.table[index[0]][index[1] + 1] == (plansza.table.length * plansza.table.length) - 1) isNear = "right"
        return isNear
    },
    checkSwitchOf: function (sth) { //sprawdza czy blok o podanym numerze znajduje sie obok pustego bloku
        return this.checkSwitch(this.find(sth))
    },
    swap: function (id) { //zamienia miejsce bloku o podanym numerze z pustym blokiem (jesli ją obok siebie)
        var index = this.find(id)
        var swap = config.cheats ? true : this.checkSwitch(index) //jesli cheats to nie sprawdza czy sa obok tylko zwaraca true
        if (swap) {
            var pustyNumer = (plansza.table.length * plansza.table.length) - 1
            var pusty = document.getElementById("blokID" + pustyNumer)
            var indexOfEmpty = this.find(pustyNumer)
            var doPrzesuniecia = document.getElementById("blokID" + id);
            //swap w tablicy
            let c = this.table[index[0]][index[1]]
            this.table[index[0]][index[1]] = this.table[indexOfEmpty[0]][indexOfEmpty[1]]
            this.table[indexOfEmpty[0]][indexOfEmpty[1]] = c
            //swap bloków
            var pxEmptyTop = pusty.style.top
            var pxEmptyLeft = pusty.style.left
            var pxFullTop = doPrzesuniecia.style.top
            var pxFullLeft = doPrzesuniecia.style.left

            pusty.style.top = pxFullTop
            pusty.style.left = pxFullLeft
            doPrzesuniecia.style.top = pxEmptyTop
            doPrzesuniecia.style.left = pxEmptyLeft
        }
        else {
            console.log("tego elementu nie mozna przesunąć");
        }
    },
    shuffleCounter: 0,
    fastShuffle: function () { //natyhcmiastowo przelosowywuje obrazek
        this.shuffleCounter = 0
        this.lastShuffle = ""
        while (this.shuffleCounter < (plansza.table.length * plansza.table.length) * 10) {
            var losowa = Math.floor(Math.random() * ((plansza.table.length * plansza.table.length) - 1))
            if (this.checkSwitchOf(losowa) && losowa != plansza.lastShuffle) {
                this.swap(losowa)
                this.shuffleCounter++;
            }
        }
    },
    activeShuffle: "",
    lastShuffle: "",
    notShuffling: true,
    slowShuffle: function () { //przelosowywuje obrazek krok po kroku
        console.log("przelosowywanie");
        timer.reset() //tworzy timer
        plansza.buttons(false) //zablokowanie przycisków na czas losowania
        this.speed(true) //zwiększenie prędkości animacji
        this.notShuffling = false //zaznaczenie że plansza jest w trakcie przelosowywania
        this.shuffleCounter = 0
        this.lastShuffle = ""
        this.activeShuffle = setInterval(function () {
            if (plansza.shuffleCounter < ((plansza.table.length * plansza.table.length) * 10)) {
                while (true) {
                    var losowa = Math.floor(Math.random() * ((plansza.table.length * plansza.table.length) - 1))
                    if (plansza.checkSwitchOf(losowa) && losowa != plansza.lastShuffle) {
                        plansza.swap(losowa)
                        plansza.shuffleCounter++;
                        plansza.lastShuffle = losowa
                        break;
                    }
                }
            }
            else {
                clearInterval(plansza.activeShuffle)
                setTimeout(() => {
                    plansza.speed(false)
                }, 200);
                console.log("Przelosowano plansze: " + plansza.shuffleCounter + " razy");
                plansza.buttons(true)
                plansza.notShuffling = true;
                timer.start()
            }
        }, (config.transitions.fast * 1000) + 10);
    },
    speed: function (ustawienie) { //zmienia szybkość animacji przesuwania bloków (przy autolosowaniu)
        if (ustawienie) {
            var x = document.getElementsByClassName("block")
            for (let i = 0; i < x.length; i++) {
                x[i].style.transition = config.transitions.fast + "s";
            }
        }
        else {
            var x = document.getElementsByClassName("block")
            for (let i = 0; i < x.length; i++) {
                x[i].style.transition = config.transitions.slow + "s";
            }
        }
    },
    winCondition: function () { //sprawdza czy obrazek jest ułożony poprawanie
        var test = true;
        var last = -1;
        for (let i = 0; i < this.table.length; i++) {
            for (let j = 0; j < this.table.length; j++) {
                if (this.table[i][j] != (last + 1)) {
                    test = false
                    break;
                }
                last = this.table[i][j]
            }
        }
        return test
    },
    buttons: (x) => { //dla false blokuje listenery przycisków, dla true przywraca
        if (x) {
            //buttons
            var buttons = document.getElementsByClassName("button")
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].addEventListener("click", zmienRozmiarPlanszy)
            }
            //blocks
            var blocks = document.getElementsByClassName("block")
            for (let i = 0; i < blocks.length; i++) {
                blocks[i].addEventListener("click", przesunMnie)
            }

        }
        else {
            //buttons
            var buttons = document.getElementsByClassName("button")
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].removeEventListener("click", zmienRozmiarPlanszy)
            }
            //blocks
            var blocks = document.getElementsByClassName("block")
            for (let i = 0; i < blocks.length; i++) {
                blocks[i].removeEventListener("click", przesunMnie)
            }
        }
    }
}
var timer = {
    value: 0,
    active: false,
    block: "", /* document.getElementById("timerblock") */
    startTime: "",
    reset: function () { //generuje timer, jest uzywany przy starcie losowania
        this.stop()
        //this.block.innerHTML = timer.convertToDigits("00:00:00.000")
        this.generateDIgits()
    },
    start: function () {
        //zapisanie daty startu, odpalenie interwału
        console.log("timer start");
        this.value = 0;
        var d = new Date()
        this.startTime = d.getTime()
        timer.active = setInterval(this.count, config.timerRefresh)
    },
    count: function () {
        var d = new Date()
        //liczba ms mnożona przez liczbę odpowiadającą za dostosowanie szybkości
        // math round zapobiega rozwaleniu licznika przy mnożeniu np. x0.1
        timer.value = Math.round((d - timer.startTime) * config.timerSpeed)
        // timer.value > toTime() > toDigits()
        // 10 > 00:00:00.010 > obrazki
        timer.convertToDigits(timer.convertToTime(timer.value))
    },
    stop: function () {
        //zatrzymuje timer
        clearInterval(timer.active)
        console.log("timer stop");
    },
    convertToDigits: function (x) { //uzywa string w postaci "00:00:00.000" do zmiany tla obrazkow
        x = x.split("")
        var html = ""
        for (let i = 0; i < x.length; i++) {
            if (x[i] == "." || x[i] == ":") {
                //nothing happens
            }
            else {
                document.getElementById("timerDigit" + i).src = "./gfx/" + config.digitsSrc + "/c" + x[i] + ".gif"
            }

        }
        return html
    },
    convertToTime: function (x) { //konwertuje liczbe ms na string w postaci "00:00:00.000"
        var h = (Math.floor(x / 3600000)).toString()
        var min = (Math.floor(x / 60000) - h * 60).toString()
        var sec = (((Math.floor(x / 1000)) - min * 60) - h * 3600).toString()
        var ms = x.toString().slice(-3)

        //zera na początku
        while (ms.length < 3) {
            ms = "0" + ms
        }
        while (sec.length < 2) {
            sec = "0" + sec
        }
        while (min.length < 2) {
            min = "0" + min
        }
        while (h.length < 2) {
            h = "0" + h
        }
        var time = h + ":" + min + ":" + sec + "." + ms
        return time
    },
    generateDIgits: function () { //tworzy obrazki timera
        console.log("generacja timera");
        timer.block.innerHTML = ""
        for (let i = 0; i < 12; i++) {
            var newDigit = new Image()
            newDigit.classList.add("digit")
            newDigit.id = "timerDigit" + i
            if (i == 2 || i == 5) {
                newDigit.src = "./gfx/" + config.digitsSrc + "/colon.gif"
                newDigit.classList.add("digitChar")
            }
            else if (i == 8) {
                newDigit.src = "./gfx/" + config.digitsSrc + "/dot.gif"
                newDigit.classList.add("digitChar")
            }
            else {
                newDigit.src = "./gfx/" + config.digitsSrc + "/c0.gif"
                newDigit.classList.add("digitDigit")
            }
            timer.block.appendChild(newDigit)
        }
    }
}
var leaderBoard = {
    setCookie: function (cname, cvalue, exdays) { //tworzy cookie {cname=cvalue}, ktore wygasa po {exdays} dniach
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    getCookie: function (cname) {   //szuka cookie o nazwie {cname}, zwraca jego wartosc lub false 
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return false;
    },
    chceckIfGoodEnaught: function (mode, score) { //zwraca docelowe miejsce w rankungu
        var scores = leaderBoard.getCookie("mode" + mode)
        var place = 0
        if (scores) {
            scores = scores.split(",")
            for (let i = 0; i < scores.length; i++) {
                if (parseInt(scores[i].split("-")[1]) < parseInt(score)) {
                    place++
                }
            }
        }
        return place
    },
    updateScores: function (mode, nameScore) {
        var scores = leaderBoard.getCookie("mode" + mode)
        if (scores) {
            scores = scores.split(",")
            //arr.splice(index, 0, item);
            var place = this.chceckIfGoodEnaught(mode, nameScore.split("-")[1])
            console.log("wynik " + nameScore.split("-")[1] + " zakwalifikował sie na miejsce " + (place + 1));
            if (place < 10) {
                console.log("dodano do tablicy trybu " + mode + " wynik: " + nameScore);
                scores.splice(place, 0, nameScore);
                if (scores.length >= 11) {
                    scores.pop()
                }
            }
            this.setCookie("mode" + mode, scores.join(","), 30)
        }
        else {
            this.setCookie("mode" + mode, nameScore, 30)
        }
    },
    show: function () {
        var block = document.createElement("div")
        block.id = "leaderBoard"
        document.body.appendChild(block)

        //close
        var close = document.createElement("div")
        close.id = "leaderBoardClose"
        close.innerText = "X"
        close.onclick = () => leaderBoard.close()
        block.appendChild(close)

        //mode selector
        for (let i = 3; i <= 6; i++) {
            var button = document.createElement("button")
            button.type = "button"
            button.classList.add("button")
            button.id = "button" + i
            button.innerText = i + " x " + i
            block.appendChild(button)
            button.onclick = () => leaderBoard.display()
        }

        //place for scores
        var scoreboard = document.createElement("div")
        scoreboard.id = "scoreboard"
        scoreboard.innerHTML = "Wybierz tryb dla którego chcesz wyświetlić wyniki"
        block.appendChild(scoreboard)

    },
    close: function () {
        document.getElementById("leaderBoard").remove()
    },
    display: function () {
        var print = "<table class='scoreboardTable'>"
        var scoreboard = document.getElementById("scoreboard")
        var id = event.target.id
        id = id.slice(6)
        console.log("wyswietlanie wynikow dla", id);
        var scores = leaderBoard.getCookie("mode" + id)
        /* console.log(scores); */
        if (scores) {
            scores = scores.split(",")
            for (let i = 0; i < scores.length; i++) {
                print += "<tr>"
                print += "<td>" + (i + 1) + ".)</td>" + "<td>" + scores[i].split("-")[0] + "</td><td class='dash'>  -  </td><td>" + timer.convertToTime(parseInt(scores[i].split("-")[1])) + "</td>"
                print += "</tr>"
            }
        }
        else {
            print = "Nie ma jeszcze żadnych rekordów dla tego trybu"
        }
        print += "<table>"
        scoreboard.innerHTML = print
    },
}
//#endregion

//#region functions
function zmienRozmiarPlanszy() {
    console.log("generacja planszy o rozmiarze: " + this.innerText[0]);
    timer.reset()
    plansza.generate(this.innerText[0])
    if (config.autolosowanie) {
        setTimeout(() => {
            plansza.slowShuffle();
        }, 200);
    }
}
function przesunMnie() {
    var id = this.id
    id = id.slice(6)
    console.log("przesuwanie elementu " + id);
    plansza.swap(id)
    if (plansza.winCondition()) { //jesli ruch ułożył planszę
        triggerWin()
    }
}

function triggerWin() {
    var x = document.getElementsByClassName("block")
    for (let i = 0; i < x.length; i++) {
        x[i].removeEventListener("click", przesunMnie) //usuwanie listenerów
    }
    timer.stop()

    setTimeout(() => { //setTimeout z popupem (żeby animacja przesuniecia zdazyla sie wykonac)
        infoWygrana();
    }, config.transitions.slow * 1000);
}

function addRandomScore(mode, x) { //dodaje x losowych wyników do trybu mode - funckcja do testów
    for (let i = 0; i < x; i++) {
        var text = "testuser_";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        var score = Math.floor(Math.random() * Math.floor(36000000))

        leaderBoard.updateScores(mode, text + "-" + score)
    }
}

function infoWygrana() {
    //custom alert
    console.log("wygrana");

    var overlay = document.createElement("div")
    overlay.id = "overlay"
    document.body.appendChild(overlay)

    var info = document.createElement("div")
    info.id = "infoWygrana"
    overlay.appendChild(info)

    var title = document.createElement("h2")
    title.innerText = "Gratulacje!"
    info.appendChild(title)

    var content = document.createElement("p")
    info.appendChild(content)

    var content2 = document.createElement("p")
    info.appendChild(content2)

    var infoClose = document.createElement("div")
    infoClose.id = "infoClose"
    infoClose.innerHTML = "X"
    infoClose.onclick = function () {
        if (document.getElementById("nameInput")) {
            var name = document.getElementById("nameInput").value
            //eliminacja znaków zakazanych ze stringa
            for (let i = 0; i < name.length; i++) {
                if (name[i] == ";" || name[i] == "," || name[i] == "-") {
                    name = ""
                }
            }
            var nameScore = name == "" || name == null ? "anonymous" : name
            nameScore += "-" + timer.value
            console.log(nameScore);
            leaderBoard.updateScores(Math.sqrt(document.getElementsByClassName("block").length), nameScore)
        }
        document.getElementById("overlay").parentNode.removeChild(document.getElementById("overlay"))
    }
    info.appendChild(infoClose)

    //generacja treści
    var boardSize = Math.sqrt(document.getElementsByClassName("block").length)

    var tresc = "Udało ci się ułożyć układankę " + boardSize + " x " + boardSize + " w czasie: " + timer.convertToTime(timer.value)
    content.innerText = tresc

    var tresc2 = leaderBoard.chceckIfGoodEnaught(boardSize, timer.value) < 10 ? "Udało ci się dostać do top 10 wyników!\nJak chcesz się nazywać na liście wyników?\n(nie używaj znaków: ,;-)" : "Niestety nie udało ci się dostać do top 10 wyników"
    content2.innerText = tresc2
    if (leaderBoard.chceckIfGoodEnaught(boardSize, timer.value) < 10) {
        var input = document.createElement("input")
        input.type = "text"
        input.id = "nameInput"
        input.autofocus = true
        input.maxlength = 25
        input.addEventListener("keyup", function (event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                document.getElementById("infoClose").click();
            }
        });
        info.appendChild(input)
    }

}
//#endregion

function loadPage() { // funkcja on "DOMConentLoaded" - wlasciwie to tylko tworzy elementy strony
    document.body.innerHTML = "" //reset strony

    //header
    var header = document.createElement("div")
    header.id = "header"
    document.body.appendChild(header)

    //imgBlock
    var imgBlock = document.createElement("div")
    imgBlock.id = "imgBlock"
    header.appendChild(imgBlock)

    //arrowLeft
    var arrowLeft = new Image()
    arrowLeft.src = "./gfx/arrow.png"
    arrowLeft.classList.add("arrow")
    arrowLeft.onclick = () => {
        if (plansza.notShuffling && imgSource.notShuffling) {
            imgSource.notShuffling = false
            var frame = document.getElementById("previewImgFrame")
            var interval = setInterval(function () {
                frame.scrollLeft -= config.sliderspeed
            }, 5)
            setTimeout(function () {
                clearInterval(interval)
                imgSource.notShuffling = true
                imgSource.prevImg()
            }, (200 * 5) / config.sliderspeed)

        }
    }
    imgBlock.appendChild(arrowLeft)

    //#region img
    var imgFrame = document.createElement("div")
    imgFrame.id = "previewImgFrame"
    imgFrame.onclick = () => {
        if (config.devmode) {
            if (event.altKey) {
                config.cheats = !config.cheats
                console.log("cheats:" + config.cheats);
                event.target.style.border = config.cheats ? "2px solid red" : "0px"
            }
            if (event.ctrlKey) {
                triggerWin()
            }
        }
    }
    imgBlock.appendChild(imgFrame)

    console.log(imgSource.autoindex);
    if (imgSource.autoindex == 0) {
        var img = new Image()
        img.src = "./gfx/" + imgSource.imgList.slice(-1)[0]
        img.classList.add("previewImg")
        imgFrame.appendChild(img)

        var img = new Image()
        img.src = "./gfx/" + imgSource.imgList[0]
        img.classList.add("previewImg")
        imgFrame.appendChild(img)

        var img = new Image()
        img.src = "./gfx/" + imgSource.imgList[1]
        img.classList.add("previewImg")
        imgFrame.appendChild(img)
    }
    else if (imgSource.autoindex == imgSource.imgList.length - 1) {
        var img = new Image()
        img.src = "./gfx/" + imgSource.imgList[imgSource.imgList.length - 2]
        img.classList.add("previewImg")
        imgFrame.appendChild(img)

        var img = new Image()
        img.src = "./gfx/" + imgSource.imgList.slice(-1)[0]
        img.classList.add("previewImg")
        imgFrame.appendChild(img)

        var img = new Image()
        img.src = "./gfx/" + imgSource.imgList[0]
        img.classList.add("previewImg")
        imgFrame.appendChild(img)
    }
    else {
        console.log("else");
        for (let i = imgSource.autoindex - 1; i <= imgSource.autoindex + 1; i++) {
            console.log("petla");
            var img = new Image()
            img.src = "./gfx/" + imgSource.imgList[i]
            img.classList.add("previewImg")
            imgFrame.appendChild(img)
        }
    }
    imgFrame.scrollLeft += 200
    //#endregion

    //arrowRight
    var arrowRight = new Image()
    arrowRight.src = "./gfx/arrow.png"
    arrowRight.classList.add("arrow")
    arrowRight.style.transform = "rotate(180deg)"
    arrowRight.onclick = () => {
        if (plansza.notShuffling && imgSource.notShuffling) {
            imgSource.notShuffling = false
            var frame = document.getElementById("previewImgFrame")
            var interval = setInterval(function () {
                frame.scrollLeft += config.sliderspeed
            }, 5)
            setTimeout(function () {
                clearInterval(interval)
                imgSource.notShuffling = true
                imgSource.nextImg()
            }, (200 * 5) / config.sliderspeed)

        }
    }
    imgBlock.appendChild(arrowRight)

    //flavicon
    document.querySelector("link[rel='icon']").href = "./gfx/" + imgSource.active;

    //size buttons block
    var buttons = document.createElement("div")
    buttons.id = "buttonsBlock"
    header.appendChild(buttons)

    //size buttons
    for (let i = 3; i <= 6; i++) {
        var button = document.createElement("button")
        button.type = "button"
        button.classList.add("button")
        button.id = "button" + i
        button.innerText = i + " x " + i
        buttons.appendChild(button)
        button.addEventListener("click", zmienRozmiarPlanszy)
    }

    //timer
    var timerBlock = document.createElement("div")
    timerBlock.id = "timerblock"
    header.appendChild(timerBlock)
    timer.block = document.getElementById("timerblock")

    //miejsce na plansze
    var main = document.createElement("div")
    main.id = "main"
    document.body.appendChild(main)

    //scoreboard
    var scoreboard = new Image()
    scoreboard.src = "./gfx/scoreboard.png"
    scoreboard.id = "leaderBoardButton"
    scoreboard.onclick = () => leaderBoard.show()
    document.body.appendChild(scoreboard)

}
document.addEventListener("DOMContentLoaded", loadPage);


    //todo:
    // - zrobić leaderboard za pomocą tabeli i poprawić css