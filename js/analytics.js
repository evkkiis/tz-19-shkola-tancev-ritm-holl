// js/analytics.js
// Этот файл отвечает за отправку событий в Google Analytics 4 (GA4) и сбор UTM-меток.

// 1. Сбор UTM-меток (выполняется сразу при загрузке скрипта на любой странице)
(function collectUTM() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
    
    utmKeys.forEach(key => {
        const value = urlParams.get(key);
        if (value) {
            sessionStorage.setItem(key, value);
            console.log("Сохранена метка:", key, "=", value);
        }
    });
})();

document.addEventListener('DOMContentLoaded', () => {
    
    // Функция отправки события
    function sendEvent(eventName, params = {}) {
        if (typeof gtag === 'function') {
            gtag('event', eventName, params);
        } else {
            console.log(`[СОБЫТИЕ]: ${eventName}`, params);
        }
    }

    // 2. Поиск элементов с атрибутом data-event (клики)
    const trackableElements = document.querySelectorAll('[data-event]');
    
    trackableElements.forEach(element => {
        element.addEventListener('click', () => {
            const eventName = element.getAttribute('data-event');
            const params = {};
            
            // Сбор параметров из data-атрибутов
            for (let attr of element.attributes) {
                if (attr.name.startsWith('data-') && attr.name !== 'data-event') {
                    const paramName = attr.name.replace('data-', '').replace(/-/g, '_');
                    params[paramName] = attr.value;
                }
            }
            
            sendEvent(eventName, params);
        });
    });

    // 3. Отслеживание video_play (один раз за просмотр)
    const videos = document.querySelectorAll('video[data-event]');
    videos.forEach(video => {
        video.addEventListener('play', () => {
            const eventName = video.getAttribute('data-event');
            const pageSection = video.getAttribute('data-page-section');
            
            if (!video.dataset.tracked) {
                sendEvent(eventName, { page_section: pageSection });
                video.dataset.tracked = 'true'; 
            }
        });
    });

    // 4. Отслеживание scroll (90%)
    let scrollTracked = false;
    window.addEventListener('scroll', () => {
        if (scrollTracked) return;
        
        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.body.offsetHeight;
        
        if ((scrollPosition / pageHeight) * 100 >= 90) {
            sendEvent('scroll', { percent_scrolled: 90 });
            scrollTracked = true;
        }
    });

    // 5. page_view
    sendEvent('page_view', {
        page_location: window.location.href,
        page_title: document.title
    });
});