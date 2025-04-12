const GEMINI_API_KEY = 'AIzaSyBHZFappIZNCup70lTnh77ICrS3l191Uzc';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const userInput = document.getElementById('userInput');
const generateBtn = document.getElementById('generateBtn');
const coverLetterArea = document.getElementById('coverLetterArea');
const downloadBtn = document.getElementById('downloadBtn');

generateBtn.addEventListener('click', generateCoverLetter);
downloadBtn.addEventListener('click', downloadPDF);

async function generateCoverLetter() {
    const prompt = userInput.value.trim();
    if (!prompt) {
        alert('Please enter job details to generate a cover letter.');
        return;
    }

    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span>Generating...</span>';
    generateBtn.classList.add('loading');

    try {
        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Create a highly professional and compelling cover letter with the following specifications:

                        Structure:
                        - Today's date in formal format
                        - Professional letterhead with hiring manager's details (if provided, otherwise "Hiring Manager")
                        - Formal greeting
                        - Opening paragraph: Strong hook and position mention
                        - Body paragraphs (2): Highlight relevant skills and experiences
                        - Closing paragraph: Call to action and appreciation
                        - Professional closing with full name
                        
                        Requirements:
                        - Maximum 350 words
                        - Formal business tone
                        - Specific achievements and metrics where possible
                        - Clear value proposition
                        - No clichés or generic statements
                        
                        Job Details: ${prompt}
                        
                        Format the letter with proper spacing and professional structure.`
                    }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            const coverLetter = data.candidates[0].content.parts[0].text;
            coverLetterArea.innerHTML = coverLetter
                .split('\n')
                .filter(line => line.trim())
                .map(line => `<p>${line.trim()}</p>`)
                .join('');
        } else {
            throw new Error('Failed to generate cover letter');
        }
    } catch (error) {
        alert('Error generating cover letter. Please try again.');
        console.error('Error:', error);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = 'Generate Cover Letter';
        generateBtn.classList.remove('loading');
    }
}

function downloadPDF() {
    if (!coverLetterArea.innerText.trim() || 
        coverLetterArea.innerText === 'Your professional cover letter will appear here.') {
        alert('Please generate a cover letter first.');
        return;
    }

    const pdfContent = document.createElement('div');
    pdfContent.className = 'pdf-content';
    pdfContent.innerHTML = coverLetterArea.innerHTML;

    const opt = {
        margin: 0,
        filename: 'professional-cover-letter.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true,
            backgroundColor: '#ffffff'
        },
        jsPDF: { 
            unit: 'in', 
            format: 'letter', 
            orientation: 'portrait'
        }
    };

    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<span>Generating PDF...</span>';
    downloadBtn.classList.add('loading');

    html2pdf().set(opt).from(pdfContent).save()
        .then(() => {
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = 'Download PDF';
            downloadBtn.classList.remove('loading');
        })
        .catch(err => {
            console.error('PDF generation failed:', err);
            alert('Error generating PDF. Please try again.');
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = 'Download PDF';
            downloadBtn.classList.remove('loading');
        });
}
