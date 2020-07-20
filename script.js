// list of gaps of the numerical semigroup
let gapsList;

// list of matrices
let matrices = [];

// list of lists of monomials (strings)
let mat = [];

let matIndex;
// Make copy of matrix
let matCopy = [];

let prevMatrix;
let nextMatrix;

let allGradedDegrees = [];
// list of ints
let gradedDegreesLeft;
// copy of left bettis
let leftBettisCopy;
// list of ints
let gradedDegreesTop;
// copy of top bettis
let topBettisCopy;
let shiftPressed = false;
let ctrlPressed = false;

// create variables for DOM elments we will be targeting
let $tableMain = $("#matrix-table");
let $tableBody = $("#matrix-body");
let $optionButtons = $("#options button");
let $innerTable = $(".inner-table");

let oldPos;
let newPos;
let scalar;

// once the page loads the table will be made sortable
// and the matrix will be generated for the matrix in
// the textarea
$(document).ready(function() {
  updatedReadInput();
  generateMatrix();
  // readAndGenerateMatrix();
  $(document).keydown(function(event) {
    if (event.keyCode == 17) {
      toggleAddSort();
    }
  });
});

// Read the input provided in the textarea section
// function readInput() {
//   finalOutput = [];
//   raw = $("#read-matrix").val();
//   rows = raw.split(/\n/);
//   rows.forEach(function (row) {
//     finalOutput.push(row.trim().split(/\s+/));
//   });
//   mat = finalOutput;
//   gradedDegreesLeft = $("#gradedDegsLeft").val().trim().split(/\s/);
//   gradedDegreesTop = $("#gradedDegsTop").val().trim().split(/\s/);
// }

function updatedReadInput() {
  finalOutput = [];
  raw = $("#read-matrix").val();
  lines = raw.split(/\n/);
  formattedLines = [];
  lines.forEach(function(line) {
    if (line != "") {
      formattedLines.push(line.split(/\s/));
    }
  });

  gapsList = lines[0].split(/\s/);

  curLine = 1;
  allGradedDegrees = [];
  matrices = []

  while (curLine < formattedLines.length) {
    // currently at dimensions
    let numRows = parseInt(formattedLines[curLine][0]);
    let numCols = parseInt(formattedLines[curLine][1]);
    curLine++;

    // currently at left graded bettis
    allGradedDegrees.push(formattedLines[curLine]);
    curLine++;

    // currently at top graded bettis
    if (curLine + 1 + numRows == formattedLines.length) {
      allGradedDegrees.push(formattedLines[curLine]);
    }
    curLine++;

    // now reading the matrix
    startLine = curLine
    let curMat = [];
    while (curLine < startLine + numRows) {
      curMat.push(formattedLines[curLine]);
      curLine++;
    }
    matrices.push(curMat);
  }
}

function generateMatrix() {
  let index = parseInt($("#matrix-index").val());
  matIndex = index;
  if (index <= 0 || index > matrices.length) {
    alert("Choose an actual index");
  } else {
    mat = []
    matrices[index-1].forEach(function(row) {
      mat.push([...row]);
    });
    gradedDegreesLeft = allGradedDegrees[index-1];
    gradedDegreesTop= allGradedDegrees[index];

    matCopy = []
    mat.forEach(function(row) {
      matCopy.push([...row]);
    });
    leftBettisCopy = [...gradedDegreesLeft];
    topBettisCopy = [...gradedDegreesTop];

    // setup prev and next matrices
    if (index == 1) {
      prevMatrix = null;
      nextMatrix = [];
      matrices[index].forEach(function(row) {
        nextMatrix.push([...row]);
      });
    } else if (index == matrices.length) {
      prevMatrix = [];
      nextMatrix = null;
      matrices[index-2].forEach(function(row) {
        prevMatrix.push([...row]);
      });
    } else {
      prevMatrix = [];
      matrices[index-2].forEach(function(row) {
        prevMatrix.push([...row]);
      });
      nextMatrix = [];
      matrices[index].forEach(function(row) {
        nextMatrix.push([...row]);
      });
    }
    createTable();
  }
}

