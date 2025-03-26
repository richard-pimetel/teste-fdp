// perfil.js - Versão Final Corrigida e Completa

// 1. Estilos para o modal de logout
const logoutModalStyles = `
    .logout-confirmation-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .logout-confirmation-content {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        width: 80%;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .logout-confirmation-content h3 {
        margin-top: 0;
        color: #333;
    }
    
    .logout-confirmation-content p {
        margin-bottom: 20px;
        color: #666;
    }
    
    .confirmation-buttons {
        display: flex;
        justify-content: space-between;
    }
    
    .confirmation-buttons button {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
    }
    
    .confirm-btn {
        background-color: #ff4d4d;
        color: white;
    }
    
    .confirm-btn:hover {
        background-color: #ff3333;
    }
    
    .cancel-btn {
        background-color: #f0f0f0;
        color: #333;
    }
    
    .cancel-btn:hover {
        background-color: #e0e0e0;
    }
`;

// Adiciona os estilos ao documento
const styleElement = document.createElement('style');
styleElement.innerHTML = logoutModalStyles;
document.head.appendChild(styleElement);

// 2. Som de notificação em base64 funcional
const notificationSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...');

// 3. Sistema de tópicos com memória melhorado
const conversationTopics = {
    currentTopic: null,
    lastTopics: [],
    
    getNewTopic: function() {
        const allTopics = [
            "E aí, curtiu o último vídeo que postei sobre o jogo do Corinthians?",
            "To pensando em fazer uma live amanhã, você vai aparecer?",
            "O que achou da última partida do Brasileirão?",
            "Você pratica algum esporte? Eu adoro correr nos fins de semana!",
            "To preparando um conteúdo especial sobre a história do futebol brasileiro...",
            "Qual foi o jogo mais emocionante que você já assistiu?",
            "Você acompanha outros esportes além do futebol?",
            "O que acha que o Corinthians precisa para melhorar esse ano?",
            "Você já foi em algum estádio ver jogo ao vivo?",
            "Prefere futebol nacional ou internacional?"
        ];
        
        const availableTopics = allTopics.filter(topic => 
            !this.lastTopics.includes(topic)
        );
        
        const newTopic = availableTopics.length > 0 
            ? availableTopics[Math.floor(Math.random() * availableTopics.length)]
            : allTopics[Math.floor(Math.random() * allTopics.length)];
        
        this.lastTopics.push(newTopic);
        if (this.lastTopics.length > 5) {
            this.lastTopics.shift();
        }
        
        this.currentTopic = newTopic;
        return newTopic;
    }
};

// Perfil do usuário
const profile = {
    name: "Cazé tv",
    stats: {
        posts: "2 mil",
        followers: "989mil",
        following: "459"
    },
    bio: {
        intro: "(Apaixonado por futebol e corrida!)",
        details: [
            "Esportes favoritos (futebol, basquete, corrida, etc.)",
            "Time do coração: Corinthians"
        ]
    },
    messages: [],
    isFollowing: false,
    settings: {
        notifications: true,
        sound: true,
        privateAccount: false,
        theme: "light"
    },
    lastMessageTime: null,
    chatInterval: null
};

// Controle de foco da janela
let windowHasFocus = true;
window.addEventListener('focus', () => windowHasFocus = true);
window.addEventListener('blur', () => windowHasFocus = false);

// Carrega as configurações salvas
function loadSavedSettings() {
    const savedSettings = localStorage.getItem('profileSettings');
    if (savedSettings) {
        Object.assign(profile.settings, JSON.parse(savedSettings));
    }
    
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
        profile.messages = JSON.parse(savedMessages);
    }
}

// Salva as configurações
function saveSettings() {
    localStorage.setItem('profileSettings', JSON.stringify(profile.settings));
    localStorage.setItem('chatMessages', JSON.stringify(profile.messages));
}

