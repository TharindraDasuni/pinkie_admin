let allProducts = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadCategoriesForFilter();
  loadProducts();
});

async function loadCategoriesForFilter() {
  const token =
    localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
  try {
    const response = await fetch("http://localhost:8080/api/categories/all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();

    if (response.ok && result.success) {
      const catSelect = document.getElementById("filterCategory");
      result.data.forEach((cat) => {
        if (cat.status === "Active") {
          catSelect.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
        }
      });
    }
  } catch (error) {
    console.error("Failed to load categories", error);
  }
}

async function loadProducts() {
  const token =
    localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
  if (!token) return;

  const tableBody = document.querySelector("#page-content-wrapper tbody");
  if (tableBody)
    tableBody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted"><i class="fas fa-spinner fa-spin me-2"></i>Loading Products...</td></tr>`;

  try {
    const response = await fetch("http://localhost:8080/api/products/all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();

    if (response.ok && result.success) {
      allProducts = result.data;

      let published = 0;
      let lowStockCount = 0;
      let outOfStockCount = 0;

      allProducts.forEach((p) => {
        let totalProductStock = 0;
        if (p.colors && p.colors.length > 0) {
          p.colors.forEach((c) => (totalProductStock += c.quantity || 0));
        } else {
          totalProductStock = p.stock || 0;
        }

        if (p.status === "Published") published++;
        if (totalProductStock === 0) outOfStockCount++;
        else if (totalProductStock <= 10) lowStockCount++;
      });

      const cardValues = document.querySelectorAll(".dash-card h3");
      if (cardValues.length >= 4) {
        cardValues[0].innerText = allProducts.length.toLocaleString();
        cardValues[1].innerText = published.toLocaleString();
        cardValues[2].innerText = lowStockCount.toLocaleString();
        cardValues[3].innerText = outOfStockCount.toLocaleString();
      }

      renderProductsTable(allProducts);
    }
  } catch (error) {
    console.error("Failed to load products", error);
    if (tableBody)
      tableBody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-danger">Error loading data</td></tr>`;
  }
}

function renderProductsTable(productsToDisplay) {
  const tableBody = document.querySelector("#page-content-wrapper tbody");
  tableBody.innerHTML = "";

  if (productsToDisplay.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="9" class="text-center py-5 text-muted">
            <i class="fas fa-search-minus fs-1 mb-3 text-pinkie opacity-50"></i>
            <h6 class="fw-bold">No products found matching your filters</h6>
        </td></tr>`;
    return;
  }

  productsToDisplay.forEach((p) => {
    let specsHtml = "";
    if (p.weight)
      specsHtml += `<span class="badge bg-light text-secondary border px-2 py-1 me-1" style="font-size: 10px;"><i class="fas fa-weight-hanging me-1"></i>${p.weight}</span>`;
    if (p.length)
      specsHtml += `<span class="badge bg-light text-secondary border px-2 py-1 me-1" style="font-size: 10px;"><i class="fas fa-ruler me-1"></i>${p.length}</span>`;
    if (p.sizes && p.sizes.length > 0)
      specsHtml += `<span class="badge bg-light text-secondary border px-2 py-1" style="font-size: 10px;"><i class="fas fa-expand-arrows-alt me-1"></i>${p.sizes.join(", ")}</span>`;

    let priceHtml = "";
    let stockHtml = "";

    if (p.colors && p.colors.length > 0) {
      p.colors.forEach((c) => {
        let cPrice = c.price ? c.price : p.price;
        priceHtml += `<div class="mb-1" style="font-size: 12px; white-space: nowrap;"><span class="text-muted fw-bold">${c.name}:</span> <span class="text-dark fw-bold">Rs. ${cPrice.toLocaleString()}</span></div>`;

        let qty = c.quantity || 0;
        let stockBadgeClass =
          qty === 0
            ? "bg-danger text-danger"
            : qty <= 5
              ? "bg-warning text-warning"
              : "bg-success text-success";
        let stockText = qty === 0 ? "Out" : qty;
        stockHtml += `<div class="mb-1 d-flex align-items-center justify-content-center" style="font-size: 12px;"><span class="text-muted fw-bold me-2" style="width: 60px; text-align: right;">${c.name}:</span><span class="badge ${stockBadgeClass} bg-opacity-10 rounded-pill" style="width: 40px;">${stockText}</span></div>`;
      });
    } else {
      priceHtml = `<span class="text-dark fw-bold" style="font-size: 13px;">Rs. ${p.price.toLocaleString()}</span>`;
      let qty = p.stock || 0;
      let stockBadgeClass =
        qty === 0
          ? "bg-danger text-danger"
          : qty <= 10
            ? "bg-warning text-warning"
            : "bg-success text-success";
      let stockText = qty === 0 ? "Out of Stock" : `${qty} in stock`;
      stockHtml = `<span class="badge ${stockBadgeClass} bg-opacity-10 px-3 py-2 rounded-pill">${stockText}</span>`;
    }

    let statusBtn =
      p.status === "Published"
        ? `<button class="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold dropdown-toggle" type="button" data-bs-toggle="dropdown" style="font-size: 12px;"><i class="fas fa-eye me-1"></i> Published</button>`
        : `<button class="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold dropdown-toggle" type="button" data-bs-toggle="dropdown" style="font-size: 12px;"><i class="fas fa-eye-slash me-1"></i> Hidden</button>`;

    const row = `
            <tr class="bg-white bg-opacity-50 shadow-sm" style="border-radius: 10px;">
                <td class="fw-bold text-muted ps-4" style="font-size: 13px;">${p.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="product-img-box glass-input-pink rounded-3 p-1 me-3" style="width: 45px; height: 45px; flex-shrink: 0;">
                            <img src="${p.mainImage || "assets/images/placeholder.jpg"}" class="img-fluid w-100 h-100 rounded-2" style="object-fit: cover;">
                        </div>
                        <div>
                            <h6 class="mb-0 fw-bold text-dark" style="font-size: 13px;">${p.title}</h6>
                            ${specsHtml !== "" ? `<div class="mt-1 d-flex flex-wrap">${specsHtml}</div>` : ""}
                        </div>
                    </div>
                </td>
                <td class="text-muted" style="font-size: 13px;">${p.categoryName || "-"}</td>
                <td class="text-muted" style="font-size: 13px;">${p.typeName || "-"}</td>
                <td class="text-muted" style="font-size: 13px;">${p.materialName || "-"}</td>
                <td class="align-middle">${priceHtml}</td>
                <td class="text-center align-middle">${stockHtml}</td>
                <td class="text-center align-middle">
                    <div class="dropdown">
                        ${statusBtn}
                        <ul class="dropdown-menu shadow-sm rounded-3 border-0" style="font-size: 13px;">
                            <li><a class="dropdown-item text-success fw-bold" href="#" onclick="changeStatus(event, '${p.id}', 'Published')"><i class="fas fa-eye me-2"></i> Published</a></li>
                            <li><a class="dropdown-item text-secondary fw-bold" href="#" onclick="changeStatus(event, '${p.id}', 'Hidden')"><i class="fas fa-eye-slash me-2"></i> Hidden</a></li>
                        </ul>
                    </div>
                </td>
                <td class="text-end pe-4 align-middle">
                    <a href="add-product.html?mode=edit&id=${p.id}" class="btn btn-sm btn-light text-primary shadow-sm rounded-circle me-1" style="width: 32px; height: 32px; padding-top: 5px;" title="Edit"><i class="fas fa-pen"></i></a>
                    <button class="btn btn-sm btn-light text-danger shadow-sm rounded-circle" style="width: 32px; height: 32px;" title="Delete" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    tableBody.innerHTML += row;
  });
}

function filterProducts() {
  const searchText = document.getElementById("searchInput").value.toLowerCase();
  const selectedCategory = document.getElementById("filterCategory").value;
  const selectedStock = document.getElementById("filterStock").value;

  const filtered = allProducts.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchText) ||
      p.id.toLowerCase().includes(searchText);

    const matchCategory =
      selectedCategory === "All" || p.categoryName === selectedCategory;

    let totalStock = 0;
    if (p.colors && p.colors.length > 0) {
      p.colors.forEach((c) => (totalStock += c.quantity || 0));
    } else {
      totalStock = p.stock || 0;
    }

    let matchStock = true;
    if (selectedStock === "InStock") matchStock = totalStock > 10;
    else if (selectedStock === "LowStock")
      matchStock = totalStock > 0 && totalStock <= 10;
    else if (selectedStock === "OutOfStock") matchStock = totalStock === 0;

    return matchSearch && matchCategory && matchStock;
  });

  renderProductsTable(filtered);
}

async function changeStatus(event, id, newStatus) {
  event.preventDefault();
  const token =
    localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
  try {
    const response = await fetch(
      `http://localhost:8080/api/products/change-status/${id}?status=${newStatus}`,
      { method: "PUT", headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.ok) loadProducts();
  } catch (error) {
    Swal.fire("Error", "Connection failed.", "error");
  }
}

function deleteProduct(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you want to delete this product?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#da5586",
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      const token =
        localStorage.getItem("adminToken") ||
        sessionStorage.getItem("adminToken");
      Swal.fire({
        title: "Deleting...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      try {
        const response = await fetch(
          `http://localhost:8080/api/products/delete/${id}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.ok) {
          Swal.fire("Deleted!", "Product has been deleted.", "success").then(
            () => loadProducts(),
          );
        }
      } catch (error) {
        Swal.fire("Error", "Connection failed.", "error");
      }
    }
  });
}
