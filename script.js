let mat;
let gradedDegreesLeft;
let gradedDegreesTop;
let shiftPressed = false;
let ctrlPressed = false;

// create variables for DOM elments we will be targeting
let $tableMain = $("#matrix-table");
let $tableBody = $("#matrix-body");
let $optionButtons = $("#options button");
let $innerTable = $(".inner-table");

let oldPos;
let newPos;

// once the page loads the table will be made sortable
// and the matrix will be generated for the matrix in
// the textarea
$(document).ready(function() {
  readInput();
  createTable();
  $(document).keydown(function(event) {
    if (event.keyCode == 16 && !shiftPressed) {
      shiftPressed = true;
      switchToRows();
      createTable();
    }
    else if (event.keyCode == 16 && shiftPressed) {
      shiftPressed = false;
      switchToCols();
      createTable();
    }
    if (event.keyCode == 17 && !ctrlPressed) {
      ctrlPressed = true;
      $("#permute").removeClass("active");
      $("#add").addClass("active");
      createTable();
    }
    else if (event.keyCode == 17 && ctrlPressed) {
      ctrlPressed = false;
      $("#add").removeClass("active");
      $("#permute").addClass("active");
      createTable();
    }
  });
});

// Read the input provided in the textarea section
function readInput() {
  finalOutput = [];
  raw = $("#read-matrix").val();
  rows = raw.split(/\n/);
  rows.forEach(function (row) {
    finalOutput.push(row.trim().split(/\s/));
  });
  mat = finalOutput;
  gradedDegreesLeft = $("#gradedDegsLeft").val().trim().split(/\s/);
  gradedDegreesTop = $("#gradedDegsTop").val().trim().split(/\s/);
}

function readAndGenerateMatrix() {
  readInput();
  createTable();
}

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
  if (!shiftPressed) {
    let tableRow = '<tr>';
    tableRow += '<th id="border-maker" class="by-cols"><table class="inner-table"><tr id="inner-border-maker" class="inner-border-col"><th>GrDgs</th></tr>';
    for (let i=0; i < gradedDegreesLeft.length; i++) {
      tableRow += '<tr id="inner-border-maker" class="inner-border-col"><th>' + gradedDegreesLeft[i] + '</th></tr>';
    }
    tableRow += '</table></th>';
    for (let col=0; col < mat[0].length; col++) {
      tableRow += '<td index='+ col +' id="border-maker" class="by-cols" onclick="multByNegOne(this, 1)"><table class="inner-table">';
      tableRow += '<tr id="inner-border-maker" class="inner-border-col"><th>' + gradedDegreesTop[col] + '</th></tr>';
      for (let row=0; row < mat.length; row++) {
        tableRow += '<tr id="inner-border-maker" class="inner-border-col"><td>' + mat[row][col] + '</td></tr>';
      }
      tableRow += '</table></td>';
    }
    tableRow += '</tr>';
    $tableBody.append(tableRow);
    if (!ctrlPressed) {
      makeSortable('x', function(oldPos, newPos) {
        updateInteralMatrixByCol(oldPos, newPos);
        animateSwitchCol(oldPos, newPos);
      });
    } else {
      makeScalable('x', gradedDegreesTop, updateInteralMatrixByColAdder);
    }
  // By Rows
  } else {
    let tableRow;
    tableRow += '<tr id="border-maker" class="by-rows"><th><table class="inner-table"><tr><th id="inner-border-maker" class="inner-border-row">GrDgs</th>';
    for (let i=0; i < gradedDegreesTop.length; i++) {
      tableRow += '<th id="inner-border-maker" class="inner-border-row">' + gradedDegreesTop[i] + '</th>';
    }
    tableRow += '</tr></table></th></tr>'
    for (let row=0; row < mat.length; row++) {
      tableRow += '<tr id="border-maker" class="by-rows movers" onclick="multByNegOne(this, 0)"><td index=' + row + '><table class="inner-table"><tr>';
      tableRow += '<th id="inner-border-maker" class="inner-border-row">' + gradedDegreesLeft[row] + '</th>';
      for (let col=0; col < mat[0].length; col++) {
        tableRow += '<td id="inner-border-maker" class="inner-border-row">' + mat[row][col] + '</td>';
      }
      tableRow += '</tr></table></td></tr>';
    }
    $tableBody.append(tableRow);
    if (!ctrlPressed) {
      makeSortable('y', function(oldPos, newPos) {
        updateInteralMatrixByRow(oldPos, newPos);
        animateSwitchRow(oldPos, newPos);
      });
    } else {
      makeScalable('y', gradedDegreesLeft, updateInternalMatrixByRowAdder);
    }
  }
}

function switchToRows() {
  $tableBody.find('#border-maker').each(function () {
    $(this).removeClass("by-cols");
    $(this).addClass("by-rows");
  });
  $innerTable.find('#inner-border-maker').each(function() {
    $(this).addClass("inner-border-row");
    $(this).removeClass("inner-border-col");
  });
}

function switchToCols() {
  $tableBody.find('#border-maker').each(function () {
    $(this).removeClass("by-rows");
    $(this).addClass("by-cols");
  });
  $innerTable.find('#inner-border-maker').each(function() {
    $(this).removeClass("inner-border-row");
    $(this).addClass("inner-border-col");
  });
}

