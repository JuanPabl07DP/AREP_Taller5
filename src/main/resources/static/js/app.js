// Configuración de la API
const API_URL = '/api/properties';
// Referencias a elementos DOM
const propertyForm = document.getElementById('propertyForm');
const formTitle = document.getElementById('formTitle');
const form = document.getElementById('form');
const propertyIdInput = document.getElementById('propertyId');
const addressInput = document.getElementById('address');
const priceInput = document.getElementById('price');
const sizeInput = document.getElementById('size');
const descriptionInput = document.getElementById('description');

const showFormBtn = document.getElementById('showFormBtn');
const cancelBtn = document.getElementById('cancelBtn');

const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const noPropertiesElement = document.getElementById('noProperties');
const propertiesListElement = document.getElementById('propertiesList');

const propertyDetailsModal = document.getElementById('propertyDetailsModal');
const propertyDetailsElement = document.getElementById('propertyDetails');
const confirmDeleteModal = document.getElementById('confirmDeleteModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

// Sistema de notificaciones
const notifications = {
    container: null,

    init() {
        // Crear contenedor para notificaciones si no existe
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    },

    show(options) {
        this.init();

        const defaults = {
            type: 'info',
            title: '',
            message: '',
            duration: 5000,
            closable: true,
            progress: true
        };

        const settings = { ...defaults, ...options };

        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${settings.type}`;

        // Iconos según tipo
        let icon = '';
        switch (settings.type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
        }

        // Estructura interna
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                ${settings.title ? `<div class="notification-title">${settings.title}</div>` : ''}
                <div class="notification-message">${settings.message}</div>
            </div>
            ${settings.closable ? '<div class="notification-close"><i class="fas fa-times"></i></div>' : ''}
            ${settings.progress ? '<div class="notification-progress"></div>' : ''}
        `;

        // Agregar al contenedor
        this.container.appendChild(notification);

        // Mostrar con animación
        setTimeout(() => notification.classList.add('show'), 10);

        // Agregar funcionalidad al botón cerrar
        if (settings.closable) {
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => this.close(notification));
        }

        // Animación de la barra de progreso
        if (settings.progress && settings.duration > 0) {
            const progressBar = notification.querySelector('.notification-progress');
            progressBar.style.transition = `transform ${settings.duration / 1000}s linear`;

            setTimeout(() => {
                progressBar.style.transform = 'scaleX(0)';
            }, 10);
        }

        // Auto cerrar después de la duración
        if (settings.duration > 0) {
            notification._timeout = setTimeout(() => {
                this.close(notification);
            }, settings.duration);
        }

        return notification;
    },

    close(notification) {
        if (notification._timeout) {
            clearTimeout(notification._timeout);
        }

        notification.style.animation = 'slide-out 0.3s forwards';

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    },

    success(message, title = 'Éxito') {
        return this.show({
            type: 'success',
            title,
            message
        });
    },

    error(message, title = 'Error') {
        return this.show({
            type: 'error',
            title,
            message,
            duration: 6000 // Los errores se muestran por más tiempo
        });
    },

    warning(message, title = 'Advertencia') {
        return this.show({
            type: 'warning',
            title,
            message
        });
    },

    info(message, title = 'Información') {
        return this.show({
            type: 'info',
            title,
            message
        });
    }
};

// Función de compatibilidad para el código existente
function showToast(message, type) {
    if (type === 'success') {
        notifications.success(message);
    } else if (type === 'error') {
        notifications.error(message);
    } else if (type === 'warning') {
        notifications.warning(message);
    } else {
        notifications.info(message);
    }
}

// Variables para paginación
let currentPage = 0;
let totalPages = 0;
let pageSize = 8;
let paginationContainer = document.querySelector('.pagination-container');

// Variables para búsqueda
let searchParams = {
    address: null,
    minPrice: null,
    maxPrice: null,
    minSize: null,
    maxSize: null
};
let isSearchActive = false;

// Variable para almacenar el ID de la propiedad a eliminar
let propertyToDeleteId = null;

// Eventos
document.addEventListener('DOMContentLoaded', () => {
    // Agregar event listeners para búsqueda
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('clearSearchBtn').addEventListener('click', clearSearch);

    // Cargar propiedades iniciales
    loadProperties();
});

showFormBtn.addEventListener('click', showForm);
cancelBtn.addEventListener('click', hideForm);
form.addEventListener('submit', handleFormSubmit);
confirmDeleteBtn.addEventListener('click', confirmDelete);
cancelDeleteBtn.addEventListener('click', () => {
    hideModal(confirmDeleteModal);
    propertyToDeleteId = null;
});

