let mat;
let gradedDegreesLeft;
let gradedDegreesTop;
let shiftPressed = false;

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
    tableRow += '<td id="border-maker" class="by-cols"><table class="inner-table"><tr id="inner-border-maker" class="inner-border-col"><th>GrDgs</th></tr>';
    for (let i=0; i < gradedDegreesLeft.length; i++) {
      tableRow += '<tr id="inner-border-maker" class="inner-border-col"><th>' + gradedDegreesLeft[i] + '</th></tr>';
    }
    tableRow += '</table></td>';
    for (let col=0; col < mat[0].length; col++) {
      tableRow += '<td id="border-maker" class="by-cols movers"><table class="inner-table">';
      tableRow += '<tr id="inner-border-maker" class="inner-border-col"><th>' + gradedDegreesTop[col] + '</th></tr>';
      for (let row=0; row < mat.length; row++) {
        tableRow += '<tr id="inner-border-maker" class="inner-border-col"><td>' + mat[row][col] + '</td></tr>';
      }
      tableRow += '</table></td>';
    }
    tableRow += '</tr>';
    $tableBody.append(tableRow);
    sortableByColumns();
  // By Rows
  } else {
    let tableRow;
    tableRow += '<tr id="border-maker" class="by-rows"><td><table class="inner-table"><tr><th id="inner-border-maker" class="inner-border-row">GrDgs</th>';
    for (let i=0; i < gradedDegreesTop.length; i++) {
      tableRow += '<th id="inner-border-maker" class="inner-border-row">' + gradedDegreesTop[i] + '</th>';
    }
    tableRow += '</tr></table></td></tr>'
    for (let row=0; row < mat.length; row++) {
      tableRow += '<tr id="border-maker" class="by-rows movers"><td><table class="inner-table"><tr>';
      tableRow += '<th id="inner-border-maker" class="inner-border-row">' + gradedDegreesLeft[row] + '</th>';
      for (let col=0; col < mat[0].length; col++) {
        tableRow += '<td id="inner-border-maker" class="inner-border-row">' + mat[row][col] + '</td>';
      }
      tableRow += '</tr></table></td></tr>';
    }
    $tableBody.append(tableRow);
    sortableByRows();
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

function sortableByColumns() {
  // make the table sortable by the headers and make the columns follow as the
  // headers move
  $tableBody.sortable({
    axis: "x" ,
    items: '.movers',
    cursor: 'move',
    helper: 'clone',
    distance: 1,
    opacity: 0.8,
    // placeholder: 'ui-state-highlight',
    // when selecting a column to sort this makes sure to grab its index
    // before moving it
    // start: function(event, ui) {
    //     startPos = $tableHead.find('th').index(ui.item);
    //     console.log($tableHead.find('th'));
    //     oldPos = startPos;
    // },
    // // instead of on change we should do something on stop so that it can do
    // // it all in one go once you let go of the column header
    // change: function(event, ui) {
    //     // Get position of the placeholder
    //     let newPos = $tableHead.find('th').index($tableHead.find('th.ui-state-highlight'));

    //     // If the position is right of the original position, substract it by one in cause of the hidden th
    //     if (newPos>startPos) newPos--;
    //     updateInteralMatrixByCol(oldPos, newPos);

    //     // move all the row elements
    //     $tableBody.find('tr').find('td:eq(' + oldPos + ')').each(function() {
    //         let tdElement = $(this);
    //         let tdElementParent = tdElement.parent();
    //         if(newPos>oldPos)// Move it the right
    //             tdElementParent.find('td:eq(' + newPos + ')').after(tdElement);
    //         else// Move it the left
    //             tdElementParent.find('td:eq(' + newPos + ')').before(tdElement);
    //     });
    //     oldPos = newPos;
    // },
  });
}

function sortableByRows() {
    $tableBody.sortable({
    axis: "y" ,
    items: '.movers',
    cursor: 'move',
    helper: 'clone',
    distance: 1,
    opacity: 0.8,
    // placeholder: 'ui-state-highlight'
    // when selecting a column to sort this makes sure to grab its index
    // before moving it
    // start: function(event, ui) {
    //     startPos = $tableBody.find('th').index(ui.item);
    //     console.log($tableBody.find('th'));
    //     console.log(startPos);
    //     oldPos = startPos;
    // },
    // // instead of on change we should do something on stop so that it can do
    // // it all in one go once you let go of the column header
    // change: function(event, ui) {
    //     // Get position of the placeholder
    //     let newPos = $tableBody.find('th').index($tableBody.find('th.ui-state-highlight'));

    //     // If the position is right of the original position, substract it by one in cause of the hidden th
    //     if (newPos>startPos) newPos--;
    //     updateInteralMatrixByRow(oldPos, newPos);

    //     // move all the row elements
    //     // $tableBody.find('tr').find('td:eq(' + oldPos + ')').each(function() {
    //     //     let tdElement = $(this);
    //     //     let tdElementParent = tdElement.parent();
    //     //     if(newPos>oldPos)// Move it the right
    //     //         tdElementParent.find('td:eq(' + newPos + ')').after(tdElement);
    //     //     else// Move it the left
    //     //         tdElementParent.find('td:eq(' + newPos + ')').before(tdElement);
    //     // });

    //     let trOld = $('tr:eq(' + oldPos + ')');
    //     if (newPos > oldPos)
    //       $('tr:eq(' + newPos + ')').after(trOld);
    //     else
    //       $('tr:eq(' + newPos + ')').before(trOld);
    //     oldPos = newPos;
    // }
  });
}

// Update the Interal Matrix as you make changes
// to the one on the table
function updateInteralMatrixByRow(oldPos, newPos) {
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

// Update the Interal Matrix as you make changes
// to the one on the table
function updateInteralMatrixByCol(oldPos, newPos) {
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

function cleanUp() {
  $tableBody.empty();
  $tableHead.empty();
}
