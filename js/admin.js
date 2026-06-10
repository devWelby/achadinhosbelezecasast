import { 
    auth, db, storage, ref, uploadBytes, getDownloadURL,
    signInWithEmailAndPassword, signOut, onAuthStateChanged,
    collection, getDocs, onSnapshot, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc
} from './firebase.js';

// Elementos da Interface
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const navLinks = document.querySelectorAll('.nav-links a');
const contentSections = document.querySelectorAll('.content-section');

// ==========================================
// MENU MOBILE
// ==========================================
const sidebar = document.getElementById('sidebar');
const mobileMenuOpenBtn = document.getElementById('mobile-menu-open');
const mobileMenuOpenConfigBtn = document.getElementById('mobile-menu-open-config');
const mobileMenuCloseBtn = document.getElementById('mobile-menu-close');

function toggleMobileMenu() {
    sidebar.classList.toggle('open');
}

if(mobileMenuOpenBtn) mobileMenuOpenBtn.addEventListener('click', toggleMobileMenu);
if(mobileMenuOpenConfigBtn) mobileMenuOpenConfigBtn.addEventListener('click', toggleMobileMenu);
if(mobileMenuCloseBtn) mobileMenuCloseBtn.addEventListener('click', toggleMobileMenu);

// Fecha o menu ao clicar num link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
    });
});

// ==========================================
// AUTENTICAÇÃO
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário logado
        loginView.style.display = 'none';
        dashboardView.style.display = 'flex';
        loadDashboardData();
    } else {
        // Deslogado
        loginView.style.display = 'flex';
        dashboardView.style.display = 'none';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = loginForm.querySelector('button');
    
    btn.textContent = 'Entrando...';
    btn.disabled = true;
    loginError.textContent = '';

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error(error);
        loginError.textContent = 'E-mail ou senha incorretos.';
        btn.textContent = 'Entrar';
        btn.disabled = false;
    }
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// ==========================================
// NAVEGAÇÃO DO DASHBOARD
// ==========================================
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class
        navLinks.forEach(l => l.classList.remove('active'));
        contentSections.forEach(s => s.style.display = 'none');
        
        // Add active class
        link.classList.add('active');
        const targetId = link.getAttribute('data-target');
        document.getElementById(targetId).style.display = 'block';
    });
});

// ==========================================
// CONFIGURAÇÕES DO SITE
// ==========================================
const configForm = document.getElementById('config-form');
const configMsg = document.getElementById('config-msg');

async function loadConfig() {
    const configDoc = await getDoc(doc(db, "config", "perfil"));
    if (configDoc.exists()) {
        const data = configDoc.data();
        document.getElementById('config-nome').value = data.nome || '';
        document.getElementById('config-bio').value = data.bio || '';
        
        // Logo file config
        const fileInput = document.getElementById('config-logo-file');
        const currentText = document.getElementById('current-logo-text');
        fileInput.setAttribute('data-current', data.logo || '');
        if(data.logo) {
            currentText.innerHTML = `Atual: <a href="${data.logo}" target="_blank">Ver imagem atual</a>`;
        } else {
            currentText.textContent = '';
        }
        
        document.getElementById('config-instagram').value = data.instagram || '';
        document.getElementById('config-tiktok').value = data.tiktok || '';
    }
}

configForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = configForm.querySelector('button');
    btn.textContent = 'Salvando...';
    btn.disabled = true;
    
    let logoUrl = document.getElementById('config-logo-file').getAttribute('data-current') || '';
    const fileInput = document.getElementById('config-logo-file');
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const storageRef = ref(storage, `config/logo_${Date.now()}_${file.name}`);
        btn.textContent = 'Enviando imagem...';
        await uploadBytes(storageRef, file);
        logoUrl = await getDownloadURL(storageRef);
    }

    const data = {
        nome: document.getElementById('config-nome').value,
        bio: document.getElementById('config-bio').value,
        logo: logoUrl,
        instagram: document.getElementById('config-instagram').value,
        tiktok: document.getElementById('config-tiktok').value,
    };

    try {
        await setDoc(doc(db, "config", "perfil"), data);
        configMsg.textContent = 'Configurações salvas com sucesso!';
        setTimeout(() => configMsg.textContent = '', 3000);
    } catch (error) {
        console.error("Erro ao salvar config", error);
        alert("Erro ao salvar configurações.");
    } finally {
        btn.textContent = 'Salvar Configurações';
        btn.disabled = false;
    }
});

