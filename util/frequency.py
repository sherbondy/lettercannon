# letter frequency counting util script.
# spits out a json file of letter frequencies given a dictionary as
# input.

import json

source = "../assets/words"

def get_letter_freqs(source):
    frequencies = {}
    total = 0
    with open(source, 'r') as f:
        for word in f:
            for letter in word:
                if letter != '\n':
                    total += 1.0
                    if not letter in frequencies:
                        frequencies[letter] = 1
                    else:
                        frequencies[letter] += 1

    for k in frequencies:
        frequencies[k] = frequencies[k]/total

    return frequencies

def write_json(source):
    with open("../assets/frequencies.json", 'w') as out_file:
        data = get_letter_freqs(source)
        encoded_str = json.dumps(data)
        out_file.write(encoded_str)


write_json(source)
