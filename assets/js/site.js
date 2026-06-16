
  // ── Year ──────────────────────────────────────────────────────────
  document.getElementById('year').textContent = new Date().getFullYear();

  // ── Mobile menu ───────────────────────────────────────────────────
  const btn  = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    btn.textContent = open ? '✕' : '☰';
  });
  menu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
      btn.textContent = '☰';
    })
  );

  
if (document.getElementById('plannerForm')) {
// ── Infrastructure planner ─────────────────────────────────────────
  const plannerForm = document.getElementById('plannerForm');
  const plannerSteps = [...document.querySelectorAll('.planner-step')];
  const plannerProgress = document.getElementById('plannerProgress');
  const plannerStepCount = document.getElementById('plannerStepCount');
  const plannerBack = document.getElementById('plannerBack');
  const plannerNext = document.getElementById('plannerNext');
  const plannerAlert = document.getElementById('plannerAlert');
  const plannerSide = document.querySelector('.planner-side');
  const plannerResult = document.getElementById('plannerResult');
  const resultTitle = document.getElementById('resultTitle');
  const resultSummary = document.getElementById('resultSummary');
  const resultComplexity = document.getElementById('resultComplexity');
  const resultServices = document.getElementById('resultServices');
  const resultPhases = document.getElementById('resultPhases');
  const plannerEnquire = document.getElementById('plannerEnquire');
  const plannerRestart = document.getElementById('plannerRestart');
  let plannerStep = 0;
  let latestPlan = null;

  const serviceDetails = {
    'Managed IT Support': 'Ongoing support, device management, user assistance, and day-to-day technical ownership.',
    'Network Solutions': 'Review and improve switching, routing, Wi-Fi, connectivity, and network resilience.',
    'Cybersecurity': 'Strengthen access, accounts, devices, system configuration, and security readiness.',
    'Rack & Stack': 'Plan and install servers, switches, firewalls, and rack equipment cleanly.',
    'Structured Cabling': 'Professional cabling, patching, labelling, and physical connectivity.',
    'IT Consulting': 'Assessment, technical roadmap, vendor-neutral guidance, and project planning.'
  };

  const scoreMap = {
    size: {
      small: {'Managed IT Support': 2, 'IT Consulting': 1},
      growing: {'Managed IT Support': 3, 'Network Solutions': 2, 'Cybersecurity': 1},
      mid: {'Managed IT Support': 3, 'Network Solutions': 3, 'Cybersecurity': 3, 'IT Consulting': 1},
      large: {'Managed IT Support': 3, 'Network Solutions': 3, 'Cybersecurity': 3, 'IT Consulting': 3}
    },
    locations: {
      one: {'Structured Cabling': 1},
      few: {'Network Solutions': 3, 'Managed IT Support': 2, 'IT Consulting': 1},
      many: {'Network Solutions': 4, 'Managed IT Support': 3, 'Cybersecurity': 2, 'IT Consulting': 2},
      remote: {'Managed IT Support': 3, 'Cybersecurity': 3, 'Network Solutions': 2}
    },
    setup: {
      new: {'IT Consulting': 3, 'Rack & Stack': 3, 'Structured Cabling': 3, 'Network Solutions': 3},
      basic: {'IT Consulting': 3, 'Managed IT Support': 2, 'Cybersecurity': 2, 'Network Solutions': 1},
      mixed: {'IT Consulting': 3, 'Network Solutions': 3, 'Cybersecurity': 2, 'Managed IT Support': 2},
      mature: {'Managed IT Support': 2, 'Cybersecurity': 2, 'IT Consulting': 1}
    },
    challenge: {
      support: {'Managed IT Support': 6, 'IT Consulting': 1},
      network: {'Network Solutions': 6, 'Structured Cabling': 2, 'IT Consulting': 1},
      security: {'Cybersecurity': 6, 'Managed IT Support': 2, 'IT Consulting': 2},
      deployment: {'Rack & Stack': 5, 'Structured Cabling': 4, 'Network Solutions': 3, 'IT Consulting': 2}
    },
    coverage: {
      project: {'IT Consulting': 2, 'Rack & Stack': 2, 'Structured Cabling': 2},
      advisory: {'IT Consulting': 5, 'Cybersecurity': 1, 'Network Solutions': 1},
      managed: {'Managed IT Support': 6, 'Cybersecurity': 2, 'Network Solutions': 1},
      unsure: {'IT Consulting': 3, 'Managed IT Support': 2}
    }
  };

  function updatePlannerStep() {
    plannerSteps.forEach((step, index) => step.classList.toggle('active', index === plannerStep));
    plannerProgress.style.width = `${((plannerStep + 1) / plannerSteps.length) * 100}%`;
    plannerStepCount.textContent = `Step ${plannerStep + 1} of ${plannerSteps.length}`;
    plannerBack.classList.toggle('visible', plannerStep > 0);
    plannerNext.textContent = plannerStep === plannerSteps.length - 1 ? 'Build My Plan →' : 'Next Question →';
    plannerAlert.textContent = '';
    document.querySelectorAll('.planner-preview-item').forEach((item, index) => {
      const input = plannerSteps[index].querySelector('input:checked');
      item.classList.toggle('complete', Boolean(input));
    });
  }

  function getPlannerAnswers() {
    return Object.fromEntries(new FormData(plannerForm).entries());
  }

  function addScores(scores, additions) {
    Object.entries(additions || {}).forEach(([service, points]) => {
      scores[service] += points;
    });
  }

  function buildPlannerPlan(answers) {
    const scores = Object.fromEntries(Object.keys(serviceDetails).map(service => [service, 0]));
    Object.entries(answers).forEach(([question, answer]) => {
      addScores(scores, scoreMap[question]?.[answer]);
    });

    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const serviceCount = answers.size === 'large' || answers.locations === 'many' || answers.setup === 'new' ? 4 : 3;
    const services = ranked.slice(0, serviceCount).map(([name]) => name);

    let complexityPoints = 0;
    if (answers.size === 'mid') complexityPoints += 1;
    if (answers.size === 'large') complexityPoints += 2;
    if (answers.locations === 'few') complexityPoints += 1;
    if (answers.locations === 'many') complexityPoints += 2;
    if (answers.setup === 'new' || answers.setup === 'mixed') complexityPoints += 1;
    const complexity = complexityPoints >= 4 ? 'Higher-complexity rollout' : complexityPoints >= 2 ? 'Moderate-complexity rollout' : 'Focused rollout';

    const titles = {
      support: 'Managed Support Foundation',
      network: 'Network Reliability Plan',
      security: 'Security Readiness Plan',
      deployment: 'Infrastructure Deployment Plan'
    };

    const summaries = {
      support: 'Your strongest starting point is consistent technical ownership: establish the environment, reduce day-to-day friction, and create a dependable support rhythm.',
      network: 'Your strongest starting point is the connectivity layer: assess the current network, resolve reliability gaps, and document a stable design that can grow.',
      security: 'Your strongest starting point is a practical security baseline: review access and devices, address the highest-risk gaps, and establish repeatable controls.',
      deployment: 'Your strongest starting point is a disciplined deployment: confirm requirements, build the physical and network foundation, then document the completed environment.'
    };

    const phases = [
      'Discovery and current-state assessment',
      answers.challenge === 'deployment' ? 'Design, equipment planning, and deployment' : 'Prioritised remediation and implementation',
      'Documentation, handover, and support plan'
    ];

    if (answers.coverage === 'managed') phases[2] = 'Managed onboarding, documentation, and ongoing support';
    if (answers.coverage === 'advisory') phases[2] = 'Roadmap handover and specialist advisory support';

    return {
      title: titles[answers.challenge],
      summary: summaries[answers.challenge],
      complexity,
      services,
      phases,
      answers
    };
  }

  function renderPlannerPlan(plan) {
    latestPlan = plan;
    plannerForm.hidden = true;
    plannerSide.hidden = true;
    plannerResult.classList.add('active');
    resultTitle.textContent = plan.title;
    resultSummary.textContent = plan.summary;
    resultComplexity.textContent = plan.complexity;
    resultServices.replaceChildren();
    resultPhases.replaceChildren();

    plan.services.forEach(service => {
      const item = document.createElement('div');
      item.className = 'result-service';
      item.textContent = `${service} — ${serviceDetails[service]}`;
      resultServices.appendChild(item);
    });

    plan.phases.forEach((phase, index) => {
      const item = document.createElement('div');
      item.className = 'result-phase';
      const number = document.createElement('span');
      number.textContent = `0${index + 1}`;
      item.append(number, document.createTextNode(phase));
      resultPhases.appendChild(item);
    });
  }

  plannerNext.addEventListener('click', () => {
    const currentInput = plannerSteps[plannerStep].querySelector('input:checked');
    if (!currentInput) {
      plannerAlert.textContent = 'Choose one option to continue.';
      return;
    }

    if (plannerStep < plannerSteps.length - 1) {
      plannerStep += 1;
      updatePlannerStep();
      plannerSteps[plannerStep].querySelector('input').focus();
    } else {
      renderPlannerPlan(buildPlannerPlan(getPlannerAnswers()));
    }
  });

  plannerBack.addEventListener('click', () => {
    if (plannerStep === 0) return;
    plannerStep -= 1;
    updatePlannerStep();
  });

  plannerForm.addEventListener('change', () => {
    plannerAlert.textContent = '';
    updatePlannerStep();
  });

  plannerRestart.addEventListener('click', () => {
    plannerForm.reset();
    plannerStep = 0;
    latestPlan = null;
    plannerForm.hidden = false;
    plannerSide.hidden = false;
    plannerResult.classList.remove('active');
    updatePlannerStep();
  });

  plannerEnquire.addEventListener('click', () => {
    if (!latestPlan) return;
    sessionStorage.setItem('onenexsysPlannerResult', JSON.stringify({
      title: latestPlan.title,
      complexity: latestPlan.complexity,
      services: latestPlan.services,
      phases: latestPlan.phases
    }));
    window.location.href = 'contact.html#contact';
  });

  updatePlannerStep();

  
  }
