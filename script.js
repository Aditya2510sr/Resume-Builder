/* ══════════════════════════════════════════════════════════
   RESUMEFORGE — SCRIPT.JS
   Agents 3 & 4: JS Developer + PDF/ATS Specialist
   ══════════════════════════════════════════════════════════ */

'use strict';

// ══════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════
const state = {
  education:       [],
  experience:      [],
  skills:          [],
  projects:        [],
  certifications:  [],
  languages:       [],   // Array of { id, name, proficiency }
  awards:          [],   // Array of { id, title, issuer, date, desc }
  photoDataUrl:    null,
  zoomLevel:       85,
};

let idCounter = 0;
const genId = () => `id_${++idCounter}`;

// ══════════════════════════════════════════════════════════
// DOM REFERENCES
// ══════════════════════════════════════════════════════════
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const dom = {
  // Personal
  fullName:   $('#full-name'),
  jobTitle:   $('#job-title'),
  email:      $('#email'),
  phone:      $('#phone'),
  location:   $('#location'),
  linkedin:   $('#linkedin'),
  github:     $('#github'),
  website:    $('#website'),
  summary:    $('#summary'),
  summaryCount: $('#summary-count'),
  photoUpload:  $('#photo-upload'),
  photoPreview: $('#photo-preview'),
  btnRemovePhoto: $('#btn-remove-photo'),

  // Section navs
  sectionNav: $('#section-nav'),
  navPills:   $$('.nav-pill'),

  // Entry containers
  educationEntries:     $('#education-entries'),
  experienceEntries:    $('#experience-entries'),
  skillsEntries:        $('#skills-entries'),
  projectsEntries:      $('#projects-entries'),
  certificationEntries: $('#certification-entries'),
  languageEntries:      $('#language-entries'),
  awardsEntries:        $('#awards-entries'),

  // Add buttons
  btnAddEducation:     $('#btn-add-education'),
  btnAddExperience:    $('#btn-add-experience'),
  btnNoExperience:     $('#btn-no-experience'),
  btnAddSkill:         $('#btn-add-skill'),
  btnAddProject:       $('#btn-add-project'),
  btnAddCertification: $('#btn-add-certification'),
  btnAddLanguage:      $('#btn-add-language'),
  btnAddAward:         $('#btn-add-award'),

  // Navbar
  btnThemeToggle: $('#btn-theme-toggle'),
  btnSaveDraft:   $('#btn-save-draft'),
  btnLoadDraft:   $('#btn-load-draft'),
  btnDownloadPdf: $('#btn-download-pdf'),
  btnDownloadPdfBottom: $('#btn-download-pdf-bottom'),
  btnClearForm:   $('#btn-clear-form'),

  // Zoom
  btnZoomIn:  $('#btn-zoom-in'),
  btnZoomOut: $('#btn-zoom-out'),
  zoomLevel:  $('#zoom-level'),
  previewScaleWrapper: $('#preview-scale-wrapper'),

  // Progress
  progressBar:   $('#progress-bar'),
  progressLabel: $('#progress-label'),

  // Modal
  modalOverlay:  $('#modal-overlay'),
  modalTitle:    $('#modal-title'),
  modalMessage:  $('#modal-message'),
  modalCancel:   $('#modal-cancel'),
  modalConfirm:  $('#modal-confirm'),

  // Toast
  toastContainer: $('#toast-container'),

  // Resume preview
  rvName:        $('#rv-name'),
  rvJobTitle:    $('#rv-job-title'),
  rvEmailDisp:   $('#rv-email-display'),
  rvPhoneDisp:   $('#rv-phone-display'),
  rvLocDisp:     $('#rv-location-display'),
  rvLinkedinDisp:('#rv-linkedin-display'),
  rvGithubDisp:  $('#rv-github-display'),
  rvWebsiteDisp: $('#rv-website-display'),
  rvSummaryText: $('#rv-summary-text'),
  rvSummarySec:  $('#rv-summary-section'),
  rvExperienceSec: $('#rv-experience-section'),
  rvExperienceList: $('#rv-experience-list'),
  rvEducationSec: $('#rv-education-section'),
  rvEducationList: $('#rv-education-list'),
  rvSkillsSec:   $('#rv-skills-section'),
  rvSkillsList:  $('#rv-skills-list'),
  rvProjectsSec: $('#rv-projects-section'),
  rvProjectsList: $('#rv-projects-list'),
  rvCertsSec:    $('#rv-certifications-section'),
  rvCertsList:   $('#rv-certifications-list'),
  rvLanguagesSec:  $('#rv-languages-section'),
  rvLanguagesList: $('#rv-languages-list'),
  rvAwardsSec:   $('#rv-awards-section'),
  rvAwardsList:  $('#rv-awards-list'),
  rvPhotoWrapper: $('#rv-photo-wrapper'),
  rvPhoto:       $('#rv-photo'),
  rvExtraStrip:  $('#rv-extra-strip'),
};

