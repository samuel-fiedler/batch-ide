var pwd = "";
var commandLine = function(command) {
  return pwd + " > " + command + "\n";
}
var errorLevel = 0;
var variables = {};
var outputElem = document.getElementById("output");
var errorElem = document.getElementById("errors");
var functions = {
  "": function() {
    return true;
  },
  "choice": function(argv) {
    var possibleChoices = "yn";
    var message = "Please enter a char!";
    var userEntered;
    var inputValue = "";
    var j = 0;
    for (var i = 0; i < argv.length; i++) {
      if (argv[i] == "/C") {
        possibleChoices = argv[i + 1];
        i++;
      } else if (argv[i] == "/M") {
        message = argv[i + 1];
        for (j = i + 2; j < argv.length; j++) {
          message += " " + argv[j];
          if (j != i + 2 && argv[j].match("\"")) {
            j = argv.length;
          }
        }
        i = j;
        message = message.replace(/"/g, "");
      } else if (argv[i] == "/D") {
        inputValue = argv[i + 1];
        i++;
      }
    }
    userEntered = input(message, inputValue);
    while ((userEntered ? userEntered.length : 0) != 1 || !possibleChoices.match(userEntered)) {
      alert("You have entered a bad character or more than one character. Please try it again!");
      userEntered = input(message, inputValue);
    }
    for (var i = 0; i < possibleChoices.length; i++) {
      if (userEntered == possibleChoices[i]) {
        errorLevel = i + 1;
      }
    }
    return true;
  },
  "cls": function() {
    outputElem.innerText = "";
    return true;
  },
  "color": function(argv) {
    var colors = [argv[0][0], argv[0][1]];
    var colorMap = {
      "0": "#000",
      "1": "#00f",
      "2": "#070",
      "3": "#0ff",
      "4": "#f00",
      "5": "#808",
      "6": "#ff0",
      "7": "#fff",
      "8": "#777",
      "9": "#add",
      "A": "#8e8",
      "B": "#7ff",
      "C": "#f77",
      "D": "#e8e",
      "E": "#ffd",
      "F": "#fff"
    };
    outputElem.style.backgroundColor = colorMap[colors[0]];
    outputElem.style.color = colorMap[colors[1]];
    return true;
  },
  "echo": function(argv) {
    if (argv[0].toLowerCase() == "off") {
      commandLine = function(command) {
        return "";
      }
    } else if (argv[0].toLowerCase() == "on") {
      commandLine = function(command) {
        return pwd + " > " + command + "\n";
      }
    } else {
      var textResult = argv[0];
      for (var i = 1; i < argv.length; i++) {
        var actualText = argv[i];
        if (actualText == ">") {
          files[argv[i + 1]] = textResult;
          i = argv.length;
          textResult = "";
        } else {
          textResult += " " + actualText;
        }
      }
      textResult = textResult + "\n";
      lib.print(textResult);
    }
    return true;
  },
  "exit": function() {
    line = commands.length;
    return true;
  },
  "goto": function(argv) {
    var mark = argv[0];
    for (var i = 0; i < commands.length; i++) {
      if (commands[i] == ":" + mark) {
        line = i;
        i = commands.length;
      }
    }
    return true;
  },
  "if": function(argv) {
    var boolean = false;
    var position = 0;
    var newCommand = "";
    if (argv[0].toLowerCase() == "errorlevel") {
      if (argv[1] == errorLevel) {
        boolean = true;
        position = 2;
      }
    } else if (argv[0].toLowerCase() == "exist") {
      if (files[argv[1]]) {
        boolean = true;
        position = 2;
      }
    } else if (argv[0].match(/%?.*?%?==%?.*?%?$/)) {
      var condition = argv[0].split(/==/);
      if (condition[0].match(/%.*?%/)) {
        condition[0] = "\"" + variables[condition[0].split(/%/g)[1]] + "\"";
      }
      if (condition[1].match(/%.*?%/)) {
        condition[1] = "\"" + variables[condition[1].split(/%/g)[1]] + "\"";
      }
      if (condition[0] == condition[1]) {
        boolean = true;
        position = 1;
      }
    } else if (argv[0].toLowerCase() == "not") {
      if (argv[1].toLowerCase() == "errorlevel") {
        if (argv[2] != errorLevel) {
          boolean = true;
          position = 3;
        }
      } else if (argv[1].toLowerCase() == "exist") {
        if (!files[argv[2]]) {
          boolean = true;
          position = 3;
        }
      } else if (argv[1].match(/%?.*?%?==%?.*?%?$/)) {
        var condition = argv[1].split(/==/);
        if (condition[0].match(/%.*?%/)) {
          condition[0] = "\"" + variables[condition[0].split(/%/g)[1]] + "\"";
        }
        if (condition[1].match(/%.*?%/)) {
          condition[1] = "\"" + variables[condition[1].split(/%/g)[1]] + "\"";
        }
        if (condition[0] != condition[1]) {
          boolean = true;
          position = 2;
        }
      }
    }
    if (boolean) {
      newCommand = argv[position];
      for (var i = position + 1; i < argv.length; i++) {
        newCommand += " " + argv[i];
      }
      run(newCommand);
    }
    return true;
  },
  "pause": function() {
    input("Press [ENTER] to continue!");
    return true;
  },
  "rem": function() {
    return true;
  },
  "set": function(argv) {
    var expression = [];
    if (argv[0] == "/p") {
      expression = argv[1].split("=");
      variables[expression[0]] = files[expression[1].replace("<", "")];
    } else if (argv[0] == "/a") {
      expression = argv[1].split("=");
      variables[expression[0]] = eval(expression[1]);
    } else {
      expression = argv[0].split("=");
      variables[expression[0]] = expression[1];
    }
  },
  "timeout": async function(argv) {
    if (argv[0] == "/T") {
      await delay(argv[1] * 1);
    }
  },
  "title": function(argv) {
    var textResult = argv[0];
    for (var i = 1; i < argv.length; i++) {
      textResult += " " + argv[i];
    }
    document.title = textResult + " – Batch IDE";
    return true;
  }
};
var files = {};
