let mat;
let gradedDegreesLeft;
let gradedDegreesTop;

// create variables for DOM elments we will be targeting
let $tableMain = $("#matrix-table");
let $tableHead = $("#matrix-head");
let $tableBody = $("#matrix-body");
let $optionButtons = $("#options button");
let $toggleButton = $("#toggle");

let oldPos;
let newPos;

// once the page loads the table will be made sortable
// and the matrix will be generated for the matrix in
// the textarea
$(document).ready(function() {
  readInput();
  createTable();
  $(document).keydown(function(event) {
    if (event.keyCode == 16) {
      $tableHead.sortable('disable');
      $tableBody.sortable('enable');
      switchToRows();
    }
  });
  $(document).keyup(function(event) {
    if (event.keyCode == 16) {
      $tableHead.sortable('enable');
      $tableBody.sortable('disable');
      switchToCols();
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
  $tableHead.empty();
  $tableBody.empty();
  $tableHead.append('<td><strong>GrDegs</strong></td>');
  for (let col=0; col < gradedDegreesTop.length; col++) {
    $tableHead.append('<th order="' + gradedDegreesTop[col] + '" id="col' + gradedDegreesTop[col] + '">' + gradedDegreesTop[col] + '</th>');
  }

  for (let row=0; row < mat.length; row++) {
    let tableRow = '<tr>';
    tableRow += '<th>' + gradedDegreesLeft[row] + '</th>';
    for (let col=0; col < mat[0].length; col++) {
      tableRow += '<td class="by-cols">' + mat[row][col] + '</td>';
    }
    tableRow += '</tr>';
    $tableBody.append(tableRow);
  }
  sortableByRows();
  $tableBody.sortable('disable');
  sortableByColumns();
}

function switchToRows() {
  $tableBody.find('td').each(function () {
    $(this).removeClass("by-cols");
    $(this).addClass("by-rows");
  });
}

function switchToCols() {
  $tableBody.find('td').each(function () {
    $(this).removeClass("by-rows");
    $(this).addClass("by-cols");
  });
}

function sortableByColumns() {
  // make the table sortable by the headers and make the columns follow as the
  // headers move
  $tableHead.sortable({
    axis: "x" ,
    items: 'th',
    cursor: 'move',
    helper: 'clone',
    distance: 1,
    opacity: 0.8,
    placeholder: 'ui-state-highlight',
    // when selecting a column to sort this makes sure to grab its index
    // before moving it
    start: function(event, ui) {
        startPos = $tableHead.find('th').index(ui.item);
        console.log($tableHead.find('th'));
        oldPos = startPos;
    },
    // instead of on change we should do something on stop so that it can do
    // it all in one go once you let go of the column header
    change: function(event, ui) {
        // Get position of the placeholder
        let newPos = $tableHead.find('th').index($tableHead.find('th.ui-state-highlight'));

        // If the position is right of the original position, substract it by one in cause of the hidden th
        if (newPos>startPos) newPos--;
        updateInteralMatrixByCol(oldPos, newPos);

        // move all the row elements
        $tableBody.find('tr').find('td:eq(' + oldPos + ')').each(function() {
            let tdElement = $(this);
            let tdElementParent = tdElement.parent();
            if(newPos>oldPos)// Move it the right
                tdElementParent.find('td:eq(' + newPos + ')').after(tdElement);
            else// Move it the left
                tdElementParent.find('td:eq(' + newPos + ')').before(tdElement);
        });
        oldPos = newPos;
    },
  });
}

function sortableByRows() {
    $tableBody.sortable({
    axis: "y" ,
    items: 'tr',
    cursor: 'move',
    helper: 'clone',
    distance: 1,
    opacity: 0.8,
    placeholder: 'ui-state-highlight'
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
