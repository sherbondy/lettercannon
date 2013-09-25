var isClearing = false;
var isOver = false;

function padZeroes(num: number, zeroes: number): string {
    var numStr = ""+num;
    while (numStr.length < zeroes){
        numStr = "0"+numStr;
    }
    return numStr;
}

class GUI {
    toggleButton = null;
    foundWordsList = null;
    timerElem = null;

    bgColor = [0,0,0,1];
    toggleModeFn = function(){};

    clearingModeText(): string {
        return isClearing ? "Enter Shooting Mode" : "Enter Word Clearing Mode";
    }

    toggleClearingMode() {
        isClearing = !isClearing;
        gui.toggleModeFn();
        gui.toggleButton.innerHTML = gui.clearingModeText();
        document.getElementById("found_words_list").innerHTML = "";
        gui.bgColor = isClearing ? [1,1,1,1] : [0,0,0,1];
    }

    setupGUI(toggleModeFn) {
        this.toggleModeFn = toggleModeFn;

        this.toggleButton = document.getElementById("toggle_mode");
        this.foundWordsList = document.getElementById("found_words_list");
        this.timerElem = document.getElementById("timer");

        this.toggleButton.innerHTML = this.clearingModeText();
        this.toggleButton.addEventListener("click", this.toggleClearingMode);
    }

    addWord(word: string) {
        var listElem = document.createElement("li");
        listElem.innerHTML = word;
        this.foundWordsList.appendChild(listElem);
    }

    updateTime(time: number) {
        var minutes = Math.floor(time / (60*60));
        var seconds = Math.floor(time % 60);
        this.timerElem.innerHTML = ("" + minutes + ":" + padZeroes(seconds, 2));
    }
}

var gui = new GUI();
