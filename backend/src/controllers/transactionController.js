const { sequelize, Transaction, TransactionDetail, Product, StockLog, Warranty, User } = require('../../models');

const getAll = async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        { model: TransactionDetail, as: 'items' },
        { model: Warranty, as: 'warranty' },
        { model: User, as: 'cashier', attributes: ['name'] }
      ],
      order: [['date', 'DESC']]
    });
    res.json(transactions);
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {
      customer_details,
      items, // array of { type, id, name, price, quantity, maxStock }
      payment_method,
      warranties // array of { product_id, product_name, duration_days }
    } = req.body;

    if (!items || items.length === 0) {
      throw new Error('Keranjang belanja kosong');
    }

    // 1. Generate Invoice No
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Transaction.count({
      where: sequelize.where(sequelize.fn('date', sequelize.col('date')), new Date().toISOString().slice(0, 10))
    });
    const invoiceNo = `INV/${dateStr}/${String(count + 1).padStart(3, '0')}`;

    let totalAmount = 0;
    let totalModal = 0;

    // Process items and validate stock
    for (const item of items) {
      const subtotal = Number(item.price) * Number(item.quantity);
      totalAmount += subtotal;

      if (item.type === 'product') {
        const product = await Product.findByPk(item.id, { transaction: t, lock: true });
        if (!product) throw new Error(`Produk tidak ditemukan: ${item.name}`);
        if (product.stok_saat_ini < item.quantity) {
          throw new Error(`Stok tidak mencukupi untuk: ${product.name}`);
        }

        totalModal += (Number(product.harga_modal) * Number(item.quantity));

        // Kurangi stok
        product.stok_saat_ini -= item.quantity;
        await product.save({ transaction: t });

        // Buat stock log
        await StockLog.create({
          product_id: product.id,
          change_qty: -item.quantity,
          type: 'Sale',
          remarks: `Penjualan Invoice ${invoiceNo}`,
          date: new Date(),
          reference_id: invoiceNo
        }, { transaction: t });
      }
    }

    const totalProfit = totalAmount - totalModal;

    // 2. Create Transaction
    const transaction = await Transaction.create({
      invoice_no: invoiceNo,
      date: new Date(),
      customer_name: customer_details?.name || 'Umum / Cash',
      customer_phone: customer_details?.phone || '-',
      customer_plat: customer_details?.plat_nomor || '-',
      customer_vehicle: customer_details?.vehicle || '-',
      customer_notes: customer_details?.notes || '-',
      total_amount: totalAmount,
      total_modal: totalModal,
      total_profit: totalProfit,
      payment_method: payment_method || 'Cash',
      cashier_id: req.user.id,
      status: 'Completed'
    }, { transaction: t });

    // 3. Create Transaction Details
    for (const item of items) {
      await TransactionDetail.create({
        transaction_id: transaction.id,
        item_type: item.type,
        item_id: item.type === 'product' ? item.id.toString() : 'manual',
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
        difficulty: item.type === 'service' ? 'Manual' : null
      }, { transaction: t });
    }

    // 4. Create Warranties
    if (warranties && warranties.length > 0) {
      for (const w of warranties) {
        const issueDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(issueDate.getDate() + Number(w.duration_days));

        await Warranty.create({
          transaction_id: transaction.id,
          invoice_no: invoiceNo,
          product_id: w.product_id,
          product_name: w.product_name,
          customer_name: customer_details?.name || 'Umum / Cash',
          customer_phone: customer_details?.phone || '-',
          customer_plat: customer_details?.plat_nomor || '-',
          duration_days: w.duration_days,
          issue_date: issueDate,
          expiry_date: expiryDate,
          status: 'Active'
        }, { transaction: t });
      }
    }

    await t.commit();
    res.status(201).json({ message: 'Transaksi berhasil', transaction });
  } catch (error) {
    await t.rollback();
    next(error); // This will pass the error to the errorMiddleware
  }
};

const cancelTransaction = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByPk(id, { 
      include: [{ model: TransactionDetail, as: 'items' }],
      transaction: t, lock: true 
    });

    if (!transaction) throw new Error('Transaksi tidak ditemukan');
    if (transaction.status === 'Cancelled') throw new Error('Transaksi sudah dibatalkan sebelumnya');

    // Rollback stock
    for (const item of transaction.items) {
      if (item.item_type === 'product') {
        const product = await Product.findByPk(item.item_id, { transaction: t, lock: true });
        if (product) {
          product.stok_saat_ini += item.quantity;
          await product.save({ transaction: t });

          await StockLog.create({
            product_id: product.id,
            change_qty: item.quantity,
            type: 'Cancel',
            remarks: `Pembatalan Transaksi Invoice ${transaction.invoice_no}`,
            date: new Date(),
            reference_id: transaction.invoice_no
          }, { transaction: t });
        }
      }
    }

    // Cancel warranties
    await Warranty.update(
      { status: 'Cancelled' },
      { where: { transaction_id: transaction.id }, transaction: t }
    );

    // Update status
    transaction.status = 'Cancelled';
    await transaction.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Transaksi berhasil dibatalkan', transaction });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

module.exports = { getAll, create, cancelTransaction };