// Funciones para interactuar con la API
async function loadProperties(page = 0, size = pageSize) {
    showLoading();
    try {
        const url = `${API_URL}?page=${page}&size=${size}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al cargar las propiedades');
        }
        const data = await response.json();

        // Guardar información de paginación
        currentPage = data.currentPage;
        totalPages = data.totalPages;

        displayProperties(data.properties);
        createPagination();
    } catch (error) {
        console.error('Error:', error);
        showError();
    } finally {
        hideLoading();
    }
}

async function searchProperties(page = 0) {
    showLoading();
    try {
        // Construir URL con parámetros de búsqueda
        let url = `${API_URL}/search?page=${page}&size=${pageSize}`;

        if (searchParams.address) url += `&address=${encodeURIComponent(searchParams.address)}`;
        if (searchParams.minPrice) url += `&minPrice=${searchParams.minPrice}`;
        if (searchParams.maxPrice) url += `&maxPrice=${searchParams.maxPrice}`;
        if (searchParams.minSize) url += `&minSize=${searchParams.minSize}`;
        if (searchParams.maxSize) url += `&maxSize=${searchParams.maxSize}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al buscar propiedades');
        }

        const data = await response.json();

        // Guardar información de paginación
        currentPage = data.currentPage;
        totalPages = data.totalPages;

        displayProperties(data.properties);
        createPagination();

        // Mostrar mensaje con resultados de búsqueda
        if (data.totalItems === 0) {
            notifications.info('No se encontraron propiedades que coincidan con los criterios de búsqueda.');
        } else {
            notifications.success(`Se encontraron ${data.totalItems} propiedades.`);
        }
    } catch (error) {
        console.error('Error:', error);
        notifications.error('Error al realizar la búsqueda. Inténtelo de nuevo.');
        showError();
    } finally {
        hideLoading();
    }
}

function handleSearch() {
    // Obtener valores de los campos de búsqueda
    const address = document.getElementById('searchAddress').value.trim();
    const minPrice = document.getElementById('searchMinPrice').value;
    const maxPrice = document.getElementById('searchMaxPrice').value;
    const minSize = document.getElementById('searchMinSize').value;
    const maxSize = document.getElementById('searchMaxSize').value;

    // Actualizar parámetros de búsqueda
    searchParams = {
        address: address || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        minSize: minSize || null,
        maxSize: maxSize || null
    };

    // Validar que al menos un campo tenga valor
    const hasSearchCriteria = Object.values(searchParams).some(value => value !== null);

    if (!hasSearchCriteria) {
        notifications.warning('Por favor, ingrese al menos un criterio de búsqueda.');
        return;
    }

    isSearchActive = true;
    searchProperties(0); // Reiniciar a primera página en nueva búsqueda
}

function clearSearch() {
    // Limpiar campos de búsqueda
    document.getElementById('searchAddress').value = '';
    document.getElementById('searchMinPrice').value = '';
    document.getElementById('searchMaxPrice').value = '';
    document.getElementById('searchMinSize').value = '';
    document.getElementById('searchMaxSize').value = '';

    // Resetear parámetros de búsqueda
    searchParams = {
        address: null,
        minPrice: null,
        maxPrice: null,
        minSize: null,
        maxSize: null
    };

    isSearchActive = false;
    loadProperties(0); // Volver a cargar todas las propiedades
    notifications.info('Búsqueda reiniciada.');
}

function createPagination() {
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return; // No mostrar paginación si solo hay una página

    // Agregar información de paginación
    const paginationInfo = document.createElement('div');
    paginationInfo.className = 'pagination-info';
    paginationInfo.textContent = `Página ${currentPage + 1} de ${totalPages}`;
    paginationContainer.appendChild(paginationInfo);

    // Crear controles de paginación
    const pagination = document.createElement('div');
    pagination.className = 'pagination';

    // Botón anterior
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i> Anterior';
    prevButton.disabled = currentPage === 0;
    prevButton.addEventListener('click', () => navigateToPage(currentPage - 1));
    pagination.appendChild(prevButton);

    // Números de página (mostrar un máximo de 5 páginas)
    const startPage = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
    const endPage = Math.min(startPage + 5, totalPages);

    for (let i = startPage; i < endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i + 1;
        pageButton.className = i === currentPage ? 'active' : '';
        pageButton.addEventListener('click', () => navigateToPage(i));
        pagination.appendChild(pageButton);
    }

    // Botón siguiente
    const nextButton = document.createElement('button');
    nextButton.innerHTML = 'Siguiente <i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage >= totalPages - 1;
    nextButton.addEventListener('click', () => navigateToPage(currentPage + 1));
    pagination.appendChild(nextButton);

    paginationContainer.appendChild(pagination);
}

function navigateToPage(page) {
    if (page < 0 || page >= totalPages) return;

    if (isSearchActive) {
        searchProperties(page);
    } else {
        loadProperties(page);
    }

    // Scroll hacia arriba para ver los nuevos resultados
    window.scrollTo({
        top: document.querySelector('.properties-container').offsetTop - 20,
        behavior: 'smooth'
    });
}