if (document.getElementById('contactForm')) {
// ── Contact form ───────────────────────────────────────────────────
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const storedPlan = sessionStorage.getItem('onenexsysPlannerResult');
  if (storedPlan) {
    try {
      const plan = JSON.parse(storedPlan);
      const serviceSelect = document.getElementById('contactService');
      const message = document.getElementById('contactMessage');
      const matchingOption = [...serviceSelect.options].find(option => option.text === plan.services?.[0]);
      if (matchingOption) serviceSelect.value = matchingOption.value;
      message.value = [
        `Infrastructure Planner result: ${plan.title}`,
        `Complexity: ${plan.complexity}`,
        `Recommended services: ${(plan.services || []).join(', ')}`,
        `Suggested rollout: ${(plan.phases || []).join(' → ')}`,
        '',
        'Additional details:'
      ].join('\n');
      sessionStorage.removeItem('onenexsysPlannerResult');
    } catch {
      sessionStorage.removeItem('onenexsysPlannerResult');
    }
  }
  contactForm.addEventListener('submit', event => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    const data = new FormData(contactForm);
    const name = data.get('name').trim();
    const company = data.get('company').trim();
    const email = data.get('email').trim();
    const service = data.get('service');
    const message = data.get('message').trim();
    const subject = `Website enquiry: ${service}`;
    const body = [
      `Name: ${name}`,
      `Company: ${company || 'Not provided'}`,
      `Email: ${email}`,
      `Service: ${service}`,
      '',
      message
    ].join('\n');

    formStatus.textContent = 'Opening your email app with the enquiry prepared.';
    window.location.href = `mailto:contact@onenexsys.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  
  }
// ── Scroll animations ─────────────────────────────────────────────
  const animatedElements = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    animatedElements.forEach(el => observer.observe(el));
  } else {
    animatedElements.forEach(el => el.classList.add('visible'));
  }

  // ── Sticky header shadow on scroll ────────────────────────────────
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,.5)' : '';
  }, { passive: true });



  // ── Visual enhancements ────────────────────────────────────────────
  const spotlightCards = document.querySelectorAll(
    '.card, .featured-service, .trust-item, .planner-teaser, .result-panel'
  );
  spotlightCards.forEach(card => card.classList.add('spotlight-card'));

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    spotlightCards.forEach(card => {
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
        card.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
      });
    });
  }

  document.querySelectorAll(
    '.services-grid, .featured-services, .trust-grid, .hero-features, .checks'
  ).forEach(group => {
    [...group.querySelectorAll(':scope > .fade-up')].forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${Math.min(index * 75, 300)}ms`);
    });
  });
