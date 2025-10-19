document.addEventListener("DOMContentLoaded", () => {
  /* ========== SELECT ELEMENTS ========== */
  const menuBtn = document.querySelector(".fa-bars");
  const searchBtn = document.getElementById("search-btn");
  const cartBtn = document.getElementById("cart-btn");
  const storeNameBox = document.querySelector(".store-name-box");
  const orderNowBtn = document.getElementById("orderNow");
  const orderForm = document.getElementById("orderForm");
  const orderFormEl = document.querySelector(".order-form");

  const sideMenu = document.getElementById("side-menu");
  const searchBox = document.getElementById("search-box");

  let searchTimeout = null;
  let cartPopup = null;

  /* ========== MENU TOGGLE ========== */
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      sideMenu.classList.toggle("hidden");
    });
  }

  document.addEventListener("click", (e) => {
    if (!sideMenu.contains(e.target) && e.target !== menuBtn) {
      sideMenu.classList.add("hidden");
    }
  });

  /* ========== SEARCH BAR ========== */
  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      searchBox.classList.toggle("hidden");
      const input = searchBox.querySelector("input");
      input.focus();

      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchBox.classList.add("hidden");
      }, 6000);
    });
  }

  searchBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = e.target.value.trim().toLowerCase();
      if (query) searchProducts(query);
    }
  });

  function searchProducts(query) {
    const allText = Array.from(document.querySelectorAll(".info-section, .product-title, .headline"));
    let found = false;
    for (const item of allText) {
      if (item.textContent.toLowerCase().includes(query)) {
        item.scrollIntoView({ behavior: "smooth", block: "center" });
        item.style.boxShadow = "0 0 0 4px rgba(0,255,115,0.4) inset";
        setTimeout(() => (item.style.boxShadow = ""), 1500);
        found = true;
        break;
      }
    }
    if (!found) alert(`No results found for "${query}".`);
  }

  /* ========== CART POPUP ========== */
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      toggleCartPopup();
    });
  }

  function toggleCartPopup() {
    if (!cartPopup) createCartPopup();
    cartPopup.style.display = cartPopup.style.display === "block" ? "none" : "block";
  }

  function createCartPopup() {
    cartPopup = document.createElement("div");
    cartPopup.className = "cart-popup";
    Object.assign(cartPopup.style, {
      position: "absolute",
      top: "60px",
      right: "10px",
      background: "#fff",
      border: "1px solid #ccc",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
      zIndex: "999",
      padding: "10px",
      width: "240px",
      display: "none"
    });

    const cartBody = document.createElement("div");
    cartBody.className = "cart-body";
    cartPopup.appendChild(cartBody);
    document.body.appendChild(cartPopup);
    updateCartDisplay();
  }

  function updateCartDisplay() {
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    const cartBody = cartPopup.querySelector(".cart-body");

    if (cartData.length === 0) {
      cartBody.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }

    cartBody.innerHTML = cartData
      .map(
        (item, i) => `
        <div style="display:flex;justify-content:space-between;margin:6px 0;">
          <span>${i + 1}. ${item.name}</span>
          <span>${item.newPrice} KSh</span>
        </div>
      `
      )
      .join("");

    const total = cartData.reduce((acc, item) => acc + item.newPrice, 0);
    const totalLine = document.createElement("div");
    totalLine.innerHTML = `<hr><strong>Total: ${total} KSh</strong>`;
    cartBody.appendChild(totalLine);
  }

  /* ========== SCROLL TO FORM ========== */
  function scrollToForm() {
    if (orderForm) {
      orderForm.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("fname")?.focus();
    }
  }

  if (orderNowBtn) orderNowBtn.addEventListener("click", scrollToForm);
  if (storeNameBox) storeNameBox.addEventListener("click", scrollToForm);

  /* ========== GOOGLE SHEETS INTEGRATION ========== */
  async function sendToGoogleSheet(data) {
    // 👇 Replace this URL with your own Google Apps Script Web App link
    const scriptURL = "https://script.google.com/macros/s/AKfycbyUCbDkgbXftw7bcZUVRwKO6oHTtOWauxW-tkkVeiDRmmuWFaWT-Qw-Qq2CJyomQg8D/exec";

    try {
      await fetch(scriptURL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      console.log("✅ Sent to Google Sheet:", data);
    } catch (err) {
      console.error("❌ Failed to send to Google Sheet:", err);
    }
  }

  /* ========== HANDLE FORM SUBMISSION ========== */
  if (orderFormEl) {
    orderFormEl.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("fname").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const altphone = document.getElementById("altphone").value.trim();
      const county = document.getElementById("county").value.trim();
      const address = document.getElementById("address").value.trim();
      const product = document.getElementById("product").value.trim();

      if (!name || !phone || !county || !address || !product) {
        alert("⚠️ Please fill in all required fields.");
        return;
      }

      const orderData = { name, phone, altphone, county, address, product, date: new Date().toLocaleString() };

      sendToGoogleSheet(orderData);
      localStorage.removeItem("cart");

      alert("✅ Order submitted successfully!");
      orderFormEl.reset();
    });
  }
});
