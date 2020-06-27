// start the matrix in

let raw;
let mat;
let gradedDegrees = [1, 2, 3, 4];

// create variables for DOM elments we will be targeting
let tableBody = $("#matrix-body");
let allRowElements = $("#matrix-body tr");
let optionButtons = $("#options button");
let toggleButton = $("#toggle");

// the class that determines whether the table is being
// represented by rows or by cols
let row_direction_class = "rowsByCol";

// boolean to determine whether rows are sortable or not
let rows_sortable = false;

// once the page loads the table will be made sortable
// and the matrix will be generated for the matrix in
// the textarea
$(document).ready(function() {
  tableBody.sortable({
    stop: function( event, ui ) {
      console.log("ui object:", ui);
    }
  });

  generateMatrix();
});

// This will convert the input given in the textarea and
// convert it to the matrix table
function generateMatrix() {
  // clear anything being displayed in the matrix table
  tableBody.empty();
  raw = $("#matrix").val();
  // get the input from textarea and set it to mat
  mat = convertStringToMatrix(raw);

  if (rows_sortable) {
    for (let i = 0; i < mat.size()[0]; i++) {
      let rowDiv = $("<div>");
      let row = $("<tr>");
      row.addClass(row_direction_class);
      for (let j = 0; j < mat.size()[1]; j++) {
        let element = math.subset(mat, math.index(i, j));
        row.append($("<td>"+element+"</td>"));
      }
      rowDiv.append(row);
      tableBody.append(rowDiv);
    }
  } else {
    for (let i = 0; i < mat.size()[0]; i++) {
      let row = $("<tr>");
      row.addClass(row_direction_class);
      for (let j = 0; j < mat.size()[1]; j++) {
        let element = math.subset(mat, math.index(i, j))
        row.append($("<td>"+element+"</td>"));
      }
      tableBody.append(row);
    }
  }
}

// Convert any string of values into a matrix
function convertStringToMatrix(rawstring) {
  let rows = rawstring.split('\n');
  for (let i = 0; i < rows.length; i++) {
    rows[i] = rows[i].split(' ');
  }

  if (rows_sortable) {
    return math.matrix(rows);
  } else {
    return math.transpose(math.matrix(rows));
  }
}

function updateFreeResolution() {
  alert('ToDo: link this with the internal free resolution');
}

function cleanUp() {
  tableBody.empty();
}

function toggleRowCol() {
  mat = math.transpose(mat);

  if (rows_sortable) {
    rows_sortable = false;
    row_direction_class = "rowsByCol";
    toggleButton.html("Switch to Rows");
    generateMatrix();
  } else {
    rows_sortable = true;
    row_direction_class = "rowsByRow"
    toggleButton.html("Switch to Columns");
    generateMatrix();
  }
}