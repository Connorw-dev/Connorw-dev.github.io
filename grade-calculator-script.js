document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('desired-grade').addEventListener('change', handleDesiredGrade);
});

function searchSubject() {
  const year = document.getElementById('year').value;
  const subjectCode = document.getElementById('subject-code').value;
  const searchUrl = `https://apps.jcu.edu.au/subjectsearch/#/subject/${year}/${subjectCode}`;
  window.open(searchUrl, '_blank');
}

function handleDesiredGrade() {
  const input = document.getElementById('desired-grade').value.toUpperCase();
  let desiredGrade;
  if (input.endsWith('%')) {
    desiredGrade = parseFloat(input);
  } else {
    switch(input) {
      case 'P': desiredGrade = 50; break;
      case 'C': desiredGrade = 65; break;
      case 'D': desiredGrade = 75; break;
      case 'HD': desiredGrade = 85; break;
      default:
        desiredGrade = parseFloat(input);
    }
  }
  if (isNaN(desiredGrade) || desiredGrade < 0 || desiredGrade > 100) {
    alert('Please enter a valid grade.');
    return null;
  }
  return desiredGrade;
}

function addRow() {
  const table = document.getElementById('grade-table').getElementsByTagName('tbody')[0];
  const newRow = table.insertRow();
  const itemCell = newRow.insertCell(0);
  const weightCell = newRow.insertCell(1);
  const gradeCell = newRow.insertCell(2);
  const removeCell = newRow.insertCell(3);

  itemCell.innerHTML = '<input type="text" class="item-input">';
  weightCell.innerHTML = '<input type="number" class="weight-input">';
  gradeCell.innerHTML = '<input type="number" class="grade-input" placeholder="out of 100%">';
  removeCell.innerHTML = '<button onclick="removeRow(this)">-</button>';
}

function removeRow(button) {
  const row = button.parentNode.parentNode;
  row.parentNode.removeChild(row);
}

function calculateRest() {
  const weightInputs = document.querySelectorAll('.weight-input');
  const gradeInputs = document.querySelectorAll('.grade-input');
  let totalWeight = 0;
  let currentGrade = 0;
  let emptyWeights = 0;
  let desiredGrade = handleDesiredGrade();

  if (desiredGrade === null) {
    return; // Stop calculation if desired grade is not valid
  }

  weightInputs.forEach((weightInput, index) => {
    const weight = parseFloat(weightInput.value);
    const grade = parseFloat(gradeInputs[index].value);

    if (!isNaN(weight)) {
      totalWeight += weight;
      if (!isNaN(grade)) {
        currentGrade += (weight / 100) * grade;
      } else {
        emptyWeights += weight; // Track the sum of the weights for empty grade fields
      }
    }
  });

  if (totalWeight !== 100) {
    document.getElementById('error-message').textContent = 'Error: The sum of the weightings must equal 100.';
    return;
  }

  document.getElementById('error-message').textContent = ''; // Clear error message if weights are valid

  gradeInputs.forEach((input, index) => {
    if (input.value === '') {
      const weight = parseFloat(weightInputs[index].value);
      if (!isNaN(weight)) {
        const calculatedGrade = 100 * (desiredGrade - 100 * currentGrade) / emptyWeights;
        // input.value = Math.max(0, calculatedGrade).toFixed(2); // Ensure grades aren't negative
        input.style.color = 'red';
      }
    }
  });
}
