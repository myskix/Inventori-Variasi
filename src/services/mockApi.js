// Mock database helper to simulate REST API behavior using localStorage for persistence
const DB_KEYS = {
  CATEGORIES: 'pos_categories',
  PRODUCTS: 'pos_products',
  SERVICES: 'pos_services',
  CUSTOMERS: 'pos_customers',
  TRANSACTIONS: 'pos_transaksi',
  TRANSACTION_DETAILS: 'pos_detail_transaksi',
  WARRANTIES: 'pos_warranties',
  STOCK_LOGS: 'pos_stok_logs'
}

// Default initial data representing "Toko Variasi Pekanbaru" (Motorcycle/Car Customization Shop)
const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Baut & Fastener', description: 'Baut L, Probolt bak mesin, mur, ring, fastener variasi' },
  { id: 'cat-2', name: 'Suku Cadang Racing', description: 'Piston kit, noken as racing, karburator kompetisi, per klep' },
  { id: 'cat-3', name: 'Pencahayaan & Listrik', description: 'Lampu LED utama, lampu sein, klakson, saklar, kabel' },
  { id: 'cat-4', name: 'Knalpot', description: 'Knalpot racing full system, slip-on, header, silencer' },
  { id: 'cat-5', name: 'Ban & Velg', description: 'Ban luar tubeless, velg racing, jari-jari, tromol' },
  { id: 'cat-6', name: 'Aksesoris & Bodi', description: 'Handgrip, spion, windshield, cover bodi carbon, jalu stang' }
]

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    category_id: 'cat-1',
    code: 'PRD-BAUT-001',
    name: 'Baut L Stainless M6x15',
    stok_saat_ini: 150,
    stok_minimum: 20,
    harga_beli: 2000,
    harga_jual: 5000,
    deskripsi: 'Baut L stainless steel anti karat ukuran M6 panjang 15mm untuk bodi/variasi',
    warranty_months: 0
  },
  {
    id: 'prod-2',
    category_id: 'cat-1',
    code: 'PRD-BAUT-002',
    name: 'Baut Probolt Bak Mesin Gold Beat',
    stok_saat_ini: 80,
    stok_minimum: 10,
    harga_beli: 8000,
    harga_jual: 15000,
    deskripsi: 'Baut variasi warna emas untuk hiasan bak mesin Honda Beat (set)',
    warranty_months: 0
  },
  {
    id: 'prod-3',
    category_id: 'cat-2',
    code: 'PRD-RACE-001',
    name: 'Noken As Racing BRT Master Cam Beat FI',
    stok_saat_ini: 8,
    stok_minimum: 2,
    harga_beli: 280000,
    harga_jual: 375000,
    deskripsi: 'Noken As BRT tipe T1 cocok untuk harian dan bore up mesin Beat FI / Scoopy FI',
    warranty_months: 3
  },
  {
    id: 'prod-4',
    category_id: 'cat-2',
    code: 'PRD-RACE-002',
    name: 'Karburator Keihin PE 28 Original Thailand',
    stok_saat_ini: 12,
    stok_minimum: 3,
    harga_beli: 220000,
    harga_jual: 320000,
    deskripsi: 'Karburator PE 28 untuk peningkatan performa motor karbu',
    warranty_months: 6
  },
  {
    id: 'prod-5',
    category_id: 'cat-4',
    code: 'PRD-EXH-001',
    name: 'Knalpot R9 Misano Nmax 155',
    stok_saat_ini: 4,
    stok_minimum: 1,
    harga_beli: 750000,
    harga_jual: 950000,
    deskripsi: 'Knalpot racing premium tipe Misano Black, suara ngebass adem standar jalanan',
    warranty_months: 12
  },
  {
    id: 'prod-6',
    category_id: 'cat-5',
    code: 'PRD-TIRE-001',
    name: 'Ban FDR Sport XR Evo Tubeless 90/80-17',
    stok_saat_ini: 15,
    stok_minimum: 5,
    harga_beli: 210000,
    harga_jual: 295000,
    deskripsi: 'Ban tubeless ring 17 dengan kompon reguler yang cocok untuk berkendara harian',
    warranty_months: 6
  },
  {
    id: 'prod-7',
    category_id: 'cat-3',
    code: 'PRD-LGT-001',
    name: 'Lampu Utama LED RTD 6 Sisi AC/DC',
    stok_saat_ini: 25,
    stok_minimum: 5,
    harga_beli: 95000,
    harga_jual: 145000,
    deskripsi: 'Lampu LED motor universal 6 sisi dengan kipas pendingin, cahaya putih terang',
    warranty_months: 1
  }
]

