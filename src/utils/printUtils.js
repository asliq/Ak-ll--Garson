// Print Utilities for Restaurant POS System

/**
 * Print receipt for an order
 */
export const printReceipt = (order, table, restaurant) => {
  const printWindow = window.open('', '_blank')
  
  if (!printWindow) {
    alert('Lütfen tarayıcınızda pop-up engelleyiciyi kapatın')
    return
  }

  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Fiş - Masa ${table.number}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Courier New', monospace;
          padding: 20px;
          max-width: 300px;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px dashed #000;
          padding-bottom: 15px;
        }
        
        .restaurant-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .date {
          font-size: 12px;
          color: #666;
          margin-top: 10px;
        }
        
        .table-info {
          margin: 15px 0;
          padding: 10px 0;
          border-bottom: 1px dashed #000;
        }
        
        .table-info div {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 14px;
        }
        
        .items {
          margin: 15px 0;
        }
        
        .item {
          margin: 10px 0;
          font-size: 14px;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
        }
        
        .item-notes {
          font-size: 12px;
          color: #666;
          margin-top: 3px;
          padding-left: 10px;
        }
        
        .totals {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px dashed #000;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
          font-size: 14px;
        }
        
        .total-row.grand-total {
          font-size: 18px;
          font-weight: bold;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #000;
        }
        
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          border-top: 2px dashed #000;
          padding-top: 15px;
        }
        
        .footer p {
          margin: 5px 0;
        }
        
        @media print {
          body {
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="restaurant-name">${restaurant?.name || 'Lezzet Durağı'}</div>
        <div>${restaurant?.address || ''}</div>
        <div>${restaurant?.phone || ''}</div>
        <div class="date">${new Date().toLocaleString('tr-TR')}</div>
      </div>
      
      <div class="table-info">
        <div>
          <span>Masa:</span>
          <strong>Masa ${table.number}</span>
        </div>
        <div>
          <span>Garson:</span>
          <span>${order.waiterName || 'Garson'}</span>
        </div>
        <div>
          <span>Sipariş No:</span>
          <span>${order.id}</span>
        </div>
      </div>
      
      <div class="items">
        ${order.items.map(item => `
          <div class="item">
            <div class="item-header">
              <span>${item.quantity}x ${item.name}</span>
              <span>₺${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            ${item.notes ? `<div class="item-notes">Not: ${item.notes}</div>` : ''}
          </div>
        `).join('')}
      </div>
      
      <div class="totals">
        <div class="total-row">
          <span>Ara Toplam:</span>
          <span>₺${(order.subtotal || order.totalAmount).toFixed(2)}</span>
        </div>
        ${order.discountAmount > 0 ? `
          <div class="total-row" style="color: #22c55e;">
            <span>İndirim:</span>
            <span>-₺${order.discountAmount.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="total-row grand-total">
          <span>TOPLAM:</span>
          <span>₺${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="footer">
        <p>Bizi tercih ettiğiniz için teşekkür ederiz!</p>
        <p>Afiyet olsun! 🍽️</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print()
          setTimeout(() => window.close(), 500)
        }
      </script>
    </body>
    </html>
  `
  
  printWindow.document.write(receiptHTML)
  printWindow.document.close()
}

/**
 * Print kitchen ticket
 */
export const printKitchenTicket = (order, table) => {
  const printWindow = window.open('', '_blank')
  
  if (!printWindow) {
    alert('Lütfen tarayıcınızda pop-up engelleyiciyi kapatın')
    return
  }

  const ticketHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Mutfak Fişi - Masa ${table.number}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Courier New', monospace;
          padding: 20px;
          max-width: 300px;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 3px double #000;
          padding-bottom: 15px;
        }
        
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .order-info {
          margin: 15px 0;
          padding: 10px;
          background: #f0f0f0;
          border: 2px solid #000;
        }
        
        .order-info div {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 16px;
          font-weight: bold;
        }
        
        .items {
          margin: 20px 0;
        }
        
        .item {
          margin: 15px 0;
          padding: 10px;
          border: 1px solid #000;
        }
        
        .item-header {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .item-notes {
          font-size: 14px;
          margin-top: 8px;
          padding: 8px;
          background: #fffacd;
          border-left: 3px solid #ffd700;
        }
        
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          border-top: 3px double #000;
          padding-top: 15px;
        }
        
        @media print {
          body {
            padding: 10px;
          }
          .order-info {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .item-notes {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">MUTFAK</div>
        <div>${new Date().toLocaleTimeString('tr-TR')}</div>
      </div>
      
      <div class="order-info">
        <div>
          <span>MASA:</span>
          <span>${table.number}</span>
        </div>
        <div>
          <span>SİPARİŞ:</span>
          <span>${order.id}</span>
        </div>
      </div>
      
      <div class="items">
        ${order.items.map(item => `
          <div class="item">
            <div class="item-header">
              ${item.quantity}x ${item.name}
            </div>
            ${item.notes ? `
              <div class="item-notes">
                <strong>NOT:</strong> ${item.notes}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
      
      <div class="footer">
        <p>Garson: ${order.waiterName || 'Garson'}</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print()
          setTimeout(() => window.close(), 500)
        }
      </script>
    </body>
    </html>
  `
  
  printWindow.document.write(ticketHTML)
  printWindow.document.close()
}

/**
 * Print daily report
 */
export const printDailyReport = (stats, date) => {
  const printWindow = window.open('', '_blank')
  
  if (!printWindow) {
    alert('Lütfen tarayıcınızda pop-up engelleyiciyi kapatın')
    return
  }

  const reportHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Günlük Rapor - ${date}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #000;
          padding-bottom: 20px;
        }
        
        .title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .subtitle {
          font-size: 18px;
          color: #666;
        }
        
        .section {
          margin: 30px 0;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #333;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 20px 0;
        }
        
        .stat-card {
          padding: 15px;
          border: 2px solid #000;
          text-align: center;
        }
        
        .stat-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        th {
          background: #f5f5f5;
          font-weight: bold;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 2px solid #000;
          padding-top: 20px;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          .stat-card {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">GÜNLÜK SATIŞ RAPORU</div>
        <div class="subtitle">${date}</div>
        <div class="subtitle">${new Date().toLocaleString('tr-TR')}</div>
      </div>
      
      <div class="section">
        <div class="section-title">Genel Özet</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Toplam Satış</div>
            <div class="stat-value">₺${stats.totalSales?.toFixed(2) || '0.00'}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Sipariş Sayısı</div>
            <div class="stat-value">${stats.orderCount || 0}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Ortalama Sipariş</div>
            <div class="stat-value">₺${stats.averageOrder?.toFixed(2) || '0.00'}</div>
          </div>
        </div>
      </div>
      
      ${stats.topItems?.length > 0 ? `
        <div class="section">
          <div class="section-title">En Çok Satan Ürünler</div>
          <table>
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Adet</th>
                <th>Toplam</th>
              </tr>
            </thead>
            <tbody>
              ${stats.topItems.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₺${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
      
      ${stats.waiterStats?.length > 0 ? `
        <div class="section">
          <div class="section-title">Garson Performansı</div>
          <table>
            <thead>
              <tr>
                <th>Garson</th>
                <th>Sipariş</th>
                <th>Satış</th>
              </tr>
            </thead>
            <tbody>
              ${stats.waiterStats.map(waiter => `
                <tr>
                  <td>${waiter.name}</td>
                  <td>${waiter.orders}</td>
                  <td>₺${waiter.sales.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
      
      <div class="footer">
        <p>Bu rapor otomatik olarak oluşturulmuştur.</p>
        <p>Akıllı Garson - Restoran Yönetim Sistemi</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print()
        }
      </script>
    </body>
    </html>
  `
  
  printWindow.document.write(reportHTML)
  printWindow.document.close()
}

/**
 * Print order list
 */
export const printOrderList = (orders, title = 'Sipariş Listesi') => {
  const printWindow = window.open('', '_blank')
  
  if (!printWindow) {
    alert('Lütfen tarayıcınızda pop-up engelleyiciyi kapatın')
    return
  }

  const listHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          padding: 30px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
        }
        
        .title {
          font-size: 24px;
          font-weight: bold;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        th {
          background: #f5f5f5;
          font-weight: bold;
        }
        
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${title}</div>
        <div>${new Date().toLocaleString('tr-TR')}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Sipariş No</th>
            <th>Masa</th>
            <th>Durum</th>
            <th>Tutar</th>
            <th>Saat</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(order => `
            <tr>
              <td>${order.id}</td>
              <td>Masa ${order.tableNumber || order.tableId}</td>
              <td>${getStatusText(order.status)}</td>
              <td>₺${order.totalAmount.toFixed(2)}</td>
              <td>${new Date(order.createdAt).toLocaleTimeString('tr-TR')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Toplam ${orders.length} sipariş</p>
      </div>
      
      <script>
        function getStatusText(status) {
          const statusMap = {
            'pending': 'Bekliyor',
            'preparing': 'Hazırlanıyor',
            'ready': 'Hazır',
            'served': 'Servis Edildi',
            'completed': 'Tamamlandı',
            'cancelled': 'İptal'
          }
          return statusMap[status] || status
        }
        
        window.onload = function() {
          window.print()
        }
      </script>
    </body>
    </html>
  `
  
  printWindow.document.write(listHTML)
  printWindow.document.close()
}

// Helper function for status text
function getStatusText(status) {
  const statusMap = {
    'pending': 'Bekliyor',
    'preparing': 'Hazırlanıyor',
    'ready': 'Hazır',
    'served': 'Servis Edildi',
    'completed': 'Tamamlandı',
    'cancelled': 'İptal'
  }
  return statusMap[status] || status
}

