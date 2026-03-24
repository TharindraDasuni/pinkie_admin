let selectedSizes = [];
let generalImageFiles = [];
let existingGeneralImages = [];

let globalTypes = [];
let globalMaterials = [];

document.addEventListener("DOMContentLoaded", async () => {
    
    await loadInitialDropdownData();

    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const productId = urlParams.get('id');

    if (mode === 'edit' && productId) {
        document.getElementById("pageTitle").innerText = "Pinkie Admin | Edit Product";
        document.getElementById("headerTitle").innerText = "Edit Jewelry Details";
        document.getElementById("submitBtn").innerText = "Update Product";
        
        loadProductData(productId);
    }
});

async function loadProductData(id) {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    
    Swal.fire({ title: 'Loading details...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch(`http://localhost:8080/api/products/get/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.success) {
            const p = result.data;

            document.getElementById("productName").value = p.title;
            document.getElementById("productPrice").value = p.price;
            document.getElementById("productDiscount").value = p.discount;
            document.getElementById("productStock").value = p.stock;
            document.getElementById("productDescription").value = p.description || "";
            document.getElementById("productWeight").value = p.weight || "";
            document.getElementById("productLength").value = p.length || "";

            if (p.customization && p.customization.isCustomizable) {
                document.getElementById("customizationSwitch").checked = true;
                toggleCustomization();
                document.getElementById("maxLetters").value = p.customization.maxLetters;
            }

            document.getElementById("productCategory").value = p.categoryId;
            loadTypesForCategory();
            
            setTimeout(() => {
                document.getElementById("productType").value = p.typeId;
                loadMaterialsForType();
                
                setTimeout(() => {
                    document.getElementById("productMaterial").value = p.materialId;
                }, 100);
            }, 100);

            if (p.sizes && p.sizes.length > 0) {
                selectedSizes = p.sizes;
                renderSizes();
            }

            if (p.colors && p.colors.length > 0) {
                p.colors.forEach(c => {
                    const container = document.getElementById("colorVariantsContainer");
                    const rowId = 'colorRow_' + Date.now() + Math.floor(Math.random() * 1000); 

                    const row = document.createElement("div");
                    row.className = "row mb-2 align-items-center bg-white p-2 rounded-3 shadow-sm border color-row";
                    row.id = rowId;

                    row.innerHTML = `
                        <div class="col-md-2">
                            <input type="text" class="form-control glass-input-pink border-0 bg-light rounded-pill px-3 color-name-input" value="${c.name}" style="font-size: 13px;">
                        </div>
                        <div class="col-md-2">
                            <input type="number" class="form-control glass-input-pink border-0 bg-light rounded-pill px-3 color-price-input" value="${c.price}" style="font-size: 13px;">
                        </div>
                        <div class="col-md-2">
                            <input type="number" class="form-control glass-input-pink border-0 bg-light rounded-pill px-3 color-discount-input" value="${c.discount || 0}" style="font-size: 13px;">
                        </div>
                        <div class="col-md-2">
                            <input type="number" class="form-control glass-input-pink border-0 bg-light rounded-pill px-3 color-qty-input" value="${c.quantity || 0}" style="font-size: 13px;">
                        </div>
                        <div class="col-md-3 d-flex align-items-center">
                            <input type="file" class="form-control glass-input-pink border-0 bg-light rounded-pill color-image-input" accept="image/*" style="font-size: 12px;" onchange="previewColorThumb(event, '${rowId}')">
                            <img id="thumb_${rowId}" src="${c.imageUrl}" data-old-url="${c.imageUrl}" class="ms-2 rounded-circle shadow-sm" style="width: 32px; height: 32px; object-fit: cover; border: 1px solid #da5586;">
                        </div>
                        <div class="col-md-1 text-end">
                            <button type="button" class="btn btn-sm btn-light text-danger rounded-circle shadow-sm" onclick="this.parentElement.parentElement.remove()">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    container.appendChild(row);
                });
            }
            
            if (p.generalImages && p.generalImages.length > 0) {
                existingGeneralImages = p.generalImages;
                renderExistingGeneralImages();
            }

            Swal.close();

        } else {
            Swal.fire('Error', 'Product not found', 'error');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Connection Error', 'Could not fetch product details', 'error');
    }
}

function renderExistingGeneralImages() {
    const container = document.getElementById("generalImagePreviewContainer");
    
    existingGeneralImages.forEach((url, index) => {
        container.innerHTML += `
            <div class="col-4 mb-2 existing-image-box" id="existing_img_${index}">
                <div class="position-relative rounded-4 overflow-hidden shadow-sm" style="aspect-ratio: 1/1; border: 2px solid #fce4ec;">
                    <img src="${url}" class="w-100 h-100" style="object-fit: cover;">
                    <button type="button" class="btn btn-danger btn-sm rounded-circle position-absolute shadow" 
                            style="top: 5px; right: 5px; width: 22px; height: 22px; padding: 0; display: flex; align-items: center; justify-content: center; z-index: 10;"
                            onclick="removeExistingGeneralImage(${index})">
                        <i class="fas fa-times" style="font-size: 10px;"></i>
                    </button>
                </div>
            </div>
        `;
    });
}

function removeExistingGeneralImage(index) {
    document.getElementById(`existing_img_${index}`).remove();
    existingGeneralImages[index] = null;
}

async function loadInitialDropdownData() {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    
    try {
        const catRes = await fetch("http://localhost:8080/api/categories/all", { headers: { "Authorization": `Bearer ${token}` } });
        const catData = await catRes.json();
        
        if (catRes.ok && catData.success) {
            const catSelect = document.getElementById("productCategory");
            let options = `<option value="" selected disabled>Select Category...</option>`;
            
            catData.data.forEach(c => {
                if (c.status === 'Active') {
                    options += `<option value="${c.id}">${c.name}</option>`;
                }
            });
            catSelect.innerHTML = options;
        }

        const typeRes = await fetch("http://localhost:8080/api/types/all", { headers: { "Authorization": `Bearer ${token}` } });
        const typeData = await typeRes.json();
        if (typeRes.ok && typeData.success) {
            globalTypes = typeData.data.filter(t => t.status === 'Active');
        }

        const matRes = await fetch("http://localhost:8080/api/materials/all", { headers: { "Authorization": `Bearer ${token}` } });
        const matData = await matRes.json();
        if (matRes.ok && matData.success) {
            globalMaterials = matData.data.filter(m => m.status === 'Active');
        }

        const genderRes = await fetch("http://localhost:8080/api/products/genders", { headers: { "Authorization": `Bearer ${token}` } });
        const genderData = await genderRes.json();
        if (genderRes.ok && genderData.success) {
            const genderSelect = document.getElementById("productGender");
            genderData.data.forEach(g => {
                let formatGender = g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
                genderSelect.innerHTML += `<option value="${formatGender}">${formatGender}</option>`;
            });
        }

    } catch (error) {
        console.error("Error loading dropdown data", error);
        Swal.fire({ icon: 'error', title: 'Connection Error', text: 'Could not load categories.' });
    }
}

function loadTypesForCategory() {
    const categoryId = document.getElementById("productCategory").value;
    const typeSelect = document.getElementById("productType");
    const matSelect = document.getElementById("productMaterial");

    let options = `<option value="" selected disabled>Select Type...</option>`;
    
    const filteredTypes = globalTypes.filter(t => t.categoryId === categoryId);
    
    filteredTypes.forEach(t => {
        options += `<option value="${t.id}">${t.name}</option>`;
    });
    
    typeSelect.innerHTML = options;

    matSelect.innerHTML = `<option value="" selected disabled>Select Type First</option>`;
}

function loadMaterialsForType() {
    const typeId = document.getElementById("productType").value;
    const matSelect = document.getElementById("productMaterial");

    let options = `<option value="" selected disabled>Select Material...</option>`;
    
    const filteredMats = globalMaterials.filter(m => m.typeId === typeId);
    
    filteredMats.forEach(m => {
        options += `<option value="${m.id}">${m.name}</option>`;
    });
    
    matSelect.innerHTML = options;
}

function toggleCustomization() {
    const isChecked = document.getElementById("customizationSwitch").checked;
    const detailsDiv = document.getElementById("customizationDetails");
    if (isChecked) {
        detailsDiv.classList.remove("d-none");
    } else {
        detailsDiv.classList.add("d-none");
        document.getElementById("maxLetters").value = "";
    }
}

function addSize() {
    const inputField = document.getElementById("sizeInput");
    const val = inputField.value.trim();
    
    if (val && !selectedSizes.includes(val)) {
        selectedSizes.push(val);
        renderSizes();
    }
    inputField.value = ""; 
}

function removeSize(sizeToRemove) {
    selectedSizes = selectedSizes.filter(size => size !== sizeToRemove);
    renderSizes();
}

function renderSizes() {
    const container = document.getElementById("sizesContainer");
    container.innerHTML = "";
    selectedSizes.forEach(size => {
        container.innerHTML += `
            <span class="badge bg-pinkie bg-opacity-10 text-pinkie border border-pinkie px-3 py-2 rounded-pill d-flex align-items-center" style="font-size: 13px;">
                ${size} 
                <i class="fas fa-times ms-2" style="cursor: pointer;" onclick="removeSize('${size}')"></i>
            </span>
        `;
    });
}

function addColorRow() {
    const container = document.getElementById("colorVariantsContainer");
    const rowId = 'colorRow_' + Date.now(); 

    const row = document.createElement("div");
    row.className = "row mb-2 align-items-center bg-white p-2 rounded-3 shadow-sm border";
    row.id = rowId;

    row.innerHTML = `
        <div class="col-md-2">
            <input type="text" class="form-control glass-input-pink border-0 bg-light rounded-pill px-3 color-name-input" placeholder="Color Name" style="font-size: 13px;">
        </div>
        <div class="col-md-2">
            <input type="number" class="form-control glass-input-pink border-0 bg-light rounded-pill px-3 color-price-input" placeholder="Price (Rs.)" style="font-size: 13px;">
        </div>
        <div class="col-md-2">
            <input type="number" class="form-control glass-input-pink border-0 bg-light rounded-pill px-3 color-discount-input" placeholder="Discount (%)" style="font-size: 13px;">
        </div>
        <div class="col-md-2">
            <input type="number" class="form-control glass-input-pink border-0 bg-light rounded-pill px-3 color-qty-input" placeholder="Quantity" style="font-size: 13px;">
        </div>
        <div class="col-md-3 d-flex align-items-center">
            <input type="file" class="form-control glass-input-pink border-0 bg-light rounded-pill color-image-input" accept="image/*" style="font-size: 12px;" onchange="previewColorThumb(event, '${rowId}')">
            <img id="thumb_${rowId}" src="" class="ms-2 rounded-circle d-none shadow-sm" style="width: 32px; height: 32px; object-fit: cover; border: 1px solid #da5586;">
        </div>
        <div class="col-md-1 text-end">
            <button type="button" class="btn btn-sm btn-light text-danger rounded-circle shadow-sm" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(row);
}

function previewColorThumb(event, rowId) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById(`thumb_${rowId}`);
            img.src = e.target.result;
            img.classList.remove('d-none');
        }
        reader.readAsDataURL(file);
    }
}

function previewGeneralImages(event) {
    const files = Array.from(event.target.files);
    
    if (generalImageFiles.length + files.length > 5) {
        Swal.fire({ icon: 'warning', title: 'Limit Exceeded', text: 'You can only upload up to 5 general images in total.' });

        const allowedSpots = 5 - generalImageFiles.length;
        generalImageFiles.push(...files.slice(0, allowedSpots));
    } else {
        generalImageFiles.push(...files);
    }

    event.target.value = "";
    renderGeneralImagePreviews();
}

function renderGeneralImagePreviews() {
    const container = document.getElementById("generalImagePreviewContainer");
    container.innerHTML = ""; 

    generalImageFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            
            container.innerHTML += `
                <div class="col-4 mb-2">
                    <div class="position-relative rounded-4 overflow-hidden shadow-sm" style="aspect-ratio: 1/1; border: 2px solid #fce4ec;">
                        <img src="${e.target.result}" class="w-100 h-100" style="object-fit: cover;">
                        
                        <button type="button" class="btn btn-danger btn-sm rounded-circle position-absolute shadow" 
                                style="top: 5px; right: 5px; width: 22px; height: 22px; padding: 0; display: flex; align-items: center; justify-content: center; z-index: 10;"
                                onclick="removeGeneralImage(${index})">
                            <i class="fas fa-times" style="font-size: 10px;"></i>
                        </button>
                    </div>
                </div>
            `;
        }
        reader.readAsDataURL(file);
    });
}