// ══════════════════════════════════════════════════════════
// SECTION NAVIGATION
// ══════════════════════════════════════════════════════════
function initSectionNav() {
  $$('.nav-card').forEach(card => {
    card.addEventListener('click', () => {
      const target = card.dataset.section;
      $$('.nav-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      $$('.form-section').forEach(sec => sec.classList.remove('active'));
      $(`#section-${target}`).classList.add('active');
    });
  });
}

// ══════════════════════════════════════════════════════════
// PROGRESS BAR
// ══════════════════════════════════════════════════════════
function updateProgress() {
  const fields = [
    dom.fullName, dom.jobTitle, dom.email, dom.phone,
    dom.location, dom.summary
  ];
  const filled = fields.filter(f => f && f.value.trim() !== '').length;
  const hasEdu  = state.education.length > 0;
  const hasExp  = state.experience.length > 0;
  const hasSkills = state.skills.length > 0;

  const total = fields.length + 3; // +3 for edu, exp, skills
  const done  = filled + (hasEdu ? 1 : 0) + (hasExp ? 1 : 0) + (hasSkills ? 1 : 0);
  const pct   = Math.round((done / total) * 100);

  dom.progressBar.style.setProperty('--progress', pct + '%');
  dom.progressLabel.textContent = `${pct}% complete`;
}

// ══════════════════════════════════════════════════════════
// PHOTO UPLOAD
// ══════════════════════════════════════════════════════════
function initPhotoUpload() {
  dom.photoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Photo must be under 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      state.photoDataUrl = ev.target.result;
      dom.photoPreview.innerHTML = `<img src="${state.photoDataUrl}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
      dom.btnRemovePhoto.classList.remove('hidden');
      updatePreview();
      showToast('Photo uploaded!', 'success');
    };
    reader.readAsDataURL(file);
  });

  dom.btnRemovePhoto.addEventListener('click', () => {
    state.photoDataUrl = null;
    dom.photoPreview.innerHTML = '<span class="photo-placeholder">📷</span>';
    dom.btnRemovePhoto.classList.add('hidden');
    dom.photoUpload.value = '';
    updatePreview();
  });
}

// ══════════════════════════════════════════════════════════
// DYNAMIC ENTRIES — EDUCATION
// ══════════════════════════════════════════════════════════
function addEducationEntry(data = {}) {
  const id = data.id || genId();
  const entry = {
    id,
    degree:    data.degree    || '',
    school:    data.school    || '',
    location:  data.location  || '',
    startDate: data.startDate || '',
    endDate:   data.endDate   || '',
    gpa:       data.gpa       || '',
    desc:      data.desc      || '',
  };
  state.education.push(entry);
  renderEducationEntry(entry);
  updatePreview();
  updateProgress();
}

function renderEducationEntry(entry) {
  const div = document.createElement('div');
  div.className = 'dynamic-entry';
  div.dataset.id = entry.id;
  div.innerHTML = `
    <div class="entry-header">
      <span class="entry-title">🎓 Education Entry</span>
      <button class="btn-remove-entry" data-remove="education" data-id="${entry.id}" title="Remove">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        Remove
      </button>
    </div>
    <div class="form-grid">
      <div class="form-group full-width">
        <label>Degree / Qualification *</label>
        <input type="text" data-field="degree" value="${esc(entry.degree)}" placeholder="e.g. B.Tech ECE / B.Sc Computer Science" />
      </div>
      <div class="form-group">
        <label>School / University *</label>
        <input type="text" data-field="school" value="${esc(entry.school)}" placeholder="University Name" />
      </div>
      <div class="form-group">
        <label>Location</label>
        <input type="text" data-field="location" value="${esc(entry.location)}" placeholder="City, Country" />
      </div>
      <div class="form-group">
        <label>Start Date</label>
        <input type="text" data-field="startDate" value="${esc(entry.startDate)}" placeholder="Aug 2020" />
      </div>
      <div class="form-group">
        <label>End Date (or Expected)</label>
        <input type="text" data-field="endDate" value="${esc(entry.endDate)}" placeholder="May 2024 / Present" />
      </div>
      <div class="form-group">
        <label>GPA / Percentage</label>
        <input type="text" data-field="gpa" value="${esc(entry.gpa)}" placeholder="8.5 / 10 or 85%" />
      </div>
      <div class="form-group full-width">
        <label>Relevant Coursework <span class="field-optional">(optional)</span></label>
        <input type="text" data-field="coursework" value="${esc(entry.coursework||'')}" placeholder="Data Structures, Signal Processing, DBMS, OS..." />
      </div>
      <div class="form-group full-width">
        <label>Honors / Achievements <span class="field-optional">(optional)</span></label>
        <input type="text" data-field="honors" value="${esc(entry.honors||'')}" placeholder="Dean's List, Merit Scholarship..." />
      </div>
    </div>
  `;

  bindEntryInputs(div, 'education', entry.id);
  dom.educationEntries.appendChild(div);
}

// ══════════════════════════════════════════════════════════
// DYNAMIC ENTRIES — EXPERIENCE
// ══════════════════════════════════════════════════════════
function addExperienceEntry(data = {}) {
  const id = data.id || genId();
  const entry = {
    id,
    role:      data.role      || '',
    company:   data.company   || '',
    location:  data.location  || '',
    startDate: data.startDate || '',
    endDate:   data.endDate   || '',
    current:   data.current   || false,
    desc:      data.desc      || '',
  };
  state.experience.push(entry);
  renderExperienceEntry(entry);
  updatePreview();
  updateProgress();
}

function renderExperienceEntry(entry) {
  const div = document.createElement('div');
  div.className = 'dynamic-entry';
  div.dataset.id = entry.id;
  div.innerHTML = `
    <div class="entry-header">
      <span class="entry-title">💼 Experience Entry</span>
      <button class="btn-remove-entry" data-remove="experience" data-id="${entry.id}" title="Remove">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        Remove
      </button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>Job Title / Role *</label>
        <input type="text" data-field="role" value="${esc(entry.role)}" placeholder="Software Engineer Intern" />
      </div>
      <div class="form-group">
        <label>Company / Organization *</label>
        <input type="text" data-field="company" value="${esc(entry.company)}" placeholder="Company Name" />
      </div>
      <div class="form-group">
        <label>Location</label>
        <input type="text" data-field="location" value="${esc(entry.location)}" placeholder="City / Remote" />
      </div>
      <div class="form-group">
        <label>Start Date</label>
        <input type="text" data-field="startDate" value="${esc(entry.startDate)}" placeholder="June 2023" />
      </div>
      <div class="form-group">
        <label>End Date</label>
        <input type="text" data-field="endDate" value="${esc(entry.endDate)}" placeholder="Aug 2023 / Present" ${entry.current ? 'disabled' : ''} />
      </div>
      <div class="form-group" style="justify-content:center;align-items:center;flex-direction:row;gap:0.5rem;padding-top:1.4rem;">
        <input type="checkbox" data-field="current" id="current-${entry.id}" ${entry.current ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--accent-primary);" />
        <label for="current-${entry.id}" style="font-size:0.8rem;color:var(--text-secondary);cursor:pointer;">Currently working here</label>
      </div>
      <div class="form-group full-width">
        <label>Description / Responsibilities</label>
        <textarea data-field="desc" rows="4" placeholder="• Led development of...\n• Improved performance by 30%...\n• Collaborated with team of 5...">${esc(entry.desc)}</textarea>
        <span style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">💡 Use bullet points (•) for ATS readability</span>
      </div>
    </div>
  `;

  // Handle "currently working" toggle
  const currentCheckbox = div.querySelector(`#current-${entry.id}`);
  const endDateInput = div.querySelector('[data-field="endDate"]');
  currentCheckbox.addEventListener('change', () => {
    endDateInput.disabled = currentCheckbox.checked;
    if (currentCheckbox.checked) endDateInput.value = '';
    updateStateEntry('experience', entry.id, 'current', currentCheckbox.checked);
    updateStateEntry('experience', entry.id, 'endDate', currentCheckbox.checked ? 'Present' : '');
    updatePreview();
  });

  bindEntryInputs(div, 'experience', entry.id);
  dom.experienceEntries.appendChild(div);
}

function addNoExperienceEntry() {
  addExperienceEntry({
    role: 'Entry Level / Fresher',
    company: 'Open to Opportunities',
    location: 'Flexible / Remote',
    startDate: new Date().getFullYear().toString(),
    endDate: 'Present',
    current: true,
    desc: "• Highly motivated and eager to start my professional career in a dynamic environment.\n• Rapid learner with strong foundational knowledge and readiness to apply it to real-world challenges.\n• Excellent communication skills, adaptable, and dedicated to achieving team goals.\n• Proactively seeking opportunities to upskill, grow, and contribute meaningfully to the organization."
  });
  showToast('Added Fresher profile outline ✨', 'info');
}

// ══════════════════════════════════════════════════════════
// DYNAMIC ENTRIES — SKILLS
// ══════════════════════════════════════════════════════════
function addSkillEntry(data = {}) {
  const id = data.id || genId();
  const entry = {
    id,
    name:     data.name     || '',
    level:    data.level    || 'intermediate',
    category: data.category || 'Technical',
  };
  state.skills.push(entry);
  renderSkillEntry(entry);
  updatePreview();
  updateProgress();
}

function renderSkillEntry(entry) {
  const div = document.createElement('div');
  div.className = `skill-entry level-${entry.level}`;
  div.dataset.id = entry.id;
  div.innerHTML = `
    <input type="text" data-field="name" value="${esc(entry.name)}" placeholder="e.g. React.js, Python, Figma" />
    <select data-field="level">
      <option value="beginner"     ${entry.level === 'beginner'     ? 'selected' : ''}>Beginner</option>
      <option value="intermediate" ${entry.level === 'intermediate' ? 'selected' : ''}>Intermediate</option>
      <option value="advanced"     ${entry.level === 'advanced'     ? 'selected' : ''}>Advanced</option>
      <option value="expert"       ${entry.level === 'expert'       ? 'selected' : ''}>Expert</option>
    </select>
    <button class="btn-remove-entry" data-remove="skills" data-id="${entry.id}" title="Remove skill">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;

  // Update level class on change
  const levelSelect = div.querySelector('[data-field="level"]');
  levelSelect.addEventListener('change', () => {
    div.className = `skill-entry level-${levelSelect.value}`;
  });

  bindEntryInputs(div, 'skills', entry.id);
  dom.skillsEntries.appendChild(div);
}

// Quick category pills → auto-add a skill slot with that category
function initCategoryPills() {
  $$('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      addSkillEntry({ category: pill.dataset.cat });
      // Switch to skills section
      $$('.nav-card').forEach(c => c.classList.remove('active'));
      const skillCard = $('[data-section="skills"]');
      if (skillCard) skillCard.classList.add('active');
      $$('.form-section').forEach(s => s.classList.remove('active'));
      const skillSec = $('#section-skills');
      if (skillSec) skillSec.classList.add('active');
      showToast(`Added a ${pill.dataset.cat} skill slot ✨`, 'info');
    });
  });
}

// ══════════════════════════════════════════════════════════
// DYNAMIC ENTRIES — PROJECTS
// ══════════════════════════════════════════════════════════
function addProjectEntry(data = {}) {
  const id = data.id || genId();
  const entry = {
    id,
    name:      data.name      || '',
    tech:      data.tech      || '',
    url:       data.url       || '',
    startDate: data.startDate || '',
    endDate:   data.endDate   || '',
    desc:      data.desc      || '',
  };
  state.projects.push(entry);
  renderProjectEntry(entry);
  updatePreview();
}

function renderProjectEntry(entry) {
  const div = document.createElement('div');
  div.className = 'dynamic-entry';
  div.dataset.id = entry.id;
  div.innerHTML = `
    <div class="entry-header">
      <span class="entry-title">🚀 Project Entry</span>
      <button class="btn-remove-entry" data-remove="projects" data-id="${entry.id}" title="Remove">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        Remove
      </button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>Project Name *</label>
        <input type="text" data-field="name" value="${esc(entry.name)}" placeholder="e.g. Resume Builder App" />
      </div>
      <div class="form-group">
        <label>Technologies Used</label>
        <input type="text" data-field="tech" value="${esc(entry.tech)}" placeholder="React, Node.js, MongoDB" />
      </div>
      <div class="form-group">
        <label>Project URL / GitHub</label>
        <input type="url" data-field="url" value="${esc(entry.url)}" placeholder="github.com/user/project" />
      </div>
      <div class="form-group">
        <label>Duration</label>
        <input type="text" data-field="startDate" value="${esc(entry.startDate)}" placeholder="Jan 2024 – Mar 2024" />
      </div>
      <div class="form-group full-width">
        <label>Description</label>
        <textarea data-field="desc" rows="3" placeholder="• Built a full-stack application...\n• Implemented real-time features...\n• Deployed on AWS with CI/CD...">${esc(entry.desc)}</textarea>
      </div>
    </div>
  `;

  bindEntryInputs(div, 'projects', entry.id);
  dom.projectsEntries.appendChild(div);
}

// ══════════════════════════════════════════════════════════
// DYNAMIC ENTRIES — CERTIFICATIONS
// ══════════════════════════════════════════════════════════
function addCertificationEntry(data = {}) {
  const id = data.id || genId();
  const entry = {
    id,
    name:   data.name   || '',
    issuer: data.issuer || '',
    date:   data.date   || '',
    url:    data.url    || '',
  };
  state.certifications.push(entry);
  renderCertificationEntry(entry);
  updatePreview();
}

function renderCertificationEntry(entry) {
  const div = document.createElement('div');
  div.className = 'dynamic-entry';
  div.dataset.id = entry.id;
  div.innerHTML = `
    <div class="entry-header">
      <span class="entry-title">🏆 Certification Entry</span>
      <button class="btn-remove-entry" data-remove="certifications" data-id="${entry.id}" title="Remove">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        Remove
      </button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>Certification Name *</label>
        <input type="text" data-field="name" value="${esc(entry.name)}" placeholder="e.g. AWS Certified Solutions Architect" />
      </div>
      <div class="form-group">
        <label>Issuing Organization</label>
        <input type="text" data-field="issuer" value="${esc(entry.issuer)}" placeholder="Amazon Web Services" />
      </div>
      <div class="form-group">
        <label>Issue Date</label>
        <input type="text" data-field="date" value="${esc(entry.date)}" placeholder="March 2024" />
      </div>
      <div class="form-group">
        <label>Credential URL</label>
        <input type="url" data-field="url" value="${esc(entry.url)}" placeholder="https://credly.com/..." />
      </div>
    </div>
  `;

  bindEntryInputs(div, 'certifications', entry.id);
  dom.certificationEntries.appendChild(div);
}

// ══════════════════════════════════════════════════════════
// DYNAMIC ENTRIES — LANGUAGES
// ══════════════════════════════════════════════════════════
function addLanguageEntry(data = {}) {
  const id = data.id || genId();
  const entry = { id, name: data.name || '', proficiency: data.proficiency || 'Fluent' };
  state.languages.push(entry);
  renderLanguageEntry(entry);
  updatePreview();
}

function renderLanguageEntry(entry) {
  const div = document.createElement('div');
  div.className = 'skill-entry';
  div.dataset.id = entry.id;
  div.style.gridTemplateColumns = '1fr 170px auto';
  div.innerHTML = `
    <input type="text" data-field="name" value="${esc(entry.name)}" placeholder="e.g. Hindi, English, French" />
    <select data-field="proficiency">
      ${['Native','Fluent','Conversational','Basic'].map(p =>
        `<option value="${p}" ${entry.proficiency === p ? 'selected' : ''}>${p}</option>`).join('')}
    </select>
    <button class="btn-remove-entry" data-remove="languages" data-id="${entry.id}" title="Remove">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;
  bindEntryInputs(div, 'languages', entry.id);
  dom.languageEntries.appendChild(div);
}

// ══════════════════════════════════════════════════════════
// DYNAMIC ENTRIES — AWARDS
// ══════════════════════════════════════════════════════════
function addAwardEntry(data = {}) {
  const id = data.id || genId();
  const entry = {
    id,
    title:  data.title  || '',
    issuer: data.issuer || '',
    date:   data.date   || '',
    desc:   data.desc   || '',
  };
  state.awards.push(entry);
  renderAwardEntry(entry);
  updatePreview();
}

function renderAwardEntry(entry) {
  const div = document.createElement('div');
  div.className = 'dynamic-entry';
  div.dataset.id = entry.id;
  div.innerHTML = `
    <div class="entry-header">
      <span class="entry-title">🥇 Award / Achievement</span>
      <button class="btn-remove-entry" data-remove="awards" data-id="${entry.id}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        Remove
      </button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>Award / Achievement Title *</label>
        <input type="text" data-field="title" value="${esc(entry.title)}" placeholder="e.g. 1st Place Hackathon, Merit Scholarship" />
      </div>
      <div class="form-group">
        <label>Issuing Body</label>
        <input type="text" data-field="issuer" value="${esc(entry.issuer)}" placeholder="e.g. IIT Delhi, Google" />
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="text" data-field="date" value="${esc(entry.date)}" placeholder="March 2024" />
      </div>
      <div class="form-group full-width">
        <label>Description <span class="field-optional">(optional)</span></label>
        <textarea data-field="desc" rows="2" placeholder="Brief description of the award or achievement...">${esc(entry.desc)}</textarea>
      </div>
    </div>
  `;
  bindEntryInputs(div, 'awards', entry.id);
  dom.awardsEntries.appendChild(div);
}
// ══════════════════════════════════════════════════════════
function bindEntryInputs(container, section, id) {
  container.querySelectorAll('[data-field]').forEach(input => {
    const field = input.dataset.field;
    const evtName = input.tagName === 'TEXTAREA' || input.tagName === 'SELECT' || input.type === 'checkbox'
      ? 'change' : 'input';

    input.addEventListener(evtName === 'input' ? 'input' : 'change', () => {
      const val = input.type === 'checkbox' ? input.checked : input.value;
      updateStateEntry(section, id, field, val);
      updatePreview();
    });

    // Also update on input for textarea
    if (input.tagName === 'TEXTAREA') {
      input.addEventListener('input', () => {
        updateStateEntry(section, id, field, input.value);
        updatePreview();
      });
    }
  });

  // Remove button
  const removeBtn = container.querySelector('[data-remove]');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      removeEntry(section, id, container);
    });
  }
}