const INITIAL_SERVICES = [
  { id: 'srv-1', code: 'SRV-PST-001', name: 'Jasa Pasang Baut Bak Mesin', harga: 15000, deskripsi: 'Pemasangan baut variasi pada bak mesin kiri-kanan' },
  { id: 'srv-2', code: 'SRV-PST-002', name: 'Jasa Pasang Knalpot Fullsystem', harga: 35000, deskripsi: 'Bongkar knalpot bawaan dan pasang knalpot fullsystem baru' },
  { id: 'srv-3', code: 'SRV-PST-003', name: 'Jasa Bore Up Mesin Matic', harga: 250000, deskripsi: 'Jasa bubut silinder, pemasangan piston kit, adjust klep' },
  { id: 'srv-4', code: 'SRV-PST-004', name: 'Jasa Setting Karburator & Tuneup', harga: 50000, deskripsi: 'Pembersihan karbu, ganti main/pilot jet, dan tuning tarikan gas' }
]

const INITIAL_CUSTOMERS = [
  { id: 'cust-0', name: 'Umum / Cash', phone: '-', address: '-' },
  { id: 'cust-1', name: 'Rian Motor Pekanbaru', phone: '081277665544', address: 'Jl. H.R. Subrantas No. 45' },
  { id: 'cust-2', name: 'Budi Prasetyo', phone: '085211223344', address: 'Jl. Harapan Raya Gg. Merpati' },
  { id: 'cust-3', name: 'Ahmad Variasi Bengkel', phone: '082390807060', address: 'Jl. Riau No. 12B' }
]

// Seeds the database if localStorage is empty
function seedDatabase() {
  if (!localStorage.getItem(DB_KEYS.CATEGORIES)) {
    localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES))
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS))
    localStorage.setItem(DB_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES))
    localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS))
    localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify([]))
    localStorage.setItem(DB_KEYS.TRANSACTION_DETAILS, JSON.stringify([]))
    localStorage.setItem(DB_KEYS.WARRANTIES, JSON.stringify([]))
    localStorage.setItem(DB_KEYS.STOCK_LOGS, JSON.stringify([
      {
        id: 'log-seed-1',
        product_id: 'prod-1',
        change_qty: 150,
        type: 'In',
        remarks: 'Stok awal sistem saat inisialisasi database',
        date: new Date().toISOString()
      },
      {
        id: 'log-seed-2',
        product_id: 'prod-2',
        change_qty: 80,
        type: 'In',
        remarks: 'Stok awal sistem saat inisialisasi database',
        date: new Date().toISOString()
      },
      {
        id: 'log-seed-3',
        product_id: 'prod-3',
        change_qty: 8,
        type: 'In',
        remarks: 'Stok awal sistem saat inisialisasi database',
        date: new Date().toISOString()
      },
      {
        id: 'log-seed-4',
        product_id: 'prod-4',
        change_qty: 12,
        type: 'In',
        remarks: 'Stok awal sistem saat inisialisasi database',
        date: new Date().toISOString()
      },
      {
        id: 'log-seed-5',
        product_id: 'prod-5',
        change_qty: 4,
        type: 'In',
        remarks: 'Stok awal sistem saat inisialisasi database',
        date: new Date().toISOString()
      },
      {
        id: 'log-seed-6',
        product_id: 'prod-6',
        change_qty: 15,
        type: 'In',
        remarks: 'Stok awal sistem saat inisialisasi database',
        date: new Date().toISOString()
      },
      {
        id: 'log-seed-7',
        product_id: 'prod-7',
        change_qty: 25,
        type: 'In',
        remarks: 'Stok awal sistem saat inisialisasi database',
        date: new Date().toISOString()
      }
    ]))
  }
}

// Run seed on load
seedDatabase()

// Generic LocalStorage helper functions
function getTableData(key) {
  seedDatabase()
  try {
    return JSON.parse(localStorage.getItem(key)) || []
  } catch (error) {
    console.error(`Error reading database table ${key}:`, error)
    return []
  }
}

