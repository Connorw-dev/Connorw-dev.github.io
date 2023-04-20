document.getElementById("template-form").addEventListener("submit", (event) => {
    event.preventDefault();
  
    const name = document.getElementById("name").value;
    const subjectCode = document.getElementById("subject-code").value;
    const title = document.getElementById("title").value;
    const studentId = document.getElementById("student-id").value;
  
    const output = `
  ---
  title: ${title}, ${studentId}, ${subjectCode}
  author: ${name}
  date: "\`r Sys.Date()\`"
  output: pdf_document
  ---
  
  \`\`\`{r setup, include=FALSE}
  knitr::opts_chunk$set(echo = TRUE)
  \`\`\`
  `;
  
    document.getElementById("output").value = output;
  });
  