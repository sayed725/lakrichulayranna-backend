import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export const generateInvoicePdf = async (orderData: any): Promise<string> => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${orderData.orderNumber}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 24px; font-weight: bold; color: #E85D24; }
        .tagline { color: #666; font-size: 14px; }
        .details { margin-bottom: 30px; display: flex; justify-content: space-between; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
        th { background-color: #f9f9f9; }
        .total-row { font-weight: bold; }
        .total-amount { font-size: 18px; color: #E85D24; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">লাকড়ি চুলায় রান্না</div>
        <div class="tagline">Authentic Wood-Fire Cooking</div>
      </div>
      <div class="details">
        <div>
          <strong>Order:</strong> ${orderData.orderNumber}<br>
          <strong>Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}<br>
          <strong>Status:</strong> ${orderData.status}
        </div>
        <div>
          <strong>Customer:</strong> ${orderData.user?.name || orderData.customerName || 'Guest'}<br>
          <strong>Phone:</strong> ${orderData.customerPhone || orderData.user?.phone || 'N/A'}<br>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${orderData.items.map((item: any) => `
            <tr>
              <td>${item.itemName}</td>
              <td>${item.quantity}</td>
              <td>৳${item.itemPrice}</td>
              <td>৳${item.total}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="text-align: right;">
        <p>Subtotal: ৳${orderData.subtotal}</p>
        ${orderData.discountAmount > 0 ? `<p>Discount: -৳${orderData.discountAmount}</p>` : ''}
        <p class="total-row">Total: <span class="total-amount">৳${orderData.total}</span></p>
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  
  const dirPath = path.join(__dirname, '../../public/invoices');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const fileName = `invoice-${orderData.orderNumber}.pdf`;
  const filePath = path.join(dirPath, fileName);
  
  await page.pdf({ path: filePath, format: 'A4' });
  await browser.close();

  return `/invoices/${fileName}`;
};