// function readAndGenerateMatrix() {
//   updatedReadInput();
//   // matCopy = [];
//   // mat.forEach(function(row) {
//   //   matCopy.push([...row]);
//   // });
//   // leftBettisCopy = [...gradedDegreesLeft];
//   // topBettisCopy = [...gradedDegreesTop];
//   // createTable();
// }

function printMatrix() {
  strRows = [];
  mat.forEach(function (row) {
    strRows.push(row.join(' '));
  });

  outputMat = strRows.join("\n");
  outputGradedDegreesLeft = gradedDegreesLeft.join(" ");
  outputGradedDegreesTop = gradedDegreesTop.join(" ");

  $('#read-matrix').val(outputMat);
  $("#gradedDegsLeft").val(outputGradedDegreesLeft);
  $("#gradedDegsTop").val(outputGradedDegreesTop);
}

// Create the matrix table
function createTable() {
  $tableBody.empty();
  // By Columns
  // if (!shiftPressed) {
  let tableRow = '<tr>';
  tableRow += '<th id="border-maker" class="by-cols"><table class="inner-table"><tr id="inner-border-maker" class="inner-border-col"><th>GrDgs</th></tr>';
  for (let i=0; i < leftBettisCopy.length; i++) {
    tableRow += '<tr id="inner-border-maker" class="inner-border-col"><th>' + leftBettisCopy[i] + '</th></tr>';
  }
  tableRow += '</table></th>';
  for (let col=0; col < matCopy[0].length; col++) {
    tableRow += '<td index='+ col +' id="border-maker" class="by-cols" onclick="multByNegOne(this)"><table class="inner-table">';
    tableRow += '<tr id="inner-border-maker" class="inner-border-col"><th>' + topBettisCopy[col] + '</th></tr>';
    for (let row=0; row < matCopy.length; row++) {
      tableRow += '<tr id="inner-border-maker" class="inner-border-col"><td>' + matCopy[row][col] + '</td></tr>';
    }
    tableRow += '</table></td>';
  }
  tableRow += '</tr>';
  $tableBody.append(tableRow);
  if (!ctrlPressed) {
    makeSortable('x', function(oldPos, newPos) {
      updateInteralMatrixByCol(oldPos, newPos); animateSwitchCol(oldPos, newPos);
    });
  } else {
    makeScalable('x', topBettisCopy, updateInteralMatrixByColAdder);
  }
  // By Rows
  // } else {
  //   let tableRow;
  //   tableRow += '<tr id="border-maker" class="by-rows"><th><table class="inner-table"><tr><th id="inner-border-maker" class="inner-border-row">GrDgs</th>';
  //   for (let i=0; i < topBettisCopy.length; i++) {
  //     tableRow += '<th id="inner-border-maker" class="inner-border-row">' + topBettisCopy[i] + '</th>';
  //   }
  //   tableRow += '</tr></table></th></tr>'
  //   for (let row=0; row < matCopy.length; row++) {
  //     tableRow += '<tr id="border-maker" class="by-rows movers" onclick="multByNegOne(this, 0)"><td index=' + row + '><table class="inner-table"><tr>';
  //     tableRow += '<th id="inner-border-maker" class="inner-border-row">' + leftBettisCopy[row] + '</th>';
  //     for (let col=0; col < matCopy[0].length; col++) {
  //       tableRow += '<td id="inner-border-maker" class="inner-border-row">' + matCopy[row][col] + '</td>';
  //     }
  //     tableRow += '</tr></table></td></tr>';
  //   }
  //   $tableBody.append(tableRow);
  //   if (!ctrlPressed) {
  //     makeSortable('y', function(oldPos, newPos) {
  //       updateInteralMatrixByRow(oldPos, newPos);
  //       animateSwitchRow(oldPos, newPos);
  //     });
  //   } else {
  //     makeScalable('y', leftBettisCopy, updateInternalMatrixByRowAdder);
  //   }
  // }
}

// function switchToRows() {
//   $tableBody.find('#border-maker').each(function () {
//     $(this).removeClass("by-cols");
//     $(this).addClass("by-rows");
//   });
//   $innerTable.find('#inner-border-maker').each(function() {
//     $(this).addClass("inner-border-row");
//     $(this).removeClass("inner-border-col");
//   });
// }