function saveTableData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error saving database table ${key}:`, error)
  }
}

// Simulates network latency
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// API EXPORTS
export const mockApi = {
  // --- CATEGORIES ---
  getCategories: async () => {
    await delay()
    return getTableData(DB_KEYS.CATEGORIES)
  },

  addCategory: async (category) => {
    await delay()
    const categories = getTableData(DB_KEYS.CATEGORIES)
    const newCategory = {
      id: `cat-${Date.now()}`,
      ...category
    }
    categories.push(newCategory)
    saveTableData(DB_KEYS.CATEGORIES, categories)
    return newCategory
  },

  // --- PRODUCTS ---
  getProducts: async () => {
    await delay()
    return getTableData(DB_KEYS.PRODUCTS)
  },

  getProductById: async (id) => {
    await delay()
    const products = getTableData(DB_KEYS.PRODUCTS)
    return products.find((p) => p.id === id) || null
  },

  addProduct: async (product) => {
    await delay()
    const products = getTableData(DB_KEYS.PRODUCTS)
    const stockLogs = getTableData(DB_KEYS.STOCK_LOGS)

    const newProduct = {
      id: `prod-${Date.now()}`,
      stok_saat_ini: Number(product.stok_saat_ini) || 0,
      stok_minimum: Number(product.stok_minimum) || 0,
      harga_beli: Number(product.harga_beli) || 0,
      harga_jual: Number(product.harga_jual) || 0,
      warranty_months: Number(product.warranty_months) || 0,
      ...product
    }
    
    products.push(newProduct)
    saveTableData(DB_KEYS.PRODUCTS, products)

    // Log the initial stock creation
    if (newProduct.stok_saat_ini > 0) {
      stockLogs.push({
        id: `log-${Date.now()}`,
        product_id: newProduct.id,
        change_qty: newProduct.stok_saat_ini,
        type: 'In',
        remarks: 'Input barang baru ke sistem',
        date: new Date().toISOString()
      })
      saveTableData(DB_KEYS.STOCK_LOGS, stockLogs)
    }

    return newProduct
  },

  updateProductStock: async (productId, changeQty, type = 'Adjustment', remarks = 'Penyesuaian stok manual') => {
    await delay()
    const products = getTableData(DB_KEYS.PRODUCTS)
    const stockLogs = getTableData(DB_KEYS.STOCK_LOGS)

    const productIndex = products.findIndex((p) => p.id === productId)
    if (productIndex === -1) throw new Error('Produk tidak ditemukan!')

    const product = products[productIndex]
    const updatedStock = product.stok_saat_ini + changeQty
    if (updatedStock < 0) throw new Error('Operasi stok tidak valid! Stok akhir tidak boleh negatif.')

    product.stok_saat_ini = updatedStock
    products[productIndex] = product
    saveTableData(DB_KEYS.PRODUCTS, products)

    const newLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      product_id: productId,
      change_qty: changeQty,
      type,
      remarks,
      date: new Date().toISOString()
    }
    stockLogs.push(newLog)
    saveTableData(DB_KEYS.STOCK_LOGS, stockLogs)

    return { product, log: newLog }
  },

  // --- SERVICES ---
  getServices: async () => {
    await delay()
    return getTableData(DB_KEYS.SERVICES)
  },

  addService: async (service) => {
    await delay()
    const services = getTableData(DB_KEYS.SERVICES)
    const newService = {
      id: `srv-${Date.now()}`,
      harga: Number(service.harga) || 0,
      ...service
    }
    services.push(newService)
    saveTableData(DB_KEYS.SERVICES, services)
    return newService
  },

  // --- CUSTOMERS ---
  getCustomers: async () => {
    await delay()
    return getTableData(DB_KEYS.CUSTOMERS)
  },

  addCustomer: async (customer) => {
    await delay()
    const customers = getTableData(DB_KEYS.CUSTOMERS)
    const newCustomer = {
      id: `cust-${Date.now()}`,
      ...customer
    }
    customers.push(newCustomer)
    saveTableData(DB_KEYS.CUSTOMERS, customers)
    return newCustomer
  },

  // --- WARRANTIES ---
  getWarranties: async () => {
    await delay()
    return getTableData(DB_KEYS.WARRANTIES)
  },

  claimWarranty: async (warrantyId, notes = '') => {
    await delay()
    const warranties = getTableData(DB_KEYS.WARRANTIES)
    const wIndex = warranties.findIndex((w) => w.id === warrantyId)
    if (wIndex === -1) throw new Error('Data garansi tidak ditemukan!')

    warranties[wIndex].status = 'Claimed'
    warranties[wIndex].claim_notes = notes
    warranties[wIndex].claim_date = new Date().toISOString()

    saveTableData(DB_KEYS.WARRANTIES, warranties)
    return warranties[wIndex]
  },

  // --- STOCK LOGS ---
  getStockLogs: async () => {
    await delay()
    return getTableData(DB_KEYS.STOCK_LOGS)
  },

  // --- TRANSACTIONS ---
  getTransactions: async () => {
    await delay()
    const transactions = getTableData(DB_KEYS.TRANSACTIONS)
    const details = getTableData(DB_KEYS.TRANSACTION_DETAILS)
    const customers = getTableData(DB_KEYS.CUSTOMERS)

    // Enrich transactions with customer details
    return transactions.map((t) => {
      const customer = customers.find((c) => c.id === t.customer_id)
      const trxDetails = details.filter((d) => d.transaksi_id === t.id)
      return {
        ...t,
        customer_name: t.customer_details?.name || (customer ? customer.name : 'Unknown'),
        customer_phone: t.customer_details?.phone || (customer ? customer.phone : '-'),
        customer_plat: t.customer_details?.plat_nomor || (customer ? customer.plat_nomor : '-'),
        items: trxDetails
      }
    })
  },

  /**
   * Simulates a transaction Checkout:
   * 1. Validate stocks for products.
   * 2. Auto-generate sequential invoice number.
   * 3. Deduct stock_saat_ini for products.
   * 4. Add items to detail_transaksi.
   * 5. Generate stok_logs records with automatic remarks.
   * 6. Generate warranty log based on custom days or default.
   * 7. Save and return transaction.
   * 
   * @param {Object} payload { customer_id, customer_details: { name, phone, plat_nomor }, items: [{ type: 'product'|'service', id, quantity, price, difficulty }], payment_method, cashier_id, warranty_duration_days }
   */
  createTransaction: async ({ customer_id, customer_details, items, payment_method, cashier_id, warranty_duration_days }) => {
    await delay(600) // Slightly longer to simulate heavy db write operation

    if (!items || items.length === 0) throw new Error('Keranjang belanja kosong!')

    const products = getTableData(DB_KEYS.PRODUCTS)
    const services = getTableData(DB_KEYS.SERVICES)
    const transactions = getTableData(DB_KEYS.TRANSACTIONS)
    const details = getTableData(DB_KEYS.TRANSACTION_DETAILS)
    const stockLogs = getTableData(DB_KEYS.STOCK_LOGS)
    const warranties = getTableData(DB_KEYS.WARRANTIES)
    const customers = getTableData(DB_KEYS.CUSTOMERS)

    // Dynamic customer registration if phone is provided and is a new customer
    let finalCustomerId = customer_id || 'cust-0'
    if (customer_details && customer_details.name && customer_details.name !== 'Umum / Cash') {
      const existingCustomer = customers.find(
        (c) => c.phone === customer_details.phone && c.phone !== '-'
      )
      if (existingCustomer) {
        finalCustomerId = existingCustomer.id
        // Update plate if it wasn't saved before
        if (customer_details.plat_nomor && (!existingCustomer.plat_nomor || existingCustomer.plat_nomor === '-')) {
          existingCustomer.plat_nomor = customer_details.plat_nomor
          saveTableData(DB_KEYS.CUSTOMERS, customers)
        }
      } else {
        const newCustomer = {
          id: `cust-${Date.now()}`,
          name: customer_details.name,
          phone: customer_details.phone || '-',
          plat_nomor: customer_details.plat_nomor || '-',
          address: '-'
        }
        customers.push(newCustomer)
        saveTableData(DB_KEYS.CUSTOMERS, customers)
        finalCustomerId = newCustomer.id
      }
    }

    // 1. Validation & Pre-calculations
    const updatedProducts = [...products]
    const logsToAdd = []
    const warrantiesToAdd = []
    const detailsToAdd = []
    let totalAmount = 0

    // Auto generate invoice number (Format: INV/YYYYMMDD/[SeqNo])
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const todayTrxs = transactions.filter((t) => t.invoice_no.includes(`INV/${todayStr}/`))
    const seqNumber = String(todayTrxs.length + 1).padStart(3, '0')
    const invoiceNo = `INV/${todayStr}/${seqNumber}`
    const transactionId = `trx-${Date.now()}`

    for (const item of items) {
      const qty = Number(item.quantity) || 1
      if (qty <= 0) throw new Error('Kuantitas item harus lebih dari 0!')

      if (item.type === 'product') {
        const prodIndex = updatedProducts.findIndex((p) => p.id === item.id)
        if (prodIndex === -1) throw new Error(`Produk dengan ID ${item.id} tidak ditemukan!`)
        
        const targetProduct = updatedProducts[prodIndex]

        // Stock check
        if (targetProduct.stok_saat_ini < qty) {
          throw new Error(`Stok tidak mencukupi untuk "${targetProduct.name}"! Stok tersedia: ${targetProduct.stok_saat_ini}, diminta: ${qty}`)
        }

        // Deduct stock
        targetProduct.stok_saat_ini -= qty
        
        // Calculate amount using retail price from catalog (prevent client tampering) or the item price
        const itemPrice = Number(item.price) || targetProduct.harga_jual
        const subtotal = itemPrice * qty
        totalAmount += subtotal

        // Prepare details
        detailsToAdd.push({
          id: `dtx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          transaksi_id: transactionId,
          item_type: 'product',
          item_id: item.id,
          name: targetProduct.name,
          quantity: qty,
          unit_price: itemPrice,
          subtotal
        })

        // Prepare stock logs (Automatic remarks from system)
        logsToAdd.push({
          id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          product_id: item.id,
          change_qty: -qty,
          type: 'Sale',
          remarks: `Penjualan Kasir via Invoice ${invoiceNo}`,
          date: new Date().toISOString()
        })

        // Prepare warranty
        let durationDays = 0
        if (warranty_duration_days !== undefined && Number(warranty_duration_days) > 0) {
          durationDays = Number(warranty_duration_days)
        } else if (targetProduct.warranty_months > 0) {
          durationDays = targetProduct.warranty_months * 30
        }

        if (durationDays > 0) {
          const expiryDate = new Date()
          expiryDate.setDate(expiryDate.getDate() + durationDays)

          warrantiesToAdd.push({
            id: `wrnt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            transaksi_id: transactionId,
            product_id: item.id,
            product_name: targetProduct.name,
            duration_days: durationDays,
            status: 'Active',
            expiry_date: expiryDate.toISOString().slice(0, 10),
            date_created: new Date().toISOString(),
            customer_name: customer_details?.name || 'Umum / Cash',
            customer_phone: customer_details?.phone || '-',
            customer_plat: customer_details?.plat_nomor || '-'
          })
        }

      } else if (item.type === 'service') {
        const targetService = services.find((s) => s.id === item.id)
        if (!targetService) throw new Error(`Jasa dengan ID ${item.id} tidak ditemukan!`)

        // Surcharge for Complex service difficulty (1.5x price)
        let itemPrice = Number(item.price) || targetService.harga
        if (item.difficulty === 'Complex') {
          itemPrice = Math.round(itemPrice * 1.5)
        }
        
        const subtotal = itemPrice * qty
        totalAmount += subtotal

        detailsToAdd.push({
          id: `dtx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          transaksi_id: transactionId,
          item_type: 'service',
          item_id: item.id,
          name: `${targetService.name} (${item.difficulty || 'Simple'})`,
          quantity: qty,
          unit_price: itemPrice,
          subtotal,
          difficulty: item.difficulty || 'Simple'
        })
      } else {
        throw new Error('Tipe item transaksi tidak dikenal! Harus "product" or "service".')
      }
    }

    // 2. Persist to Database Tables
    const newTransaction = {
      id: transactionId,
      invoice_no: invoiceNo,
      date: new Date().toISOString(),
      customer_id: finalCustomerId,
      customer_details: customer_details || { name: 'Umum / Cash', phone: '-', plat_nomor: '-' },
      total_amount: totalAmount,
      payment_method: payment_method || 'Cash',
      cashier_id: cashier_id || 'usr-002'
    }

    // Save Transactions
    transactions.push(newTransaction)
    saveTableData(DB_KEYS.TRANSACTIONS, transactions)

    // Save Details
    details.push(...detailsToAdd)
    saveTableData(DB_KEYS.TRANSACTION_DETAILS, details)

    // Save Deducted Stock Products
    saveTableData(DB_KEYS.PRODUCTS, updatedProducts)

    // Save Stock Logs
    stockLogs.push(...logsToAdd)
    saveTableData(DB_KEYS.STOCK_LOGS, stockLogs)

    // Save Warranties
    if (warrantiesToAdd.length > 0) {
      warranties.push(...warrantiesToAdd)
      saveTableData(DB_KEYS.WARRANTIES, warranties)
    }

    return {
      transaction: newTransaction,
      details: detailsToAdd,
      warranties: warrantiesToAdd,
      stock_logs: logsToAdd
    }
  }
}
