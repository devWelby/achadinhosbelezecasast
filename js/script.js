// ==========================================
// 1. URL DA PLANILHA (COLE O LINK AQUI)
// ==========================================
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1oRupea0ZYG-vkBW-GjpqJsbUY5AhgtoFFnIwHJjiCl-l8hwfN6FM_Xnq8W9bhFlDkVMGMsT2Ngiz/pub?output=csv";

let produtos = [];
let currentSearchTerm = '';
let currentCategory = 'Todas';

// Função simples para converter linha CSV em array
function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
        const currentline = lines[i].split(regex).map(item => item.replace(/^"|"$/g, '').trim());
        
        let obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j] || '';
        }
        result.push(obj);
    }
    return result;
}

// ==========================================
// CARREGAMENTO E RENDERIZAÇÃO
// ==========================================
const gridContainer = document.getElementById('products-grid');

function renderSkeletons() {
    const loadingSpinner = document.getElementById('loading-spinner');
    if(loadingSpinner) loadingSpinner.style.display = 'none';
    
    gridContainer.style.display = 'grid';
    gridContainer.innerHTML = '';
    for(let i=0; i<6; i++) {
        gridContainer.innerHTML += `
            <article class="product-card skeleton">
                <div class="product-img"></div>
                <div class="product-content">
                    <div class="product-title"></div>
                    <div class="product-desc"></div>
                    <div class="product-desc" style="width: 60%;"></div>
                    <div class="card-actions" style="margin-top: 12px;">
                        <div class="btn-primary" style="height: 40px; border: none;"></div>
                        <div class="btn-secondary" style="height: 35px; border: none;"></div>
                    </div>
                </div>
            </article>
        `;
    }
}

async function loadProducts() {
    if (CSV_URL === "COLE_O_LINK_DO_CSV_AQUI" || !CSV_URL) {
        gridContainer.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>Por favor, configure o link da sua planilha.</p>";
        return;
    }

    renderSkeletons();

    try {
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error("Erro ao buscar a planilha");
        
        const csvText = await response.text();
        produtos = parseCSV(csvText);
        
        renderCategories();
        filterAndRender();
    } catch (error) {
        console.error("Erro ao carregar os produtos:", error);
        gridContainer.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--shopee-color);'>Erro ao carregar produtos. Verifique o link da planilha.</p>";
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return str.toString().replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

function renderProducts(produtosToRender) {
    gridContainer.innerHTML = '';
    
    if (produtosToRender.length === 0) {
        gridContainer.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>Nenhum produto encontrado.</p>";
        return;
    }

    produtosToRender.forEach((produto, index) => {
        const card = document.createElement('article');
        card.className = 'product-card';
        
        card.innerHTML = `
            <img src="${escapeHTML(produto.imagem)}" alt="${escapeHTML(produto.titulo)}" class="product-img" loading="lazy">
            <div class="product-content">
                <h2 class="product-title">${escapeHTML(produto.titulo)}</h2>
                ${produto.descricao ? `<p class="product-desc">${escapeHTML(produto.descricao)}</p>` : ''}
                
                <div class="card-actions">
                    <a href="${escapeHTML(produto.link)}" target="_blank" rel="noopener noreferrer" class="btn-primary track-click" data-title="${escapeHTML(produto.titulo)}">
                        <i class="fas fa-shopping-bag"></i> Ver na Shopee
                    </a>
                    <button class="btn-secondary copy-btn" data-link="${escapeHTML(produto.link)}">
                        <i class="fas fa-copy"></i> Copiar Link
                    </button>
                </div>
            </div>
        `;
        gridContainer.appendChild(card);
    });
    
    setupAnimations();
    setupCopyButtons();
    setupClickTracking();
}

// ==========================================
// PESQUISA E FILTROS
// ==========================================
function renderCategories() {
    const categoriesContainer = document.getElementById('categories-container');
    if (!categoriesContainer) return;
    
    const categoriasSet = new Set(['Todas']);
    produtos.forEach(p => {
        if (p.categoria && p.categoria.trim() !== '') {
            categoriasSet.add(p.categoria.trim());
        }
    });

    categoriesContainer.innerHTML = '';
    
    // Se não houver categoria (só a aba "Todas"), esconde o container
    if (categoriasSet.size <= 1) {
        categoriesContainer.style.display = 'none';
        return;
    }
    categoriesContainer.style.display = 'flex';

    categoriasSet.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `category-btn ${cat === currentCategory ? 'active' : ''}`;
        btn.textContent = cat;
        btn.addEventListener('click', () => {
            currentCategory = cat;
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterAndRender();
        });
        categoriesContainer.appendChild(btn);
    });
}

function filterAndRender() {
    const term = currentSearchTerm.toLowerCase();
    const filtered = produtos.filter(p => {
        const matchesSearch = (p.titulo || '').toLowerCase().includes(term) || (p.descricao || '').toLowerCase().includes(term);
        const matchesCategory = currentCategory === 'Todas' || (p.categoria || '').trim() === currentCategory;
        return matchesSearch && matchesCategory;
    });
    renderProducts(filtered);
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value;
        filterAndRender();
    });
}

// ==========================================
// ANIMAÇÕES E FUNCIONALIDADES
// ==========================================
function setupAnimations() {
    const cards = document.querySelectorAll('.product-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('show');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));
}

function setupCopyButtons() {
    const copyBtns = document.querySelectorAll('.copy-btn');
    const toast = document.getElementById('toast');
    
    copyBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const link = btn.getAttribute('data-link');
            try {
                await navigator.clipboard.writeText(link);
                if (toast) {
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 3000);
                }
            } catch (err) {
                console.error('Erro ao copiar', err);
                alert("Erro ao copiar o link!");
            }
        });
    });
}

// MODO ESCURO AUTOMÁTICO
const htmlElement = document.documentElement;
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(e) {
    const isDark = e.matches;
    htmlElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

applyTheme(darkModeMediaQuery);
darkModeMediaQuery.addEventListener('change', applyTheme);

// CONTADOR DE CLIQUES
const clickCounterElement = document.getElementById('click-counter');
let clickCount = parseInt(localStorage.getItem('shopee_click_count')) || 0;
if(clickCounterElement) clickCounterElement.textContent = clickCount;

function setupClickTracking() {
    const links = document.querySelectorAll('.track-click');
    links.forEach(link => {
        link.addEventListener('click', () => {
            clickCount++;
            localStorage.setItem('shopee_click_count', clickCount);
            if(clickCounterElement) clickCounterElement.textContent = clickCount;
        });
    });
}

// REGISTRO DO SERVICE WORKER (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.error('Falha ao registrar o Service Worker:', err);
        });
    });
}

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('year').textContent = new Date().getFullYear();
    setupSearch();
    loadProducts();
});
