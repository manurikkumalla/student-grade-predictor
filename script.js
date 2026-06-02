let courses = JSON.parse(localStorage.getItem('courses')) || [];

const courseForm = document.getElementById('courseForm');
const courseName = document.getElementById('courseName');
const courseCredits = document.getElementById('courseCredits');
const courseGrade = document.getElementById('courseGrade');
const coursesList = document.getElementById('coursesList');
const targetGpa = document.getElementById('targetGpa');
const targetGpaValue = document.getElementById('targetGpaValue');
const remainingCredits = document.getElementById('remainingCredits');
const currentGpaEl = document.getElementById('currentGpa');
const totalCreditsEl = document.getElementById('totalCredits');
const predictionMessage = document.getElementById('predictionMessage');
const predictionCard = document.getElementById('predictionResultCard');

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    courseForm.addEventListener('submit', addCourse);
    targetGpa.addEventListener('input', (e) => {
        targetGpaValue.innerText = parseFloat(e.target.value).toFixed(2);
        calculatePrediction();
    });
    remainingCredits.addEventListener('input', calculatePrediction);
});

function addCourse(e) {
    e.preventDefault();
    const name = courseName.value.trim();
    const credits = parseInt(courseCredits.value);
    const grade = parseFloat(courseGrade.value);
    if (name && credits > 0) {
        courses.push({ id: Date.now(), name, credits, grade });
        localStorage.setItem('courses', JSON.stringify(courses));
        courseForm.reset();
        updateUI();
    }
}

function deleteCourse(id) {
    courses = courses.filter(c => c.id !== id);
    localStorage.setItem('courses', JSON.stringify(courses));
    updateUI();
}

function updateUI() {
    coursesList.innerHTML = '';
    let totalGP = 0, totalCred = 0;
    courses.forEach(c => {
        totalCred += c.credits;
        totalGP += (c.grade * c.credits);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-semibold text-dark">${escapeHTML(c.name)}</td>
            <td>${c.credits} Credits</td>
            <td><span class="badge bg-primary">${c.grade.toFixed(1)}</span></td>
            <td class="text-end">
                <button class="btn-delete" onclick="deleteCourse(${c.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        coursesList.appendChild(tr);
    });

    const currentGpa = totalCred > 0 ? (totalGP / totalCred) : 0.00;
    currentGpaEl.innerText = currentGpa.toFixed(2);
    totalCreditsEl.innerText = totalCred;
    calculatePrediction();
}

function calculatePrediction() {
    const totalCred = courses.reduce((sum, c) => sum + c.credits, 0);
    const totalGP = courses.reduce((sum, c) => sum + (c.grade * c.credits), 0);
    const targetVal = parseFloat(targetGpa.value);
    const remainingCreds = parseInt(remainingCredits.value) || 0;

    if (courses.length === 0 || remainingCreds <= 0) {
        predictionMessage.innerHTML = "Add completed courses and remaining credits to forecast GPA requirements.";
        predictionCard.style.background = "linear-gradient(135deg, #4f46e5, #3b82f6)";
        return;
    }

    const requiredGP = ((targetVal * (totalCred + remainingCreds)) - totalGP) / remainingCreds;
    if (requiredGP <= 0) {
        predictionMessage.innerHTML = `Target GPA <strong>${targetVal.toFixed(2)}</strong> already secured! You are ahead of schedule.`;
        predictionCard.style.background = "linear-gradient(135deg, #10b981, #059669)";
    } else if (requiredGP <= 4.0) {
        predictionMessage.innerHTML = `Average grade point of <strong>${requiredGP.toFixed(2)}</strong> required over remaining <strong>${remainingCreds}</strong> credits to achieve <strong>${targetVal.toFixed(2)}</strong> target.`;
        predictionCard.style.background = "linear-gradient(135deg, #4f46e5, #3b82f6)";
    } else {
        predictionMessage.innerHTML = `Target <strong>${targetVal.toFixed(2)}</strong> requires a <strong>${requiredGP.toFixed(2)}</strong> average, which exceeds max credits (4.0). Adjust your goal.`;
        predictionCard.style.background = "linear-gradient(135deg, #ef4444, #e11d48)";
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}