function updateStateEntry(section, id, field, value) {
  const arr = state[section];
  const entry = arr.find(e => e.id === id);
  if (entry) entry[field] = value;
}

function removeEntry(section, id, container) {
  state[section] = state[section].filter(e => e.id !== id);
  container.style.opacity = '0';
  container.style.transform = 'scale(0.95)';
  container.style.transition = 'all 0.25s ease';
  setTimeout(() => container.remove(), 250);
  updatePreview();
  updateProgress();
}

// ══════════════════════════════════════════════════════════
// LIVE RESUME PREVIEW UPDATE
// ══════════════════════════════════════════════════════════
function updatePreview() {
  // Personal Info
  const name = dom.fullName.value.trim() || 'Your Name';
  const title = dom.jobTitle.value.trim() || 'Professional Title';
  dom.rvName.textContent = name;
  dom.rvJobTitle.textContent = title;

  // Extra personal info strip (DOB, Nationality)
  const extraStrip = dom.rvExtraStrip;
  if (extraStrip) {
    extraStrip.innerHTML = '';
    const dob = document.getElementById('date-of-birth')?.value.trim();
    const nat = document.getElementById('nationality')?.value.trim();
    if (dob) { const s = document.createElement('span'); s.className = 'rv-extra-item'; s.textContent = `📅 ${dob}`; extraStrip.appendChild(s); }
    if (nat) { const s = document.createElement('span'); s.className = 'rv-extra-item'; s.textContent = `🌍 ${nat}`; extraStrip.appendChild(s); }
  }

  // Contact items
  setContactItem('rv-email-display',   dom.email.value.trim(),    '✉');
  setContactItem('rv-phone-display',   dom.phone.value.trim(),    '📞');
  setContactItem('rv-location-display',dom.location.value.trim(), '📍');
  setContactItem('rv-linkedin-display', dom.linkedin.value.trim(), '🔗 LinkedIn');
  setContactItem('rv-github-display',  dom.github.value.trim(),   '💻 GitHub');
  setContactItem('rv-website-display', dom.website.value.trim(),  '🌐 Website');

  // Summary
  const summaryText = dom.summary.value.trim();
  dom.rvSummarySec.style.display = summaryText ? '' : 'none';
  dom.rvSummaryText.textContent = summaryText;

  // Photo
  if (state.photoDataUrl) {
    dom.rvPhotoWrapper.classList.remove('hidden');
    dom.rvPhoto.src = state.photoDataUrl;
  } else {
    dom.rvPhotoWrapper.classList.add('hidden');
  }

  // Experience
  renderPreviewExperience();
  renderPreviewEducation();
  renderPreviewSkills();
  renderPreviewProjects();
  renderPreviewCertifications();
  renderPreviewLanguages();
  renderPreviewAwards();
}

