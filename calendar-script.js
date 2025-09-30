// ====================================
// OKUL TAKVİM SİSTEMİ - CALENDAR VIEW
// ====================================

console.log('%c📅 Takvim Görünümü Başlatılıyor...', 'color: #667eea; font-size: 16px; font-weight: bold;');

// Global Variables
let currentUser = {
    id: 1,
    name: 'Demo Kullanıcı',
    email: 'demo@okul.com',
    role: 'teacher'
};

let events = [];
let currentDate = new Date();
let selectedDate = null;

// Event Types
const eventTypes = {
    lesson: { label: 'Ders', color: '#10b981' },
    exam: { label: 'Sınav', color: '#ef4444' },
    lab: { label: 'Laboratuvar', color: '#3b82f6' },
    meeting: { label: 'Toplantı', color: '#f59e0b' },
    event: { label: 'Etkinlik', color: '#8b5cf6' },
    homework: { label: 'Ödev', color: '#ec4899' }
};

const priorityLevels = {
    low: { label: 'Düşük', color: '#6b7280' },
    medium: { label: 'Orta', color: '#f59e0b' },
    high: { label: 'Yüksek', color: '#ef4444' }
};

const statusOptions = {
    scheduled: { label: 'Planlandı', color: '#3b82f6' },
    inprogress: { label: 'Devam Ediyor', color: '#f59e0b' },
    completed: { label: 'Tamamlandı', color: '#10b981' },
    cancelled: { label: 'İptal Edildi', color: '#6b7280' }
};

const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

// ====================================
// INITIALIZE
// ====================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 Takvim yükleniyor...');
    loadUserInfo();
    loadEvents();
    renderCalendar();
    updateStats();
    console.log('✨ Takvim hazır!');
});

// ====================================
// USER INFO
// ====================================
function loadUserInfo() {
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    
    if (userName) userName.textContent = currentUser.name;
    if (userRole) userRole.textContent = 'Öğretmen';
}

// ====================================
// LOAD EVENTS
// ====================================
function loadEvents() {
    const saved = localStorage.getItem('schoolCalendarEvents');
    if (saved) {
        try {
            events = JSON.parse(saved);
            console.log('📦 Etkinlikler yüklendi:', events.length);
        } catch (e) {
            console.error('❌ Veri yükleme hatası:', e);
            events = [];
        }
    } else {
        events = [];
    }
}

// ====================================
// CALENDAR RENDERING
// ====================================
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update header
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get day of week (0 = Sunday, adjust to Monday = 0)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    
    // Get previous month days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    
    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        const date = new Date(year, month - 1, day);
        grid.appendChild(createDayCell(date, true));
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        grid.appendChild(createDayCell(date, false));
    }
    
    // Next month days
    const totalCells = grid.children.length;
    const remainingCells = 42 - totalCells; // 6 weeks = 42 cells
    for (let day = 1; day <= remainingCells; day++) {
        const date = new Date(year, month + 1, day);
        grid.appendChild(createDayCell(date, true));
    }
}

function createDayCell(date, isOtherMonth) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    
    if (isOtherMonth) {
        cell.classList.add('other-month');
    }
    
    // Check if today
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        cell.classList.add('today');
    }
    
    // Get events for this day
    const dayEvents = getEventsForDate(date);
    const hasConflicts = checkDayConflicts(dayEvents);
    
    if (dayEvents.length > 0) {
        cell.classList.add('has-events');
    }
    
    if (hasConflicts) {
        cell.classList.add('has-conflicts');
    }
    
    // Create day number
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    
    if (date.toDateString() === today.toDateString()) {
        const circle = document.createElement('div');
        circle.className = 'day-number-circle';
        circle.textContent = date.getDate();
        dayNumber.appendChild(circle);
    } else {
        dayNumber.textContent = date.getDate();
    }
    
    if (dayEvents.length > 0 && !isOtherMonth) {
        const count = document.createElement('span');
        count.className = 'event-count';
        count.textContent = dayEvents.length;
        dayNumber.appendChild(count);
    }
    
    cell.appendChild(dayNumber);
    
    // Create events container
    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'day-events';
    
    // Show max 3 events, then "X more"
    const maxVisible = 3;
    const visibleEvents = dayEvents.slice(0, maxVisible);
    
    visibleEvents.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.className = `calendar-event ${event.type}`;
        eventEl.onclick = (e) => {
            e.stopPropagation();
            showEventDetail(event);
        };
        
        const title = document.createElement('span');
        title.className = 'calendar-event-title';
        title.textContent = event.title;
        
        const time = document.createElement('span');
        time.className = 'calendar-event-time';
        time.textContent = event.startTime;
        
        eventEl.appendChild(title);
        eventEl.appendChild(time);
        eventsContainer.appendChild(eventEl);
    });
    
    // Show "X more" if there are more events
    if (dayEvents.length > maxVisible) {
        const moreEl = document.createElement('div');
        moreEl.className = 'more-events';
        moreEl.textContent = `+${dayEvents.length - maxVisible} daha fazla`;
        moreEl.onclick = (e) => {
            e.stopPropagation();
            showDayEvents(date, dayEvents);
        };
        eventsContainer.appendChild(moreEl);
    }
    
    cell.appendChild(eventsContainer);
    
    // Click handler for day
    cell.onclick = () => {
        if (dayEvents.length > 0) {
            showDayEvents(date, dayEvents);
        }
    };
    
    return cell;
}

function getEventsForDate(date) {
    const dateStr = formatDateForInput(date);
    return events.filter(event => event.date === dateStr)
        .sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
}

