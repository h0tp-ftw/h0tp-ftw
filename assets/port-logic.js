// ============================================
// CONFIGURATION
// ============================================

const GITHUB_USERNAME = 'h0tp-ftw';
const FEATURED_PROJECTS_COUNT = 6;
const PORTFOLIO_CSV_URL = 'assets/portfolio-returns.csv';

const ROTATING_WORDS = [
    'unpaid',
    'unknown',
    'overworked',
    'broke',
    'caffeinated',
    'sleep-deprived',
    'passionate',
    'dedicated',
];

const PROJECT_LOGOS = {
    'ankimon-trading-tool': 'https://img.icons8.com/fluency/512/bullish.png',
    'ankimon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/2052px-Pok%C3%A9_Ball_icon.svg.png',
    'anki-prettify': 'https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/logos/exports/1544x1544_circle.png',
    'prettify': 'https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/logos/exports/1544x1544_circle.png',
    'anki-vscode': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/512px-Visual_Studio_Code_1.35_icon.svg.png',
    'anki': 'https://images.icon-icons.com/1381/PNG/512/anki_93962.png',
    'api-key-cycler': 'https://em-content.zobj.net/source/apple/354/key_1f511.png',
    'acoustic-engine': 'https://img.icons8.com/fluency/512/speaker.png',
    'alarm': 'https://img.icons8.com/color/512/alarm-clock.png',
    'h0tp-ftw.github.io': 'https://img.icons8.com/color/512/globe--v1.png',
};

// Map GitHub languages to Devicon classes
const LANGUAGE_ICONS = {
    'JavaScript': 'devicon-javascript-plain',
    'TypeScript': 'devicon-typescript-plain',
    'Python': 'devicon-python-plain',
    'HTML': 'devicon-html5-plain',
    'CSS': 'devicon-css3-plain',
    'Java': 'devicon-java-plain',
    'C#': 'devicon-csharp-plain',
    'C++': 'devicon-cplusplus-plain',
    'C': 'devicon-c-plain',
    'Go': 'devicon-go-plain',
    'Rust': 'devicon-rust-plain',
    'PHP': 'devicon-php-plain',
    'Ruby': 'devicon-ruby-plain',
    'Swift': 'devicon-swift-plain',
    'Kotlin': 'devicon-kotlin-plain',
    'Dart': 'devicon-dart-plain',
    'Shell': 'devicon-bash-plain',
    'PowerShell': 'devicon-powershell-plain',
    'Vue': 'devicon-vuejs-plain',
    'React': 'devicon-react-original',
    'Angular': 'devicon-angularjs-plain',
    'Svelte': 'devicon-svelte-plain',
    'Docker': 'devicon-docker-plain',
    'Kubernetes': 'devicon-kubernetes-plain',
    'Lua': 'devicon-lua-plain',
    // Fallback
    'default': 'devicon-github-original'
};

// ============================================
// SCROLL PROGRESS INDICATOR
// ============================================

function updateScrollProgress() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height);

    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        progressBar.style.transform = `scaleX(${scrolled})`;
    }
}

window.addEventListener('scroll', updateScrollProgress);

// ============================================
// UTILITY FUNCTIONS
// ============================================

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ============================================
// SCROLL REVEAL & PARALLAX
// ============================================

const observerOptions = {
    threshold: 0.05,
    rootMargin: '0px 0px -20px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

function initScrollAnimations() {
    // Scroll animations disabled for better performance
    document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .project-card, .person-card').forEach(el => {
        el.classList.add('visible');
    });
}

// Enhanced parallax with multiple layers
// PARALLAX DISABLED FOR PERFORMANCE
// Parallax effects removed to eliminate lag

// ============================================
// THEME TOGGLE
// ============================================

const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'frappe';
html.setAttribute('data-theme', savedTheme);

function updateTogglePosition() {
    const currentTheme = html.getAttribute('data-theme');
    const slider = document.querySelector('.theme-slider');
    if (slider) {
        slider.classList.toggle('light-mode', currentTheme === 'latte');
    }
}

updateTogglePosition();

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'frappe' ? 'latte' : 'frappe';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateTogglePosition();

    // Update chart if exists
    if (window.portfolioChart) {
        updateChartTheme();
    }
});

// ============================================
// FLOATING NAVIGATION WITH SMOOTH SCROLL
// ============================================

const floatingNav = document.getElementById('floating-nav');
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const sectionId = item.dataset.section;
        const section = document.getElementById(sectionId);

        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