function setContactItem(id, value, prefix) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!value) { el.textContent = ''; return; }
  if (value.startsWith('http') || value.startsWith('linkedin') || value.startsWith('github') || value.startsWith('www')) {
    const href = value.startsWith('http') ? value : `https://${value}`;
    el.innerHTML = `<a href="${href}" target="_blank">${prefix} ${value}</a>`;
  } else {
    el.textContent = `${prefix} ${value}`;
  }
}

function renderPreviewExperience() {
  const list = dom.rvExperienceList;
  list.innerHTML = '';
  dom.rvExperienceSec.style.display = state.experience.length ? '' : 'none';

  state.experience.forEach(exp => {
    if (!exp.role && !exp.company) return;
    const end = exp.current ? 'Present' : exp.endDate;
    const dateStr = [exp.startDate, end].filter(Boolean).join(' – ');

    const entry = document.createElement('div');
    entry.className = 'rv-entry';
    entry.innerHTML = `
      <div class="rv-entry-header">
        <div>
          <div class="rv-entry-title">${esc(exp.role)}</div>
          <div class="rv-entry-org">${esc(exp.company)}</div>
        </div>
        <div style="text-align:right;">
          ${dateStr ? `<div class="rv-entry-date">${esc(dateStr)}</div>` : ''}
          ${exp.location ? `<div class="rv-entry-location">${esc(exp.location)}</div>` : ''}
        </div>
      </div>
      ${exp.desc ? `<div class="rv-entry-desc">${formatDesc(exp.desc)}</div>` : ''}
    `;
    list.appendChild(entry);
  });
}

