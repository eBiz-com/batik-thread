/* ================================
   Batik Thread v6.2 – script.js
   Auto-sync with Admin Dashboard
   ================================ */

// Load from localStorage first, then fallback to demo data
let products = JSON.parse(localStorage.getItem("batik_products")) || [];

// If no admin products exist, load demo products
if (products.length === 0) {
  products = [
    {
      id: 1,
      name: "Urban Kente Set",
      price: 150,
      gender: "Men",
      color: "gold",
      fabric: "Kente Cotton",
      origin: "Ghana",
      story: "A modern twist on traditional Kente, blending streetwear boldness with African pride.",
      images: [
        "https://images.pexels.com/photos/7651065/pexels-photo-7651065.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/11013280/pexels-photo-11013280.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/7651063/pexels-photo-7651063.jpeg?auto=compress&cs=tinysrgb&w=800"
      ]
    },
    {
      id: 2,
      name: "Adire Street Flow",
      price: 120,
      gender: "Women",
      color: "blue",
      fabric: "Indigo Adire",
      origin: "Nigeria",
      story: "Adire masterpiece merging Yoruba indigo art with modern city flair.",
      images: [
        "https://images.pexels.com/photos/9835649/pexels-photo-9835649.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/9835650/pexels-photo-9835650.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/9835651/pexels-photo-9835651.jpeg?auto=compress&cs=tinysrgb&w=800"
      ]
    },
    {
      id: 3,
      name: "Golden Lace Radiance",
      price: 220,
      gender: "Women",
      color: "gold",
      fabric: "Lace",
      origin: "Nigeria",
      story: "Opulent gold lace with detailed embroidery that shines at any occasion.",
      images: [
        "https://images.pexels.com/photos/7640906/pexels-photo-7640906.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/7639416/pexels-photo-7639416.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/7640914/pexels-photo-7640914.jpeg?auto=compress&cs=tinysrgb&w=800"
      ]
    },
    {
      id: 4,
      name: "Ankara Rebel Jacket",
      price: 180,
      gender: "Men",
      color: "red",
      fabric: "Ankara",
      origin: "Nigeria",
      story: "Bold Ankara prints meet streetwear energy in this stylish urban jacket.",
      images: [
        "https://images.pexels.com/photos/6030228/pexels-photo-6030228.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/7640696/pexels-photo-7640696.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/6030231/pexels-photo-6030231.jpeg?auto=compress&cs=tinysrgb&w=800"
      ]
    },
    {
      id: 5,
      name: "Ebony Queen Dress",
      price: 200,
      gender: "Women",
      color: "black",
      fabric: "Silk Blend",
      origin: "Kenya",
      story: "Flowing black silk with subtle gold trims that redefine elegance.",
      images: [
        "https://images.pexels.com/photos/9840079/pexels-photo-9840079.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/9840081/pexels-photo-9840081.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/9840082/pexels-photo-9840082.jpeg?auto=compress&cs=tinysrgb&w=800"
      ]
    },
    {
      id: 6,
      name: "Little Kente Joy",
      price: 95,
      gender: "Kids",
      color: "green",
      fabric: "Kente Cotton",
      origin: "Ghana",
      story: "Bright and cheerful Kente outfit for kids, celebrating color and heritage.",
      images: [
        "https://images.pexels.com/photos/1648374/pexels-photo-1648374.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/9772458/pexels-photo-9772458.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/9772459/pexels-photo-9772459.jpeg?auto=compress&cs=tinysrgb&w=800"
      ]
    },
    {
      id: 7,
      name: "Sokoto Silk Aura",
      price: 210,
      gender: "Men",
      color: "gold",
      fabric: "Silk",
      origin: "Nigeria",
      story: "Soft Sokoto silk blending comfort with royal African elegance.",
      images: [
        "https://images.pexels.com/photos/1858475/pexels-photo-1858475.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1858477/pexels-photo-1858477.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1858476/pexels-photo-1858476.jpeg?auto=compress&cs=tinysrgb&w=800"
      ]
    },
    {
      id: 8,
      name: "Rainbow Ankara Joy",
      price: 110,
      gender: "Kids",
      color: "red",
      fabric: "Ankara",
      origin: "Nigeria",
      story: "Colorful Ankara outfit radiating happiness and culture for little ones.",
      images: [
        "https://images.pexels.com/photos/1648372/pexels-photo-1648372.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1648373/pexels-photo-1648373.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1648375/pexels-photo-1648375.jpeg?auto=compress&cs=tinysrgb&w=800"
      ]
    },
    {
      id: 9,
      name: "Adinkra Essence",
      price: 175,
      gender: "Men",
      color: "blue",
      fabric: "Cotton Print",
      origin: "Ghana",
      story: "Adinkra prints meet tailored fit, merging tradition with modern cool.",
      images: [
        "https://images.pexels.com/photos/7651072/pexels-photo-7651072.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/7651073/pexels-photo-7651073.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/7651074/pexels-photo-7651074.jpeg?auto=compress&cs=tinysrgb&w=800"
      ]
    },
    {
      id: 10,
      name: "Queen of Nsukka",
      price: 250,
      gender: "Women",
      color: "green",
      fabric: "Adire Silk",
      origin: "Nigeria",
      story: "Luxurious silk adorned with Nsukka motifs — elegance born of heritage.",
      images: [
        "https://images.pexels.com/photos/6020226/pexels-photo-6020226.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/6020227/pexels-photo-6020227.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/6020225/pexels-photo-6020225.jpeg?auto=compress&cs=tinysrgb&w=800"
      ]
    }
  ];
}

