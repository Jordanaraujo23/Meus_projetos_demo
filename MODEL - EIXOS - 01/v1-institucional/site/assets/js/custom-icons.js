/* ============================================
   CUSTOM ICONS - HELPER
   Sistema para carregar e usar ícones SVG customizados
   ============================================ */

// ===== ICON PATHS =====
const CUSTOM_ICONS = {
    // Pilares
    educacao: 'assets/icons/educacao.svg',
    saude: 'assets/icons/saude.svg',
    cultura: 'assets/icons/cultura.svg',
    sustentabilidade: 'assets/icons/sustentabilidade.svg',
    
    // Institucional
    missao: 'assets/icons/missao.svg',
    visao: 'assets/icons/visao.svg',
    valores: 'assets/icons/valores.svg',
    alvo: 'assets/icons/alvo.svg',
    
    // Contato
    email: 'assets/icons/email.svg',
    telefone: 'assets/icons/telefone.svg',
    localizacao: 'assets/icons/localizacao.svg',
    
    // Ações
    coracao: 'assets/icons/coracao.svg',
    ajuda: 'assets/icons/ajuda.svg',
    compartilhar: 'assets/icons/compartilhar.svg',
    download: 'assets/icons/download.svg',
    busca: 'assets/icons/busca.svg',
    check: 'assets/icons/check.svg',
    
    // Informação
    calendario: 'assets/icons/calendario.svg',
    relogio: 'assets/icons/relogio.svg',
    documento: 'assets/icons/documento.svg',
    imagem: 'assets/icons/imagem.svg',
    grafico: 'assets/icons/grafico.svg',
    
    // Pessoas
    usuarios: 'assets/icons/usuarios.svg',
    trofeu: 'assets/icons/trofeu.svg'
};

// ===== LOAD ICON =====
async function loadCustomIcon(iconName) {
    const path = CUSTOM_ICONS[iconName];
    if (!path) {
        console.error(`Ícone "${iconName}" não encontrado`);
        return null;
    }

    try {
        const response = await fetch(path);
        const svgText = await response.text();
        return svgText;
    } catch (error) {
        console.error(`Erro ao carregar ícone "${iconName}":`, error);
        return null;
    }
}

// ===== CREATE ICON ELEMENT =====
async function createCustomIcon(iconName, options = {}) {
    const {
        size = 'md',
        className = '',
        hover = 'scale',
        animate = false
    } = options;

    const svgContent = await loadCustomIcon(iconName);
    if (!svgContent) return null;

    const container = document.createElement('div');
    container.className = `custom-icon custom-icon-${size} ${className}`;
    
    if (hover === 'rotate') {
        container.classList.add('rotate-hover');
    } else if (hover === 'pulse') {
        container.classList.add('pulse-hover');
    }
    
    if (animate) {
        container.classList.add('float');
    }

    container.innerHTML = svgContent;
    
    return container;
}

// ===== REPLACE FONT AWESOME ICONS =====
async function replaceWithCustomIcons() {
    // Substituir ícones nos pilares
    const pillarMappings = {
        'fa-heart-pulse': 'saude',
        'fa-graduation-cap': 'educacao',
        'fa-masks-theater': 'cultura',
        'fa-leaf': 'sustentabilidade'
    };

    for (const [faClass, customIcon] of Object.entries(pillarMappings)) {
        const elements = document.querySelectorAll(`.${faClass}`);
        
        for (const element of elements) {
            const icon = await createCustomIcon(customIcon, {
                size: 'lg',
                hover: 'rotate'
            });
            
            if (icon && element.parentElement) {
                element.parentElement.replaceChild(icon, element);
            }
        }
    }
}

// ===== INSERT ICON BY SELECTOR =====
async function insertCustomIcon(selector, iconName, options = {}) {
    const element = document.querySelector(selector);
    if (!element) {
        console.error(`Elemento "${selector}" não encontrado`);
        return;
    }

    const icon = await createCustomIcon(iconName, options);
    if (icon) {
        element.appendChild(icon);
    }
}

// ===== CREATE CATEGORY BADGE =====
async function createCategoryBadge(category, text) {
    const badge = document.createElement('span');
    badge.className = `category-badge ${category}`;
    
    const icon = await createCustomIcon(category, { size: 'sm' });
    if (icon) {
        badge.appendChild(icon);
    }
    
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    badge.appendChild(textSpan);
    
    return badge;
}

// ===== SHOWCASE ALL ICONS =====
async function createIconShowcase(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const showcase = document.createElement('div');
    showcase.className = 'icon-showcase';

    const iconNames = {
        educacao: 'Educação',
        saude: 'Saúde',
        cultura: 'Cultura',
        sustentabilidade: 'Sustentabilidade'
    };

    for (const [iconName, label] of Object.entries(iconNames)) {
        const item = document.createElement('div');
        item.className = 'icon-showcase-item';

        const icon = await createCustomIcon(iconName, {
            size: 'xl',
            hover: 'rotate',
            animate: true
        });

        if (icon) {
            item.appendChild(icon);
        }

        const text = document.createElement('p');
        text.textContent = label;
        item.appendChild(text);

        showcase.appendChild(item);
    }

    container.appendChild(showcase);
}

// ===== PRELOAD ALL ICONS =====
async function preloadCustomIcons() {
    console.log('🎨 Pré-carregando ícones customizados...');
    
    const promises = Object.keys(CUSTOM_ICONS).map(iconName => loadCustomIcon(iconName));
    await Promise.all(promises);
    
    console.log('✅ Ícones customizados carregados!');
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎨 Iniciando Custom Icons...');
    
    // Preload icons
    await preloadCustomIcons();
    
    // Replace Font Awesome icons (opcional)
    // await replaceWithCustomIcons();
    
    console.log('✅ Custom Icons carregado!');
});

// ===== EXPORT =====
window.CustomIcons = {
    loadCustomIcon,
    createCustomIcon,
    insertCustomIcon,
    createCategoryBadge,
    createIconShowcase,
    replaceWithCustomIcons,
    preloadCustomIcons
};