function renderPreviewEducation() {
  const list = dom.rvEducationList;
  list.innerHTML = '';
  dom.rvEducationSec.style.display = state.education.length ? '' : 'none';

  state.education.forEach(edu => {
    if (!edu.degree && !edu.school) return;
    const dateStr = [edu.startDate, edu.endDate].filter(Boolean).join(' – ');

    const entry = document.createElement('div');
    entry.className = 'rv-entry';
    entry.innerHTML = `
      <div class="rv-entry-header">
        <div>
          <div class="rv-entry-title">${esc(edu.degree)}</div>
          <div class="rv-entry-org">${esc(edu.school)}</div>
        </div>
        <div style="text-align:right;">
          ${dateStr ? `<div class="rv-entry-date">${esc(dateStr)}</div>` : ''}
          ${edu.location ? `<div class="rv-entry-location">${esc(edu.location)}</div>` : ''}
        </div>
      </div>
      ${edu.gpa ? `<div class="rv-entry-desc" style="margin-top:2px;"><strong>GPA:</strong> ${esc(edu.gpa)}</div>` : ''}
    `;
    list.appendChild(entry);
  });
}

function renderPreviewSkills() {
  const list = dom.rvSkillsList;
  list.innerHTML = '';
  dom.rvSkillsSec.style.display = state.skills.length ? '' : 'none';

  if (!state.skills.length) return;

  // Group by category (for resume, just show all as tags — ATS friendly)
  const skillsDiv = document.createElement('div');
  skillsDiv.className = 'rv-skills-grid';

  state.skills.forEach(skill => {
    if (!skill.name) return;
    const tag = document.createElement('span');
    tag.className = 'rv-skill-tag';
    tag.textContent = skill.name;
    skillsDiv.appendChild(tag);
  });

  list.appendChild(skillsDiv);
}

function renderPreviewProjects() {
  const list = dom.rvProjectsList;
  list.innerHTML = '';
  dom.rvProjectsSec.style.display = state.projects.length ? '' : 'none';

  state.projects.forEach(proj => {
    if (!proj.name) return;
    const entry = document.createElement('div');
    entry.className = 'rv-entry';
    entry.innerHTML = `
      <div class="rv-entry-header">
        <div>
          <div class="rv-entry-title">${esc(proj.name)}${proj.url ? ` <span style="font-size:0.75rem;font-weight:500;color:#6366f1;">↗ Link</span>` : ''}</div>
          ${proj.tech ? `<div class="rv-entry-org" style="font-size:0.8rem;">${esc(proj.tech)}</div>` : ''}
        </div>
        ${proj.startDate ? `<div class="rv-entry-date">${esc(proj.startDate)}</div>` : ''}
      </div>
      ${proj.desc ? `<div class="rv-entry-desc">${formatDesc(proj.desc)}</div>` : ''}
    `;
    list.appendChild(entry);
  });
}