// function switchToCols() {
//   $tableBody.find('#border-maker').each(function () {
//     $(this).removeClass("by-rows");
//     $(this).addClass("by-cols");
//   });
//   $innerTable.find('#inner-border-maker').each(function() {
//     $(this).removeClass("inner-border-row");
//     $(this).addClass("inner-border-col");
//   });
// }

// function toggleRowsColumns() {
//   if (!shiftPressed) {
//     shiftPressed = true;
//     switchToRows();
//     createTable();
//   }
//   else if (shiftPressed) {
//     shiftPressed = false;
//     switchToCols();
//     createTable();
//   }
// }

function toggleAddSort() {
  if (!ctrlPressed) {
    ctrlPressed = true;
    $("#add-permute").html("Currently Adding");
    createTable();
  }
  else if (ctrlPressed) {
    ctrlPressed = false;
    $("#add-permute").html("Currently Permuting");
    createTable();
  }
}

function cleanUp() {
  $tableBody.empty();
}

function makeScalable(direction, affectedBettis, internalUpdater) {
  // make the table sortable by the headers and make the columns follow as the
  // headers move
  $("#matrix-body>tr>td>table").draggable({
    axis: direction,
    cursor: 'move',
    revert: 'invalid',
    revertDuration: 300,
    distance: 5,
    opacity: 0.8,
    zIndex: 10,
    start: function(event, ui) {
      $(this).addClass("draggable");
      $(this).parent().droppable("disable");
    },
    stop: function(event, ui) {
      $(this).removeClass("draggable");
      $(this).parent().droppable("enable");
    }
  });

  $("#matrix-body>tr>td").droppable({
    drop: function (event, ui) {
      let $draggable = ui.draggable;
      let $draggableParent = $draggable.parent();
      let $dropContainer = $(this);

      oldPos = parseInt($draggableParent.attr('index'));
      newPos = parseInt($dropContainer.attr('index'));

      $draggable.animate({left: '0', top: '0'}, 200);

      if ($dropContainer.hasClass("in-semi")) {
        $dropContainer.removeClass("in-semi");
        let $draggableElements = $draggable.find("tbody>tr>td");
        let $targetElements = $dropContainer.children().find("tbody>tr>td");
        let $dropIndex = parseInt($dropContainer.attr("index"));
        let $dragIndex = parseInt($draggableParent.attr("index"));
        scalar = parseInt(affectedBettis[$dropIndex]) - parseInt(affectedBettis[$dragIndex]);

        let i = 0;
        while (i < $draggableElements.length) {
          let targetValue = toPower($targetElements[i].innerHTML);
          let draggedValue = toPower($draggableElements[i].innerHTML);
          let isNeg = draggedValue.toString()[0] == "-" ? -1 : 1;
          let scaledValue = draggedValue == 0 ? 0 : (draggedValue + (isNeg * scalar));
          $targetElements[i].innerHTML = toMonomial(targetValue + scaledValue);
          i++;
        }
        internalUpdater(oldPos, newPos);
      } else {
        $dropContainer.removeClass("not-in-semi");
      }

    },
    over: function(event, ui) {
      $dropContainer = $(this);
      $draggableParent = ui.draggable.parent();
      $dropIndex = parseInt($dropContainer.attr("index"));
      $dragIndex = parseInt($draggableParent.attr("index"));
      scalar = parseInt(affectedBettis[$dropIndex]) - parseInt(affectedBettis[$dragIndex]);
      if (gapsList.includes(scalar.toString()) || scalar < 0) {
        $dropContainer.addClass("not-in-semi");
      } else {
        $dropContainer.addClass("in-semi");
      }
    },
    out: function(event, ui) {
      $dropContainer = $(this);
      $draggableParent = ui.draggable.parent();
      $dropIndex = parseInt($dropContainer.attr("index"));
      $dragIndex = parseInt($draggableParent.attr("index"));
      scalar = parseInt(affectedBettis[$dropIndex]) - parseInt(affectedBettis[$dragIndex]);
      if (gapsList.includes(scalar.toString()) || scalar < 0) {
        $dropContainer.removeClass("not-in-semi");
      } else {
        $dropContainer.removeClass("in-semi");
      }
    }
  });
}

