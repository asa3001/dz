const products = document.querySelector('.products');
const title = document.querySelector('#title');
const price = document.querySelector('#Price'); 
const category = document.querySelector('#Category');
const desc = document.querySelector('#Desc'); 
const add_btn = document.querySelector('#add_btn');
const perPage = 6; 
let currentPage = 1;

const getProducts = () => {
    fetch('https://fakestoreapi.com/products')
        .then((res) => res.json())
        .then((json) => {
            if (json) {
                products.innerHTML = '';
                const startIndex = (currentPage - 1) * perPage;
                const endIndex = startIndex + perPage;

                json.slice(startIndex, endIndex).forEach((item) => {
                    products.innerHTML += `
                    <div class="product" data-id="${item.id}" data-category="${item.category}">
                        <img src="${item.image}" alt="">
                        <h3>${item.title}</h3>
                        <p class="description">${item.description}</p>
                        <p class="price">Price: $${item.price}</p>
                        <button id="del-btn" onclick="delProduct('${item.id}')">Delete</button>
                        <button class="edit-btn">Edit</button>
                    </div>
                    `;
                });

                renderPagination(json.length);
            } else {
                console.log('Ошибка загрузки данных.');
            }
        });
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / perPage);

    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            getProducts();
        });
        pagination.appendChild(pageButton);
    }
}


getProducts();

add_btn.addEventListener('click', (event) => {
    event.preventDefault();
    postData(title.value, price.value, category.value, 'https://google.com', desc.value);
});

function postData(title, price, category, image, desc) {
    const data = {
        title,
        price,
        description: desc, 
        image,
        category,
    };
    addProduct(data);
}

function addProduct({ title, price, description, image, category }) {
    fetch('https://fakestoreapi.com/products', {
        method: 'POST',
        body: JSON.stringify({
            title,
            price,
            description,
            image,
            category,
        }),
        headers: {
            'Content-type': 'application/json',
        },
    })
        .then((res) => res.json())
        .then((json) => {
            products.innerHTML += `
            <div class="product" data-id="${json.id}" data-category="${json.category}">
                <img src="${json.image}" alt="">
                <h3>${json.title}</h3>
                <p class="description">${json.description}</p>
                <p class="price">Price: $${json.price}</p>
                <button id="del-btn" onclick="delProduct('${json.id}')">Delete</button>
                <button class="edit-btn">Edit</button>
            </div>
            `;
        });
}

// Удаление товара
function delProduct(productId) {
    const productDiv = document.querySelector(`.product[data-id="${productId}"]`);
    if (productDiv) {
        productDiv.remove();
    }
}

// Редактирование товара
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("edit-btn")) {
        const productDiv = event.target.closest(".product");
        handleEditClick(event.target, productDiv);
    }
});

function handleEditClick(editButton, productDiv) {
    if (isEditing) {
        return;
    }

    isEditing = true;

    const productId = productDiv.getAttribute("data-id");

    if (productDiv) {
        const productTitle = productDiv.querySelector("h3").textContent;
        const productDescription = productDiv.querySelector("p.description").textContent;

        const productPriceElement = productDiv.querySelector(".price");
        const productPrice = parseFloat(productPriceElement.textContent.replace("Price: $", ""));

        const inputTitle = document.createElement("input");
        inputTitle.value = productTitle;

        const inputDescription = document.createElement("input");
        inputDescription.value = productDescription;

        const inputPrice = document.createElement("input");
        inputPrice.value = productPrice;

        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.className = "save-btn";
        saveButton.id = `save-btn-${productId}`;

        productDiv.appendChild(inputTitle);
        productDiv.appendChild(inputDescription);
        productDiv.appendChild(inputPrice);
        productDiv.appendChild(saveButton);

        saveButton.addEventListener("click", () => {
            handleSaveClick(productId, productDiv, inputTitle, inputDescription, inputPrice);
        });
    }
}

function handleSaveClick(productId, productDiv, inputTitle, inputDescription, inputPrice) {
    const updatedTitle = inputTitle.value;
    const updatedDescription = inputDescription.value;
    const updatedPrice = inputPrice.value;

    fetch(`https://fakestoreapi.com/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify({
            title: updatedTitle,
            description: updatedDescription,
            price: updatedPrice
        }),
        headers: {
            "Content-type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((updatedProduct) => {
            const productTitle = productDiv.querySelector("h3");
            const productDescription = productDiv.querySelector("p.description");
            const productPrice = productDiv.querySelector(".price");

            productTitle.textContent = updatedProduct.title;
            productDescription.textContent = updatedProduct.description;
            productPrice.textContent = `Price: $${updatedProduct.price}`;

            inputTitle.remove();
            inputDescription.remove();
            inputPrice.remove();

            const saveButton = productDiv.querySelector(`#save-btn-${productId}`);
            if (saveButton) {
                saveButton.remove();
            }

            isEditing = false;
        });
}

// Поиск
const searchInput = document.querySelector('#search-input');
searchInput.addEventListener('input', handleSearch);

function handleSearch() {
    const searchText = searchInput.value.toLowerCase();
    const allProducts = document.querySelectorAll('.product');

    allProducts.forEach((product) => {
        const productTitle = product.querySelector('h3').textContent.toLowerCase();

        if (productTitle.includes(searchText)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// Фильтр по категории
const categorySelect = document.querySelector('#categorySelect');
categorySelect.addEventListener('change', () => {
    const selectedCategory = categorySelect.value.toLowerCase();
    const allProducts = document.querySelectorAll('.product');

    allProducts.forEach((product) => {
        const productCategory = product.getAttribute('data-category').toLowerCase();
        product.style.display = selectedCategory === 'all' || productCategory === selectedCategory ? 'block' : 'none';
    });
});