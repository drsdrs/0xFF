(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd)
    define(["../../lib/codemirror"], mod);
  else
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  CodeMirror.defineOption("autoIndentRulers", false, function(cm, val) {
    if (cm.state.rulerDiv) {
      cm.state.rulerDiv.remove();
      cm.state.rulerDiv = null;
      cm.off("update", updateIndentRulers);
    }
    if (val) {
      const div = document.createElement("div");
      div.className = "CodeMirror-rulers";
      div.style.position = "absolute";
      div.style.top = 0;
      div.style.left = 0;
      div.style.right = 0;
      div.style.bottom = 0;
      cm.display.lineSpace.parentElement.insertBefore(div, cm.display.lineSpace);
      cm.state.rulerDiv = div;
      cm.on("update", updateIndentRulers);
      updateIndentRulers(cm);
    }
  });

  function updateIndentRulers(cm) {
    const div = cm.state.rulerDiv;
    div.textContent = ''; // Clear any old rulers

    const cw = cm.defaultCharWidth(); // Character width
    const tabSize = cm.getOption("tabSize"); // Tab size setting
    const doc = cm.getDoc();
    const totalLines = doc.lineCount(); // Total number of lines

    // Monokai theme ruler colors based on indentation depth
    const colors = [
      "#f92672", // Depth 1 (Pinkish)
      "#f4bf75", // Depth 2 (Yellowish)
      "#a6e22e", // Depth 3 (Greenish)
      "#66d9ef", // Depth 4 (Cyan)
      "#9b59b6", // Depth 5 (Purple)
      "#e6db74"  // Depth 6 (Light Yellow)
    ];

    // Now draw rulers based on the calculated depth
    for (let i = 0; i < totalLines; i++) {
      const line = doc.getLine(i); // Get the current line content
      const indentMatch = line.match(/^[\t ]+/); // Match indentation (spaces or tabs)
      if (!indentMatch) continue; // Skip lines with no indentation

      // Calculate the indentation depth of the current line
      const depth = Math.floor(indentMatch[0].length / tabSize);

      // Calculate the indentation width for the current line
      let indentWidth = 0;
      for (let ch of indentMatch[0]) {
        indentWidth += (ch === '\t') ? tabSize : 1;
      }

      const coords = cm.charCoords({ line: i, ch: 0 }, 'local'); // Get the line's position
      const lineHeight = cm.defaultTextHeight(); // Line height

      // Create a vertical ruler for each indentation depth
      const step = tabSize*cw;
      for (let j = 0; j < indentWidth / tabSize; j++) {
        const rulerColor = colors[j%colors.length];
        const left = (j * step)+5; // Left position for each tab stop within the same depth

        const elt = document.createElement("div");
        elt.className = "CodeMirror-ruler";
        elt.style.left = left + "px"; // Left position based on indentation
        elt.style.top = coords.top + "px"; // Position from the top based on the line
        elt.style.height = lineHeight + "px"; // Set ruler height per line
        elt.style.borderLeft = `1px dashed ${rulerColor}`; // Ruler style with color
        elt.style.position = "absolute";
        div.appendChild(elt);
      }
    }
  }

});