function toggleRowsColumns() {
  if (!shiftPressed) {
    shiftPressed = true;
    switchToRows();
    createTable();
  }
  else if (shiftPressed) {
    shiftPressed = false;
    switchToCols();
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
    opacity: 0.6,
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

      $draggable.css({ "left":0, "top":0 });

      let $draggableElements = $draggable.find("tbody>tr>");
      let $targetElements = $dropContainer.children().find("tbody>tr>");

      // console.log($draggable.find("tbody>tr>"));

      let i = 0;
      while (i < $draggableElements.length) {
        let targetValue = parseInt($targetElements[i].innerHTML);
        let draggedValue = parseInt($draggableElements[i].innerHTML);
        $targetElements[i].innerHTML = targetValue + draggedValue;
        i++;
      }

      // internalUpdater(oldPos, newPos);
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

function animateSwitchRow(oldPos, newPos) {
  if (oldPos < newPos) {
    $('.switchslide').removeClass('switchslide');
    for(let i = oldPos;i < newPos; i++) {
      $("[index=" + i + "]").addClass('switchslide');
    }
    $('.switchslide').css({'top': $("[index=" + newPos + "]").parent().height(), 'position': 'relative'});
    $('.switchslide').animate({
      'top': 0
    }, {
      duration: 100,
      // avoids (some) flickering
      step: function(now, fx) {
        fx.now = parseInt(now);
      },
      complete: function() {
        $(this).css({'top': '', 'position': ''});
    }});
  }
  else {
    $('.switchslide').removeClass('switchslide');
    for(let i = oldPos;i > newPos; i--) {
      $("[index=" + i + "]").addClass('switchslide');
    }
    $('.switchslide').css({'bottom': $("[index=" + newPos + "]").parent().height(), 'position': 'relative'});
    $('.switchslide').animate({
      'bottom': 0
    }, {
      duration: 100,
      // avoids (some) flickering
      step: function(now, fx) {
        fx.now = parseInt(now);
      },
      complete: function() {
        $(this).css({'bottom': '', 'position': ''});
    }});
  }
}

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
      duration: 100,
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
      duration: 100,
      complete: function() {
        $(this).css({'right': '', 'position': ''});
    }});
  }
}

function multByNegOne(element, direction) {
  if (direction == 1) {
    $element = $tableBody.find(element);
    index = $tableBody.find(">tr>td").index($element);
    $element.find(">table>tbody>tr>td").each(function() {
      this.innerHTML *= -1;
    });
    updateInternalMatrixNeg(index, 'col');
  } else if (direction == 0) {
    $element = $tableBody.find(element);
    index = $tableBody.find(".movers").index($element);
    $element.find('>td>table>tbody>tr>td').each(function() {
      this.innerHTML *= -1;
    });
    updateInternalMatrixNeg(index, 'row');
  }
}

function updateInternalMatrixNeg(index, direction) {
  if (direction == 'col') {
    for (let row=0; row < mat.length; row++) {
      mat[row][index] *= -1;
    }
  } else if (direction == 'row') {
    for (let col=0; col < mat[0].length; col++) {
      mat[index][col] *= -1;
    }
  }
  printMatrix();
}

// Update the Interal Matrix as you make changes
// to the one on the table
function updateInteralMatrixByRow(oldPos, newPos) {
  temp = gradedDegreesLeft[oldPos];
  gradedDegreesLeft.splice(oldPos, 1);
  gradedDegreesLeft.splice(newPos, 0, temp);

  temp = mat[oldPos];
  mat.splice(oldPos, 1);
  mat.splice(newPos, 0, temp);

  printMatrix();
}

// Update the Interal Matrix as you make changes
// to the one on the table
function updateInteralMatrixByCol(oldPos, newPos) {
  temp = gradedDegreesTop[oldPos];
  gradedDegreesTop.splice(oldPos, 1);
  gradedDegreesTop.splice(newPos, 0, temp);

  for (let row=0; row < mat.length; row++){
    temp = mat[row][oldPos];
    mat[row].splice(oldPos, 1);
    mat[row].splice(newPos, 0, temp);
  }

  printMatrix();
}

function updateInternalMatrixByRowAdder(oldPos, newPos) {
  temp = gradedDegreesLeft[oldPos];
  gradedDegreesLeft[oldPos] = gradedDegreesLeft[newPos];
  gradedDegreesLeft[newPos] = temp;

  for (let col=0; col < mat[0].length; col++){
    temp = mat[newPos][col];
    mat[newPos][col] = mat[oldPos][col];
    mat[oldPos][col] = temp;
  }

  printMatrix();
}

function updateInteralMatrixByColAdder(oldPos, newPos) {
  temp = gradedDegreesTop[oldPos];
  gradedDegreesTop[oldPos] = gradedDegreesTop[newPos];
  gradedDegreesTop[newPos] = temp;

  for (let row=0; row < mat.length; row++){
    temp = mat[row][newPos];
    mat[row][newPos] = mat[row][oldPos];
    mat[row][oldPos] = temp;
  }

  printMatrix();
}

function range(start, stop) {
  let rangeArray = [];

  for (i = start; i < stop; i++) {
    rangeArray.push(i);
  }
  return rangeArray
}
