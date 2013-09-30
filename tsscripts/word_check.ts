// neighbors: {[number: [number]]}
// That's probably not correct typescript but it's the basic idea
// For instance: {0: [1, 2, 10], 1: [0, 3, 10]}

// selected: list of numbers
// For instance: [2, 0, 1]

// Neighbors will probably be a global variable but if it's not
// I can always pass it in here. Type of selected will come once I figure
// out TypeScript.

// Include the dictionary array. If this is bad for performance, we'll
// try getting words from the file itself via requests.
/// <reference path="../assets/words.ts" />

// Array of already-picked words, to prevent players from re-spelling the
// same word multiple times for points.
// TODO: put typing on this
var foundWords:string[];
foundWords = [];
var found_words_letters:string = "";

// Returns empty string if selected letters do not spell a word, or if the word
// spelled has fewer than 3 letters. 
// Returns the word spelled otherwise.
function checkWord(neighbors, selected){
   var word:string = letters[selected[0]].letter;
   found_words_letters=letters[selected[0]].id;
   if (selected.length < 3){
      return "";
   }

   for (var i:number = 1; i < selected.length; i++){
	// letters array maps numbers to letters
	// only add to the word if the letters are actually adjacent...
	if ((i != 0) && (neighbors[selected[i-1]].indexOf(selected[i]) != -1)){
	    word += letters[selected[i]].letter;
	    found_words_letters += letters[selected[i]].id+",";
	} else {
	    found_words_letters = "";
	    return "";
	}
   }

   if (foundWords.indexOf(found_words_letters) != -1){
      // Player's already selected that word in that place, don't give them
      // more points!!
      found_words_letters = "";
      return "";
   }

   // We have the word, now see if it's in the dictionary (assets/words)
   if (dictionary.indexOf(word) != -1){
       // add the sequence of letters (not the word itself) to an array
       // console.log(found_words_letters);
       foundWords.push(found_words_letters);
       found_words_letters = "";
       return word.charAt(0).toUpperCase() + word.slice(1);
   } else {
       return "";
   }
}

// Returns empty string if selected letters do not spell a word, or if the word
// spelled has fewer than 3 letters. 
// Returns the word spelled otherwise.
function checkWordSolo(neighbors, selected){
   if (selected.length < 3){
      return "";
   }

   var word:string = letters[selected[0]].letter;

   for (var i:number = 1; i < selected.length; i++){
	// letters array maps numbers to letters
	// only add to the word if the letters are actually adjacent...
	if ((i != 0) && (neighbors[selected[i-1]].indexOf(selected[i]) != -1)){
        if (letters[selected[i]] == undefined)
          return "";
	    word += letters[selected[i]].letter;
	} else {
	    return "";
	}
   }

   // We have the word, now see if it's in the dictionary (assets/words)
   if (dictionary.indexOf(word) != -1){
       return word.charAt(0).toUpperCase() + word.slice(1);
   } else {
       return "";
   }
}

var lettersWords = [];
var wordsWords   = [];

function checkWordsGroup(neighbors, id) {
  var output = [];
  var stack = [[parseInt(id)]];
  var seen_letters = [parseInt(id)];
  var current_path;
  var i = 0;
  while (i < stack.length) {
    current_path = stack[i];
    // Fastest way to get last element of js array.
    // http://jsperf.com/get-last-item-from-array
    var last = current_path[current_path.length - 1];
    if (neighbors[last]) {
      neighbors[last].forEach(function (adj) {
        if (seen_letters.indexOf(adj) == -1) {
          stack.push([adj]);
          seen_letters.push(adj);
        }
        if (current_path.indexOf(adj) == -1) {
          stack.push(current_path.concat(adj));
        }
      });
    }
    i++;
  }
  output = output.concat(stack);
  var word, word_id;
  output.forEach(function(selected) {
    word = checkWordSolo(neighbors, selected);
    if (word.length > 0) {
      word_id = selected.toString();
      if (lettersWords.indexOf(word_id) == -1) {
        lettersWords.push(word_id);
        wordsWords.push(word);
      }
    }
  });
}

function checkWordsAll(neighbors) {
  var output = [];
  for (var id in letters) {
    var stack = [[parseInt(id)]];
    var current_path;
    var i = 0;
    while (i < stack.length) {
      current_path = stack[i];
      // Fastest way to get last element of js array.
      // http://jsperf.com/get-last-item-from-array
      var last = current_path[current_path.length - 1];
      if (neighbors[last]) {
        neighbors[last].forEach(function (adj) {
          if (current_path.indexOf(adj) == -1) {
            stack.push(current_path.concat(adj));
          }
        });
      }
      i++;
    }
    output = output.concat(stack);
  }
  var word, word_id;
  output.forEach(function(selected) {
    word = checkWordSolo(neighbors, selected);
    if (word.length > 0) {
      word_id = selected.toString();
      if (lettersWords.indexOf(word_id) == -1) {
        lettersWords.push(word_id);
        wordsWords.push(word);
      }
    }
  });
}