function checkDayConflicts(dayEvents) {
    for (let i = 0; i < dayEvents.length; i++) {
        for (let j = i + 1; j < dayEvents.length; j++) {
            const e1Start = parseTime(dayEvents[i].startTime);
            const e1End = parseTime(dayEvents[i].endTime);
            const e2Start = parseTime(dayEvents[j].startTime);
            const e2End = parseTime(dayEvents[j].endTime);
            
            if (e1Start < e2End && e1End > e2Start) {
                return true;
            }
        }
    }
    return false;
}

// ====================================
// EVENT DETAIL MODAL
// ====================================
function showEventDetail(event) {
    const modal = document.getElementById('eventDetailModal');
    const content = document.getElementById('eventDetailContent');
    
    const conflicts = checkConflicts(event);
    
    content.innerHTML = `
        <div class="event-detail-content">
            <div class="detail-section">
                <div class="detail-badges">
                    <span class="detail-badge" style="background: ${eventTypes[event.type].color}; color: white;">
                        ${eventTypes[event.type].label}
                    </span>
                    <span class="detail-badge" style="background: ${priorityLevels[event.priority].color}33; color: ${priorityLevels[event.priority].color};">
                        ${priorityLevels[event.priority].label} Öncelik
                    </span>
                    <span class="detail-badge" style="background: ${statusOptions[event.status].color}33; color: ${statusOptions[event.status].color};">
                        ${statusOptions[event.status].label}
                    </span>
                </div>
            </div>
            
            <div class="detail-section">
                <div class="detail-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    </svg>
                    Etkinlik Adı
                </div>
                <div class="detail-value">${event.title}</div>
            </div>
            
            <div class="detail-time">
                <div class="detail-time-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    ${formatDate(event.date)}
                </div>
                <div class="detail-time-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${event.startTime} - ${event.endTime}
                </div>
            </div>
            
            ${event.location ? `
                <div class="detail-section">
                    <div class="detail-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Konum
                    </div>
                    <div class="detail-value">${event.location}</div>
                </div>
            ` : ''}
            
            ${event.teacher ? `
                <div class="detail-section">
                    <div class="detail-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Öğretmen
                    </div>
                    <div class="detail-value">${event.teacher}</div>
                </div>
            ` : ''}
            
            ${event.students ? `
                <div class="detail-section">
                    <div class="detail-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                        </svg>
                        Sınıflar
                    </div>
                    <div class="detail-value">${event.students}</div>
                </div>
            ` : ''}
            
            ${event.description ? `
                <div class="detail-section">
                    <div class="detail-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="17" y1="10" x2="3" y2="10"></line>
                            <line x1="21" y1="6" x2="3" y2="6"></line>
                            <line x1="21" y1="14" x2="3" y2="14"></line>
                            <line x1="17" y1="18" x2="3" y2="18"></line>
                        </svg>
                        Açıklama
                    </div>
                    <div class="detail-value">${event.description}</div>
                </div>
            ` : ''}
            
            ${conflicts.length > 0 ? `
                <div class="conflict-alert">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <div class="conflict-alert-content">
                        <strong>Çakışma Uyarısı!</strong>
                        <p>Bu etkinlik ${conflicts.length} etkinlikle çakışıyor: ${conflicts.map(c => c.title).join(', ')}</p>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    modal.classList.add('active');
}

function showDayEvents(date, dayEvents) {
    const modal = document.getElementById('eventDetailModal');
    const content = document.getElementById('eventDetailContent');
    const title = document.getElementById('detailTitle');
    
    title.textContent = `${formatDate(formatDateForInput(date))} - ${dayEvents.length} Etkinlik`;
    
    const eventsHtml = dayEvents.map(event => `
        <div class="calendar-event ${event.type}" style="margin-bottom: 8px; cursor: pointer;" onclick="showEventDetail(${JSON.stringify(event).replace(/"/g, '&quot;')})">
            <span class="calendar-event-title">${event.title}</span>
            <span class="calendar-event-time">${event.startTime} - ${event.endTime}</span>
        </div>
    `).join('');
    
    content.innerHTML = `<div class="event-detail-content">${eventsHtml}</div>`;
    modal.classList.add('active');
}

function closeEventDetail() {
    document.getElementById('eventDetailModal').classList.remove('active');
}

// ====================================
// NAVIGATION
// ====================================
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    updateStats();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    updateStats();
}

function goToToday() {
    currentDate = new Date();
    renderCalendar();
    updateStats();
    showToast('Bugüne gidildi', 'info');
}

// ====================================
// STATS
// ====================================
function updateStats() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // This month events
    const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
    
    // Today events
    const today = new Date();
    const todayStr = formatDateForInput(today);
    const todayEvents = events.filter(event => event.date === todayStr);
    
    const monthEl = document.getElementById('monthEvents');
    const todayEl = document.getElementById('todayEvents');
    
    if (monthEl) monthEl.textContent = monthEvents.length;
    if (todayEl) todayEl.textContent = todayEvents.length;
}

// ====================================
// UTILITY FUNCTIONS
// ====================================
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function checkConflicts(event) {
    return events.filter(e => {
        if (e.id === event.id) return false;
        if (e.date !== event.date) return false;
        const eStart = parseTime(e.startTime);
        const eEnd = parseTime(e.endTime);
        const eventStart = parseTime(event.startTime);
        const eventEnd = parseTime(event.endTime);
        return (eventStart < eEnd && eventEnd > eStart);
    });
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function logout() {
    if (confirm('Çıkış yapmak istiyor musunuz?')) {
        alert('Demo modda çıkış yapılamaz');
    }
}

// Make functions global
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.goToToday = goToToday;
window.closeEventDetail = closeEventDetail;
window.showEventDetail = showEventDetail;
window.toggleSidebar = toggleSidebar;
window.logout = logout;

console.log('%c✨ Takvim Hazır!', 'color: #10b981; font-size: 18px; font-weight: bold;');