function removeGeneralImage(index) {
    generalImageFiles.splice(index, 1);
    renderGeneralImagePreviews();
}

async function saveProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.get('mode') === 'edit';
    const productId = urlParams.get('id');

    const name = document.getElementById("productName").value.trim();
    const price = document.getElementById("productPrice").value;
    const stock = document.getElementById("productStock").value;
    const catSelect = document.getElementById("productCategory");
    const typeSelect = document.getElementById("productType");
    const matSelect = document.getElementById("productMaterial");

    if (!name || !price || !stock || !catSelect.value || !typeSelect.value || !matSelect.value) {
        Swal.fire({ icon: 'warning', title: 'Required Fields', text: 'Please fill all the mandatory (*) fields.' });
        return;
    }

    const keptExistingImages = (typeof existingGeneralImages !== 'undefined') ? existingGeneralImages.filter(url => url !== null) : [];

    if (!isEditMode && generalImageFiles.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Images Required', text: 'Please upload at least 1 general image.' });
        return;
    } else if (isEditMode && generalImageFiles.length === 0 && keptExistingImages.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Images Required', text: 'Product must have at least 1 general image.' });
        return;
    }

    const formData = new FormData();
    formData.append("title", name);
    formData.append("price", price);
    formData.append("discount", document.getElementById("productDiscount").value || 0);
    formData.append("stock", stock);
    formData.append("description", document.getElementById("productDescription").value.trim());

    const isCustomizable = document.getElementById("customizationSwitch").checked;
    formData.append("isCustomizable", isCustomizable);
    if (isCustomizable) formData.append("maxLetters", document.getElementById("maxLetters").value || 0);

    formData.append("categoryId", catSelect.value);
    formData.append("categoryName", catSelect.options[catSelect.selectedIndex].text);
    formData.append("typeId", typeSelect.value);
    formData.append("typeName", typeSelect.options[typeSelect.selectedIndex].text);
    formData.append("materialId", matSelect.value);
    formData.append("materialName", matSelect.options[matSelect.selectedIndex].text);
    formData.append("weight", document.getElementById("productWeight").value.trim());
    formData.append("length", document.getElementById("productLength").value.trim());

    formData.append("sizes", JSON.stringify(selectedSizes));
    formData.append("existingGeneralImages", JSON.stringify(keptExistingImages));

    const colorRows = document.querySelectorAll("#colorVariantsContainer .row");
    let colorsData = [];
    let missingColorImage = false;

    colorRows.forEach((row) => {
        const cName = row.querySelector(".color-name-input").value.trim();
        const cPrice = row.querySelector(".color-price-input").value;
        const cDiscount = row.querySelector(".color-discount-input").value || 0;
        const cQty = row.querySelector(".color-qty-input").value || 0;
        const fileInput = row.querySelector(".color-image-input");
        const imgElement = row.querySelector("img");

        if (cName) {
            let colorObj = {
                name: cName,
                price: parseFloat(cPrice) || parseFloat(price),
                discount: parseFloat(cDiscount),
                quantity: parseInt(cQty)
            };

            if (fileInput.files.length > 0) {
                formData.append("colorImages", fileInput.files[0]);
                colorObj.hasNewImage = true;
            } else {
                colorObj.hasNewImage = false;
                colorObj.existingImageUrl = imgElement ? imgElement.getAttribute("data-old-url") : "";
                
                if (!colorObj.existingImageUrl) missingColorImage = true;
            }
            colorsData.push(colorObj);
        }
    });

    if (colorsData.length > 0 && missingColorImage) {
        Swal.fire({ icon: 'warning', title: 'Missing Images', text: 'Please upload an image for each color variant.' });
        return;
    }

    formData.append("colorsData", JSON.stringify(colorsData));

    generalImageFiles.forEach(file => {
        formData.append("generalImages", file);
    });

    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    
    const apiUrl = isEditMode ? `http://localhost:8080/api/products/update/${productId}` : `http://localhost:8080/api/products/add`;
    const apiMethod = isEditMode ? "PUT" : "POST";
    const loadingMsg = isEditMode ? "Updating Product..." : "Saving Product...";

    Swal.fire({ title: loadingMsg, text: 'Uploading details. Please wait.', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch(apiUrl, {
            method: apiMethod,
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.success) {
            Swal.fire('Success!', result.message, 'success').then(() => {
                window.location.href = "products.html"; 
            });
        } else {
            Swal.fire('Failed', result.message || 'Action failed', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Backend server is unreachable.', 'error');
    }
} 