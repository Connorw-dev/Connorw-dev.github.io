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
    switch(input) {
      case 'P': desiredGrade = 50; break;
      case 'C': desiredGrade = 65; break;
      case 'D': desiredGrade = 75; break;
      case 'HD': desiredGrade = 85; break;
      default:
        desiredGrade = parseFloat(input);
        if (isNaN(desiredGrade) || desiredGrade < 0 || desiredGrade > 100) {
          alert('Please enter a valid grade.');
          return;
        }
    }
    console.log(desiredGrade); // Placeholder for desiredGrade handling
  }
  
  function addRow() {
    const table = document.getElementById('grade-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    const itemCell = newRow.insertCell(0);
    const weightCell = newRow.insertCell(1);
    const gradeCell = newRow.insertCell(2);
  
    itemCell.innerHTML = '<input type="text" class="item-input">';
    weightCell.innerHTML = '<input type="number" class="weight-input">';
    gradeCell.innerHTML = '<input type="number" class="grade-input">';
  }
  
  function calculateRest() {
    const gradeInputs = document.querySelectorAll('.grade-input');
    gradeInputs.forEach(input => {
      if (input.value === '') {
        input.value = '50';
        input.style.color = 'red';
      }
    });
  }
  