function renderPreviewCertifications() {
  const list = dom.rvCertsList;
  list.innerHTML = '';
  dom.rvCertsSec.style.display = state.certifications.length ? '' : 'none';

  state.certifications.forEach(cert => {
    if (!cert.name) return;
    const entry = document.createElement('div');
    entry.className = 'rv-cert-entry';
    entry.innerHTML = `
      <div>
        <div class="rv-cert-name">${esc(cert.name)}</div>
        ${cert.issuer ? `<div class="rv-cert-issuer">${esc(cert.issuer)}</div>` : ''}
      </div>
      ${cert.date ? `<div class="rv-cert-date">${esc(cert.date)}</div>` : ''}
    `;
    list.appendChild(entry);
  });
}

function renderPreviewLanguages() {
  if (!dom.rvLanguagesSec) return;
  dom.rvLanguagesSec.style.display = state.languages.length ? '' : 'none';
  dom.rvLanguagesList.innerHTML = '';
  if (!state.languages.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'rv-skills-grid';
  state.languages.forEach(lang => {
    if (!lang.name) return;
    const tag = document.createElement('span');
    tag.className = 'rv-skill-tag';
    tag.textContent = `${lang.name} – ${lang.proficiency}`;
    wrap.appendChild(tag);
  });
  dom.rvLanguagesList.appendChild(wrap);
}

function renderPreviewAwards() {
  if (!dom.rvAwardsSec) return;
  dom.rvAwardsSec.style.display = state.awards.length ? '' : 'none';
  dom.rvAwardsList.innerHTML = '';

  state.awards.forEach(award => {
    if (!award.title) return;
    const entry = document.createElement('div');
    entry.className = 'rv-cert-entry';
    entry.style.flexDirection = 'column';
    entry.style.alignItems = 'flex-start';
    entry.innerHTML = `
      <div style="display:flex;justify-content:space-between;width:100%;">
        <div>
          <div class="rv-cert-name">${esc(award.title)}</div>
          ${award.issuer ? `<div class="rv-cert-issuer">${esc(award.issuer)}</div>` : ''}
        </div>
        ${award.date ? `<div class="rv-cert-date">${esc(award.date)}</div>` : ''}
      </div>
      ${award.desc ? `<div class="rv-entry-desc" style="margin-top:3px;font-size:0.8rem;">${esc(award.desc)}</div>` : ''}
    `;
    dom.rvAwardsList.appendChild(entry);
  });
}

// ── Format description (render bullet points) ──
function formatDesc(text) {
  const escaped = esc(text);
  // Convert bullet-point lines to proper HTML
  const lines = escaped.split('\n');
  const hasBullets = lines.some(l => l.trim().startsWith('•') || l.trim().startsWith('-'));
  if (hasBullets) {
    const items = lines
      .filter(l => l.trim())
      .map(l => l.trim().replace(/^[•\-]\s*/, ''));
    return `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
  }
  return `<p>${escaped.replace(/\n/g, '<br>')}</p>`;
}

// ── Escape HTML ──
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ══════════════════════════════════════════════════════════
// PERSONAL INFO — LIVE BINDING
// ══════════════════════════════════════════════════════════
function initPersonalInfoBindings() {
  const personalFields = [
    dom.fullName, dom.jobTitle, dom.email, dom.phone,
    dom.location, dom.linkedin, dom.github, dom.website, dom.summary,
    document.getElementById('date-of-birth'),
    document.getElementById('nationality'),
    document.getElementById('objective'),
  ];

  personalFields.forEach(field => {
    if (!field) return;
    field.addEventListener('input', () => {
      updatePreview();
      updateProgress();
    });
  });

  // Char count for summary
  dom.summary.addEventListener('input', () => {
    dom.summaryCount.textContent = `${dom.summary.value.length} / 600`;
  });
}

// ══════════════════════════════════════════════════════════
// THEME TOGGLE
// ══════════════════════════════════════════════════════════
function initThemeToggle() {
  const savedTheme = localStorage.getItem('rf-theme') || 'light';
  applyTheme(savedTheme);

  dom.btnThemeToggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('rf-theme', next);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = dom.btnThemeToggle.querySelector('.theme-icon');
  icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ══════════════════════════════════════════════════════════
// ZOOM CONTROLS
// ══════════════════════════════════════════════════════════
function initZoom() {
  applyZoom(state.zoomLevel);

  dom.btnZoomIn.addEventListener('click', () => {
    state.zoomLevel = Math.min(state.zoomLevel + 5, 120);
    applyZoom(state.zoomLevel);
  });

  dom.btnZoomOut.addEventListener('click', () => {
    state.zoomLevel = Math.max(state.zoomLevel - 5, 50);
    applyZoom(state.zoomLevel);
  });
}

function applyZoom(level) {
  dom.previewScaleWrapper.style.transform = `scale(${level / 100})`;
  dom.previewScaleWrapper.style.marginBottom = level < 100
    ? `${-(794 * (1 - level / 100))}px` : '0';
  dom.zoomLevel.textContent = `${level}%`;
}

// ══════════════════════════════════════════════════════════
// SAVE / LOAD DRAFT (localStorage)
// ══════════════════════════════════════════════════════════
function saveDraft() {
  const draft = {
    personal: {
      fullName:  dom.fullName.value,
      jobTitle:  dom.jobTitle.value,
      email:     dom.email.value,
      phone:     dom.phone.value,
      location:  dom.location.value,
      linkedin:  dom.linkedin.value,
      github:    dom.github.value,
      website:   dom.website.value,
      summary:   dom.summary.value,
    },
    photo:          state.photoDataUrl,
    education:      state.education,
    experience:     state.experience,
    skills:         state.skills,
    projects:       state.projects,
    certifications: state.certifications,
  };

  try {
    localStorage.setItem('rf-draft', JSON.stringify(draft));
    showToast('Draft saved successfully! 💾', 'success');
  } catch (e) {
    showToast('Could not save draft (storage full?)', 'error');
  }
}

function loadDraft() {
  const raw = localStorage.getItem('rf-draft');
  if (!raw) {
    showToast('No saved draft found.', 'info');
    return;
  }

  try {
    const draft = JSON.parse(raw);

    // Personal
    if (draft.personal) {
      Object.entries(draft.personal).forEach(([key, val]) => {
        const el = dom[key] || document.getElementById(key);
        if (el) el.value = val || '';
      });
      dom.summaryCount.textContent = `${dom.summary.value.length} / 600`;
    }

    // Photo
    if (draft.photo) {
      state.photoDataUrl = draft.photo;
      dom.photoPreview.innerHTML = `<img src="${draft.photo}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
      dom.btnRemovePhoto.classList.remove('hidden');
    }

    // Clear all dynamic sections
    clearAllDynamicSections();

    // Load arrays
    (draft.education || []).forEach(e => addEducationEntry(e));
    (draft.experience || []).forEach(e => addExperienceEntry(e));
    (draft.skills || []).forEach(e => addSkillEntry(e));
    (draft.projects || []).forEach(e => addProjectEntry(e));
    (draft.certifications || []).forEach(e => addCertificationEntry(e));
    (draft.languages || []).forEach(e => addLanguageEntry(e));
    (draft.awards || []).forEach(e => addAwardEntry(e));

    updatePreview();
    updateProgress();
    showToast('Draft loaded successfully! ✅', 'success');
  } catch (e) {
    showToast('Failed to load draft.', 'error');
  }
}

