import { db } from './firebase-config.js';
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const newsGrid = document.getElementById('news-grid');
    const featuredWrapper = document.querySelector('.featured-news-wrapper');

    if (newsGrid) {
        const q = query(collection(db, "noticias"), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            newsGrid.innerHTML = '';
            
            if (snapshot.empty) {
                newsGrid.innerHTML = '<p class="text-center w-100 py-5 text-muted">Aguardando novas notícias...</p>';
                return;
            }

            const allNews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            window.currentNews = allNews;

            // 1. Featured News with Random Rotation
            let currentFeaturedIndex = Math.floor(Math.random() * allNews.length);
            
            const updateFeatured = (index) => {
                const featured = allNews[index];
                if (!featured || !featuredWrapper) return;

                const dateStr = featured.createdAt?.toDate ? featured.createdAt.toDate().toLocaleDateString('pt-BR') : 'Recente';
                const categorySlug = (featured.category || 'geral').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
                
                // Add fade-out effect if content exists
                if (featuredWrapper.innerHTML) {
                    featuredWrapper.style.opacity = '0';
                    featuredWrapper.style.transform = 'translateY(10px)';
                }

                setTimeout(() => {
                    featuredWrapper.innerHTML = `
                        <article class="featured-article reveal active" 
                                 data-category="${categorySlug}" 
                                 onclick="openNewsModalById('${featured.id}')">
                            <div class="featured-article-image">
                                <img src="${(featured.imageUrl || 'assets/img/projeto-brasilia-2025-1.png').replace('../', '')}" alt="${featured.title}">
                                <span class="tag tag-primary">Notícia em Destaque</span>
                            </div>
                            <div class="featured-article-content">
                                <div class="featured-meta">
                                    <span><i class="far fa-calendar-alt"></i> ${dateStr}</span>
                                    <span><i class="far fa-user"></i> Assessoria</span>
                                </div>
                                <h2 class="featured-title">${featured.title}</h2>
                                <p class="featured-excerpt">${featured.excerpt || ''}</p>
                                <button class="btn btn-primary btn-pill">Ler Matéria Completa</button>
                            </div>
                        </article>
                    `;
                    featuredWrapper.style.opacity = '1';
                    featuredWrapper.style.transform = 'translateY(0)';
                    featuredWrapper.classList.add('active');
                    featuredWrapper.style.transition = 'all 0.8s ease';
                }, featuredWrapper.innerHTML ? 400 : 0);
            };

            // Initial render
            updateFeatured(currentFeaturedIndex);

            // Rotation Interval (Every 8 seconds)
            if (window.featuredInterval) clearInterval(window.featuredInterval);
            if (allNews.length > 1) {
                window.featuredInterval = setInterval(() => {
                    let nextIndex;
                    do {
                        nextIndex = Math.floor(Math.random() * allNews.length);
                    } while (nextIndex === currentFeaturedIndex && allNews.length > 1);
                    
                    currentFeaturedIndex = nextIndex;
                    updateFeatured(currentFeaturedIndex);
                }, 8000);
            }

            // 2. Render Full Grid (Existing logic)
            newsGrid.innerHTML = '';
            allNews.forEach((item) => {
                const dateStr = item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('pt-BR') : 'Recente';
                const categorySlug = (item.category || 'geral')
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]/g, '');

                const card = `
                    <article class="article-card reveal active" 
                             data-category="${categorySlug}" 
                             onclick="openNewsModalById('${item.id}')">
                        <div class="article-image">
                            <span class="tag tag-primary" style="position: absolute; top: 1rem; right: 1rem;">${item.category || 'Geral'}</span>
                            <img src="${(item.imageUrl || 'assets/img/projeto-brasilia-2025-1.png').replace('../', '')}" alt="${item.title}" loading="lazy">
                        </div>
                        <div class="article-content">
                            <span class="meta-date"><i class="far fa-calendar-alt"></i> ${dateStr}</span>
                            <h3 class="article-title">${item.title}</h3>
                            <p class="article-excerpt">${item.excerpt || ''}</p>
                            <button class="read-more">Ler mais <i class="fas fa-arrow-right"></i></button>
                        </div>
                    </article>
                `;
                newsGrid.insertAdjacentHTML('beforeend', card);
            });
        });
    }

    window.openNewsModalById = (id) => {
        const item = window.currentNews.find(n => n.id === id);
        if (item) {
            // Fill modal and show (Reuse openNewsModal logic if available or implement here)
            const modal = document.getElementById("news-modal");
            if (!modal) return;
            
            document.getElementById("news-modal-title").innerText = item.title;
            document.getElementById("news-modal-category").innerText = item.category || 'Geral';
            document.getElementById("news-modal-date").innerText = item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('pt-BR') : 'Recente';
            document.getElementById("news-modal-body").innerHTML = item.content || item.description || item.excerpt;
            
            const track = document.getElementById("news-carousel-track");
            if (track) {
                const imgUrl = (item.imageUrl || 'assets/img/projeto-brasilia-2025-1.png').replace('../', '');
                track.innerHTML = `<img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover;">`;
            }

            modal.classList.add("active");
            document.body.style.overflow = "hidden";
        }
    };

    window.closeNewsModal = () => {
        const modal = document.getElementById("news-modal");
        if (modal) modal.classList.remove("active");
        document.body.style.overflow = "auto";
    };
});