// Inicializa o chat
function initializeChat() {
    if (profile.messages.length === 0) {
        const welcomeMessages = [
            {
                sender: "Cazé tv",
                text: "E aí, tudo bem? Sou o Cazé, apaixonado por esportes!",
                time: getCurrentTime(),
                received: true,
                read: false
            },
            {
                sender: "Cazé tv",
                text: conversationTopics.getNewTopic(),
                time: getCurrentTime(),
                received: true,
                read: false
            }
        ];
        
        profile.messages = welcomeMessages;
        saveSettings();
    }
    
    startAutoMessages();
}

// Funções auxiliares
function getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function isOlderThan(timeString, minutes) {
    const now = new Date();
    const time = new Date(timeString);
    return (now - time) > (minutes * 60 * 1000);
}

// Sistema de mensagens automáticas
function startAutoMessages() {
    if (profile.chatInterval) clearInterval(profile.chatInterval);
    
    profile.chatInterval = setInterval(() => {
        if (!DOM.chatModal.classList.contains('active')) {
            sendAutoMessage();
        }
    }, 300000); // 5 minutos
    
    setTimeout(sendAutoMessage, 60000); // Primeira mensagem após 1 minuto
}

function sendAutoMessage() {
    const lastInteraction = profile.messages
        .filter(m => !m.received)
        .sort((a, b) => new Date(b.time) - new Date(a.time))[0];
    
    let messageText;
    
    if (!lastInteraction || isOlderThan(lastInteraction.time, 2)) {
        messageText = conversationTopics.getNewTopic();
    } else {
        messageText = generateReply(lastInteraction.text);
    }
    
    const newMessage = {
        sender: "Cazé tv",
        text: messageText,
        time: getCurrentTime(),
        received: true,
        read: false
    };
    
    profile.messages.push(newMessage);
    saveSettings();
    
    if (!DOM.chatModal.classList.contains('active')) {
        updateUnreadCount();
        showNotification("Nova mensagem de Cazé tv");
    } else {
        renderMessages();
    }
}

// Sistema de respostas inteligentes melhorado
function generateReply(userMessage) {
    const text = userMessage.toLowerCase().trim();
    
    // Respostas específicas para saudações
    if (/(olá|oi|e aí)/.test(text)) {
        return randomResponse([
            "E aí, tudo bem? Sou o Cazé, prazer!",
            "Oi! Tudo jóia com você?",
            "E aí, beleza? Como você tá?"
        ]);
    }
    
    // Respostas para "tudo bem"
    if (/tudo bem/.test(text)) {
        return randomResponse([
            "Que bom! Eu tô ótimo, obrigado por perguntar!",
            "Aqui tudo ótimo! E com você?",
            "Tô bem demais! Preparando uns vídeos novos!"
        ]);
    }
    
    // Restante do sistema de respostas temáticas
    const responses = {
        corinthians: [
            "Vai Corinthians! O que achou da última partida?",
            "Timão! Tá gostando do desempenho essa temporada?",
            "Corinthians é paixão! Qual seu jogador favorito do time atual?"
        ],
        futebol: [
            "Futebol é demais né? Qual o melhor jogo que você já viu?",
            "To preparando um vídeo sobre táticas de futebol! Tem um estilo de jogo preferido?",
            "O que achou da última rodada do Brasileirão?"
        ],
        basquete: [
            "Basquete é espetacular! Você acompanha a NBA?",
            "Curtiu os últimos jogos da NBA? Tô fazendo uns vídeos sobre!",
            "Basquete brasileiro tá animado, você acompanha?"
        ],
        vídeos: [
            "To sempre preparando conteúdos novos! Tem algum tema que você gostaria?",
            "To editando uns vídeos novos! O que você mais gosta no canal?",
            "To planejando os próximos vídeos, sugestões são bem-vindas!"
        ],
        padrão: [
            "Interessante isso! Me conta mais...",
            "Legal seu ponto! O que mais você acha sobre?",
            "Gostei do que falou! Desenvolve mais essa ideia aí..."
        ]
    };

    if (/corinthians|timão/i.test(text)) {
        return randomResponse(responses.corinthians);
    }
    if (/futebol|jogo|partida|brasileirão/i.test(text)) {
        return randomResponse(responses.futebol);
    }
    if (/basquete|nba|quadra/i.test(text)) {
        return randomResponse(responses.basquete);
    }
    if (/vídeo|conteúdo|canal|youtube/i.test(text)) {
        return randomResponse(responses.vídeos);
    }
    if (/\?$/.test(text)) {
        return "Boa pergunta! To preparando um conteúdo sobre isso, posso te avisar quando sair?";
    }
    
    return randomResponse(responses.padrão);
}