// ==========================================
// GERENCIAMENTO DE PRODUTOS (CRUD)
// ==========================================
const productsList = document.getElementById('admin-products-list');
const addProductBtn = document.getElementById('add-product-btn');
const productModal = document.getElementById('product-modal');
const closeModalBtn = document.querySelector('.close-modal');
const productForm = document.getElementById('product-form');

function openModal(title = "Novo Produto") {
    document.getElementById('modal-title').textContent = title;
    productModal.classList.add('active');
}

function closeModal() {
    productModal.classList.remove('active');
    productForm.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('current-image-text').textContent = '';
    document.getElementById('product-imagem-file').removeAttribute('data-current');
}

closeModalBtn.addEventListener('click', closeModal);
addProductBtn.addEventListener('click', () => openModal());

// Escuta produtos em tempo real para a tabela
let unsubProducts = null;

function loadProducts() {
    if(unsubProducts) unsubProducts();
    
    unsubProducts = onSnapshot(collection(db, "produtos"), (snapshot) => {
        productsList.innerHTML = '';
        if (snapshot.empty) {
            productsList.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum produto cadastrado.</td></tr>';
            return;
        }

        snapshot.forEach((doc) => {
            const p = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${p.imagem}" alt="Produto"></td>
                <td><strong>${p.titulo}</strong></td>
                <td><span class="badge" style="background:#e0e0e0; padding:4px 8px; border-radius:12px; font-size:0.8rem;">${p.categoria || 'Sem categoria'}</span></td>
                <td>
                    <div class="actions-group">
                        <button class="btn btn-primary btn-sm edit-btn" data-id="${doc.id}">Editar</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${doc.id}">Excluir</button>
                    </div>
                </td>
            `;
            productsList.appendChild(tr);

            // Ações dos botões gerados
            tr.querySelector('.edit-btn').addEventListener('click', () => editProduct(doc.id, p));
            tr.querySelector('.delete-btn').addEventListener('click', () => deleteProductDoc(doc.id));
        });
    });
}

function editProduct(id, data) {
    document.getElementById('product-id').value = id;
    document.getElementById('product-titulo').value = data.titulo || '';
    document.getElementById('product-link').value = data.link || '';
    
    const fileInput = document.getElementById('product-imagem-file');
    const currentText = document.getElementById('current-image-text');
    fileInput.setAttribute('data-current', data.imagem || '');
    if (data.imagem) {
        currentText.innerHTML = `Atual: <a href="${data.imagem}" target="_blank">Ver imagem atual</a>`;
    } else {
        currentText.textContent = '';
    }

    document.getElementById('product-categoria').value = data.categoria || '';
    document.getElementById('product-descricao').value = data.descricao || '';
    openModal("Editar Produto");
}

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = productForm.querySelector('button');
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    const id = document.getElementById('product-id').value;
    
    let imageUrl = document.getElementById('product-imagem-file').getAttribute('data-current') || '';
    const fileInput = document.getElementById('product-imagem-file');
    
    try {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const storageRef = ref(storage, `produtos/${Date.now()}_${file.name}`);
            btn.textContent = 'Enviando imagem...';
            await uploadBytes(storageRef, file);
            imageUrl = await getDownloadURL(storageRef);
        }

        if (!imageUrl) {
            alert("A imagem do produto é obrigatória!");
            btn.textContent = 'Salvar Produto';
            btn.disabled = false;
            return;
        }

        btn.textContent = 'Salvando produto...';
        const data = {
            titulo: document.getElementById('product-titulo').value,
            link: document.getElementById('product-link').value,
            imagem: imageUrl,
            categoria: document.getElementById('product-categoria').value,
            descricao: document.getElementById('product-descricao').value,
            updatedAt: new Date()
        };
        if (id) {
            await updateDoc(doc(db, "produtos", id), data);
        } else {
            data.createdAt = new Date();
            await addDoc(collection(db, "produtos"), data);
        }
        closeModal();
    } catch (error) {
        console.error("Erro ao salvar produto", error);
        alert("Erro ao salvar o produto.");
    } finally {
        btn.textContent = 'Salvar Produto';
        btn.disabled = false;
    }
});

async function deleteProductDoc(id) {
    if (confirm("Tem certeza que deseja excluir este produto? Essa ação não pode ser desfeita.")) {
        try {
            await deleteDoc(doc(db, "produtos", id));
        } catch (error) {
            console.error("Erro ao excluir", error);
            alert("Erro ao excluir o produto.");
        }
    }
}

function loadDashboardData() {
    loadConfig();
    loadProducts();
}
