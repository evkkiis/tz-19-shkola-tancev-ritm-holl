document.addEventListener('DOMContentLoaded', () => {
    
    // Функция отправки события
    function sendEvent(eventName, params = {}) {
        if (typeof gtag === 'function') {
            gtag('event', eventName, params);
        } else {
            console.log(`[СОБЫТИЕ]: ${eventName}`, params);
        }
    }

    // 1. Поиск элементов с атрибутом data-event
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

    // 2. Отслеживание video_play (один раз за просмотр)
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

    // 3. Отслеживание scroll (90%)
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

    // 4. page_view
    sendEvent('page_view', {
        page_location: window.location.href,
        page_title: document.title
    });
});