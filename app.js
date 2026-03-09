/* ================================================
   app.js — Talent Intelligence Dashboard
   ================================================ */
/* global ChartDataLabels */
document.addEventListener("DOMContentLoaded", async function() {

  try {
    var authCheck = await fetch("/api/session", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store"
    });

    if (!authCheck.ok) {
      window.location.replace("/login");
      return;
    }
  } catch {
    window.location.replace("/login");
    return;
  }

  document.documentElement.removeAttribute("data-auth-check");

  // Register datalabels plugin globally
  Chart.register(ChartDataLabels);
  // Disable datalabels globally by default — enable per-chart
  Chart.defaults.plugins.datalabels = { display: false };
  // Set default Chart.js font to Figtree
  Chart.defaults.font.family = "Figtree, sans-serif";

  // ---- DATA ----
  var DATA = {
    salaryRoles: [
      { role: "Foundational Staff", sector: "Junior Staff", baseP25: 92262, baseP50: 107823, baseP75: 130611, tcP25Lo: 115000, tcP25Hi: 135000, tcP50Lo: 145000, tcP50Hi: 175000, tcP75Lo: 185000, tcP75Hi: 225000 },
      { role: "Senior Staff", sector: "Mid Staff", baseP25: 115433, baseP50: 135000, baseP75: 150000, tcP25Lo: 165000, tcP25Hi: 200000, tcP50Lo: 210000, tcP50Hi: 260000, tcP75Lo: 280000, tcP75Hi: 350000 },
      { role: "Principal Engineer", sector: "Senior Staff", baseP25: 140000, baseP50: 164000, baseP75: 199000, tcP25Lo: 220000, tcP25Hi: 280000, tcP50Lo: 310000, tcP50Hi: 400000, tcP75Lo: 450000, tcP75Hi: 600000 }
    ],
    costArbitrage: [
      { region: "London", median: 215000, ratio: 1.6 },
      { region: "Manchester", median: 145000, ratio: 4.2 },
      { region: "Leeds", median: 135000, ratio: 4.2 },
      { region: "Edinburgh", median: 140000, ratio: 3.8 },
      { region: "Bristol", median: 148000, ratio: 3.5 },
      { region: "Cambridge", median: 165000, ratio: 2.9 }
    ],
    donors: [
      { company: "Meta", headcount: 29, growth: -9.4, reason: "PSC-driven burnout, stack-ranking culture" },
      { company: "AWS", headcount: 18, growth: -16.7, reason: "High operational toil, frugality-driven debt" },
      { company: "Personio", headcount: 8, growth: -20.0, reason: "No clear AI-first mission, retention issues" }
    ],
    gainers: [
      { company: "JPMorganChase", headcount: 15, growth: 50.0, reason: "Tech-first rebrand, AI salaries up to \u00a3207k" },
      { company: "Google DeepMind", headcount: 10, growth: 66.7, reason: "Prestige destination for elite AI cohort" },
      { company: "Apple", headcount: 7, growth: 75.0, reason: "Privacy-focused on-device AI architecture" }
    ],
    poolDistribution: [
      { label: "Big Tech", pct: 35 },
      { label: "Fintech & Capital", pct: 25 },
      { label: "Scale-ups & Labs", pct: 40 }
    ],
    skills: [
      { skill: "Python", pros: 607, penetration: 86.6, growth: 20.7 },
      { skill: "Machine Learning", pros: 481, penetration: 68.6, growth: 12.9 },
      { skill: "Data Pipelines", pros: 219, penetration: 31.2, growth: 85.6 },
      { skill: "Infrastructure as Code", pros: 163, penetration: 23.3, growth: 98.8 },
      { skill: "Distributed Systems", pros: 204, penetration: 29.1, growth: 45.2 },
      { skill: "Solution Architecture", pros: 140, penetration: 20.0, growth: 164.2 },
      { skill: "Large Language Models", pros: 70, penetration: 10.0, growth: 94.4 }
    ],
    competitors: [
      { company: "Meta", headcount: 29, growth: -9.4, vp: "Scale & Compensation. Highest RSU packages, 'Move Fast' mantra.", weakness: "Burnout: PSC-driven culture, toxic stack-ranking, 'Silos of Toxicity'", action: "Target E5/E6 engineers trapped in legacy bespoke systems", opp: 8.5, threat: 7.0 },
      { company: "Google", headcount: 22, growth: 5.2, vp: "Innovation & Stability. Prestige and massive benefits.", weakness: "Bureaucracy: Slow promotions to Staff (L6), design-doc loops", action: "Target L5 engineers ready for Staff but blocked by red tape", opp: 6.5, threat: 8.0 },
      { company: "JPMorganChase", headcount: 15, growth: 50.0, vp: "Complexity & Domain Power. AI for high-stakes finance.", weakness: "Rigid corporate hierarchies, legacy modernisation fatigue", action: "Target engineers seeking 'Work with Soul' and modern stacks", opp: 5.0, threat: 8.5 },
      { company: "AWS", headcount: 18, growth: -16.7, vp: "Infrastructure Dominance. Backbone of the internet.", weakness: "Toil: High on-call burden, extreme frugality-driven debt", action: "Target SDE3s seeking to move from plumbing to product", opp: 8.0, threat: 5.5 },
      { company: "Monzo/Wise", headcount: 12, growth: 8.3, vp: "Modern Tech & Product Brand. Cool London fintech vibe.", weakness: "High accountability for profitability, IPO-driven burnout risk", action: "Target architects wanting EdTech mission over fintech pressure", opp: 6.0, threat: 6.5 },
      { company: "Google DeepMind", headcount: 10, growth: 66.7, vp: "Research prestige. Cutting-edge AI research + engineering.", weakness: "Lacks direct product-to-user feedback loop", action: "Emphasise Multiverse's direct learner impact vs pure research", opp: 3.5, threat: 9.0 },
      { company: "Duffel", headcount: 6, growth: 15.0, vp: "API-first travel stack. Rebuilding core travel infrastructure.", weakness: "Small domain niche (travel APIs), limited mission breadth", action: "Highlight Multiverse's broader social impact and AI-native stack", opp: 7.0, threat: 4.0 },
      { company: "Apple", headcount: 7, growth: 75.0, vp: "Prestige & Privacy. On-device AI and consumer hardware.", weakness: "Secretive culture prevents open-source community engagement", action: "Target engineers wanting open collaboration & mission impact", opp: 4.0, threat: 6.0 }
    ],
    risks: [
      { category: "Compensation Ceiling", severity: "High", detail: "Elite 14.3% receive competing offers from JPMorgan (\u00a3207k+) and Meta. Wise Principal banding reaches \u00a3199k base + RSUs." },
      { category: "Pipeline Bottleneck", severity: "High", detail: "Only 1.6 qualified professionals per posting (vs 4.2 in regional hubs). TAM of 701 collapses to 100 elite." },
      { category: "Hybrid Expectation Gap", severity: "Medium", detail: "81% of London tech professionals expect flexible work and often require 20%+ salary uplift for full office mandates." },
      { category: "Interview Friction", severity: "High", detail: "Staff candidates increasingly reject generic LeetCode loops; interview process quality directly impacts acceptance and dropout rates." }
    ],
    opportunities: [
      { category: "Big Tech Exodus", severity: "High", detail: "Meta (-9.4%), AWS (-16.7%), Personio (-20%) haemorrhaging Staff talent. These engineers have distributed systems DNA but suffer organisational exhaustion." },
      { category: "Platform Orchestration Shift", severity: "High", detail: "The market is shifting from feature builders to platform orchestrators (Solution Architecture +164.2%, IaC +98.8%), aligning tightly with Staff expectations." },
      { category: "Ownership Gap", severity: "High", detail: "Staff Engineers architect systems for 22,000+ apprentices \u2014 direct code-to-social-mobility link vs tweaking ad-ranking algorithms at Big Tech." },
      { category: "Gender Diversity Edge", severity: "Medium", detail: "Only 11% female at Staff level. Elite female engineers prioritise psychological safety and inclusive collaboration \u2014 Multiverse\u2019s core EVP pillars." }
    ],
    evpGaps: [
      { gap: "Ownership Gap", detail: "Architect learner journey for 22,000+ apprentices vs tweaking ad-ranking algorithms at Big Tech" },
      { gap: "Platform Orchestration Shift", detail: "London hiring has moved to orchestration capability: Solution Architecture +164.2% and Infrastructure as Code +98.8% growth." },
      { gap: "AI Implementation Gap", detail: "AI Native delivery (AI Grading, Atlas productionised) vs AI Explorer cohorts where implementation remains mostly experimental." },
      { gap: "Donor Conversion Window", detail: "Meta and AWS outflow is a timed conversion opportunity for distributed-systems engineers seeking impact and less operational toil." },
      { gap: "Hybrid Flexibility Edge", detail: "81% of tech professionals now treat flexible work as non-negotiable, making a credible hybrid model a decisive offer-stage lever." }
    ],
    sources: [
      { source: "LinkedIn Talent Intelligence", reports: 9, desc: "Talent pool baseline and employer-flow signal for London Staff+ hiring.", url: "https://business.linkedin.com/talent-solutions/talent-intelligence" },
      { source: "Multiverse Internal Inputs", reports: 4, desc: "Role, EVP, and delivery context from internal-facing materials.", url: "https://www.multiverse.io/en-GB/blog/multiverse-s-playbook-for-creating-a-culture-of-experimentation" },
      { source: "Market & Compensation Benchmarks", reports: 12, desc: "External salary and hiring trend benchmarks for offer calibration.", url: "https://www.roberthalf.com/gb/en/insights/salary-guide/technology" },
      { source: "Community & Sentiment Signals", reports: 11, desc: "Practitioner sentiment used to validate culture and attrition patterns.", url: "https://www.reddit.com/r/ExperiencedDevs/comments/t0ilqg/is_the_wlb_and_psc_culture_at_meta_as_bad_as_some/" },
      { source: "Full Works Cited Corpus", reports: 47, desc: "Complete citation list for traceability and review.", url: "#works-cited-list" }
    ],
    methodology: [
      "TAM of 701 validated via core boolean: Python + AWS + AI experience in London Area at Staff+ seniority",
      "Elite pool (100) filtered by: LLM/GenAI + Platform/Product Engineering + Distributed Systems",
      "Skill Density Index: cohort_skills / total_pool = 100 / 701 = 14.3%",
      "Hiring Difficulty Score (9/10): composite of supply/demand ratio (1.6:1), median TTH (31 days), pool concentration",
      "Salary ranges derived from Staff+ Salary Banding Research and London market benchmarks for 2026 role calibration",
      "Competitor analysis triangulated with LTI employer flow and practitioner sentiment from community sources",
      "Traceability expanded with full Works Cited entries parsed from the Talent Blueprint source document"
    ],
    worksCited: [
      "Density - Staff Engineer - Multi (1).xlsx",
      "Multiverse's playbook for creating a culture of experimentation, accessed on March 5, 2026, https://www.multiverse.io/en-GB/blog/multiverse-s-playbook-for-creating-a-culture-of-experimentation",
      "Meta vs Google Offer - Which Should I Join for Long-Term Growth? : r/leetcode - Reddit, accessed on March 5, 2026, https://www.reddit.com/r/leetcode/comments/1kdyhol/meta_vs_google_offer_which_should_i_join_for/",
      "Hire Software Developers in London - Market trends and insights - Agency Partners, accessed on March 5, 2026, https://agency-partners.com/reports/market-insights/united-kingdom-london-software",
      "Staff Software Engineer - Product Fundamentals @ Multiverse ..., accessed on March 5, 2026, https://jobs.generalcatalyst.com/companies/multiverse/jobs/68294215-staff-software-engineer-product-fundamentals",
      "Facebook London wlb and Pip culture : r/cscareerquestionsEU - Reddit, accessed on March 5, 2026, https://www.reddit.com/r/cscareerquestionsEU/comments/q984je/facebook_london_wlb_and_pip_culture/",
      "JPMorgan Engineering Pay: What you'll earn as an analyst, associate and VP, accessed on March 5, 2026, https://www.efinancialcareers.com/news/tech-pay-jpmorgan-software-engineer",
      "AboutTheData: Hiring difficulty - Salesforce, accessed on March 5, 2026, https://talentneuron.my.site.com/Support/s/article/AboutTheData-Hiring-difficulty?nocache=https%3A%2F%2Ftalentneuron.my.site.com%2FSupport%2Fs%2Farticle%2FAboutTheData-Hiring-difficulty",
      "Is Meta WLB that bad in UK? : r/cscareerquestionsuk - Reddit, accessed on March 5, 2026, https://www.reddit.com/r/cscareerquestionsuk/comments/1cdnxqz/is_meta_wlb_that_bad_in_uk/",
      "Questions about working at Meta : r/womenintech - Reddit, accessed on March 5, 2026, https://www.reddit.com/r/womenintech/comments/1kghvoh/questions_about_working_at_meta/",
      "Is the WLB and PSC culture at Meta as bad as some make it out to be? - Reddit, accessed on March 5, 2026, https://www.reddit.com/r/ExperiencedDevs/comments/t0ilqg/is_the_wlb_and_psc_culture_at_meta_as_bad_as_some/",
      "10 Best Companies for Software Engineers in 2026 - Crossover, accessed on March 5, 2026, https://www.crossover.com/resources/10-best-companies-for-software-engineers-in-2026",
      "OpenAI to make London its largest research hub outside US - Business Matters, accessed on March 5, 2026, https://bmmagazine.co.uk/news/openai-london-largest-research-hub-outside-us/",
      "Inspiring Employee Value Proposition Examples - FutureCode IT Consulting, accessed on March 5, 2026, https://future-code.dev/en/blog/inspiring-employee-value-proposition-examples",
      "Google vs Meta in 2025: Salary, Culture, Interviews, and Career ..., accessed on March 5, 2026, https://blog.stackademic.com/google-vs-meta-in-2025-salary-culture-interviews-and-career-growth-compared-5295b62b948c",
      "Is the WLB and PSC culture at Meta as bad as some make it out to be? - Reddit, accessed on March 5, 2026, https://www.reddit.com/r/cscareerquestions/comments/t0fr6u/is_the_wlb_and_psc_culture_at_meta_as_bad_as_some/",
      "The Best Employee Value Proposition Examples - Seenit, accessed on March 5, 2026, https://www.seenit.io/resources/blog/the-best-employee-value-proposition-examples",
      "Do staff engineers at Meta or Google like companies have more knowledge than people with Postdocs ? : r/cscareerquestions - Reddit, accessed on March 5, 2026, https://www.reddit.com/r/cscareerquestions/comments/1r0s12p/do_staff_engineers_at_meta_or_google_like/",
      "The AI skills gap in financial services | Multiverse, accessed on March 5, 2026, https://www.multiverse.io/en-GB/blog/finserv-ai-skills-gap",
      "Capital Markets Tech Talent Gap: Senior Engineers in 2026 - EC1 Partners, accessed on March 5, 2026, https://ec1partners.com/blog/capital-markets-tech-talent-gap-2026/",
      "London Salaries 2026 | $107k-$5.9M - 6figr.com, accessed on March 5, 2026, https://6figr.com/us/salary/london--l",
      "Staff Software Engineer in London at Multiverse | Apply now ..., accessed on March 5, 2026, https://talents.studysmarter.co.uk/companies/multiverse/london/staff-software-engineer-28279769/",
      "Staff AI Engineer (Systems), Remote Job, February 2026 - Dynamite Jobs, accessed on March 5, 2026, https://dynamitejobs.com/company/strike/remote-job/staff-ai-engineer-systems",
      "Hiring Software Engineers at Scale in 2026: How Enterprises Are Solving Talent Shortages Without Slowing Delivery - AIQU, accessed on March 5, 2026, https://aiqusearch.com/blog/hiring-software-engineers-at-scale-in-2026-how-enterprises-are-solving-talent-shortages-without-slowing-delivery",
      "UK Labour Market Insights - February 2026 Trends - Redline Group, accessed on March 5, 2026, https://www.redlinegroup.com/insight-details/uk-labour-market-insights-february-2026",
      "Multiverse Losses Widen to £63.3m in 2025 Despite 36% Revenue Growth - IndexBox, accessed on March 5, 2026, https://www.indexbox.io/blog/multiverse-losses-widen-to-633m-in-2025-despite-36-revenue-growth/",
      "Multiverse | Upskilling platform for AI and tech adoption, accessed on March 5, 2026, https://www.multiverse.io/en-GB",
      "Recruitment forecasts for 2026 - what it means for Defence Technology, Engineering, Aviation, Business Support and contractor talent - CBSbutler, accessed on March 5, 2026, https://www.cbsbutler.com/blog/recruitment-forecasts-for-2026-what-it-means-for-defence-technology-engineering-aviation-business-support-contractor-talent-203",
      "Defense Tech Surges 2026: 5 Sectors & Startup Opportunities - YouTube, accessed on March 5, 2026, https://www.youtube.com/shorts/qQbgimeobWY",
      "London's Leading Tech Frontiers: Spotlight on Companies Shaping 2026 - The Codest, accessed on March 5, 2026, https://thecodest.co/en/blog/londons-leading-tech-frontiers-spotlight-on-companies-shaping-2024/",
      "11 of the Most Exciting British Scale-ups to Watch in 2025 - The Business Journal, accessed on March 5, 2026, https://thebusinessjournal.co.uk/tech/fintech-to-greentech-the-11-uk-scale-ups-you-need-to-be-watching/",
      "Capsule Cover | The UK's Top 50 Tech Scale-Ups | Capsule Scale-Up 50 2026, accessed on March 5, 2026, https://capsulecover.com/blog/capsule-scale-up-50-2026?hsLang=en",
      "London drives sharp rebound in UK Fintech hiring - Morgan McKinley, accessed on March 5, 2026, https://www.morganmckinley.com/uk/article/london-drives-sharp-rebound-in-uk-fintech-hiring",
      "Multiverse's playbook for landing AI transformation, accessed on March 5, 2026, https://www.multiverse.io/en-GB/blog/multiverse-s-playbook-for-landing-ai-transformation",
      "The 10 Most In-demand Tech Careers of 2026 | LSE Executive Education, accessed on March 5, 2026, https://www.lse.ac.uk/study-at-lse/executive-education/insights/articles/the-10-most-in-demand-tech-careers-of-2026",
      "Software 2026 trends | Market insights - Harvey Nash, accessed on March 5, 2026, https://www.harveynash.co.uk/latest-news/software-trends-in-the-year-ahead-a-uk-hiring-outlook",
      "Software Engineer yearly salaries in London, England, ENG at JP Morgan - Indeed, accessed on March 5, 2026, https://uk.indeed.com/cmp/J.P.-Morgan-9/salaries/Software-Engineer/London-ENG",
      "Best Software Companies in London UK 2026 - Top IT Firms Reviewed & Ranked - Givni, accessed on March 5, 2026, http://givni.in/blog/best-software-companies-in-london-uk-2025",
      "UK Tech Recruitment Trends to Watch in 2026 - Ntrinsic, accessed on March 5, 2026, https://www.ntrinsicglobal.com/resources/blog/uk-tech-recruitment-trends-to-watch-in-2026/",
      "UK Tech Hiring Outlook 2026: Business Mindsets, Hybrid Pressures & a Return to Contracting | Source Group International - Technology Recruitment & Consulting Specialists, accessed on March 5, 2026, https://www.sourcegroupinternational.com/insights/uk-tech-hiring-outlook-2026/",
      "2026 UK Tech and IT Salary Guide and Survey - Robert Half, accessed on March 5, 2026, https://www.roberthalf.com/gb/en/insights/salary-guide/technology",
      "10 workforce trends tech leaders can't ignore in 2026 | Lorien Insights, accessed on March 5, 2026, https://www.lorienglobal.com/insights/10-workforce-trends-tech-leaders-cant-ignore",
      "Britain's truly got talent: 10 of the most promising early-stage startups to keep an eye on in 2026 - BeBeez, accessed on March 5, 2026, https://bebeez.eu/2026/02/18/britains-truly-got-talent-10-of-the-most-promising-early-stage-startups-to-keep-an-eye-on-in-2026/",
      "State of the industry in 2025 - are we still at mid 2023 levels? : r/ExperiencedDevs - Reddit, accessed on March 5, 2026, https://www.reddit.com/r/ExperiencedDevs/comments/1hwtfxe/state_of_the_industry_in_2025_are_we_still_at_mid/",
      "Solutions | Engineering | Multiverse, accessed on March 5, 2026, https://www.multiverse.io/en-GB/employers/solutions/engineering",
      "Tech \"Talent Wars\" Are Over - 14:00:00 25 Feb 2026 - London Stock Exchange, accessed on March 5, 2026, https://www.londonstockexchange.com/news-article/market-news/tech-talent-wars-are-over/17477015",
      "Looking Ahead: What 2026 Might Hold for Tech Hiring in the UK - Noa Recruitment, accessed on March 5, 2026, https://thisisnoa.com/looking-ahead-what-2026-might-hold-for-tech-hiring-in-the-uk"
    ]
  };

  // ---- COLOR PALETTES ----
  var LIGHT = { accent: "#0EA5E9", accent2: "#06B6D4", purple: "#8B5CF6", amber: "#F59E0B", green: "#10B981", red: "#F43F5E", text: "#0F172A", textMuted: "#64748B", textFaint: "#94A3B8", border: "#E2E8F0", surface: "#FFFFFF" };
  var DARK  = { accent: "#38BDF8", accent2: "#22D3EE", purple: "#A78BFA", amber: "#FBBF24", green: "#34D399", red: "#FB7185", text: "#E2E8F0", textMuted: "#94A3B8", textFaint: "#64748B", border: "#475569", surface: "#1E293B" };
  var THEME_KEY = "ti-theme";
  var theme = "light";
  function C() { return theme === "dark" ? DARK : LIGHT; }

  // ---- THEME ----
  var root = document.documentElement;
  var toggle = document.querySelector("[data-theme-toggle]");
  var toggleIcon = document.querySelector("[data-theme-icon]");
  var toggleLabel = document.querySelector("[data-theme-label]");
  var logoutButton = document.getElementById("logout-button");
  var storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    theme = storedTheme;
  }

  function setThemeToggle(nextTheme) {
    if (toggleIcon) {
      toggleIcon.innerHTML = nextTheme === "dark"
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }

    if (toggleLabel) {
      toggleLabel.textContent = nextTheme === "dark" ? "Light mode" : "Dark mode";
    }

    if (toggle) {
      toggle.setAttribute("aria-label", nextTheme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  function applyTheme(nextTheme, options) {
    var skipRebuild = options && options.skipRebuild;
    theme = nextTheme;
    root.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    setThemeToggle(theme);

    if (!skipRebuild) {
      rebuildCharts();
    }
  }

  applyTheme(theme, { skipRebuild: true });

  if (toggle) {
    toggle.addEventListener("click", function() {
      applyTheme(theme === "dark" ? "light" : "dark");
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", function() {
      fetch("/api/logout", { method: "POST" })
        .finally(function() {
          window.location.href = "/login";
        });
    });
  }

  // ---- TABS ----
  var navBtns = document.querySelectorAll(".nav-item");
  var tabs = document.querySelectorAll(".tab-content");
  var rendered = {};
  var roleFilter = "";
  var pipelineFilter = "";
  var candidateFilter = "";

  function normaliseQuery(value) {
    return String(value || "").trim().toLowerCase();
  }

  function matchesQuery(query, fields) {
    if (!query) return true;
    var haystack = fields.join(" ").toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function emptyRow(colspan, text) {
    return '<tr class="table-empty-row"><td colspan="' + colspan + '">' + text + "</td></tr>";
  }

  navBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      var id = btn.getAttribute("data-tab");
      navBtns.forEach(function(b) { b.classList.remove("active"); });
      tabs.forEach(function(t) { t.classList.remove("active"); });
      btn.classList.add("active");
      document.getElementById("tab-" + id).classList.add("active");
      if (id === "talent" && !rendered.talent) { buildTalentTab(); rendered.talent = true; }
      if (id === "competitors" && !rendered.comp) { buildCompetitorTab(); rendered.comp = true; }
      if (id === "strategy" && !rendered.strat) { buildStrategyTab(); rendered.strat = true; }
      if (id === "sources" && !rendered.src) { buildSourcesTab(); rendered.src = true; }
    });
  });

  function initElasticSearch() {
    var controls = document.querySelectorAll("[data-elastic-search]");

    controls.forEach(function(control) {
      var input = control.querySelector("input[type='search']");
      var toggleButton = control.querySelector("[data-search-toggle]");
      var clearButton = control.querySelector("[data-search-clear]");

      function setExpanded(nextExpanded) {
        control.setAttribute("data-expanded", nextExpanded ? "true" : "false");
      }

      function syncValueState() {
        control.setAttribute("data-has-value", input && input.value ? "true" : "false");
      }

      if (toggleButton && input) {
        toggleButton.addEventListener("click", function() {
          setExpanded(true);
          input.focus();
        });
      }

      if (input) {
        input.addEventListener("focus", function() {
          setExpanded(true);
        });

        input.addEventListener("blur", function() {
          if (!input.value.trim()) {
            setExpanded(false);
          }
        });

        input.addEventListener("input", function() {
          syncValueState();
        });
      }

      if (clearButton && input) {
        clearButton.addEventListener("click", function() {
          input.value = "";
          input.dispatchEvent(new Event("input", { bubbles: true }));
          syncValueState();
          input.focus();
        });
      }

      syncValueState();
    });
  }

  function bindSearchInputs() {
    var roleSearchInput = document.querySelector("[data-role-search]");
    var pipelineSearchInput = document.querySelector("[data-pipeline-search]");
    var candidateSearchInput = document.querySelector("[data-candidate-search]");

    if (roleSearchInput) {
      roleSearchInput.addEventListener("input", function() {
        roleFilter = normaliseQuery(roleSearchInput.value);
        buildSalaryTable();
      });
    }

    if (pipelineSearchInput) {
      pipelineSearchInput.addEventListener("input", function() {
        pipelineFilter = normaliseQuery(pipelineSearchInput.value);
        buildPipelineTable();
      });
    }

    if (candidateSearchInput) {
      candidateSearchInput.addEventListener("input", function() {
        candidateFilter = normaliseQuery(candidateSearchInput.value);
        buildCandidateTable();
      });
    }
  }

  // ---- CHART STORE ----
  var charts = {};
  function kill(k) { if (charts[k]) { charts[k].destroy(); delete charts[k]; } }

  // ---- SALARY TAB ----

  // Mandate descriptions from research doc
  var MANDATES = [
    "Technical leadership within a domain; mentor to senior ICs. Cross-team architectural alignment.",
    "Department-wide technical strategy; alignment of multiple roadmaps. Strategic driver for CTO.",
    "Company-wide engineering strategy; \"Force Multiplier\" for entire org. Right-hand to CTO."
  ];
  var LEVEL_CLASSES = ["junior", "mid", "senior"];
  var LEVEL_TIERS = ["Tier 1", "Tier 2", "Tier 3"];

  function fmtK(v) { return "\u00a3" + Math.round(v / 1000) + "k"; }
  function fmtFull(v) { return "\u00a3" + v.toLocaleString(); }

  function buildLevelCards() {
    var el = document.getElementById("level-cards");
    if (!el) return;
    var maxTC = 600000; // scale bar relative to highest P75
    el.innerHTML = DATA.salaryRoles.map(function(r, i) {
      var cls = LEVEL_CLASSES[i];
      var tier = LEVEL_TIERS[i];
      var colors = ["var(--color-positive)", "var(--color-accent)", "var(--chart-3)"];
      var barColor = colors[i];
      function pct(lo, hi) {
        var left = Math.round((lo / maxTC) * 100);
        var width = Math.round(((hi - lo) / maxTC) * 100);
        return "left:" + left + "%;width:" + width + "%";
      }
      return '<div class="level-card level-card--' + cls + '">' +
        '<span class="level-card-tier">' + tier + '</span>' +
        '<div class="level-card-title">' + r.role + '</div>' +
        '<div class="level-card-base">' +
          '<span class="level-card-base-value">' + fmtFull(r.baseP50) + '</span>' +
          '<span class="level-card-base-label">base median</span>' +
        '</div>' +
        '<div class="level-card-ranges">' +
          '<div class="level-range-row">' +
            '<span class="level-range-label">P25</span>' +
            '<div class="level-range-bar"><div class="level-range-fill" style="' + pct(r.tcP25Lo, r.tcP25Hi) + ';background:' + barColor + ';opacity:0.5"></div></div>' +
            '<span class="level-range-value">' + fmtK(r.tcP25Lo) + ' \u2013 ' + fmtK(r.tcP25Hi) + '</span>' +
          '</div>' +
          '<div class="level-range-row">' +
            '<span class="level-range-label">P50</span>' +
            '<div class="level-range-bar"><div class="level-range-fill" style="' + pct(r.tcP50Lo, r.tcP50Hi) + ';background:' + barColor + ';opacity:0.75"></div></div>' +
            '<span class="level-range-value">' + fmtK(r.tcP50Lo) + ' \u2013 ' + fmtK(r.tcP50Hi) + '</span>' +
          '</div>' +
          '<div class="level-range-row">' +
            '<span class="level-range-label">P75</span>' +
            '<div class="level-range-bar"><div class="level-range-fill" style="' + pct(r.tcP75Lo, r.tcP75Hi) + ';background:' + barColor + '"></div></div>' +
            '<span class="level-range-value">' + fmtK(r.tcP75Lo) + ' \u2013 ' + fmtK(r.tcP75Hi) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="level-card-mandate">' + MANDATES[i] + '</div>' +
      '</div>';
    }).join("");
  }

  function buildSalaryChart() {
    kill("salary");
    var c = C();
    // Per-level colors: cyan for Foundational, blue for Senior, purple for Principal
    var levelColors = [c.green, c.accent, c.purple];
    // Build 3 datasets (one per level), each with 3 data points (P25, P50, P75 ranges)
    var datasets = DATA.salaryRoles.map(function(r, i) {
      return {
        label: r.role,
        data: [[r.tcP25Lo, r.tcP25Hi], [r.tcP50Lo, r.tcP50Hi], [r.tcP75Lo, r.tcP75Hi]],
        backgroundColor: levelColors[i] + "CC",
        borderColor: levelColors[i],
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      };
    });
    charts.salary = new Chart(document.getElementById("salaryChart"), {
      type: "bar",
      data: {
        labels: ["P25", "P50 (Median)", "P75"],
        datasets: datasets
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 800 },
        plugins: {
          legend: { position: "top", labels: { color: c.textMuted, font: { size: 11 }, usePointStyle: true, padding: 16 } },
          tooltip: { callbacks: { label: function(ctx){ var v=ctx.raw; return ctx.dataset.label+": \u00a3"+v[0].toLocaleString()+" \u2013 \u00a3"+v[1].toLocaleString(); } } },
          datalabels: { display: true, color: c.text, font: { size: 10, weight: "600", family: "Figtree,sans-serif" }, anchor: "end", align: "top", formatter: function(v){ return "\u00a3"+Math.round(v[0]/1000)+"k\u2013"+Math.round(v[1]/1000)+"k"; } }
        },
        scales: {
          x: { ticks: { color: c.textMuted, font: { size: 12, weight: "600" } }, grid: { display: false } },
          y: { ticks: { color: c.textFaint, font: { size: 10 }, callback: function(v){ return "\u00a3"+Math.round(v/1000)+"k"; } }, grid: { color: c.border+"44" }, beginAtZero: true }
        }
      }
    });
  }

  function buildArbitrageChart() {
    kill("arb");
    var c = C();
    charts.arb = new Chart(document.getElementById("arbitrageChart"), {
      type: "bar",
      data: {
        labels: DATA.costArbitrage.map(function(r){ return r.region; }),
        datasets: [
          { label: "Median Salary (\u00a3)", data: DATA.costArbitrage.map(function(r){ return r.median; }), backgroundColor: DATA.costArbitrage.map(function(r){ return r.region==="London"?c.amber:c.accent; }), borderRadius: 4, yAxisID: "y" },
          { label: "Supply/Demand Ratio", data: DATA.costArbitrage.map(function(r){ return r.ratio; }), type: "line", borderColor: c.green, pointBackgroundColor: c.green, pointRadius: 5, fill: false, tension: 0.3, yAxisID: "y1" }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "top", labels: { color: c.textMuted, font: { size: 11 }, usePointStyle: true, padding: 16 } },
          datalabels: { display: true, color: c.text, font: { size: 10, weight: "600", family: "Figtree,sans-serif" }, anchor: "end", align: "top", formatter: function(v, ctx){ if(ctx.datasetIndex===0) return "\u00a3"+Math.round(v/1000)+"k"; return v+":1"; } }
        },
        scales: {
          x: { ticks: { color: c.textMuted }, grid: { display: false } },
          y: { position: "left", ticks: { color: c.textFaint, callback: function(v){ return "\u00a3"+Math.round(v/1000)+"k"; } }, grid: { color: c.border+"44" }, beginAtZero: true },
          y1: { position: "right", ticks: { color: c.green, callback: function(v){ return v+":1"; } }, grid: { display: false }, beginAtZero: true }
        }
      }
    });
  }

  function buildSalaryTable() {
    var tb = document.getElementById("salary-table-body");
    if (!tb) return;
    var rows = DATA.salaryRoles.filter(function(r) {
      return matchesQuery(roleFilter, [r.role, r.sector]);
    });

    if (!rows.length) {
      tb.innerHTML = emptyRow(7, "No roles match this search.");
      return;
    }

    tb.innerHTML = rows.map(function(r){
      return "<tr><td><strong>"+r.role+"</strong><br><span style='font-size:11px;color:var(--color-text-muted)'>"+r.sector+"</span></td><td>\u00a3"+r.baseP25.toLocaleString()+"</td><td>\u00a3"+r.baseP50.toLocaleString()+"</td><td>\u00a3"+r.baseP75.toLocaleString()+"</td><td>\u00a3"+r.tcP25Lo.toLocaleString()+" \u2013 \u00a3"+r.tcP25Hi.toLocaleString()+"</td><td>\u00a3"+r.tcP50Lo.toLocaleString()+" \u2013 \u00a3"+r.tcP50Hi.toLocaleString()+"</td><td>\u00a3"+r.tcP75Lo.toLocaleString()+" \u2013 \u00a3"+r.tcP75Hi.toLocaleString()+"</td></tr>";
    }).join("");
  }

  // Toggle
  document.getElementById("btn-comp").addEventListener("click", function(){
    this.classList.add("active"); document.getElementById("btn-arb").classList.remove("active");
    document.getElementById("salary-chart-wrap").classList.remove("hidden");
    document.getElementById("arbitrage-chart-wrap").classList.add("hidden");
  });
  document.getElementById("btn-arb").addEventListener("click", function(){
    this.classList.add("active"); document.getElementById("btn-comp").classList.remove("active");
    document.getElementById("arbitrage-chart-wrap").classList.remove("hidden");
    document.getElementById("salary-chart-wrap").classList.add("hidden");
    if (!charts.arb) buildArbitrageChart();
  });

  // ---- TALENT TAB ----
  function buildTalentTab() {
    buildSankey();
    buildPoolDonut();
    buildSkillsChart();
    buildPipelineTable();
  }

  function buildSankey() {
    var c = C();
    var el = document.getElementById("sankey"); el.innerHTML = "";
    var w = el.clientWidth || 700, h = 320;
    var svg = d3.select("#sankey").append("svg").attr("width", w).attr("height", h);
    var sk = d3.sankey().nodeWidth(18).nodePadding(24).nodeAlign(d3.sankeyJustify).extent([[140,20],[w-120,h-20]]);
    var graph = sk({
      nodes: [{name:"Meta (29)"},{name:"AWS (18)"},{name:"Personio (8)"},{name:"Talent Pool"},{name:"JPMorgan (15)"},{name:"DeepMind (10)"},{name:"Apple (7)"}].map(function(d){return Object.assign({},d);}),
      links: [{source:0,target:3,value:29},{source:1,target:3,value:18},{source:2,target:3,value:8},{source:3,target:4,value:15},{source:3,target:5,value:10},{source:3,target:6,value:7}].map(function(d){return Object.assign({},d);})
    });
    var dc=["#F43F5E","#FB923C","#F59E0B"], gc=[c.accent,c.green,c.accent2];
    svg.append("g").selectAll("path").data(graph.links).join("path").attr("d",d3.sankeyLinkHorizontal()).attr("fill","none").attr("stroke",function(d){return d.source.index<=2?dc[d.source.index]:gc[d.target.index-4];}).attr("stroke-opacity",0.4).attr("stroke-width",function(d){return Math.max(2,d.width);});
    svg.append("g").selectAll("rect").data(graph.nodes).join("rect").attr("x",function(d){return d.x0;}).attr("y",function(d){return d.y0;}).attr("height",function(d){return Math.max(1,d.y1-d.y0);}).attr("width",function(d){return d.x1-d.x0;}).attr("fill",function(d){return d.index<=2?dc[d.index]:d.index===3?c.accent:gc[d.index-4];}).attr("rx",3);
    svg.append("g").selectAll("text").data(graph.nodes).join("text").attr("x",function(d){return d.index<=2?d.x0-8:d.x1+8;}).attr("y",function(d){return(d.y0+d.y1)/2;}).attr("dy","0.35em").attr("text-anchor",function(d){return d.index<=2?"end":"start";}).text(function(d){return d.name;}).attr("fill",c.text).style("font-size","12px").style("font-family","Figtree,sans-serif").style("font-weight","600");
  }

  function buildPoolDonut() {
    kill("donut");
    var c = C();
    charts.donut = new Chart(document.getElementById("poolDonut"), {
      type: "doughnut",
      data: { labels: DATA.poolDistribution.map(function(d){return d.label+" ("+d.pct+"%)";}), datasets: [{ data: DATA.poolDistribution.map(function(d){return d.pct;}), backgroundColor: [c.accent,c.amber,c.green], borderColor: c.surface, borderWidth: 3 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: "65%", plugins: { legend: { position: "bottom", labels: { color: c.textMuted, font: { size: 11 }, usePointStyle: true, padding: 12 } },
        datalabels: { display: true, color: c.text, font: { size: 12, weight: "700", family: "Figtree,sans-serif" }, formatter: function(v){ return v+"%"; } }
      } }
    });
  }

  function buildSkillsChart() {
    kill("skills");
    var c = C();
    charts.skills = new Chart(document.getElementById("skillsChart"), {
      type: "bar",
      data: {
        labels: DATA.skills.map(function(s){return s.skill;}),
        datasets: [
          { label: "Penetration %", data: DATA.skills.map(function(s){return s.penetration;}), backgroundColor: c.accent+"88", borderColor: c.accent, borderWidth: 1, borderRadius: 3, yAxisID: "y" },
          { label: "YoY Growth %", data: DATA.skills.map(function(s){return s.growth;}), type: "line", borderColor: c.green, pointBackgroundColor: c.green, pointRadius: 4, tension: 0.3, yAxisID: "y1" }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "top", labels: { color: c.textMuted, font: { size: 11 }, usePointStyle: true, padding: 12 } },
          tooltip: { callbacks: { afterBody: function(items){ return "Headcount: "+DATA.skills[items[0].dataIndex].pros; } } },
          datalabels: { display: true, color: c.text, font: { size: 9, weight: "600", family: "Figtree,sans-serif" }, anchor: "end", align: "top", formatter: function(v, ctx){ if(ctx.datasetIndex===0) return v+"%"; return "+"+v+"%"; } }
        },
        scales: {
          x: { ticks: { color: c.textMuted, font: { size: 9 }, maxRotation: 35 }, grid: { display: false } },
          y: { ticks: { color: c.textFaint, callback: function(v){return v+"%";} }, grid: { color: c.border+"33" } },
          y1: { position: "right", ticks: { color: c.green, callback: function(v){return "+"+v+"%";} }, grid: { display: false } }
        }
      }
    });
  }

  function getPipelineRows() {
    var donors = DATA.donors.map(function(d) {
      return { stage: "Donor", company: d.company, headcount: d.headcount, growth: d.growth, context: d.reason };
    });
    var gainers = DATA.gainers.map(function(g) {
      return { stage: "Gainer", company: g.company, headcount: g.headcount, growth: g.growth, context: g.reason };
    });

    return donors.concat(gainers);
  }

  function buildPipelineTable() {
    var tb = document.getElementById("pipeline-table-body");
    if (!tb) return;

    var rows = getPipelineRows().filter(function(row) {
      return matchesQuery(pipelineFilter, [row.stage, row.company, row.context, row.growth]);
    });

    if (!rows.length) {
      tb.innerHTML = emptyRow(5, "No pipeline rows match this search.");
      return;
    }

    tb.innerHTML = rows.map(function(row) {
      var growth = row.growth > 0 ? "+" + row.growth : String(row.growth);
      return "<tr><td><strong>" + row.stage + "</strong></td><td>" + row.company + "</td><td>" + row.headcount + "</td><td>" + growth + "%</td><td>" + row.context + "</td></tr>";
    }).join("");
  }

  // ---- COMPETITOR TAB ----
  function buildCompetitorTab() {
    buildScatter();
    buildCandidateTable();
  }

  function buildScatter() {
    kill("scatter");
    var c = C();
    var pts = DATA.competitors.map(function(comp){ return { x: comp.opp, y: comp.threat, r: Math.max(7,Math.sqrt(comp.headcount)*3.5), company: comp.company, headcount: comp.headcount, growth: comp.growth }; });
    charts.scatter = new Chart(document.getElementById("scatterChart"), {
      type: "bubble",
      data: { datasets: [{ data: pts, backgroundColor: pts.map(function(p){ return p.growth<0?c.red+"AA":p.growth>30?c.green+"AA":c.accent+"AA"; }), borderColor: pts.map(function(p){ return p.growth<0?c.red:p.growth>30?c.green:c.accent; }), borderWidth: 2 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { title: function(i){return i[0].raw.company;}, label: function(i){ var p=i.raw; return ["Opportunity: "+p.x+"/10","Threat: "+p.y+"/10","Headcount: "+p.headcount,"Growth: "+(p.growth>0?"+":"")+p.growth+"%"]; } } },
          datalabels: { display: false }
        },
        scales: {
          x: { title: { display: true, text: "Opportunity Score \u2192", color: c.textMuted, font: { weight: "bold" } }, ticks: { color: c.textFaint }, grid: { color: c.border+"22" }, min: 2, max: 10 },
          y: { title: { display: true, text: "\u2190 Threat Score", color: c.textMuted, font: { weight: "bold" } }, ticks: { color: c.textFaint }, grid: { color: c.border+"22" }, min: 3, max: 10 }
        }
      },
      plugins: [{
        id: "quad",
        beforeDraw: function(chart) {
          var a = chart.chartArea;
          var cx = chart.ctx;
          if (!a) return;
          var g = cx.createLinearGradient(a.left, a.top, a.right, a.bottom);
          g.addColorStop(0, c.accent + "10");
          g.addColorStop(1, c.accent2 + "08");
          cx.save();
          cx.fillStyle = g;
          cx.fillRect(a.left, a.top, a.right - a.left, a.bottom - a.top);
          cx.restore();
        },
        beforeDatasetsDraw: function(chart) {
          var a=chart.chartArea, cx=chart.ctx, mx=(a.left+a.right)/2, my=(a.top+a.bottom)/2;
          var depth = 12;
          var steps = 6;
          var i;
          cx.save();
          cx.strokeStyle = c.border + "6B";
          cx.lineWidth = 1;
          for (i = 0; i <= steps; i++) {
            var y = a.top + (a.bottom - a.top) * (i / steps);
            var lift = depth * (1 - i / steps);
            cx.beginPath();
            cx.moveTo(a.left + lift, y - lift);
            cx.lineTo(a.right + lift, y - lift);
            cx.stroke();
            cx.beginPath();
            cx.moveTo(a.left, y);
            cx.lineTo(a.left + lift, y - lift);
            cx.moveTo(a.right, y);
            cx.lineTo(a.right + lift, y - lift);
            cx.stroke();
          }
          cx.beginPath();
          cx.moveTo(a.left + depth, a.top - depth);
          cx.lineTo(a.right + depth, a.top - depth);
          cx.lineTo(a.right, a.top);
          cx.lineTo(a.left, a.top);
          cx.closePath();
          cx.stroke();
          cx.strokeStyle=c.border+"78";
          cx.setLineDash([4,4]);
          cx.beginPath();
          cx.moveTo(mx,a.top);
          cx.lineTo(mx,a.bottom);
          cx.stroke();
          cx.beginPath();
          cx.moveTo(a.left,my);
          cx.lineTo(a.right,my);
          cx.stroke();
          cx.setLineDash([]);
          cx.restore();
        },
        afterDatasetsDraw: function(chart) {
          var a=chart.chartArea, cx=chart.ctx, mx=(a.left+a.right)/2;
          cx.save();
          cx.font="600 10px Figtree,sans-serif";
          cx.fillStyle=c.textFaint;
          cx.textAlign="center";
          cx.fillText("Low Opp / High Threat",(a.left+mx)/2,a.top+16);
          cx.fillText("High Opp / High Threat",(mx+a.right)/2,a.top+16);
          cx.fillText("Low Opp / Low Threat",(a.left+mx)/2,a.bottom-8);
          cx.fillText("High Opp / Low Threat",(mx+a.right)/2,a.bottom-8);
          chart.data.datasets[0].data.forEach(function(p,i){ var m=chart.getDatasetMeta(0).data[i]; if(m){ cx.font="600 10px Figtree,sans-serif"; cx.fillStyle=c.text; cx.textAlign="center"; cx.fillText(p.company,m.x,m.y-p.r-4); } });
          cx.restore();
        }
      }]
    });
  }

  function buildCandidateTable() {
    var tb = document.getElementById("candidate-table-body");
    if (!tb) return;

    var rows = DATA.competitors.filter(function(comp) {
      return matchesQuery(candidateFilter, [comp.company, comp.vp, comp.weakness, comp.action, comp.growth, comp.opp, comp.threat]);
    });

    if (!rows.length) {
      tb.innerHTML = emptyRow(6, "No candidates match this search.");
      return;
    }

    tb.innerHTML = rows.map(function(comp) {
      var growth = comp.growth > 0 ? "+" + comp.growth : String(comp.growth);
      return "<tr><td><strong>" + comp.company + "</strong><br><span style='font-size:11px;color:var(--color-text-muted)'>" + comp.vp + "</span></td><td>" + comp.headcount + "</td><td>" + growth + "%</td><td>" + comp.opp + "/10</td><td>" + comp.threat + "/10</td><td>" + comp.action + "</td></tr>";
    }).join("");
  }

  // ---- STRATEGY TAB ----
  function buildStrategyTab() {
    document.getElementById("risk-cards").innerHTML = DATA.risks.map(function(r){
      var bc=r.severity==="High"?"badge--high":"badge--medium";
      return '<div class="strat-card risk-card"><div class="strat-card-header"><span class="strat-card-title">'+r.category+'</span><span class="kpi-badge '+bc+'">'+r.severity+'</span></div><div class="strat-card-detail">'+r.detail+'</div></div>';
    }).join("");
    document.getElementById("opp-cards").innerHTML = DATA.opportunities.map(function(o){
      var bs=o.severity==="High"?"background:rgba(16,185,129,0.1);color:#10B981":"background:rgba(245,158,11,0.1);color:#F59E0B";
      return '<div class="strat-card opp-card"><div class="strat-card-header"><span class="strat-card-title">'+o.category+'</span><span class="kpi-badge" style="'+bs+'">'+o.severity+'</span></div><div class="strat-card-detail">'+o.detail+'</div></div>';
    }).join("");
    document.getElementById("evp-cards").innerHTML = DATA.evpGaps.map(function(g){
      return '<div class="evp-card"><div class="evp-card-title">'+g.gap+'</div><div class="evp-card-text">'+g.detail+'</div></div>';
    }).join("");
  }

  function formatWorksCitedEntry(ref) {
    var raw = String(ref || "");
    var clean = raw.replace(/\s*,?\s*accessed on [^,]+,\s*/i, ", ").replace(/\s{2,}/g, " ").trim();
    var urlMatch = raw.match(/https?:\/\/\S+/);
    if (!urlMatch) return clean;
    var href = urlMatch[0].replace(/[),.;]+$/, "");
    var pre = clean.slice(0, clean.indexOf(urlMatch[0])).replace(/[,\s]+$/, "");
    return pre + ' <a href="' + href + '" target="_blank" rel="noopener noreferrer">Source</a>';
  }

  // ---- SOURCES TAB ----
  function buildSourcesTab() {
    document.getElementById("source-cards").innerHTML = DATA.sources.map(function(s){
      var descLink = "";
      if (s.url) {
        descLink = s.url.charAt(0) === "#"
          ? ' <a class="source-inline-link" href="' + s.url + '">Source</a>'
          : ' <a class="source-inline-link" href="' + s.url + '" target="_blank" rel="noopener noreferrer">Source</a>';
      }
      return '<div class="source-card"><div class="source-card-count">'+s.reports+'</div><div class="source-card-name">'+s.source+'</div><div class="source-card-desc">'+s.desc+descLink+"</div></div>";
    }).join("");
    document.getElementById("method-list").innerHTML = DATA.methodology.map(function(m){ return "<li>"+m+"</li>"; }).join("");
    document.getElementById("works-cited-list").innerHTML = DATA.worksCited.map(function(ref){ return "<li>"+formatWorksCitedEntry(ref)+"</li>"; }).join("");
  }

  // ---- REBUILD ON THEME CHANGE ----
  function rebuildCharts() {
    buildSalaryChart();
    if (charts.arb) buildArbitrageChart();
    if (rendered.talent) { buildSankey(); buildPoolDonut(); buildSkillsChart(); }
    if (rendered.comp) buildScatter();
  }

  // ---- INIT ----
  initElasticSearch();
  bindSearchInputs();
  buildLevelCards();
  buildSalaryChart();
  buildSalaryTable();
  buildPipelineTable();
  buildCandidateTable();

});