function randomResponse(options) {
    return options[Math.floor(Math.random() * options.length)];
}

// Funções do chat
function sendMessage() {
    const text = DOM.chatMessageInput.value.trim();
    if (text) {
        const userMessage = {
            sender: "Você",
            text: text,
            time: getCurrentTime(),
            received: false,
            read: true
        };
        
        profile.messages.push(userMessage);
        renderMessages();
        DOM.chatMessageInput.value = '';
        
        showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            const replyText = generateReply(text);
            const replyMessage = {
                sender: "Cazé tv",
                text: replyText,
                time: getCurrentTime(),
                received: true,
                read: false
            };
            
            profile.messages.push(replyMessage);
            renderMessages();
            saveSettings();
            
            if (profile.settings.sound) {
                playNotificationSound();
            }
        }, 1500 + Math.random() * 2000);
    }
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    DOM.chatMessages.appendChild(typingDiv);
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function playNotificationSound() {
    try {
        // Cria um novo elemento de áudio cada vez para evitar conflitos
        const sound = new Audio();
        sound.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
        sound.volume = 0.3;
        sound.play().catch(e => console.log("Erro ao tocar som:", e));
    } catch (e) {
        console.log("Erro no sistema de som:", e);
    }
}

// Função de notificação melhorada
function showNotification(message) {
    if (!profile.settings.notifications) return;
    
    DOM.notification.textContent = message;
    DOM.notification.classList.add('show');
    
    // Toca som apenas se estiver ativado e a janela não estiver em foco
    if (profile.settings.sound && !windowHasFocus) {
        playNotificationSound();
    }
    
    setTimeout(() => {
        DOM.notification.classList.remove('show');
    }, 3000);
}

// Configurações
function toggleNotifications() {
    profile.settings.notifications = DOM.notificationsToggle.checked;
    saveSettings();
    showNotification(`Notificações ${profile.settings.notifications ? 'ativadas' : 'desativadas'}`);
}

function toggleSound() {
    profile.settings.sound = DOM.soundToggle.checked;
    saveSettings();
    showNotification(`Som ${profile.settings.sound ? 'ativado' : 'desativado'}`);
    
    if (profile.settings.sound) {
        playNotificationSound();
    }
}

function togglePrivateAccount() {
    profile.settings.privateAccount = DOM.privateAccountToggle.checked;
    saveSettings();
    showNotification(`Conta ${profile.settings.privateAccount ? 'privada' : 'pública'}`);
}

function changeTheme(theme) {
    profile.settings.theme = theme;
    document.body.className = theme;
    saveSettings();
    showNotification(`Tema alterado para ${theme}`);
    
    // Atualiza o tema ativo nos botões de navegação
    updateNavItemsStyle();
    
    // Marca o tema ativo no seletor
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}

function updateNavItemsStyle() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.style.color = '';
        item.offsetHeight;
        item.style.color = getComputedStyle(item).color;
    });
}

function loadSettings() {
    DOM.notificationsToggle.checked = profile.settings.notifications;
    DOM.soundToggle.checked = profile.settings.sound;
    DOM.privateAccountToggle.checked = profile.settings.privateAccount;
    document.body.className = profile.settings.theme;
    updateNavItemsStyle();
    
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === profile.settings.theme);
    });
}