const productList = document.getElementById("product-list");
const productModal = document.getElementById("product-modal");
const cartModal = document.getElementById("cart-modal");
const cartCount = document.getElementById("cart-count");
const cartItemsDiv = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const backToTop = document.getElementById("backToTop");
const priceRange = document.getElementById("priceRange");
const priceValue = document.getElementById("priceValue");

let cart = [];

/* --------------------
   Render Products
-------------------- */
function displayProducts(list) {
  productList.innerHTML = "";
  list.forEach(prod => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <img src="${prod.images[0]}" alt="${prod.name}">
      <div class="product-info">
        <h3>${prod.name}</h3>
        <p>$${prod.price}</p>
        <button class="btn-secondary" onclick="openModal(${prod.id})">Quick View</button>
      </div>
    `;
    productList.appendChild(card);
  });
  handleFadeIn();
}

/* --------------------
   Product Modal
-------------------- */
function openModal(id) {
  const product = products.find(p => p.id === id);
  const modalName = document.getElementById("modal-name");
  const modalPrice = document.getElementById("modal-price");
  const modalStory = document.getElementById("modal-story");
  const modalFabric = document.getElementById("modal-fabric");
  const modalOrigin = document.getElementById("modal-origin");
  const carousel = document.querySelector(".carousel-images");

  modalName.textContent = product.name;
  modalPrice.textContent = `$${product.price}`;
  modalStory.textContent = product.story;
  modalFabric.textContent = product.fabric;
  modalOrigin.textContent = product.origin;

  carousel.innerHTML = "";
  product.images.forEach(img => {
    const imgEl = document.createElement("img");
    imgEl.src = img;
    carousel.appendChild(imgEl);
  });

  productModal.classList.remove("hidden");

  // Auto-slide carousel
  let index = 0;
  const imgs = carousel.querySelectorAll("img");
  imgs.forEach((img, i) => (img.style.display = i === 0 ? "block" : "none"));
  let interval = setInterval(() => {
    imgs[index].style.display = "none";
    index = (index + 1) % imgs.length;
    imgs[index].style.display = "block";
  }, 3000);

  document.getElementById("add-to-cart").onclick = () => addToCart(product);
  document.getElementById("chat-whatsapp").onclick = () => {
    const size = document.getElementById("sizeSelect").value;
    const msg = encodeURIComponent(
      `Hello, I'm interested in *${product.name}* (Size: ${size}) for $${product.price}.`
    );
    window.open(`https://wa.me/13219616566?text=${msg}`, "_blank");
  };

  document.getElementById("close-modal").onclick = () => {
    productModal.classList.add("hidden");
    clearInterval(interval);
  };
}

/* --------------------
   Cart Functions
-------------------- */
function addToCart(product) {
  cart.push(product);
  cartCount.textContent = cart.length;
  updateCart();
  productModal.classList.add("hidden");
}

function updateCart() {
  cartItemsDiv.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;
    const div = document.createElement("div");
    div.innerHTML = `<p>${item.name} - $${item.price} 
      <span style="color:#d4af37;cursor:pointer;" onclick="removeFromCart(${index})">×</span></p>`;
    cartItemsDiv.appendChild(div);
  });
  cartTotalEl.textContent = total.toFixed(2);
}

function removeFromCart(i) {
  cart.splice(i, 1);
  cartCount.textContent = cart.length;
  updateCart();
}

document.getElementById("floating-cart").onclick = () => {
  document.body.classList.add("modal-open");
  cartModal.classList.remove("hidden");
};
document.getElementById("close-cart").onclick = () => {
  document.body.classList.remove("modal-open");
  cartModal.classList.add("hidden");
};
document.getElementById("checkout-btn").onclick = () => {
  if (cart.length === 0) return;
  const items = cart.map(i => `${i.name} ($${i.price})`).join(", ");
  const msg = encodeURIComponent(`Hello, I’d like to purchase: ${items}.`);
  window.open(`https://wa.me/13219616566?text=${msg}`, "_blank");
};

/* --------------------
   Filters
-------------------- */
document.getElementById("colorFilter").onchange =
document.getElementById("genderFilter").onchange =
priceRange.oninput = () => {
  priceValue.textContent = `$${priceRange.value}`;
  filterProducts();
};

function filterProducts() {
  const color = document.getElementById("colorFilter").value;
  const gender = document.getElementById("genderFilter").value;
  const price = parseInt(priceRange.value);

  const filtered = products.filter(
    p =>
      (color === "all" || p.color === color) &&
      (gender === "all" || p.gender === gender) &&
      p.price <= price
  );
  displayProducts(filtered);
}

/* --------------------
   Scroll & Fade
-------------------- */
function handleFadeIn() {
  const cards = document.querySelectorAll(".product-card");
  const trigger = window.innerHeight * 0.9;
  window.addEventListener("scroll", () => {
    cards.forEach(card => {
      const top = card.getBoundingClientRect().top;
      if (top < trigger) card.classList.add("visible");
    });
  });
}

/* --------------------
   Back to Top
-------------------- */
window.addEventListener("scroll", () => {
  if (window.scrollY > 400) backToTop.classList.add("show");
  else backToTop.classList.remove("show");
});
backToTop.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

/* --------------------
   Initialize
-------------------- */
displayProducts(products);