function updateActiveNav() {
    const sections = ['hero', 'my-setup', 'featured-projects', 'surprise-section', 'portfolio-performance', 'niche-projects', 'cool-people'];

    const scrollPosition = window.scrollY + 100;

    for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (!section) continue;

        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            navItems.forEach(item => {
                if (item.dataset.section === sectionId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            break;
        }
    }
}

window.addEventListener('scroll', updateActiveNav);
updateActiveNav();

// ============================================
// ROTATING TEXT ANIMATION
// ============================================

let currentWordIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
const rotatingTextElement = document.getElementById('rotating-text');
const typingSpeed = 100;
const deletingSpeed = 50;
const pauseTime = 2000;

function typeText() {
    const currentWord = ROTATING_WORDS[currentWordIndex];

    if (isDeleting) {
        rotatingTextElement.textContent = currentWord.substring(0, currentCharIndex - 1);
        currentCharIndex--;

        if (currentCharIndex === 0) {
            isDeleting = false;
            currentWordIndex = (currentWordIndex + 1) % ROTATING_WORDS.length;
            setTimeout(typeText, 500);
            return;
        }
    } else {
        rotatingTextElement.textContent = currentWord.substring(0, currentCharIndex + 1);
        currentCharIndex++;

        if (currentCharIndex === currentWord.length) {
            isDeleting = true;
            setTimeout(typeText, pauseTime);
            return;
        }
    }

    setTimeout(typeText, isDeleting ? deletingSpeed : typingSpeed);
}

setTimeout(typeText, 1000);

// ============================================
// GITHUB API
// ============================================

let myReposCache = null;
let starredReposCache = null;
let followingCache = null;

async function fetchMyRepos() {
    if (myReposCache) return myReposCache;

    try {
        const repos = [];
        let page = 1;
        let hasMore = true;

        while (hasMore && page <= 5) {
            const response = await fetch(
                `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&page=${page}`,
                { headers: { 'Accept': 'application/vnd.github.v3+json' } }
            );

            if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

            const data = await response.json();
            if (data.length === 0) {
                hasMore = false;
            } else {
                repos.push(...data);
                page++;
            }
        }

        const filteredRepos = repos.filter(repo => {
            return repo.owner.login === GITHUB_USERNAME || !repo.fork;
        });

        myReposCache = filteredRepos;
        return filteredRepos;
    } catch (error) {
        console.error('Error fetching repos:', error);
        return [];
    }
}

async function fetchStarredRepos() {
    if (starredReposCache) return starredReposCache;

    try {
        const repos = [];
        let page = 1;
        let hasMore = true;

        while (hasMore && page <= 20) {
            const response = await fetch(
                `https://api.github.com/users/${GITHUB_USERNAME}/starred?per_page=100&page=${page}`,
                { headers: { 'Accept': 'application/vnd.github.v3+json' } }
            );

            if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

            const data = await response.json();
            if (data.length === 0) {
                hasMore = false;
            } else {
                repos.push(...data);
                page++;
            }
        }

        starredReposCache = repos;
        return repos;
    } catch (error) {
        console.error('Error fetching starred repos:', error);
        return [];
    }
}

async function fetchFollowing() {
    if (followingCache) return followingCache;

    try {
        const users = [];
        let page = 1;
        let hasMore = true;

        while (hasMore && page <= 5) {
            const response = await fetch(
                `https://api.github.com/users/${GITHUB_USERNAME}/following?per_page=100&page=${page}`,
                { headers: { 'Accept': 'application/vnd.github.v3+json' } }
            );

            if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

            const data = await response.json();
            if (data.length === 0) {
                hasMore = false;
            } else {
                const usersWithDetails = await Promise.all(
                    data.map(async (user) => {
                        try {
                            const detailResponse = await fetch(
                                `https://api.github.com/users/${user.login}`,
                                { headers: { 'Accept': 'application/vnd.github.v3+json' } }
                            );
                            if (detailResponse.ok) {
                                return await detailResponse.json();
                            }
                        } catch (err) {
                            console.error(`Error fetching details for ${user.login}:`, err);
                        }
                        return user;
                    })
                );
                users.push(...usersWithDetails);
                page++;
            }
        }

        followingCache = shuffleArray(users);
        return followingCache;
    } catch (error) {
        console.error('Error fetching following:', error);
        return [];
    }
}

function getProjectLogo(repoName) {
    const lowerName = repoName.toLowerCase();

    for (const [key, logoUrl] of Object.entries(PROJECT_LOGOS)) {
        if (lowerName.includes(key)) {
            return logoUrl;
        }
    }

    return null;
}

function getLanguageIcon(language) {
    if (!language) return LANGUAGE_ICONS['default'];
    return LANGUAGE_ICONS[language] || LANGUAGE_ICONS['default'];
}

/* 
   REMOVED: getRepoImage(repo) 
   We now use language icons instead of random placeholder images.
*/

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

function renderRepoName(fullName) {
    if (!fullName.includes('/')) return `<span>${fullName}</span>`;
    const [owner, name] = fullName.split('/');
    return `
        <span class="repo-owner">${owner}/</span>
        <span class="repo-title">${name}</span>
    `;
}
// ============================================
// LOAD FEATURED PROJECTS - FULLY CLICKABLE!
// ============================================

async function loadFeaturedProjects() {
    const container = document.getElementById('featured-projects-grid');
    const section = document.getElementById('featured-projects');

    try {
        const myRepos = await fetchMyRepos();

        if (myRepos.length === 0) {
            container.innerHTML = `<div class="loading-state"><p>No repositories found.</p></div>`;
            return;
        }

        // FILTER OUT h0tp-ftw/h0tp-ftw (website repo)!
        const filteredRepos = myRepos.filter(repo => {
            return repo.full_name !== 'h0tp-ftw/h0tp-ftw';
        });

        if (filteredRepos.length === 0) {
            container.innerHTML = `<div class="loading-state"><p>No other projects found.</p></div>`;
            return;
        }

        // Remove loading state only to preserve static tiles (like Quiet)
        const loadingState = container.querySelector('.loading-state');
        if (loadingState) loadingState.remove();

        // Helper to render a chunk of repos
        const renderRepos = (repos, startIndex) => {
            repos.forEach((repo, i) => {
                const index = startIndex + i;
                const description = repo.description || 'No description available';
                const stars = formatNumber(repo.stargazers_count);
                const language = repo.language || 'Code'; // Better fallback
                const customLogo = getProjectLogo(repo.name);

                // CREATE FULLY CLICKABLE CARD
                const card = document.createElement('a');
                card.href = repo.html_url;
                card.target = '_blank';
                card.rel = 'noopener';
                card.className = 'project-card clickable-card';
                // Stagger animations based on index in this batch
                card.style.animationDelay = `${(i % 6) * 0.1}s`;

                if (customLogo) {
                    // LOGO CARD
                    card.innerHTML = `
                        <div class="project-image logo-only">
                            <img src="${customLogo}" alt="${repo.name}" class="project-logo-img" />
                        </div>
                        <div class="project-info">
                            <h3 class="project-name">
                                ${renderRepoName(repo.full_name)}
                            </h3>
                            <p class="project-description">${description}</p>
                            <div class="project-stats">
                                <span class="stat">⭐ ${stars}</span>
                                <span class="stat">🍴 ${repo.forks_count}</span>
                                <span class="stat">💻 ${language}</span>
                            </div>
                        </div>
                    `;
                } else {
                    // NEW: NO-LOGO VARIANT (Language Icon + Gradient)
                    const iconClass = getLanguageIcon(language);

                    card.innerHTML = `
                        <div class="project-image no-logo-variant">
                             <i class="${iconClass}"></i>
                        </div>
                        <div class="project-info">
                            <h3 class="project-name">
                                ${renderRepoName(repo.full_name)}
                            </h3>
                            <p class="project-description">${description}</p>
                            <div class="project-stats">
                                <span class="stat">⭐ ${stars}</span>
                                <span class="stat">🍴 ${repo.forks_count}</span>
                                <span class="stat">💻 ${language}</span>
                            </div>
                        </div>
                    `;
                }

                container.appendChild(card);
                observer.observe(card);
            });
        };

        const initialLimit = 6;
        const initialRepos = filteredRepos.slice(0, initialLimit);
        const remainingRepos = filteredRepos.slice(initialLimit);

        renderRepos(initialRepos, 0);

        // If there are more repos, add a Load More button
        if (remainingRepos.length > 0) {
            // Check if button container already exists (id: projects-load-more-container)
            let existingBtnContainer = document.getElementById('projects-load-more-container');
            if (existingBtnContainer) existingBtnContainer.remove();

            const btnContainer = document.createElement('div');
            btnContainer.id = 'projects-load-more-container'; // ID for easy removal
            btnContainer.style.width = '100%';
            btnContainer.style.display = 'flex';
            btnContainer.style.justifyContent = 'center';
            btnContainer.style.marginTop = '3rem';

            // Using surprise-btn class for consistent styling with the other button
            btnContainer.innerHTML = `
                <button id="projects-load-more-btn" class="surprise-btn" style="min-width: 200px;">
                    <svg class="btn-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M7 10l5 5 5-5z"/>
                    </svg>
                    <span>Show All Projects (${filteredRepos.length})</span>
                </button>
            `;

            // Append after the grid
            container.parentNode.appendChild(btnContainer);

            // Event listener
            document.getElementById('projects-load-more-btn').addEventListener('click', function () {
                renderRepos(remainingRepos, initialLimit);
                // Animate removal
                btnContainer.style.opacity = '0';
                setTimeout(() => btnContainer.remove(), 300);
            });
        }

    } catch (error) {
        console.error('Error loading featured projects:', error);
        container.innerHTML = `<div class="loading-state"><p>Error loading projects.</p></div>`;
    }
}

// ============================================
// PORTFOLIO CHART WITH TOGGLE - 3 COLUMN CSV!
// ============================================

let portfolioChart = null;
let portfolioData = null;
let currentView = 'cumulative';

async function loadPortfolioDataFromCSV() {
    try {
        const csvUrl = PORTFOLIO_CSV_URL;

        console.log('📊 Loading CSV:', csvUrl);

        const response = await fetch(csvUrl, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const csvText = await response.text();
        console.log('✓ CSV loaded:', csvText.length, 'characters');

        const lines = csvText.split(/\r?\n/).filter(line => line.trim());
        console.log('✓ Lines:', lines.length);

        const dataLines = lines.slice(1);

        const months = [];
        const cumulativeReturns = [];
        const periodReturns = [];

        dataLines.forEach(line => {
            const parts = line.split(',').map(p => p.trim());
            if (parts.length < 3) return;

            const month = parts[0];
            const returnVal = parseFloat(parts[1]);
            const periodVal = parseFloat(parts[2]);

            let formattedMonth = month;
            if (month.includes('-')) {
                const [monthName, year] = month.split('-');
                const fullYear = year.length === 2 ? '20' + year : year;
                formattedMonth = `${monthName} ${fullYear}`;
            }

            months.push(formattedMonth);
            cumulativeReturns.push(returnVal);
            periodReturns.push(periodVal);
        });

        console.log(`✅ Loaded ${months.length} months: ${months[0]} to ${months[months.length - 1]}`);

        return {
            months: months,
            cumulative: cumulativeReturns,
            period: periodReturns
        };

    } catch (error) {
        console.error('❌ Error loading CSV:', error);
        return {
            months: ["Oct 2024", "Nov 2024", "Dec 2024"],
            cumulative: [0.0, 0.8, 2.3],
            period: [0.0, 0.8, 1.5]
        };
    }
}

async function createPortfolioChart() {
    const canvas = document.getElementById('portfolio-chart');

    if (!canvas) {
        console.log('Portfolio chart canvas not found');
        return;
    }

    try {
        portfolioData = await loadPortfolioDataFromCSV();

        if (!portfolioData || portfolioData.months.length === 0) {
            canvas.parentElement.innerHTML = '<div class="loading-state"><p>No portfolio data available.</p></div>';
            return;
        }

        renderChart('cumulative');
        setupToggleButton();

        console.log('✅ Portfolio chart initialized');

    } catch (error) {
        console.error('Error creating portfolio chart:', error);
        canvas.parentElement.innerHTML = '<div class="loading-state"><p>Error loading chart.</p></div>';
    }
}

function renderChart(viewType) {
    const canvas = document.getElementById('portfolio-chart');
    const theme = getChartTheme();

    if (portfolioChart) {
        portfolioChart.destroy();
    }

    const data = viewType === 'cumulative' ? portfolioData.cumulative : portfolioData.period;
    const label = viewType === 'cumulative' ? 'Cumulative TWR (%)' : 'Period Return (%)';

    const ctx = canvas.getContext('2d');

    portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: portfolioData.months,
            datasets: [{
                label: label,
                data: data,
                borderColor: '#ca9ee6',
                backgroundColor: function (context) {
                    const chart = context.chart;
                    const { ctx, chartArea, scales } = chart;
                    if (!chartArea) return null;

                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);

                    // If scales are not ready yet, return a default or wait
                    if (!scales || !scales.y) {
                        return 'rgba(202, 158, 230, 0.2)'; // fallback
                    }

                    const yAxis = scales.y;
                    // getPixelForValue returns the pixel location for a value
                    const zeroPixel = yAxis.getPixelForValue(0);
                    const top = chartArea.top;
                    const bottom = chartArea.bottom;
                    const height = bottom - top;

                    // Calculate ratio where 0 is located from 0..1 (top..bottom)
                    let zeroRatio = (zeroPixel - top) / height;

                    // Clamp ratio to [0, 1]
                    zeroRatio = Math.max(0, Math.min(1, zeroRatio));

                    // Green for above 0 (#a6d189)
                    gradient.addColorStop(0, 'rgba(166, 209, 137, 0.5)');
                    gradient.addColorStop(zeroRatio, 'rgba(166, 209, 137, 0.05)');

                    // Red for below 0 (#e78284)
                    gradient.addColorStop(zeroRatio, 'rgba(231, 130, 132, 0.05)');
                    gradient.addColorStop(1, 'rgba(231, 130, 132, 0.5)');

                    return gradient;
                },
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: '#ca9ee6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#f4b8e4',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: theme.textColor,
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: theme.tooltipBg,
                    titleColor: theme.textColor,
                    bodyColor: theme.textColor,
                    borderColor: theme.tooltipBorder,
                    borderWidth: 2,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            const prefix = viewType === 'cumulative' ? 'TWR' : 'Period';
                            return `${prefix}: ${context.parsed.y.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: theme.gridColor,
                        lineWidth: 1
                    },
                    ticks: {
                        color: theme.textColor,
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    beginAtZero: viewType === 'cumulative',
                    grid: {
                        color: theme.gridColor,
                        lineWidth: 1
                    },
                    ticks: {
                        color: theme.textColor,
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });

    updateStatsDisplay(viewType);
    updateToggleButton(viewType);

    window.portfolioChart = portfolioChart;
}

function getChartTheme() {
    const theme = html.getAttribute('data-theme');
    const isDark = theme === 'frappe';

    return {
        textColor: isDark ? '#c6d0f5' : '#4c4f69',
        gridColor: isDark ? '#414559' : '#dce0e8',
        tooltipBg: isDark ? '#303446' : '#eff1f5',
        tooltipBorder: isDark ? '#ca9ee6' : '#8839ef'
    };
}

function updateStatsDisplay(viewType) {
    const statsContainer = document.getElementById('chart-stats-display');
    if (!statsContainer) return;

    const data = viewType === 'cumulative' ? portfolioData.cumulative : portfolioData.period;
    const currentValue = data[data.length - 1];

    if (viewType === 'cumulative') {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Current Return</span>
                <span class="stat-value">${currentValue.toFixed(2)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Time Period</span>
                <span class="stat-value">${portfolioData.months[0]} - ${portfolioData.months[portfolioData.months.length - 1]}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Months Tracked</span>
                <span class="stat-value">${portfolioData.months.length}</span>
            </div>
        `;
    } else {
        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const avgValue = data.reduce((a, b) => a + b, 0) / data.length;

        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Best Month</span>
                <span class="stat-value">+${maxValue.toFixed(2)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Worst Month</span>
                <span class="stat-value">${minValue.toFixed(2)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Avg Month</span>
                <span class="stat-value">${avgValue.toFixed(2)}%</span>
            </div>
        `;
    }
}

function setupToggleButton() {
    const toggleBtn = document.getElementById('chart-toggle-btn');
    if (!toggleBtn) {
        console.warn('⚠️ Toggle button not found!');
        return;
    }

    console.log('✓ Setting up toggle button');

    toggleBtn.addEventListener('click', () => {
        currentView = currentView === 'cumulative' ? 'period' : 'cumulative';
        console.log(`🔄 Toggled to: ${currentView}`);
        renderChart(currentView);
    });
}

function updateToggleButton(viewType) {
    const toggleBtn = document.getElementById('chart-toggle-btn');
    if (!toggleBtn) return;

    if (viewType === 'cumulative') {
        toggleBtn.innerHTML = `
            <svg class="btn-svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4 10h2v4h-2v-4zm4-6h2v10h-2V11zm4-4h2v14h-2V7z"/>
            </svg>
            <span>Show Period Returns</span>
        `;
    } else {
        toggleBtn.innerHTML = `
            <svg class="btn-svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
            </svg>
            <span>Show Cumulative TWR</span>
        `;
    }
}

function updateChartTheme() {
    if (!portfolioChart || !portfolioData) return;
    renderChart(currentView);
}
// ============================================
// 3 RANDOM STARRED PROJECTS
// ============================================

const surpriseBtn = document.getElementById('surprise-btn');
const surpriseCardsGrid = document.getElementById('surprise-cards-grid');
let starredProjects = [];

async function initializeSurprise() {
    starredProjects = await fetchStarredRepos();

    const starsCountElement = document.getElementById('stars-count');
    if (starsCountElement && starredProjects.length > 0) {
        starsCountElement.textContent = `(${starredProjects.length})`;
    }

    if (starredProjects.length > 0) {
        const initialProjects = getRandomProjects(5);
        display5RandomCards(initialProjects);
    }
}

surpriseBtn.addEventListener('click', () => {
    if (starredProjects.length === 0) return;

    surpriseBtn.classList.add('spinning');
    surpriseBtn.disabled = true;

    setTimeout(() => {
        surpriseBtn.classList.remove('spinning');
        surpriseBtn.disabled = false;
    }, 800);

    const randomProjects = getRandomProjects(5);
    display5RandomCards(randomProjects);
});

function getRandomProjects(count) {
    const shuffled = [...starredProjects].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, starredProjects.length));
}

function display5RandomCards(projects) {
    surpriseCardsGrid.innerHTML = '';

    projects.forEach((repo, index) => {
        const card = document.createElement('a');
        card.href = repo.html_url;
        card.target = '_blank';
        card.rel = 'noopener';
        card.className = 'project-card clickable-card';
        card.style.animationDelay = `${index * 0.1}s`;

        const description = repo.description || 'No description available';
        const stars = formatNumber(repo.stargazers_count);
        const language = repo.language || 'Unknown';

        card.innerHTML = `
            <div class="project-image">
                <img src="${getRepoImage(repo)}" alt="${repo.full_name}" />
            </div>
            <div class="project-info">
                <h3 class="project-name">
                    ${renderRepoName(repo.full_name)}
                </h3>
                <p class="project-description">${description}</p>
                <div class="project-stats">
                    <span class="stat">⭐ ${stars}</span>
                    <span class="stat">💻 ${language}</span>
                </div>
            </div>
        `;

        surpriseCardsGrid.appendChild(card);
        observer.observe(card);
    });
}

// ============================================
// SHOW ALL STARS TOGGLE
// ============================================

const showAllStarsBtn = document.getElementById('show-all-stars-btn');
const allStarsInline = document.getElementById('all-stars-inline');
let isStarsExpanded = false;

showAllStarsBtn.addEventListener('click', () => {
    isStarsExpanded = !isStarsExpanded;

    if (isStarsExpanded) {
        allStarsInline.classList.remove('collapsed');
        showAllStarsBtn.querySelector('span:nth-of-type(1)').textContent = 'Hide All Stars';
    } else {
        allStarsInline.classList.add('collapsed');
        showAllStarsBtn.querySelector('span:nth-of-type(1)').textContent = 'Show All Stars';
    }
});

// ============================================
// ALL STARRED PROJECTS WITH FILTER
// ============================================

let allStars = [];
let displayedStars = 0;
const STARS_PER_PAGE = 12;

async function loadAllStars() {
    allStars = await fetchStarredRepos();

    const container = document.getElementById('stars-grid');
    if (allStars.length === 0) {
        container.innerHTML = `<div class="loading-state"><p>No starred repositories found.</p></div>`;
        return;
    }

    const languages = [...new Set(allStars.map(r => r.language).filter(Boolean))].sort();
    const languageFilter = document.getElementById('language-filter');
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        languageFilter.appendChild(option);
    });

    container.innerHTML = '';
    displayMoreStars();
}

function displayMoreStars(filtered = allStars) {
    const container = document.getElementById('stars-grid');
    const loadMoreBtn = document.getElementById('load-more');

    const toDisplay = filtered.slice(displayedStars, displayedStars + STARS_PER_PAGE);

    toDisplay.forEach((repo) => {
        const card = document.createElement('a');
        card.href = repo.html_url;
        card.target = '_blank';
        card.rel = 'noopener';
        card.className = 'project-card clickable-card';

        const description = repo.description || 'No description available';
        const stars = formatNumber(repo.stargazers_count);
        const language = repo.language || 'Unknown';

        card.innerHTML = `
            <div class="project-image">
                <img src="${getRepoImage(repo)}" alt="${repo.full_name}" loading="lazy" />
            </div>
            <div class="project-info">
                <h3 class="project-name">
                    ${renderRepoName(repo.full_name)}
                </h3>
                <p class="project-description">${description}</p>
                <div class="project-stats">
                    <span class="stat">⭐ ${stars}</span>
                    <span class="stat">💻 ${language}</span>
                </div>
            </div>
        `;

        container.appendChild(card);
        observer.observe(card);
    });

    displayedStars += toDisplay.length;

    if (displayedStars >= filtered.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

const searchInput = document.getElementById('search-stars');
const languageFilter = document.getElementById('language-filter');
const loadMoreBtn = document.getElementById('load-more');

function filterStars() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedLang = languageFilter.value;

    const filtered = allStars.filter(repo => {
        const matchesSearch = !searchTerm ||
            repo.name.toLowerCase().includes(searchTerm) ||
            repo.full_name.toLowerCase().includes(searchTerm) ||
            (repo.description && repo.description.toLowerCase().includes(searchTerm));

        const matchesLang = !selectedLang || repo.language === selectedLang;

        return matchesSearch && matchesLang;
    });

    displayedStars = 0;
    document.getElementById('stars-grid').innerHTML = '';
    displayMoreStars(filtered);
}

searchInput.addEventListener('input', filterStars);
languageFilter.addEventListener('change', filterStars);
loadMoreBtn.addEventListener('click', () => displayMoreStars());

// ============================================
// COOL PEOPLE
// ============================================

async function loadCoolPeople() {
    const container = document.getElementById('people-grid');

    try {
        const following = await fetchFollowing();

        if (following.length === 0) {
            container.innerHTML = `<div class="loading-state"><p>Not following anyone yet!</p></div>`;
            return;
        }

        container.innerHTML = '';

        const peopleToShow = following.slice(0, 20);

        peopleToShow.forEach((user) => {
            const card = document.createElement('a');
            card.className = 'person-card';
            card.href = user.html_url;
            card.target = '_blank';
            card.rel = 'noopener';

            const bio = user.bio || user.name || 'GitHub Developer';

            card.innerHTML = `
                <div class="person-avatar">
                    <img src="${user.avatar_url}" alt="${user.login}" />
                </div>
                <div class="person-name">${user.login}</div>
                <div class="person-bio">${bio}</div>
            `;

            container.appendChild(card);
            observer.observe(card);
        });
    } catch (error) {
        console.error('Error loading cool people:', error);
        container.innerHTML = `<div class="loading-state"><p>Error loading following list.</p></div>`;
    }
}
// ============================================
// INITIALIZE EVERYTHING!
// ============================================

async function init() {
    console.log('🚀 Initializing spectacular portfolio...');

    try {
        initScrollAnimations();
        console.log('✓ Scroll animations initialized');

        // Load in sequence for smooth experience
        await loadFeaturedProjects();
        console.log('✓ Featured projects loaded');

        await initializeSurprise();
        console.log('✓ Surprise section initialized');

        await loadAllStars();
        console.log('✓ All stars loaded');

        await createPortfolioChart();
        console.log('✓ Portfolio chart created');

        await loadCoolPeople();
        console.log('✓ Cool people loaded');

        console.log('✅ Site fully loaded and spectacular!');
    } catch (error) {
        console.error('❌ Error during initialization:', error);
        console.error('Stack trace:', error.stack);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


// ============================================
// NICHE PROJECTS TOGGLE
// ============================================

const showAllNicheBtn = document.getElementById('show-all-niche-btn');
const nicheGrid = document.getElementById('niche-grid');
let nicheExpanded = false;

if (showAllNicheBtn) {
    showAllNicheBtn.addEventListener('click', () => {
        nicheExpanded = !nicheExpanded;

        const hiddenTiles = nicheGrid.querySelectorAll('.hidden-niche-tile');

        if (nicheExpanded) {
            hiddenTiles.forEach(tile => {
                tile.classList.remove('hidden-niche-tile');
                tile.classList.add('visible-niche-tile');
            });
            showAllNicheBtn.querySelector('span').textContent = 'Show Less Projects';
            showAllNicheBtn.classList.add('expanded');
        } else {
            hiddenTiles.forEach(tile => {
                tile.classList.add('hidden-niche-tile');
                tile.classList.remove('visible-niche-tile');
            });
            showAllNicheBtn.querySelector('span').textContent = 'Show More Projects';
            showAllNicheBtn.classList.remove('expanded');
        }
    });
}

// ============================================
// COOL VISUAL EFFECTS (TILT & PARTICLE TRAIL)
// ============================================

class VanillaTilt {
    constructor(element, settings = {}) {
        if (!(element instanceof Node)) {
            throw "Can't initialize VanillaTilt because " + element + " is not a Node.";
        }

        this.width = null;
        this.height = null;
        this.clientWidth = null;
        this.clientHeight = null;
        this.left = null;
        this.top = null;

        this.gammazero = null;
        this.betazero = null;
        this.lastgammazero = null;
        this.lastbetazero = null;

        this.transitionTimeout = null;
        this.updateCall = null;
        this.event = null;

        this.updateBind = this.update.bind(this);
        this.resetBind = this.reset.bind(this);

        this.element = element;
        this.settings = this.extendSettings(settings);

        this.reverse = this.settings.reverse ? -1 : 1;
        this.glare = this.isSettingTrue(this.settings.glare);
        this.glarePrerender = this.isSettingTrue(this.settings["glare-prerender"]);
        this.fullPageListening = this.isSettingTrue(this.settings["full-page-listening"]);

        if (this.glare) {
            this.prepareGlare();
        }

        if (this.fullPageListening) {
            this.updateClientSize();
        }

        this.addEventListeners();
        this.reset();
        this.updateInitialPosition();
    }

    isSettingTrue(setting) {
        return setting === "" || setting === true || setting === 1;
    }

    extendSettings(settings) {
        let defaultSettings = {
            reverse: false,
            max: 15, // max tilt rotation (degrees)
            startX: 0,
            startY: 0,
            perspective: 1000,
            easing: "cubic-bezier(.03,.98,.52,.99)",
            scale: 1.05,
            speed: 300,
            transition: true,
            axis: null,
            glare: false,
            "max-glare": 1,
            "glare-prerender": false,
            "full-page-listening": false,
            "mouse-event-element": null,
            reset: true,
            gyroscope: true,
            gyroscopeMinAngleX: -45,
            gyroscopeMaxAngleX: 45,
            gyroscopeMinAngleY: -45,
            gyroscopeMaxAngleY: 45,
            gyroscopeSamples: 10
        };

        let newSettings = {};
        for (var property in defaultSettings) {
            if (property in settings) {
                newSettings[property] = settings[property];
            } else if (this.element.hasAttribute("data-tilt-" + property)) {
                let attribute = this.element.getAttribute("data-tilt-" + property);
                try {
                    newSettings[property] = JSON.parse(attribute);
                } catch (e) {
                    newSettings[property] = attribute;
                }
            } else {
                newSettings[property] = defaultSettings[property];
            }
        }

        return newSettings;
    }

    initGlare() {
        this.glareElementWrapper = document.createElement("div");
        this.glareElementWrapper.classList.add("js-tilt-glare");
        this.glareElementWrapper.style.position = "absolute";
        this.glareElementWrapper.style.top = "0";
        this.glareElementWrapper.style.left = "0";
        this.glareElementWrapper.style.width = "100%";
        this.glareElementWrapper.style.height = "100%";
        this.glareElementWrapper.style.overflow = "hidden";
        this.glareElementWrapper.style.pointerEvents = "none";

        this.glareElement = document.createElement("div");
        this.glareElement.classList.add("js-tilt-glare-inner");
        this.glareElement.style.position = "absolute";
        this.glareElement.style.top = "50%";
        this.glareElement.style.left = "50%";
        this.glareElement.style.pointerEvents = "none";
        this.glareElement.style.backgroundImage = `linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)`;
        this.glareElement.style.transform = "rotate(180deg) translate(-50%, -50%)";
        this.glareElement.style.transformOrigin = "0% 0%";
        this.glareElement.style.opacity = "0";

        this.updateGlareSize();

        this.glareElementWrapper.appendChild(this.glareElement);
        this.element.appendChild(this.glareElementWrapper);
    }

    prepareGlare() {
        if (!this.glarePrerender) {
            // Create glare element
            this.initGlare();
        }
    }

    updateGlareSize() {
        if (this.glare) {
            const size = (this.element.offsetWidth > this.element.offsetHeight ? this.element.offsetWidth : this.element.offsetHeight) * 2;
            this.glareElement.style.width = `${size}px`;
            this.glareElement.style.height = `${size}px`;
        }
    }

    updateClientSize() {
        this.clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        this.clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    }

    onWindowResize() {
        this.updateGlareSize();
        this.updateClientSize();
    }

    addEventListeners() {
        this.onMouseEnterBind = this.onMouseEnter.bind(this);
        this.onMouseMoveBind = this.onMouseMove.bind(this);
        this.onMouseLeaveBind = this.onMouseLeave.bind(this);
        this.onWindowResizeBind = this.onWindowResize.bind(this);

        this.element.addEventListener("mouseenter", this.onMouseEnterBind);
        this.element.addEventListener("mouseleave", this.onMouseLeaveBind);
        this.element.addEventListener("mousemove", this.onMouseMoveBind);

        if (this.glare || this.fullPageListening) {
            window.addEventListener("resize", this.onWindowResizeBind);
        }
    }

    onMouseEnter() {
        this.updateElementPosition();
        this.element.style.willChange = "transform";
        this.setTransition();
    }

    onMouseMove(event) {
        if (this.updateCall !== null) {
            cancelAnimationFrame(this.updateCall);
        }

        this.event = event;
        this.updateCall = requestAnimationFrame(this.updateBind);
    }

    onMouseLeave() {
        this.setTransition();
        if (this.settings.reset) {
            requestAnimationFrame(this.resetBind);
        }
    }

    reset() {
        this.event = {
            clientX: this.left + this.width / 2,
            clientY: this.top + this.height / 2
        };

        if (this.element && this.element.style) {
            this.element.style.transform = `perspective(${this.settings.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        }

        this.resetGlare();
    }

    resetGlare() {
        if (this.glare) {
            this.glareElement.style.transform = "rotate(180deg) translate(-50%, -50%)";
            this.glareElement.style.opacity = "0";
        }
    }

    updateInitialPosition() {
        if (this.settings.startX === 0 && this.settings.startY === 0) {
            return;
        }

        this.onMouseEnter();

        if (this.fullPageListening) {
            this.event = {
                clientX: (this.settings.startX + this.settings.max) / (2 * this.settings.max) * this.clientWidth,
                clientY: (this.settings.startY + this.settings.max) / (2 * this.settings.max) * this.clientHeight
            };
        } else {
            this.event = {
                clientX: this.left + ((this.settings.startX + this.settings.max) / (2 * this.settings.max) * this.width),
                clientY: this.top + ((this.settings.startY + this.settings.max) / (2 * this.settings.max) * this.height)
            };
        }

        let backupScale = this.settings.scale;
        this.settings.scale = 1;
        this.update();
        this.settings.scale = backupScale;
        this.resetGlare();
    }

    getValues() {
        let x, y;

        if (this.fullPageListening) {
            x = this.event.clientX / this.clientWidth;
            y = this.event.clientY / this.clientHeight;
        } else {
            x = (this.event.clientX - this.left) / this.width;
            y = (this.event.clientY - this.top) / this.height;
        }

        x = Math.min(Math.max(x, 0), 1);
        y = Math.min(Math.max(y, 0), 1);

        let tiltX = (this.reverse * (this.settings.max - x * this.settings.max * 2)).toFixed(2);
        let tiltY = (this.reverse * (y * this.settings.max * 2 - this.settings.max)).toFixed(2);
        let angle = Math.atan2(this.event.clientX - (this.left + this.width / 2), -(this.event.clientY - (this.top + this.height / 2))) * (180 / Math.PI);

        return {
            tiltX: tiltX,
            tiltY: tiltY,
            percentageX: x * 100,
            percentageY: y * 100,
            angle: angle
        };
    }

    updateElementPosition() {
        let rect = this.element.getBoundingClientRect();
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;
        this.left = rect.left;
        this.top = rect.top;
    }

    update() {
        let values = this.getValues();

        this.element.style.transform = "perspective(" + this.settings.perspective + "px) " +
            "rotateX(" + (this.settings.axis === "x" ? 0 : values.tiltY) + "deg) " +
            "rotateY(" + (this.settings.axis === "y" ? 0 : values.tiltX) + "deg) " +
            "scale3d(" + this.settings.scale + ", " + this.settings.scale + ", " + this.settings.scale + ")";

        if (this.glare) {
            this.glareElement.style.transform = `rotate(${values.angle}deg) translate(-50%, -50%)`;
            this.glareElement.style.opacity = `${values.percentageY * this.settings["max-glare"] / 100}`;
        }

        this.element.dispatchEvent(new CustomEvent("tiltChange", {
            "detail": values
        }));

        this.updateCall = null;
    }

    setTransition() {
        clearTimeout(this.transitionTimeout);
        this.element.style.transition = this.settings.speed + "ms " + this.settings.easing;
        if (this.glare) this.glareElement.style.transition = `opacity ${this.settings.speed}ms ${this.settings.easing}`;

        this.transitionTimeout = setTimeout(() => {
            this.element.style.transition = "";
            if (this.glare) this.glareElement.style.transition = "";
        }, this.settings.speed);
    }
}

// Initialize New Features
function initCoolFeatures() {
    console.log('✨ Initializing cool visual effects...');

    // Init Tilt on Project Cards and Setup Categories
    const tiltElements = document.querySelectorAll('.project-card, .setup-category, .profile-image');
    tiltElements.forEach(el => {
        new VanillaTilt(el, {
            max: 5,
            speed: 400,
            glare: true,
            "max-glare": 0.2,
            scale: 1.02
        });
    });

    // Observe for new project cards (dynamic loading)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList.contains('project-card')) {
                        new VanillaTilt(node, {
                            max: 5,
                            speed: 400,
                            glare: true,
                            "max-glare": 0.2,
                            scale: 1.02
                        });
                    }
                });
            }
        });
    });

    const grid = document.getElementById('featured-projects-grid');
    if (grid) observer.observe(grid, { childList: true });

    const starsGrid = document.getElementById('stars-grid');
    if (starsGrid) observer.observe(starsGrid, { childList: true });

    const surpriseGrid = document.getElementById('surprise-cards-grid');
    if (surpriseGrid) observer.observe(surpriseGrid, { childList: true });
}

// Run basic init
initCoolFeatures();