function clearAllDynamicSections() {
  state.education = []; dom.educationEntries.innerHTML = '';
  state.experience = []; dom.experienceEntries.innerHTML = '';
  state.skills = []; dom.skillsEntries.innerHTML = '';
  state.projects = []; dom.projectsEntries.innerHTML = '';
  state.certifications = []; dom.certificationEntries.innerHTML = '';
  state.languages = []; if (dom.languageEntries) dom.languageEntries.innerHTML = '';
  state.awards = []; if (dom.awardsEntries) dom.awardsEntries.innerHTML = '';
}

function clearAll() {
  showModal(
    'Clear All Data',
    'This will erase everything. Are you sure?',
    () => {
      // Personal
      [dom.fullName, dom.jobTitle, dom.email, dom.phone,
       dom.location, dom.linkedin, dom.github, dom.website, dom.summary].forEach(f => { if(f) f.value = ''; });
      dom.summaryCount.textContent = '0 / 600';

      // Photo
      state.photoDataUrl = null;
      dom.photoPreview.innerHTML = '<span class="photo-placeholder">📷</span>';
      dom.btnRemovePhoto.classList.add('hidden');
      dom.photoUpload.value = '';

      clearAllDynamicSections();
      updatePreview();
      updateProgress();
      showToast('All data cleared.', 'info');
    }
  );
}

// ══════════════════════════════════════════════════════════
// PDF DOWNLOAD — Agent 4
// ══════════════════════════════════════════════════════════
function downloadPDF() {
  const name = dom.fullName.value.trim() || 'Resume';
  if (!name || name === 'Your Name') {
    showToast('Please enter your name before downloading!', 'error');
    return;
  }

  // Validate required fields
  if (!dom.email.value.trim() && !dom.phone.value.trim()) {
    showToast('Please add at least an email or phone.', 'error');
    return;
  }

  // Show loading overlay
  const overlay = document.createElement('div');
  overlay.className = 'pdf-loading';
  overlay.innerHTML = `
    <div class="pdf-loading-box">
      <div class="pdf-spinner"></div>
      <div class="pdf-loading-text">Generating your PDF...</div>
      <div class="pdf-loading-sub">Optimizing for ATS compatibility</div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Prepare the resume element (clone it without any skill bars — ATS friendly)
  const element = document.getElementById('resume-document');

  // ATS-optimized options
  const opt = {
    margin:     [10, 10, 10, 10], // mm
    filename:   `${name.replace(/\s+/g, '_')}_Resume.pdf`,
    image:      { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  // Temporarily set white background for PDF
  const origBg = element.style.background;
  element.style.background = '#ffffff';

  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      element.style.background = origBg;
      document.body.removeChild(overlay);
      showToast(`"${name.replace(/\s+/g, '_')}_Resume.pdf" downloaded! 🎉`, 'success');
    })
    .catch((err) => {
      element.style.background = origBg;
      document.body.removeChild(overlay);
      showToast('PDF generation failed. Please try again.', 'error');
      console.error('PDF Error:', err);
    });
}

// ══════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ══════════════════════════════════════════════════════════
function showToast(message, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '💬'}</span>
    <span>${message}</span>
  `;
  dom.toastContainer.appendChild(toast);

  // Auto-remove after 3.5s
  setTimeout(() => {
    toast.style.animation = 'toast-out 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ══════════════════════════════════════════════════════════
// CONFIRM MODAL
// ══════════════════════════════════════════════════════════
let modalResolve = null;

function showModal(title, message, onConfirm) {
  dom.modalTitle.textContent = title;
  dom.modalMessage.textContent = message;
  dom.modalOverlay.classList.remove('hidden');
  modalResolve = onConfirm;
}

function initModal() {
  dom.modalCancel.addEventListener('click', () => {
    dom.modalOverlay.classList.add('hidden');
    modalResolve = null;
  });

  dom.modalConfirm.addEventListener('click', () => {
    dom.modalOverlay.classList.add('hidden');
    if (modalResolve) { modalResolve(); modalResolve = null; }
  });

  dom.modalOverlay.addEventListener('click', (e) => {
    if (e.target === dom.modalOverlay) {
      dom.modalOverlay.classList.add('hidden');
      modalResolve = null;
    }
  });
}

// ══════════════════════════════════════════════════════════
// AUTO-SAVE (every 30s if content exists)
// ══════════════════════════════════════════════════════════
function initAutoSave() {
  setInterval(() => {
    if (dom.fullName.value.trim() || state.education.length || state.experience.length) {
      localStorage.setItem('rf-draft', JSON.stringify(buildDraftObject()));
    }
  }, 30000);
}

function buildDraftObject() {
  return {
    personal: {
      fullName:  dom.fullName.value,
      jobTitle:  dom.jobTitle.value,
      email:     dom.email.value,
      phone:     dom.phone.value,
      location:  dom.location.value,
      linkedin:  dom.linkedin.value,
      github:    dom.github.value,
      website:   dom.website.value,
      summary:   dom.summary.value,
      dateOfBirth: document.getElementById('date-of-birth')?.value || '',
      nationality: document.getElementById('nationality')?.value || '',
      objective:   document.getElementById('objective')?.value || '',
    },
    photo:          state.photoDataUrl,
    education:      state.education,
    experience:     state.experience,
    skills:         state.skills,
    projects:       state.projects,
    certifications: state.certifications,
    languages:      state.languages,
    awards:         state.awards,
  };
}

// ══════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ══════════════════════════════════════════════════════════
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+S → Save Draft
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveDraft();
    }
    // Ctrl+P → Download PDF (override browser print)
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      downloadPDF();
    }
    // Escape → Close modal
    if (e.key === 'Escape') {
      dom.modalOverlay.classList.add('hidden');
    }
  });
}

