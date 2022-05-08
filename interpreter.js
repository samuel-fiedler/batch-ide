var commands;
var line = 0;
var runAllowed;

// Interpret Batch source
async function interpret(source) {
  commands = source.split(/\n/g);
  runAllowed = true;
  for (line = 0; line < commands.length; line++) {
    if (runAllowed) {
      var command = commands[line];
      if (command[0] == ":") {
        continue;
      }
      await run(command);
      await delay(0.01);
    } else {
      line = commands.length;
    }
  }
}

// Convert a Command to a array

function split(data) {
  var result = data.split(/ /g);
  return result;
}

// Library for the Batch Interpreter

var lib = {
  "error": function(text) {
    errorElem.innerText += text + "\n";
  },
  "input": function(text) {
    return input(text, "");
  },
  "print": function(text) {
    outputElem.innerText += text;
    return true;
  },
};

async function run(command) {
  var argv = split(command);
  var cmd = argv.shift().toLowerCase();
  if (cmd[0] == "@") {
    cmd = cmd.substring(1);
  } else {
    lib.print(commandLine(command));
  }
  for (var i = 0; i < argv.length; i++) {
    argv[i] = replaceVariables(argv[i]);
  }
  if (functions[cmd]) {
    await functions[cmd](argv);
  } else {
    lib.error("Command not found: " + cmd);
  }
}

function delay(n) {
  return new Promise(function(resolve) {
    setTimeout(resolve, n * 1000);
  });
}

function replaceVariables(text) {
  return text.replace(/%.*?%/g, function(x) {
    var variableName = x.replace(/%/g, "");
    if (variables[variableName]) {
      return variables[variableName];
    } else {
      lib.error("Variable not found: " + variableName);
      return "";
    }
  });
}