async function getPropertyById(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            throw new Error(`Error al obtener la propiedad con ID ${id}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        notifications.error('Error al obtener la propiedad');
        return null;
    }
}

async function createProperty(property) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(property)
        });

        if (!response.ok) {
            // Intenta obtener el mensaje de error del servidor
            const errorData = await response.json().catch(() => null);
            if (errorData) {
                // Mostrar errores de validación si están disponibles
                Object.keys(errorData).forEach(field => {
                    const errorElement = document.getElementById(`${field}Error`);
                    if (errorElement) {
                        errorElement.textContent = errorData[field];
                    }
                });
                throw new Error('Error de validación');
            }
            throw new Error('Error al crear la propiedad');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        if (error.message !== 'Error de validación') {
            notifications.error('Error al crear la propiedad');
        }
        return null;
    }
}

async function updateProperty(id, property) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(property)
        });

        if (!response.ok) {
            // Intenta obtener el mensaje de error del servidor
            const errorData = await response.json().catch(() => null);
            if (errorData) {
                // Mostrar errores de validación si están disponibles
                Object.keys(errorData).forEach(field => {
                    const errorElement = document.getElementById(`${field}Error`);
                    if (errorElement) {
                        errorElement.textContent = errorData[field];
                    }
                });
                throw new Error('Error de validación');
            }
            throw new Error(`Error al actualizar la propiedad con ID ${id}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        if (error.message !== 'Error de validación') {
            notifications.error(`Error al actualizar la propiedad`);
        }
        return null;
    }
}