function makeSortable(direction, internalUpdater) {
  // make the table sortable by the headers and make the columns follow as the
  // headers move
  $("#matrix-body>tr>td>table").draggable({
    axis: direction,
    cursor: 'move',
    revert: 'invalid',
    revertDuration: 300,
    opacity: 0.6,
    distance: 5,
    zIndex: 10,
    start: function(event, ui) {
      $(this).addClass("draggable");
    },
    stop: function(event, ui) {
      $(this).removeClass("draggable");
    }
  });

  $("#matrix-body>tr>td").droppable({
    hoverClass: 'drop-hover',
    drop: function (event, ui) {
      let $draggable = ui.draggable;
      let $draggableParent = $draggable.parent();
      let $dropContainer = $(this);
      oldPos = parseInt($draggableParent.attr('index'));
      newPos = parseInt($dropContainer.attr('index'));

      if (oldPos < newPos) {
        let $curDraggable = $draggable;
        let $nextDraggable = $dropContainer.children();
        $dropContainer.append($curDraggable);

        for (let i=newPos; i > oldPos; i--) {
          $curDraggable = $nextDraggable;
          $nextContainer = $("[index=" + (i-1) + "]");
          $nextDraggable = $nextContainer.children();
          $nextContainer.append($curDraggable);
        }
      } else {
        let $curDraggable = $draggable;
        let $nextDraggable = $dropContainer.children();
        $dropContainer.append($curDraggable);

        for (let i=newPos; i < oldPos; i++) {
          $curDraggable = $nextDraggable;
          $nextContainer = $("[index=" + (i+1) + "]");
          $nextDraggable = $nextContainer.children();
          $nextContainer.append($curDraggable);
        }
      }

      $draggable.css({ "left":0, "top":0 });

      internalUpdater(oldPos, newPos);
    }
  });
}

// function animateSwitchRow(oldPos, newPos) {
//   if (oldPos < newPos) {
//     $('.switchslide').removeClass('switchslide');
//     for(let i = oldPos;i < newPos; i++) {
//       $("[index=" + i + "]").addClass('switchslide');
//     }
//     $('.switchslide').css({'top': $("[index=" + newPos + "]").parent().height(), 'position': 'relative'});
//     $('.switchslide').animate({
//       'top': 0
//     }, {
//       duration: 300,
//       // avoids (some) flickering
//       step: function(now, fx) {
//         fx.now = parseInt(now);
//       },
//       complete: function() {
//         $(this).css({'top': '', 'position': ''});
//     }});
//   }
//   else {
//     $('.switchslide').removeClass('switchslide');
//     for(let i = oldPos;i > newPos; i--) {
//       $("[index=" + i + "]").addClass('switchslide');
//     }
//     $('.switchslide').css({'bottom': $("[index=" + newPos + "]").parent().height(), 'position': 'relative'});
//     $('.switchslide').animate({
//       'bottom': 0
//     }, {
//       duration: 300,
//       // avoids (some) flickering
//       step: function(now, fx) {
//         fx.now = parseInt(now);
//       },
//       complete: function() {
//         $(this).css({'bottom': '', 'position': ''});
//     }});
//   }
// }

function animateSwitchCol(oldPos, newPos) {
  if (oldPos < newPos) {
    $('.switchslide').removeClass('switchslide');
    for(let i = oldPos;i < newPos; i++) {
      $("[index=" + i + "]").addClass('switchslide');
    }
    $('.switchslide').css({'left': $("[index=" + newPos + "]").width(), 'position': 'relative'});
    $('.switchslide').animate({
      'left': 0
    }, {
      duration: 300,
      complete: function() {
        $(this).css({'left': '', 'position': ''});
    }});
  }
  else {
    $('.switchslide').removeClass('switchslide');
    for(let i = oldPos;i > newPos; i--) {
      $("[index=" + i + "]").addClass('switchslide');
    }
    $('.switchslide').css({'right': $("[index=" + newPos + "]").width(), 'position': 'relative'});
    $('.switchslide').animate({
      'right': 0
    }, {
      duration: 300,
      complete: function() {
        $(this).css({'right': '', 'position': ''});
    }});
  }
}

