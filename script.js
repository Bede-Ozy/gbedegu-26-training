document.addEventListener('DOMContentLoaded', () => {
  // Slide state
  let currentSlide = 0;
  const slides = document.querySelectorAll('.slide');
  const slideSelect = document.getElementById('slideSelect');
  const slideNumDisplay = document.getElementById('slideNumDisplay');
  const progressFill = document.getElementById('progressFill');
  const deckContainer = document.getElementById('deckContainer');
  
  const totalSlides = slides.length;

  // Initialize scale
  function updateScale() {
    const slideWidth = 1280;
    const slideHeight = 720;
    
    let viewportWidth, viewportHeight;
    
    if (document.fullscreenElement) {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
    } else {
      const padding = 40; // total padding
      viewportWidth = window.innerWidth - padding;
      viewportHeight = window.innerHeight - 130; // accounting for 70px header + 60px footer
    }

    const scaleX = viewportWidth / slideWidth;
    const scaleY = viewportHeight / slideHeight;
    let scale = Math.min(scaleX, scaleY);
    
    // In fullscreen, let it scale naturally to fill the page, otherwise cap at 1.2
    if (!document.fullscreenElement) {
      scale = Math.min(1.2, scale);
    }
    scale = Math.max(0.4, scale);

    if (window.innerWidth > 768) {
      deckContainer.style.setProperty('--scale', scale);
    } else {
      deckContainer.style.removeProperty('--scale');
    }
  }

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      document.body.classList.add('fullscreen-mode');
    } else {
      document.body.classList.remove('fullscreen-mode');
    }
    updateScale();
  });

  window.addEventListener('resize', updateScale);
  updateScale();

  // Slide navigation function
  function showSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    
    // Remove active class from current slide
    slides[currentSlide].classList.remove('active');
    
    // Set new current slide
    currentSlide = index;
    slides[currentSlide].classList.add('active');

    // Update controls
    slideSelect.value = currentSlide;
    slideNumDisplay.textContent = `${currentSlide + 1} / ${totalSlides}`;
    progressFill.style.width = `${((currentSlide + 1) / totalSlides) * 100}%`;

    // Update presenter notes
    const activeNote = document.querySelector('.presenter-note-slide.active');
    if (activeNote) activeNote.classList.remove('active');
    
    const nextNote = document.getElementById(`note-slide-${currentSlide}`);
    if (nextNote) nextNote.classList.add('active');
  }

  // Prev / Next button listeners
  document.getElementById('prevBtn').addEventListener('click', () => showSlide(currentSlide - 1));
  document.getElementById('nextBtn').addEventListener('click', () => showSlide(currentSlide + 1));
  
  // Dropdown select listener
  slideSelect.addEventListener('change', (e) => showSlide(parseInt(e.target.value)));

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // Ignore input text areas or form elements
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      showSlide(currentSlide + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
      e.preventDefault();
      showSlide(currentSlide - 1);
    } else if (e.key.toLowerCase() === 'f') {
      toggleFullscreen();
    }
  });

  // Mouse wheel navigation (debounced)
  let lastWheelTime = 0;
  document.getElementById('deckViewport').addEventListener('wheel', (e) => {
    const now = Date.now();
    if (now - lastWheelTime < 800) return; // limit scroll rate
    
    if (e.deltaY > 20) {
      showSlide(currentSlide + 1);
      lastWheelTime = now;
    } else if (e.deltaY < -20) {
      showSlide(currentSlide - 1);
      lastWheelTime = now;
    }
  });

  // Touch navigation support
  let touchStartX = 0;
  let touchEndX = 0;
  document.getElementById('deckViewport').addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);

  document.getElementById('deckViewport').addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);

  function handleSwipe() {
    const minDistance = 50;
    if (touchEndX < touchStartX - minDistance) {
      showSlide(currentSlide + 1);
    }
    if (touchEndX > touchStartX + minDistance) {
      showSlide(currentSlide - 1);
    }
  }

  // Fullscreen support
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error enabling fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }
  document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);



  // ========================================================
  // SLIDE 2: JCI Action Framework Widget
  // ========================================================
  const frameworkSteps = document.querySelectorAll('.framework-step');
  const detailsContents = document.querySelectorAll('.framework-details-content');

  frameworkSteps.forEach(step => {
    step.addEventListener('click', () => {
      frameworkSteps.forEach(s => s.classList.remove('active'));
      detailsContents.forEach(c => c.classList.remove('active'));

      step.classList.add('active');
      const targetId = step.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // ========================================================
  // SLIDE 3: Iron Triangle Interactive SVG Widget
  // ========================================================
  const nodes = document.querySelectorAll('.triangle-node');
  const triangleLines = document.querySelectorAll('.triangle-line');
  const conceptTabs = document.querySelectorAll('.concept-tab-card');
  const triangleInfoTitle = document.getElementById('triangleInfoTitle');

  function selectIronTriangleNode(conceptName) {
    // Reset highlights
    nodes.forEach(n => n.classList.remove('active'));
    triangleLines.forEach(l => l.classList.remove('highlight'));
    conceptTabs.forEach(t => t.classList.remove('active'));

    // Highlight Node
    const activeNode = document.querySelector(`.triangle-node[data-concept="${conceptName}"]`);
    if (activeNode) activeNode.classList.add('active');

    // Highlight connecting lines
    if (conceptName === 'scope') {
      document.getElementById('line-scope-time').classList.add('highlight');
      document.getElementById('line-scope-cost').classList.add('highlight');
      triangleInfoTitle.textContent = "Focus: Scope (Quality & Deliverables)";
    } else if (conceptName === 'time') {
      document.getElementById('line-scope-time').classList.add('highlight');
      document.getElementById('line-time-cost').classList.add('highlight');
      triangleInfoTitle.textContent = "Focus: Time (Schedules & Milestones)";
    } else if (conceptName === 'cost') {
      document.getElementById('line-scope-cost').classList.add('highlight');
      document.getElementById('line-time-cost').classList.add('highlight');
      triangleInfoTitle.textContent = "Focus: Cost (Budget & Resources)";
    }

    // Activate corresponding tab list
    const activeTab = document.querySelector(`.concept-tab-card[data-concept="${conceptName}"]`);
    if (activeTab) activeTab.classList.add('active');
  }

  nodes.forEach(node => {
    node.addEventListener('click', () => {
      const concept = node.getAttribute('data-concept');
      selectIronTriangleNode(concept);
    });
  });

  conceptTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const concept = tab.getAttribute('data-concept');
      selectIronTriangleNode(concept);
    });
  });

  // ========================================================
  // SLIDE 4: SDG Alignment Clicker Widget
  // ========================================================
  const sdgButtons = document.querySelectorAll('.sdg-icon-btn');
  const sdgTitle = document.getElementById('sdgDetailsTitle');
  const sdgDesc = document.getElementById('sdgDetailsDesc');

  const sdgData = {
    '1': {
      title: "SDG 1: No Poverty",
      desc: "Projects targeting financial literacy, micro-enterprise training for local youths, and skills acquiring schemes. In JCIN, this resolves through local entrepreneurship summits."
    },
    '2': {
      title: "SDG 2: Zero Hunger",
      desc: "Community agricultural advocacy, food security campaigns, and donation systems. Important for rural outreach programs in Northern local organisations."
    },
    '3': {
      title: "SDG 3: Good Health & Well-being",
      desc: "Malaria eradication, immunization support, mental health awareness, and sanitation initiatives. A staple of JCI Nigeria's local impact projects."
    },
    '4': {
      title: "SDG 4: Quality Education",
      desc: "Laying foundations through book drives, building/renovating schools, tutoring, and providing classroom tools to underserved communities."
    },
    '5': {
      title: "SDG 5: Gender Equality",
      desc: "Empowering young girls through sanitary pad distributions, stem workshops, and gender advocacy projects to promote equal community leadership."
    },
    '6': {
      title: "SDG 6: Clean Water & Sanitation",
      desc: "Installing boreholes in rural water-scarce areas of Northern Nigeria, training on hygiene, and construction of toilet facilities."
    },
    '8': {
      title: "SDG 8: Decent Work & Economic Growth",
      desc: "Providing professional internships, CV writing bootcamps, vocational training, and tech skills acquisitions for JCI members and local youth."
    },
    '13': {
      title: "SDG 13: Climate Action",
      desc: "Tree planting campaigns to curb desertification in Northern Nigeria, waste recycling seminars, and clean-up exercises."
    }
  };

  sdgButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sdgButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const num = btn.getAttribute('data-sdg');
      if (sdgData[num]) {
        sdgTitle.textContent = sdgData[num].title;
        sdgDesc.textContent = sdgData[num].desc;
      }
    });
  });

  // ========================================================
  // SLIDE 5: Gantt Chart Widget
  // ========================================================
  const ganttBars = document.querySelectorAll('.gantt-bar');
  const ganttTitle = document.getElementById('ganttInfoTitle');
  const ganttDesc = document.getElementById('ganttInfoDesc');

  const ganttData = {
    'initiation': {
      title: "Weeks 1 - 2: Project Initiation",
      desc: "Perform needs assessments, stakeholder interviews, align with JCI Action Framework, draft project charter, and secure board approvals."
    },
    'planning': {
      title: "Weeks 2 - 4: Planning & Design",
      desc: "Formulate timeline milestones, prepare budget and financial sponsorships, allocate member resources, and execute marketing strategy."
    },
    'execution': {
      title: "Weeks 4 - 6: Execution & Deliverables",
      desc: "Coordinate project teams, manage community campaigns, run events on the ground, manage sponsorships and partnerships."
    },
    'closure': {
      title: "Weeks 5 - 8: M&E, Closure, and Handover",
      desc: "Verify outputs vs. outcomes, run audits on finance, hand over to community leaders, and compile the final project report."
    }
  };

  ganttBars.forEach(bar => {
    bar.addEventListener('click', () => {
      const phase = bar.getAttribute('data-phase');
      if (ganttData[phase]) {
        ganttTitle.textContent = ganttData[phase].title;
        ganttDesc.textContent = ganttData[phase].desc;
      }
    });
  });

  // ========================================================
  // SLIDE 6: Org Chart Widget
  // ========================================================
  const orgNodes = document.querySelectorAll('.org-node');
  const detailsName = document.getElementById('orgDetailsName');
  const detailsRole = document.getElementById('orgDetailsRole');
  const detailsList = document.getElementById('orgDetailsList');

  const orgData = {
    'director': {
      name: "Project Director",
      role: "Strategic Leader",
      responsibilities: [
        "Liaises with JCI Local Organization President and Board.",
        "Overlooks all project deliverables, milestones, and safety guidelines.",
        "Coordinates key stakeholder and partner relations.",
        "Drives the project's vision and core goals."
      ]
    },
    'planner': {
      name: "Project Secretary / Secretary",
      role: "Operations & Admin Officer",
      responsibilities: [
        "Manages project records, meeting minutes, and document templates.",
        "Handles internal and external communications schedules.",
        "Tracks progress against deadlines and coordinates tasks.",
        "Drafts final evaluation reports and feedback compilations."
      ]
    },
    'treasurer': {
      name: "Project Treasurer / Logistics",
      role: "Finance & Supply Coordinator",
      responsibilities: [
        "Prepares and tracks project budget statements.",
        "Audits financial records and receipt handovers.",
        "Secures physical venues, speaker bookings, and transport logistics.",
        "Enforces cost efficiency across team procurements."
      ]
    },
    'relations': {
      name: "PR & Volunteer Coordinator",
      role: "Marketing & Engagement Officer",
      responsibilities: [
        "Drives volunteer member recruitment, orientation, and shifts.",
        "Drafts press releases and coordinates social media promotions.",
        "Oversees photographer schedules, event branding, and newsletters.",
        "Acts as primary contact point for local beneficiaries."
      ]
    }
  };

  orgNodes.forEach(node => {
    node.addEventListener('click', () => {
      orgNodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      const id = node.getAttribute('data-id');
      if (orgData[id]) {
        detailsName.textContent = orgData[id].name;
        detailsRole.textContent = orgData[id].role;
        
        detailsList.innerHTML = '';
        orgData[id].responsibilities.forEach(resp => {
          const li = document.createElement('div');
          li.className = 'framework-bullet-item';
          li.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>${resp}</span>
          `;
          detailsList.appendChild(li);
        });
      }
    });
  });

  // ========================================================
  // SLIDE 7: Monitoring & Evaluation Impact Calculator
  // ========================================================
  const volunteersSlider = document.getElementById('volunteersSlider');
  const targetReachSlider = document.getElementById('targetReachSlider');
  const efficiencySlider = document.getElementById('efficiencySlider');

  const volunteersValue = document.getElementById('volunteersValue');
  const targetReachValue = document.getElementById('targetReachValue');
  const efficiencyValue = document.getElementById('efficiencyValue');

  const calcScore = document.getElementById('calcScore');
  const calcRating = document.getElementById('calcRating');

  function calculateImpact() {
    const v = parseInt(volunteersSlider.value);
    const r = parseInt(targetReachSlider.value);
    const e = parseInt(efficiencySlider.value); // 1, 2, or 3

    volunteersValue.textContent = v;
    targetReachValue.textContent = r;
    
    let effLabel = "Low";
    if (e === 2) effLabel = "Medium";
    if (e === 3) effLabel = "High";
    efficiencyValue.textContent = effLabel;

    // Calculate score logic: log scale reach to not let it overwhelm. Max reach = 5000 (log is ~8.5). Max vol = 200. Max eff = 3.
    const normV = (v / 200) * 40; // max 40 points
    const normR = (Math.log(r) / Math.log(5000)) * 40; // max 40 points
    const normE = (e / 3) * 20; // max 20 points
    
    let score = Math.round(normV + normR + normE);
    score = Math.min(100, Math.max(10, score));

    calcScore.textContent = score;

    let rating = "Local Community Impact";
    if (score > 40) rating = "Local Organization Star Project";
    if (score > 65) rating = "National Impact Tier - JCI Nigeria Award Contender";
    if (score > 85) rating = "International Best Practice - Africa & Middle East Standard";
    
    calcRating.textContent = rating;
  }

  volunteersSlider.addEventListener('input', calculateImpact);
  targetReachSlider.addEventListener('input', calculateImpact);
  efficiencySlider.addEventListener('input', calculateImpact);

  // Run initial calculation
  calculateImpact();

  // ========================================================
  // SLIDE 11: Impact Model Canvas Interactive Grid
  // ========================================================
  const canvasBlocks = document.querySelectorAll('.canvas-block');
  const canvasDetailTitle = document.getElementById('canvasDetailTitle');
  const canvasDetailDesc = document.getElementById('canvasDetailDesc');

  const canvasBlockInfo = {
    'problem': {
      title: "1. Problem & Local Needs",
      desc: "Specify the community issues you are tackling (e.g., poor sanitation, youth unemployment in Northern Nigeria). <b>JCIN Example:</b> High youth unemployment due to lack of standard tech skills."
    },
    'beneficiaries': {
      title: "2. Target Beneficiaries & Segment",
      desc: "Exactly who benefits from the project and who pays/sponsors (e.g., undergraduates in Kaduna). <b>JCIN Example:</b> 100 students of Ahmadu Bello University, Zaria."
    },
    'value': {
      title: "3. Unique Value Proposition",
      desc: "What unique benefit does this JCI project deliver that others don't? <b>JCIN Example:</b> Fully funded hands-on mentoring bootcamps featuring local tech leaders."
    },
    'activities': {
      title: "4. Core Activities & Interventions",
      desc: "The critical actions needed to execute the project. <b>JCIN Example:</b> Curriculum design, tutor hire, 8-week code bootcamps, and a tech career fair."
    },
    'partners': {
      title: "5. Key Partners & Stakeholders",
      desc: "External bodies crucial for success (government, companies, media). <b>JCIN Example:</b> Kaduna State Tech Hub (venue sponsor) and Nigerian local software firms."
    },
    'resources': {
      title: "6. Key Resources",
      desc: "What assets (funding, volunteers, material, logistics) are required? <b>JCIN Example:</b> Laptops, internet plans, JCI member trainers, and sponsorship seed capital."
    },
    'channels': {
      title: "7. Channels & Community Engagement",
      desc: "How do you reach beneficiaries and report back to sponsors? <b>JCIN Example:</b> Radio announcements, campus flyer runs, WhatsApp communities, and press releases."
    },
    'costs': {
      title: "8. Cost Structure",
      desc: "The principal expenditures incurred. <b>JCIN Example:</b> Venue generator fuel, printing certificates, publicity banners, and trainer stipend."
    },
    'revenue': {
      title: "9. Sustainability & Reinvestment (Surplus)",
      desc: "How to fund the project and recycle surpluses. <b>JCIN Example:</b> CSR sponsorships, ticket sales for tech fair, and alumni community contributions."
    },
    'impact': {
      title: "10. Social Impact & Metrics",
      desc: "The systemic change you want to observe (KPIs). <b>JCIN Example:</b> Number of youths employed, increase in income brackets, and local business partnerships formed."
    }
  };

  canvasBlocks.forEach(block => {
    block.addEventListener('click', () => {
      canvasBlocks.forEach(b => b.classList.remove('active'));
      block.classList.add('active');

      const blockName = block.getAttribute('data-block');
      if (canvasBlockInfo[blockName]) {
        canvasDetailTitle.textContent = canvasBlockInfo[blockName].title;
        canvasDetailDesc.innerHTML = canvasBlockInfo[blockName].desc;
      }
    });
  });

  // ========================================================
  // SLIDE 13: Case Studies Slider
  // ========================================================
  const caseButtons = document.querySelectorAll('.case-btn');
  const caseContents = document.querySelectorAll('.case-content');

  caseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      caseButtons.forEach(b => b.classList.remove('active'));
      caseContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
    });
  });


});