// Elementos DOM
const DOM = {
    followBtn: document.getElementById('followBtn'),
    unfollowBtn: document.getElementById('unfollowBtn'),
    editBioBtn: document.getElementById('editBioBtn'),
    editProfileBtn: document.getElementById('editProfileBtn'),
    navItems: document.querySelectorAll('.nav-item'),
    messagesNavItem: document.getElementById('messagesNavItem'),
    settingsNavItem: document.getElementById('settingsNavItem'),
    profileName: document.querySelector('.profile-name'),
    postsCount: document.getElementById('postsCount'),
    followersCount: document.getElementById('followersCount'),
    followingCount: document.getElementById('followingCount'),
    bioIntro: document.getElementById('bioIntro'),
    bioDetailsList: document.getElementById('bioDetailsList'),
    notification: document.getElementById('notification'),
    bioModal: document.getElementById('bioModal'),
    bioEditor: document.getElementById('bioEditor'),
    closeBioModal: document.getElementById('closeBioModal'),
    cancelBioEdit: document.getElementById('cancelBioEdit'),
    saveBio: document.getElementById('saveBio'),
    profileModal: document.getElementById('profileModal'),
    profileNameInput: document.getElementById('profileNameInput'),
    closeProfileModal: document.getElementById('closeProfileModal'),
    cancelProfileEdit: document.getElementById('cancelProfileEdit'),
    saveProfile: document.getElementById('saveProfile'),
    publicationsContainer: document.querySelector('.publications'),
    chatModal: document.getElementById('chatModal'),
    chatMessages: document.getElementById('chatMessages'),
    chatMessageInput: document.getElementById('chatMessageInput'),
    sendMessageBtn: document.getElementById('sendMessageBtn'),
    closeChatModal: document.getElementById('closeChatModal'),
    unreadCount: document.querySelector('.unread-count'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsModal: document.getElementById('closeSettingsModal'),
    notificationsToggle: document.getElementById('notificationsToggle'),
    soundToggle: document.getElementById('soundToggle'),
    privateAccountToggle: document.getElementById('privateAccountToggle'),
    logoutBtn: document.getElementById('logoutBtn'),
    logoutConfirmationModal: document.getElementById('logoutConfirmationModal'),
    logoutConfirmBtn: document.getElementById('logoutConfirmBtn'),
    logoutCancelBtn: document.getElementById('logoutCancelBtn')
};

// Inicialização
document.addEventListener('DOMContentLoaded', init);

function init() {
    loadSavedSettings();
    loadProfileData();
    setupEventListeners();
    loadSportsPublications();
    updateUnreadCount();
    loadSettings();
    initializeChat();
    changeTheme(profile.settings.theme);
}

// Sistema de Chat
function setupChat() {
    DOM.sendMessageBtn.addEventListener('click', sendMessage);
    DOM.chatMessageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    DOM.closeChatModal.addEventListener('click', closeChat);
    DOM.chatModal.addEventListener('click', (e) => {
        if (e.target === DOM.chatModal) closeChat();
    });
}

function openChat() {
    DOM.chatModal.classList.add('active');
    markMessagesAsRead();
    updateUnreadCount();
    renderMessages();
}

function closeChat() {
    DOM.chatModal.classList.remove('active');
}

function renderMessages() {
    DOM.chatMessages.innerHTML = '';
    profile.messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.received ? 'received' : 'sent'}`;
        messageDiv.innerHTML = `
            ${msg.received ? `<strong>${msg.sender}</strong><br>` : ''}
            ${msg.text}
            <span class="message-time">${msg.time}</span>
        `;
        DOM.chatMessages.appendChild(messageDiv);
    });
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
}

function markMessagesAsRead() {
    profile.messages.forEach(msg => {
        if (msg.received) msg.read = true;
    });
}

function updateUnreadCount() {
    const unread = profile.messages.filter(msg => msg.received && !msg.read).length;
    if (DOM.unreadCount) {
        DOM.unreadCount.textContent = unread;
        DOM.unreadCount.style.display = unread > 0 ? 'flex' : 'none';
    }
}

// Publicações Esportivas
async function getSportsImages() {
    try {
        const sportsDbImages = await getSportsDbImages();
        return sportsDbImages.length >= 6 ? sportsDbImages : [
            ...sportsDbImages,
            ...await getUnsplashSportsImages(6 - sportsDbImages.length)
        ];
    } catch (error) {
        console.error("Erro ao obter imagens esportivas:", error);
        return await getUnsplashSportsImages(6);
    }
}

async function getSportsDbImages() {
    const leagueIds = [4328, 4387, 4391];
    const images = [];
    
    for (const leagueId of leagueIds) {
        const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=${leagueId}`);
        const data = await response.json();
        
        if (data.events) {
            for (const event of data.events.filter(event => event.strThumb)) {
                if (images.length >= 6) break;
                images.push({
                    url: event.strThumb,
                    alt: `${event.strEvent} - ${event.strLeague}`,
                    type: 'event'
                });
            }
        }
    }
    return images.slice(0, 6);
}