function multByNegOne(element) {
  // if (direction == 1) {
  $element = $tableBody.find(element);
  index = $tableBody.find(">tr>td").index($element);
  $element.find(">table>tbody>tr>td").each(function() {
    if (this.innerHTML != "0") {
      this.innerHTML = toMonomial(toPower(this.innerHTML) * -1);
    }
  });
  updateInternalMatrixNeg(index);
  // } else if (direction == 0) {
  //   $element = $tableBody.find(element);
  //   index = $tableBody.find(".movers").index($element);
  //   $element.find('>td>table>tbody>tr>td').each(function() {
  //     if (this.innerHTML != "0") {
  //       this.innerHTML = toMonomial(toPower(this.innerHTML) * -1);
  //     }
  //   });
  //   updateInternalMatrixNeg(index, 'row');
  // }
}

function updateInternalMatrixNeg(index) {
  // if (direction == 'col') {
  for (let row=0; row < matCopy.length; row++) {
    if (matCopy[row][index] != "0") {
      matCopy[row][index] = toMonomial(toPower(matCopy[row][index]) * -1);
    }
  }
  if (nextMatrix != null) {
    row = nextMatrix[index];
    for (let i = 0; i < row.length; i++) {
      if (row[i] != "0") {
        row[i] = toMonomial(toPower(row[i]) * -1);
      }
    }
  }
  // } else if (direction == 'row') {
  //   for (let col=0; col < matCopy[0].length; col++) {
  //     if (matCopy[index][col] != "0") {
  //       matCopy[index][col] = toMonomial(toPower(matCopy[index][col]) * -1);
  //     }
  //   }
  //   if (prevMatrix != null) {
  //     for (let row = 0; row < prevMatrix.length; row++) {
  //       if (prevMatrix[row][index] != "0") {
  //         prevMatrix[row][index] = toMonomial(toPower(prevMatrix[row][index]) * -1);
  //       }
  //     }
  //   }
  // }
  // printMatrix();
}

// Update the Interal Matrix as you make changes
// to the one on the table
// function updateInteralMatrixByRow(oldPos, newPos) {
//   temp = leftBettisCopy[oldPos];
//   leftBettisCopy.splice(oldPos, 1);
//   leftBettisCopy.splice(newPos, 0, temp);

//   temp = matCopy[oldPos];
//   matCopy.splice(oldPos, 1);
//   matCopy.splice(newPos, 0, temp);

//   if (prevMatrix != null) {
//     for (let row=0; row < prevMatrix.length; row++){
//       temp = prevMatrix[row][oldPos];
//       prevMatrix[row].splice(oldPos, 1);
//       prevMatrix[row].splice(newPos, 0, temp);
//     }
//   }

//   // printMatrix();
// }

// Update the Interal Matrix as you make changes
// to the one on the table
function updateInteralMatrixByCol(oldPos, newPos) {
  temp = topBettisCopy[oldPos];
  topBettisCopy.splice(oldPos, 1);
  topBettisCopy.splice(newPos, 0, temp);

  for (let row=0; row < matCopy.length; row++){
    temp = matCopy[row][oldPos];
    matCopy[row].splice(oldPos, 1);
    matCopy[row].splice(newPos, 0, temp);
  }

  if (nextMatrix != null) {
    temp = nextMatrix[oldPos];
    nextMatrix.splice(oldPos, 1);
    nextMatrix.splice(newPos, 0, temp);
  }

  // printMatrix();
}

// function updateInternalMatrixByRowAdder(oldPos, newPos) {
  // let draggedRow = matCopy[oldPos];
  // let targetRow = matCopy[newPos];
  // let draggedBetti = parseInt(leftBettisCopy[oldPos]);
  // let targetBetti = parseInt(leftBettisCopy[newPos]);

  // scalar = targetBetti - draggedBetti;

  // let i = 0;
  // while (i < targetRow.length) {
  //   let targetValue = toPower(targetRow[i]);
  //   let draggedValue = toPower(draggedRow[i]);
  //   let isNeg = draggedValue.toString()[0] == "-" ? -1 : 1;
  //   let scaledValue = draggedValue == 0 ? 0 : (draggedValue + (isNeg * scalar));
  //   targetRow[i] = toMonomial(targetValue + scaledValue);
  //   i++;
  // }
  // printMatrix();
// }