async function deleteProperty(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Error al eliminar la propiedad con ID ${id}`);
        }

        return true;
    } catch (error) {
        console.error('Error:', error);
        notifications.error('Error al eliminar la propiedad');
        return false;
    }
}

// Funciones para manipular el DOM
function displayProperties(properties) {
    // Limpiar el contenedor de propiedades
    propertiesListElement.innerHTML = '';

    if (properties.length === 0) {
        propertiesListElement.classList.add('hidden');
        noPropertiesElement.classList.remove('hidden');
        return;
    }

    noPropertiesElement.classList.add('hidden');
    propertiesListElement.classList.remove('hidden');

    // Crear una tarjeta para cada propiedad
    properties.forEach(property => {
        const propertyCard = createPropertyCard(property);
        propertiesListElement.appendChild(propertyCard);
    });
}

function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card';

    // Formatear el precio con separador de miles
    const formattedPrice = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(property.price);

    // Limitar la descripción a un número máximo de caracteres
    const shortDescription = property.description
        ? (property.description.length > 100
            ? property.description.substring(0, 100) + '...'
            : property.description)
        : 'Sin descripción';

    card.innerHTML = `
        <div class="property-card-header">
            <h3>${property.address}</h3>
        </div>
        <div class="property-card-body">
            <div class="property-price">${formattedPrice}</div>
            <div class="property-size">${property.size} m²</div>
            <div class="property-description">${shortDescription}</div>
        </div>
        <div class="property-card-footer">
            <button class="btn btn-info view-btn" data-id="${property.id}">
                <i class="fas fa-eye"></i> Ver
            </button>
            <div class="card-actions">
                <button class="btn btn-primary edit-btn" data-id="${property.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger delete-btn" data-id="${property.id}">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `;

    // Agregar event listeners de manera más segura
    const viewBtn = card.querySelector('.view-btn');
    viewBtn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        console.log("Ver propiedad con ID:", id);
        showPropertyDetails(id);
    });

    const editBtn = card.querySelector('.edit-btn');
    editBtn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        console.log("Botón editar clickeado para ID:", id);
        editProperty(id);
    });

    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        console.log("Eliminar propiedad con ID:", id);
        showDeleteConfirmation(id);
    });

    return card;
}

async function showPropertyDetails(id) {
    const property = await getPropertyById(id);
    if (!property) return;

    // Formatear el precio con separador de miles
    const formattedPrice = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(property.price);

    propertyDetailsElement.innerHTML = `
        <div class="property-detail">
            <strong>ID:</strong> ${property.id}
        </div>
        <div class="property-detail">
            <strong>Dirección:</strong> ${property.address}
        </div>
        <div class="property-detail">
            <strong>Precio:</strong> ${formattedPrice}
        </div>
        <div class="property-detail">
            <strong>Tamaño:</strong> ${property.size} m²
        </div>
        <div class="property-detail">
            <strong>Descripción:</strong> ${property.description || 'Sin descripción'}
        </div>
    `;

    showModal(propertyDetailsModal);

    // Agregar event listener para cerrar el modal
    propertyDetailsModal.querySelector('.close-btn').addEventListener('click', () => {
        hideModal(propertyDetailsModal);
    });
}

async function editProperty(id) {
    try {
        // Asegurarse de que id sea un número
        id = parseInt(id);
        if (isNaN(id)) {
            console.error("ID no válido:", id);
            notifications.error("Error al editar: ID de propiedad no válido");
            return;
        }

        console.log("Editando propiedad con ID:", id);

        const property = await getPropertyById(id);
        if (!property) {
            console.error("No se pudo obtener la propiedad con ID:", id);
            notifications.error("No se pudo obtener la información de la propiedad");
            return;
        }

        console.log("Propiedad obtenida:", property);

        // Cambiar título del formulario
        formTitle.textContent = 'Editar Propiedad';

        // Rellenar el formulario con los datos de la propiedad
        propertyIdInput.value = property.id;
        addressInput.value = property.address;
        priceInput.value = property.price;
        sizeInput.value = property.size;
        descriptionInput.value = property.description || '';

        // Mostrar el formulario
        showForm();
    } catch (error) {
        console.error("Error al editar la propiedad:", error);
        notifications.error("Ocurrió un error al intentar editar la propiedad");
    }
}

function showDeleteConfirmation(id) {
    propertyToDeleteId = id;
    showModal(confirmDeleteModal);
}

async function confirmDelete() {
    if (propertyToDeleteId === null) return;

    const success = await deleteProperty(propertyToDeleteId);
    if (success) {
        hideModal(confirmDeleteModal);
        notifications.success('Propiedad eliminada con éxito');

        // Recargar la página actual de propiedades
        if (isSearchActive) {
            searchProperties(currentPage);
        } else {
            loadProperties(currentPage);
        }
    }

    propertyToDeleteId = null;
}

function handleFormSubmit(event) {
    event.preventDefault();

    // Limpiar mensajes de error previos
    clearErrorMessages();

    // Obtener los valores del formulario
    const id = propertyIdInput.value;
    const address = addressInput.value.trim();
    const price = parseFloat(priceInput.value);
    const size = parseFloat(sizeInput.value);
    const description = descriptionInput.value.trim();

    // Validar los campos
    let isValid = true;

    if (!address) {
        document.getElementById('addressError').textContent = 'La dirección es obligatoria';
        isValid = false;
    }

    if (isNaN(price) || price <= 0) {
        document.getElementById('priceError').textContent = 'El precio debe ser un número positivo';
        isValid = false;
    }

    if (isNaN(size) || size <= 0) {
        document.getElementById('sizeError').textContent = 'El tamaño debe ser un número positivo';
        isValid = false;
    }

    if (!isValid) return;

    // Crear objeto de propiedad
    const property = {
        address,
        price,
        size,
        description
    };

    // Crear o actualizar la propiedad
    if (id) {
        updatePropertySubmit(id, property);
    } else {
        createPropertySubmit(property);
    }
}

async function createPropertySubmit(property) {
    const newProperty = await createProperty(property);
    if (newProperty) {
        hideForm();
        clearForm();
        notifications.success('Propiedad creada con éxito');

        // Recargar propiedades (primera página)
        if (isSearchActive) {
            // Si hay una búsqueda activa, limpiar la búsqueda y mostrar todas las propiedades
            clearSearch();
        } else {
            loadProperties(0);
        }
    }
}

async function updatePropertySubmit(id, property) {
    const updatedProperty = await updateProperty(id, property);
    if (updatedProperty) {
        hideForm();
        clearForm();
        notifications.success('Propiedad actualizada con éxito');

        // Recargar la página actual
        if (isSearchActive) {
            searchProperties(currentPage);
        } else {
            loadProperties(currentPage);
        }
    }
}

function showForm() {
    propertyForm.classList.remove('hidden');
    showFormBtn.classList.add('hidden');
    console.log("Formulario mostrado");
}

function hideForm() {
    propertyForm.classList.add('hidden');
    showFormBtn.classList.remove('hidden');
    clearForm();
    clearErrorMessages();
}

function clearForm() {
    formTitle.textContent = 'Añadir Nueva Propiedad';
    propertyIdInput.value = '';
    form.reset();
}

function clearErrorMessages() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

function showModal(modal) {
    modal.classList.remove('hidden');
}

function hideModal(modal) {
    modal.classList.add('hidden');
}

function showLoading() {
    loadingElement.classList.remove('hidden');
    errorElement.classList.add('hidden');
    noPropertiesElement.classList.add('hidden');
    propertiesListElement.classList.add('hidden');
}

function hideLoading() {
    loadingElement.classList.add('hidden');
}

function showError() {
    errorElement.classList.remove('hidden');
    noPropertiesElement.classList.add('hidden');
    propertiesListElement.classList.add('hidden');
}