async function getUnsplashSportsImages(count) {
    const sports = ['soccer', 'basketball', 'volleyball', 'tennis', 'running', 'swimming'];
    return Array.from({length: count}, (_, i) => ({
        url: `https://source.unsplash.com/random/300x300/?${sports[i % sports.length]},sports`,
        alt: `Imagem de ${sports[i % sports.length]}`,
        type: 'generic'
    }));
}

async function loadSportsPublications() {
    try {
        const sportsImages = await getSportsImages();
        await renderPublications(sportsImages);
    } catch (error) {
        console.error("Erro ao carregar publicações:", error);
        showNotification("Não foi possível carregar as publicações esportivas");
    }
}

async function renderPublications(images) {
    DOM.publicationsContainer.innerHTML = '';
    
    for (let row = 0; row < 2; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'publication';
        
        for (let col = 0; col < 3; col++) {
            const index = row * 3 + col;
            if (images[index]) {
                const item = document.createElement('div');
                item.className = 'publication-item';
                const img = document.createElement('img');
                img.alt = images[index].alt;
                img.loading = 'lazy';
                item.title = images[index].alt;
                item.appendChild(img);
                rowDiv.appendChild(item);
                await loadImageWithFallback(img, images[index].url, images[index].alt);
            }
        }
        DOM.publicationsContainer.appendChild(rowDiv);
    }
}

async function loadImageWithFallback(imgElement, src, alt) {
    return new Promise((resolve) => {
        imgElement.onload = () => {
            imgElement.parentElement.classList.add('loaded');
            resolve();
        };
        imgElement.onerror = () => {
            imgElement.src = `https://source.unsplash.com/random/300x300/?sports,${encodeURIComponent(alt)}`;
            imgElement.parentElement.classList.add('loaded');
            resolve();
        };
        imgElement.src = src;
    });
}

// Funções do Perfil
function loadProfileData() {
    DOM.profileName.textContent = profile.name;
    DOM.postsCount.textContent = profile.stats.posts;
    DOM.followersCount.textContent = profile.stats.followers;
    DOM.followingCount.textContent = profile.stats.following;
    DOM.bioIntro.textContent = profile.bio.intro;
    DOM.bioDetailsList.innerHTML = profile.bio.details.map(detail => 
        `<li class="bio-detail">${detail}</li>`
    ).join('');
    updateFollowButtons();
}

function updateFollowButtons() {
    DOM.followBtn.style.display = profile.isFollowing ? 'none' : 'flex';
    DOM.unfollowBtn.style.display = profile.isFollowing ? 'flex' : 'none';
}