function updateInteralMatrixByColAdder(oldPos, newPos) {
  let draggedBetti = parseInt(topBettisCopy[oldPos]);
  let targetBetti = parseInt(topBettisCopy[newPos]);

  scalar = targetBetti - draggedBetti;

  for (let row = 0; row < matCopy.length; row++) {
    let targetValue = toPower(matCopy[row][newPos]);
    let draggedValue = toPower(matCopy[row][oldPos]);
    let isNeg = draggedValue.toString()[0] == "-" ? -1 : 1;
    let scaledValue = draggedValue == 0 ? 0 : (draggedValue + (isNeg * scalar));
    matCopy[row][newPos] = toMonomial(targetValue + scaledValue);
  }

  if (nextMatrix != null) {
    let draggedRow = nextMatrix[newPos];
    let targetRow = nextMatrix[oldPos];
    let draggedBetti = parseInt(topBettisCopy[newPos]);
    let targetBetti = parseInt(topBettisCopy[oldPos]);

    scalar = draggedBetti - targetBetti;

    let i = 0;
    while (i < targetRow.length) {
      let targetValue = toPower(targetRow[i]);
      let draggedValue = toPower(draggedRow[i]);
      let isNeg = draggedValue.toString()[0] == "-" ? -1 : 1;
      let scaledValue = draggedValue == 0 ? 0 : (draggedValue + (isNeg * scalar));
      targetRow[i] = toMonomial(targetValue - scaledValue);
      i++;
    }
  }
  // printMatrix();
}

function resetMatrix() {
  matCopy = [];
  mat.forEach(function(row) {
    matCopy.push([...row]);
  });
  topBettisCopy = [...gradedDegreesTop];
  leftBettisCopy = [...gradedDegreesLeft];

  // reset prev and next matrices
  if (matIndex == 1) {
    nextMatrix = [];
    matrices[matIndex].forEach(function(row) {
      nextMatrix.push([...row]);
    });
  } else if (matIndex == matrices.length) {
    prevMatrix = [];
    matrices[matIndex-2].forEach(function(row) {
      prevMatrix.push([...row]);
    });
  } else {
    prevMatrix = [];
    matrices[matIndex-2].forEach(function(row) {
      prevMatrix.push([...row]);
    });
    nextMatrix = [];
    matrices[matIndex].forEach(function(row) {
      nextMatrix.push([...row]);
    });
  }
  createTable();
}

function updateMatrix() {
  mat = [];
  matCopy.forEach(function(row) {
    mat.push([...row]);
  });
  gradedDegreesTop = [...topBettisCopy];
  gradedDegreesLeft = [...leftBettisCopy];

  matrices[matIndex-1] = [];

  mat.forEach(function (row) {
    matrices[matIndex-1].push([...row]);
  });

  allGradedDegrees[matIndex-1] = [...gradedDegreesLeft];
  allGradedDegrees[matIndex] = [...gradedDegreesTop];

  if (matIndex == 1) {
    matrices[matIndex] = [];
    nextMatrix.forEach(function(row) {
      matrices[matIndex].push([...row]);
    });
  } else if (matIndex == matrices.length) {
    matrices[matIndex-2] = [];
    prevMatrix.forEach(function(row) {
      matrices[matIndex-2].push([...row]);
    });
  } else {
    matrices[matIndex] = [];
    nextMatrix.forEach(function(row) {
      matrices[matIndex].push([...row]);
    });
    matrices[matIndex-2] = [];
    prevMatrix.forEach(function(row) {
      matrices[matIndex-2].push([...row]);
    });
  }
  // printMatrix();
}

function range(start, stop) {
  let rangeArray = [];

  for (i = start; i < stop; i++) {
    rangeArray.push(i);
  }
  return rangeArray
}

function toPower(monomial) {
  if (monomial == "0") {
    return 0;
  }
  let isNeg = monomial[0] == "-" ? -1 : 1;
  let exponent = parseInt(monomial.match(/\^(\d+)/)[1]);
  return isNeg * exponent;
}

function toMonomial(power) {
  if (power == 0) {
    return "0";
  }
  let isNeg = "";

  if (power < 0) {
    isNeg = "-";
    power *= -1;
  }

  return isNeg + "x^" + power;
}