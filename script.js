document.getElementById("template-form").addEventListener("submit", (event) => {
    event.preventDefault();
  
    const name = document.getElementById("name").value;
    const subjectCode = document.getElementById("subject-code").value;
    const title = document.getElementById("title").value;
    const studentId = document.getElementById("student-id").value;
  
    const output = `
---
title: |
  | \\vspace{8cm} \\LARGE ${title}
author: |
    | ${name}
    | Student ID: ${studentId}
date: \\DTMtoday
output:
  pdf_document:
    extra_dependencies: float
    fig_caption: yes
    number_sections: true
header-includes: |
  \\usepackage{caption}
  \\usepackage{fancyhdr}
  \\renewcommand{\\headrulewidth}{0pt}
  
  \\usepackage{lastpage}
  \\usepackage{datetime2}
  \\usepackage{textcase}
  \\DTMsetdatestyle{ddmmyyyy}
  
  \\pagestyle{fancy}
  \\fancyhead[L]{${name}}
  \\fancyhead[C]{${subjectCode} ${title}}
  \\fancyhead[R]{Date of Submission: \\DTMtoday}
  \\fancyfoot[C]{}
  \\fancyfoot[R]{Page \\thepage\\ of \\pageref{LastPage}}
  
  
  \\DeclareCaptionLabelSeparator{IEEE}{.\\quad }
  \\captionsetup{labelfont=bf}
  \\captionsetup[figure]{name=Fig., labelsep=IEEE, format=hang, justification=centering,singlelinecheck=false}
  
  \\DeclareCaptionTextFormat{up}{\\MakeUppercase{#1}}
  \\renewcommand{\\thetable}{\\Roman{table}}
  \\captionsetup[table]{name=TABLE, position=above, justification=centering, labelsep=newline, aboveskip=0pt, textfont=bf, textformat=up}
  
  \\usepackage{lscape}
  \\usepackage{rotating}
---

\\newpage
\\tableofcontents
\\listoffigures
\\listoftables
\\newpage

\`\`\`{r setup, include=FALSE}
knitr::opts_chunk$set(echo = FALSE, 
                      fig.pos = "H",  # Hold figures' position
                      fig.align = 'center', # Figures go to middle of page
                      out.extra = "", 
                      out.width = "75%", # 75% can fit two MATLAB figures per page
                      message=FALSE,  # Suppress messages when knitting
                      warning=FALSE,  # Suppress warning when knitting
                      tidy.opts = list(width.cutoff = 60),  # Wrap code-chunk text
                      tidy = TRUE)

library(ggplot2) # Better plots
library(kableExtra) # Better tables
library(bookdown) # Mainly for referencing tables, figures, eqns.
library(comprehenr)
options(scipen=2)  # Prevent scientific notation in plots
\`\`\`
  `;
  
    document.getElementById("output").value = output;
  });
  