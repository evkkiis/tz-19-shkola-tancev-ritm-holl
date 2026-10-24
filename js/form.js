// js/form.js

// ВСТАВЬ СЮДА СВОЮ ССЫЛКУ ИЗ APPS SCRIPT (Она начинается на https://script.google.com/macros/s/...)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyzQXWRcCtPftruPM_gftWLuv3l5MX5_tEDDUFmG9xmPv8co-HYT1oEpyYS637N3dN_VQ/exec";

// 1. Сбор UTM-меток (выполняется сразу при загрузке скрипта)
(function collectUTM() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
    
    utmKeys.forEach(key => {
        const value = urlParams.get(key);
        if (value) {
            // Сохраняем в память на время сессии
            sessionStorage.setItem(key, value);
            console.log("Сохранена метка:", key, "=", value); // Для отладки
        }
    });
})();

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('lead-form');
    if (!form) return; // Если мы не на странице контактов, ничего не делаем

    // 2. Отправка формы
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Останавливаем перезагрузку
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true; // Блокируем кнопку
        submitBtn.textContent = "Отправка...";

        // Собираем данные из формы
        const formData = new FormData(form);
        
        // Генерируем уникальный ID для заявки (по ТЗ: REQ- + UUID)
        const requestId = 'REQ-' + crypto.randomUUID();

        // Добавляем скрытые поля и UTM-метки из sessionStorage
        formData.append('request_id', requestId);
        
        const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
        utmKeys.forEach(key => {
            // Если в памяти есть метка, берем её, иначе пустую строку
            const val = sessionStorage.getItem(key) || '';
            formData.append(key, val);
        });

        try {
            // Отправляем POST запрос в Google Apps Script
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.ok === true) {
                // Если успех, сохраняем номер заявки и переходим на страницу Спасибо
                sessionStorage.setItem('last_request_id', requestId);
                
                // Отправляем событие generate_lead в GA4 (по ТЗ)
                if (typeof gtag === 'function') {
                    gtag('event', 'generate_lead', {
                        lead_style: formData.get('dance_style'),
                        lead_level: formData.get('level'),
                        lead_source: sessionStorage.getItem('utm_source') || 'direct'
                    });
                }

                window.location.href = 'thanks.html';
            } else {
                // Ошибка от скрипта (например, неверный формат телефона)
                alert("Ошибка: " + result.error);
                if (typeof gtag === 'function') {
                    gtag('event', 'form_error', { error_type: 'server' });
                }
                submitBtn.disabled = false;
                submitBtn.textContent = "Отправить";
            }
        } catch (error) {
            console.error("Ошибка сети:", error);
            alert("Ошибка сети. Попробуйте позже.");
            if (typeof gtag === 'function') {
                gtag('event', 'form_error', { error_type: 'network' });
            }
            submitBtn.disabled = false;
            submitBtn.textContent = "Отправить";
        }
    });
});