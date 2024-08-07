let subjects = {};

function loadSubjects() {
    fetch('subjects.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            subjects = data;
            displaySubjects();
        })
        .catch(error => console.error('Error loading subjects:', error));
}

function displaySubjects() {
    const tableBody = document.getElementById('subjectsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    Object.keys(subjects).forEach(code => {
        const subject = subjects[code];
        const row = tableBody.insertRow();
        const cellCode = row.insertCell(0);
        cellCode.innerHTML = `<a href="https://apps.jcu.edu.au/subjectsearch/#/subject/2024/${code}" target="_blank">${code}</a>`;
        row.insertCell(1).textContent = subject.name;
    });
}

function toggleAll(filterType) {
    const allCheckbox = document.getElementById(`${filterType}All`);
    const checkboxes = document.querySelectorAll(`.${filterType}`);

    if (allCheckbox.checked) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    filterSubjects();
}

function filterSubjects() {
    const examAll = document.getElementById('filterExamAll').checked;
    const prefixAll = document.getElementById('filterPrefixAll').checked;
    const campus = document.querySelector('input[name="campus"]:checked').value;
    const period = document.querySelector('input[name="period"]:checked').value;
    const lecturerWant = document.getElementById('lecturerWantInput').value.toLowerCase();
    const lecturerNotWant = document.getElementById('lecturerNotWantInput').value.toLowerCase();
    const essayAll = document.getElementById('filterEssayAll').checked;

    const selectedExamFilters = Array.from(document.querySelectorAll('.filterExam:checked')).map(input => input.value);
    const selectedPrefixes = Array.from(document.querySelectorAll('.filterPrefix:checked')).map(input => input.value);
    const selectedEssayFilters = Array.from(document.querySelectorAll('.filterEssay:checked')).map(input => input.value);

    const keywords = document.getElementById('keywordInput').value.toLowerCase().split('&').map(term => term.trim());
    const excludeKeywords = document.getElementById('excludeKeywordInput').value.toLowerCase().split('&').map(term => term.trim());
    
    const tableBody = document.getElementById('subjectsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    Object.keys(subjects).forEach(code => {
        const subject = subjects[code];
        const hasCentrallyAdministeredExamination = subject.assessment.some(assess => assess.title.toLowerCase().includes('examination (centrally administered)'));
        const hasEssay = subject.assessment.some(assess => assess.title.toLowerCase().includes('essay'));
        const subjectPrefix = code.substring(0, 2);

        const matchExamFilter = (
            examAll ||
            (selectedExamFilters.includes('hasExam') && hasCentrallyAdministeredExamination) ||
            (selectedExamFilters.includes('noExam') && !hasCentrallyAdministeredExamination)
        );

        const matchPrefixFilter = (
            prefixAll ||
            selectedPrefixes.includes(subjectPrefix)
        );

        const matchEssayFilter = (
            essayAll ||
            (selectedEssayFilters.includes('hasEssay') && hasEssay) ||
            (selectedEssayFilters.includes('noEssay') && !hasEssay)
        );

        const matchKeywordFilter = keywords.some(keyword => (
            code.toLowerCase().includes(keyword) ||
            subject.name.toLowerCase().includes(keyword) ||
            subject.description.toLowerCase().includes(keyword) ||
            subject.college.toLowerCase().includes(keyword) ||
            subject.assessment.some(assess => assess.title.toLowerCase().includes(keyword)) ||
            subject.availabilities.some(availability => availability.availability.toLowerCase().includes(keyword))
        )) || keywords.length === 0;

        const matchExcludeKeywordFilter = excludeKeywords.every(excludeKeyword => (
            !excludeKeyword ||
            (!code.toLowerCase().includes(excludeKeyword) &&
            !subject.name.toLowerCase().includes(excludeKeyword) &&
            !subject.description.toLowerCase().includes(excludeKeyword) &&
            !subject.college.toLowerCase().includes(excludeKeyword) &&
            !subject.assessment.some(assess => assess.title.toLowerCase().includes(excludeKeyword)) &&
            !subject.availabilities.some(availability => availability.availability.toLowerCase().includes(excludeKeyword))
        )));

        const matchCampusAndPeriodFilter = (
            (campus === 'all' && period === 'all') ||
            (campus === 'all' && subject.availabilities.some(availability => availability.availability.includes(period))) ||
            (period === 'all' && subject.availabilities.some(availability => availability.availability.includes(campus))) ||
            subject.availabilities.some(availability => availability.availability.includes(campus) && availability.availability.includes(period))
        );

        const matchLecturerWantFilter = (
            !lecturerWant ||
            (campus === 'all' && period === 'all' && subject.availabilities.some(availability => availability['lecturer(s)'] && availability['lecturer(s)'].some(lecturer => lecturer.toLowerCase().includes(lecturerWant)))) ||
            (campus === 'all' && subject.availabilities.some(availability => availability.availability.includes(period) && availability['lecturer(s)'] && availability['lecturer(s)'].some(lecturer => lecturer.toLowerCase().includes(lecturerWant)))) ||
            (period === 'all' && subject.availabilities.some(availability => availability.availability.includes(campus) && availability['lecturer(s)'] && availability['lecturer(s)'].some(lecturer => lecturer.toLowerCase().includes(lecturerWant)))) ||
            subject.availabilities.some(availability => availability.availability.includes(campus) && availability.availability.includes(period) && availability['lecturer(s)'] && availability['lecturer(s)'].some(lecturer => lecturer.toLowerCase().includes(lecturerWant)))
        );

        const matchLecturerNotWantFilter = (
            !lecturerNotWant ||
            !subject.availabilities.some(availability => availability['lecturer(s)'] && availability['lecturer(s)'].some(lecturer => lecturer.toLowerCase().includes(lecturerNotWant)))
        );

        if (matchExamFilter && matchPrefixFilter && matchCampusAndPeriodFilter && matchEssayFilter && matchKeywordFilter && matchExcludeKeywordFilter && matchLecturerWantFilter && matchLecturerNotWantFilter) {
            const row = tableBody.insertRow();
            const cellCode = row.insertCell(0);
            cellCode.innerHTML = `<a href="https://apps.jcu.edu.au/subjectsearch/#/subject/2024/${code}" target="_blank">${code}</a>`;
            row.insertCell(1).textContent = subject.name;
        }
    });
}

window.onload = loadSubjects;