function setupEventListeners() {
    DOM.followBtn.addEventListener('click', () => toggleFollow(true));
    DOM.unfollowBtn.addEventListener('click', () => toggleFollow(false));
    
    DOM.navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            setActiveNavItem(this);
            
            if (this === DOM.messagesNavItem) {
                openChat();
            } else if (this === DOM.settingsNavItem) {
                openSettingsModal();
            } else {
                closeChat();
                showNotification(`Navegando para ${this.textContent.toLowerCase()}...`);
            }
        });
    });
    
    setupChat();
    
    DOM.editBioBtn.addEventListener('click', openBioEditor);
    DOM.closeBioModal.addEventListener('click', closeBioEditor);
    DOM.cancelBioEdit.addEventListener('click', closeBioEditor);
    DOM.saveBio.addEventListener('click', saveBiography);
    DOM.bioModal.addEventListener('click', (e) => e.target === DOM.bioModal && closeBioEditor());
    
    DOM.editProfileBtn.addEventListener('click', openProfileEditor);
    DOM.closeProfileModal.addEventListener('click', closeProfileEditor);
    DOM.cancelProfileEdit.addEventListener('click', closeProfileEditor);
    DOM.saveProfile.addEventListener('click', saveProfileChanges);
    DOM.profileModal.addEventListener('click', (e) => e.target === DOM.profileModal && closeProfileEditor());
    
    DOM.closeSettingsModal.addEventListener('click', closeSettingsModal);
    DOM.settingsModal.addEventListener('click', (e) => e.target === DOM.settingsModal && closeSettingsModal());
    
    DOM.notificationsToggle.addEventListener('change', toggleNotifications);
    DOM.soundToggle.addEventListener('change', toggleSound);
    DOM.privateAccountToggle.addEventListener('change', togglePrivateAccount);
    
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => changeTheme(option.dataset.theme));
    });
    
    // Event listeners para logout
    DOM.logoutBtn.addEventListener('click', showLogoutConfirmation);
    DOM.logoutConfirmBtn.addEventListener('click', logout);
    DOM.logoutCancelBtn.addEventListener('click', hideLogoutConfirmation);
    DOM.logoutConfirmationModal.addEventListener('click', (e) => {
        if (e.target === DOM.logoutConfirmationModal) {
            hideLogoutConfirmation();
        }
    });
}

// Modal de confirmação de logout
function showLogoutConfirmation() {
    DOM.logoutConfirmationModal.classList.add('active');
}

function hideLogoutConfirmation() {
    DOM.logoutConfirmationModal.classList.remove('active');
}

function toggleFollow(follow) {
    profile.isFollowing = follow;
    profile.stats.followers = formatNumber(parseNumber(profile.stats.followers) + (follow ? 1 : -1));
    updateFollowButtons();
    loadProfileData();
    showNotification(follow ? `Agora você está seguindo ${profile.name}!` : `Você deixou de seguir ${profile.name}.`);
}

function setActiveNavItem(activeItem) {
    DOM.navItems.forEach(item => item.classList.remove('active'));
    activeItem.classList.add('active');
}

function openBioEditor() {
    DOM.bioEditor.value = `${profile.bio.intro}\n${profile.bio.details.join('\n')}`;
    DOM.bioModal.classList.add('active');
}

function closeBioEditor() {
    DOM.bioModal.classList.remove('active');
}

function saveBiography() {
    const newBio = DOM.bioEditor.value;
    if (newBio.trim()) {
        const [intro, ...details] = newBio.split('\n').filter(line => line.trim());
        profile.bio.intro = intro || "(Sem descrição)";
        profile.bio.details = details;
        loadProfileData();
        showNotification("Biografia atualizada com sucesso!");
        closeBioEditor();
    }
}

function openProfileEditor() {
    DOM.profileNameInput.value = profile.name;
    DOM.profileModal.classList.add('active');
}

function closeProfileEditor() {
    DOM.profileModal.classList.remove('active');
}

function saveProfileChanges() {
    const newName = DOM.profileNameInput.value.trim();
    if (newName) {
        profile.name = newName;
        loadProfileData();
        showNotification("Perfil atualizado com sucesso!");
        closeProfileEditor();
    }
}

function openSettingsModal() {
    DOM.settingsModal.classList.add('active');
}

function closeSettingsModal() {
    DOM.settingsModal.classList.remove('active');
}

function logout() {
    hideLogoutConfirmation();
    showNotification("Saindo da conta...");
    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
}

// Utilitários
function parseNumber(str) {
    if (str.includes('mil')) return parseFloat(str.replace('mil', '')) * 1000;
    if (str.includes('mi')) return parseFloat(str.replace('mi', '')) * 1000000;
    return parseInt(str.replace(/\D/g, ''));
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'mi';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'mil';
    return num.toString();
}