// ══════════════════════════════════════════════════════════
// SAMPLE DATA (auto-fill for demonstration)
// ══════════════════════════════════════════════════════════
function loadSampleData() {
  // Only autofill if nothing is present
  const hasDraft = !!localStorage.getItem('rf-draft');
  if (hasDraft) return;

  dom.fullName.value  = 'Aditya Singh Rathore';
  dom.jobTitle.value  = 'Full Stack Developer & ECE Engineer';
  dom.email.value     = 'aditya@example.com';
  dom.phone.value     = '+91 98765 43210';
  dom.location.value  = 'Jaipur, Rajasthan, India';
  dom.linkedin.value  = 'linkedin.com/in/aditya-singh';
  dom.github.value    = 'github.com/aditya-singh';
  dom.summary.value   = 'Highly motivated B.Tech ECE student with strong skills in full-stack development, embedded systems, and signal processing. Experienced in building scalable web applications and simulation projects. Seeking challenging roles to apply technical expertise and drive innovation.';
  dom.summaryCount.textContent = `${dom.summary.value.length} / 600`;

  addEducationEntry({
    degree: 'B.Tech in Electronics & Communication Engineering',
    school: 'Rajasthan Technical University',
    location: 'Jaipur, India',
    startDate: 'Aug 2021',
    endDate: 'May 2025',
    gpa: '8.2 / 10',
  });

  addExperienceEntry({
    role: 'Software Development Intern',
    company: 'TechNova Solutions',
    location: 'Remote',
    startDate: 'June 2024',
    endDate: 'Aug 2024',
    desc: '• Developed RESTful APIs using Node.js and Express, reducing response time by 35%\n• Built responsive UI components in React.js for the company dashboard\n• Collaborated with a team of 5 engineers using Agile methodology\n• Integrated third-party payment gateway and improved security protocols',
  });

  addSkillEntry({ name: 'JavaScript (ES6+)', level: 'advanced' });
  addSkillEntry({ name: 'React.js',           level: 'advanced' });
  addSkillEntry({ name: 'Node.js',            level: 'intermediate' });
  addSkillEntry({ name: 'Python',             level: 'intermediate' });
  addSkillEntry({ name: 'MongoDB',            level: 'intermediate' });
  addSkillEntry({ name: 'C/C++',              level: 'intermediate' });
  addSkillEntry({ name: 'Git & GitHub',       level: 'advanced' });
  addSkillEntry({ name: 'HTML5 & CSS3',       level: 'expert' });

  addProjectEntry({
    name: 'Beamforming Simulation Tool',
    tech: 'Python, NumPy, Matplotlib, Tkinter',
    startDate: 'Jan 2024 – Mar 2024',
    desc: '• Simulated linear antenna array beamforming with real-time radiation pattern\n• Implemented phase shift calculations using complex signal mathematics\n• Built interactive GUI with live visualization using Tkinter and Matplotlib',
  });

  addProjectEntry({
    name: 'Resume Builder Web App',
    tech: 'HTML5, CSS3, JavaScript, html2pdf.js',
    startDate: 'Apr 2024',
    desc: '• Built a fully functional ATS-friendly resume builder with live preview\n• Implemented PDF generation, localStorage draft saving, and dark mode\n• Designed premium UI with smooth animations and responsive layout',
  });

  addCertificationEntry({
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    date: 'Jan 2024',
  });

  addCertificationEntry({
    name: 'The Web Developer Bootcamp',
    issuer: 'Udemy / Colt Steele',
    date: 'Oct 2023',
  });

  updatePreview();
  updateProgress();
}

// ══════════════════════════════════════════════════════════
// INITIALIZE APP
// ══════════════════════════════════════════════════════════
function init() {
  initSectionNav();
  initPersonalInfoBindings();
  initPhotoUpload();
  initThemeToggle();
  initZoom();
  initModal();
  initKeyboardShortcuts();
  initAutoSave();

  // Button bindings
  dom.btnAddEducation.addEventListener('click',     () => addEducationEntry());
  dom.btnAddExperience.addEventListener('click',    () => addExperienceEntry());
  if (dom.btnNoExperience) dom.btnNoExperience.addEventListener('click', () => addNoExperienceEntry());
  dom.btnAddSkill.addEventListener('click',         () => addSkillEntry());
  dom.btnAddProject.addEventListener('click',       () => addProjectEntry());
  dom.btnAddCertification.addEventListener('click', () => addCertificationEntry());
  dom.btnAddLanguage.addEventListener('click',      () => addLanguageEntry());
  dom.btnAddAward.addEventListener('click',         () => addAwardEntry());

  initCategoryPills();

  dom.btnSaveDraft.addEventListener('click',           saveDraft);
  dom.btnLoadDraft.addEventListener('click',           loadDraft);
  dom.btnDownloadPdf.addEventListener('click',         downloadPDF);
  dom.btnDownloadPdfBottom.addEventListener('click',   downloadPDF);
  dom.btnClearForm.addEventListener('click',           clearAll);

  // Load sample data on first visit
  loadSampleData();

  // Initial preview render
  updatePreview();
  updateProgress();

  // Greeting
  setTimeout(() => {
    showToast('Welcome to ResumeForge! 🚀 Ctrl+S to save draft.', 'info');
  }, 800);
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', init);
