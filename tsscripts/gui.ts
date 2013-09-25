var isClearing = false;
var isOver = false;

class GUI {
    toggleButton = null;
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
        this.toggleButton = document.getElementById("toggle_mode")
        this.toggleButton.innerHTML = this.clearingModeText();
        this.toggleButton.addEventListener("click", this.toggleClearingMode);
    }
}

var gui = new GUI();
