const PDFDocument = require("pdfkit");

exports.generateInvoice = (payment, tenant, res) => {
  const doc = new PDFDocument({ margin: 50 });

  doc.pipe(res);

  // Header
  doc
    .fillColor("#368F8B")
    .fontSize(24)
    .text("JanUmang SaaS", 50, 57)
    .fillColor("#444444")
    .fontSize(10)
    .text("123 Tech Park, Sector 45", 200, 65, { align: "right" })
    .text("New Delhi, India, 110001", 200, 80, { align: "right" })
    .text("Email: billing@janumang.com", 200, 95, { align: "right" })
    .moveDown();

  const hr = (y) => {
    doc.strokeColor("#eeeeee").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
  };

  hr(120);

  // Invoice Summary
  const invoiceNum = payment._id?.toString().toUpperCase().slice(-8) || "N/A";
  doc
    .fontSize(20)
    .fillColor("#222222")
    .text(`INVOICE`, 50, 140)
    .fontSize(10)
    .fillColor("#555555")
    .text(`Invoice No:`, 50, 170)
    .text(`INV-${invoiceNum}`, 150, 170)
    .text(`Date Paid:`, 50, 185)
    .text(new Date(payment.paidAt || payment.createdAt).toLocaleDateString(), 150, 185)
    .text(`Status:`, 50, 200)
    .fillColor(payment.status === "paid" ? "#22c55e" : "#f59e0b")
    .text(payment.status.toUpperCase(), 150, 200)
    .fillColor("#555555")
    .text(`Payment ID:`, 50, 215)
    .text(payment.razorpayPaymentId || "N/A", 150, 215);

  // Billed To
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text(`Billed To:`, 350, 170)
    .font("Helvetica")
    .text(tenant?.name || "Customer", 350, 185)
    .text(`Tenant ID: ${tenant?._id?.toString()?.slice(-8) || "N/A"}`, 350, 200);

  hr(250);

  // Table Header
  doc.fontSize(10).font("Helvetica-Bold");
  doc.text("Description", 50, 270);
  doc.text("Plan", 250, 270);
  doc.text("Billing Cycle", 350, 270);
  doc.text("Total Amount", 0, 270, { align: "right" });

  hr(290);

  // Table Row
  doc.font("Helvetica").fillColor("#333333");
  doc.text(`Software Subscription`, 50, 310);
  doc.text(payment.plan ? payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1) : "-", 250, 310);
  doc.text(payment.billingCycle ? payment.billingCycle.charAt(0).toUpperCase() + payment.billingCycle.slice(1) : "-", 350, 310);
  
  const amountStr = `Rs ${(payment.amount / 100).toFixed(2)}`;
  doc.text(amountStr, 0, 310, { align: "right" });

  hr(340);

  // Totals
  doc.font("Helvetica-Bold").fontSize(12);
  doc.text("Total Paid:", 350, 360);
  doc.fillColor("#368F8B").text(amountStr, 0, 360, { align: "right" });

  doc.font("Helvetica").fontSize(10).fillColor("#aaaaaa").text("This is an electronically generated invoice.", 50, 700, { align: "center", width: 500 });
  
  doc.end();
};
