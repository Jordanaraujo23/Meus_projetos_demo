import { db } from './firebase-config.js';
import { collection, query, orderBy, limit, onSnapshot, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Dynamic News
    const newsGrid = document.querySelector('.news-grid');
    if (newsGrid) {
        const qNews = query(collection(db, "noticias"), orderBy("createdAt", "desc"), limit(3));
        onSnapshot(qNews, (snapshot) => {
            if (!snapshot.empty) {
                newsGrid.innerHTML = '';
                snapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    const card = `
                        <article class="article-card reveal">
                            <div class="article-image">
                                <span class="tag tag-primary" style="position: absolute; top: 1rem; left: 1rem">${data.category || 'Novidade'}</span>
                                <img src="${(data.imageUrl || 'assets/img/projeto-brasilia-2025-1.png').replace('../', '')}" alt="${data.title}" loading="lazy">
                            </div>
                            <div class="article-content">
                                <h3 class="article-title">${data.title}</h3>
                                <p class="article-excerpt">${data.excerpt || ''}</p>
                                <a href="noticias.html" style="color: var(--primary); font-weight: 600">
                                    Ler mais <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        </article>
                    `;
                    newsGrid.insertAdjacentHTML('beforeend', card);
                });
            } else {
                newsGrid.innerHTML = '<p class="text-center w-100 py-5 text-muted">Acompanhe nossas próximas notícias em breve!</p>';
            }
        });
    }

    // 2. Featured Project Image
    const featuredImg = document.querySelector('.split-section.bg-white .split-image img');
    if (featuredImg) {
        const qProj = query(collection(db, "projetos"), where("isMain", "==", true), limit(1));
        onSnapshot(qProj, (snapshot) => {
            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                if (data.imageUrl) featuredImg.src = data.imageUrl.replace('../', '');
            }
        });
    }
});
