// Shared product catalog for the Education Materials store.
// Underscore prefix keeps Vercel from treating this file as its own route -
// it's a plain module imported by the real API functions in this folder.
//
// `storagePath` is where the file lives inside the private "course-files"
// Supabase Storage bucket - upload the actual .pptx/.xlsx there under these
// exact paths (see supabase/schema.sql and the README for the upload steps).

const PRODUCTS = {
  "intro": {
    name: "Introduction to Real Estate",
    priceCents: 2999,
    files: [
      { filename: "Introduction-to-Real-Estate.pptx", storagePath: "intro/Introduction-to-Real-Estate.pptx" }
    ]
  },
  "fundamentals": {
    name: "Real Estate Finance Fundamentals",
    priceCents: 2999,
    files: [
      { filename: "Real-Estate-Finance-Fundamentals.pptx", storagePath: "fundamentals/Real-Estate-Finance-Fundamentals.pptx" },
      { filename: "Real-Estate-Finance-Fundamentals-Workbook.xlsx", storagePath: "fundamentals/Real-Estate-Finance-Fundamentals-Workbook.xlsx" }
    ]
  },
  "advanced": {
    name: "Advanced: Deal Structuring & Waterfalls",
    priceCents: 2999,
    files: [
      { filename: "Advanced-RE-Finance-Fundamentals.pptx", storagePath: "advanced/Advanced-RE-Finance-Fundamentals.pptx" },
      { filename: "Advanced-RE-Finance-Workbook.xlsx", storagePath: "advanced/Advanced-RE-Finance-Workbook.xlsx" }
    ]
  },
  "multifamily": {
    name: "Multifamily Underwriting",
    priceCents: 2999,
    files: [
      { filename: "Multifamily-Underwriting.pptx", storagePath: "multifamily/Multifamily-Underwriting.pptx" },
      { filename: "Multifamily-Adjustments-Worksheet.xlsx", storagePath: "multifamily/Multifamily-Adjustments-Worksheet.xlsx" }
    ]
  },
  "office": {
    name: "Office Underwriting",
    priceCents: 2999,
    files: [
      { filename: "Office-Underwriting.pptx", storagePath: "office/Office-Underwriting.pptx" },
      { filename: "Office-Adjustments-Worksheet.xlsx", storagePath: "office/Office-Adjustments-Worksheet.xlsx" }
    ]
  },
  "retail-industrial": {
    name: "Retail & Industrial Underwriting",
    priceCents: 2999,
    files: [
      { filename: "Retail-Industrial-Underwriting.pptx", storagePath: "retail-industrial/Retail-Industrial-Underwriting.pptx" },
      { filename: "Retail-Industrial-Adjustments-Worksheet.xlsx", storagePath: "retail-industrial/Retail-Industrial-Adjustments-Worksheet.xlsx" }
    ]
  },
  "bundle-all-6": {
    name: "Complete Bundle - All 6 Courses",
    priceCents: 11900,
    files: [
      { filename: "Introduction-to-Real-Estate.pptx", storagePath: "intro/Introduction-to-Real-Estate.pptx" },
      { filename: "Real-Estate-Finance-Fundamentals.pptx", storagePath: "fundamentals/Real-Estate-Finance-Fundamentals.pptx" },
      { filename: "Real-Estate-Finance-Fundamentals-Workbook.xlsx", storagePath: "fundamentals/Real-Estate-Finance-Fundamentals-Workbook.xlsx" },
      { filename: "Advanced-RE-Finance-Fundamentals.pptx", storagePath: "advanced/Advanced-RE-Finance-Fundamentals.pptx" },
      { filename: "Advanced-RE-Finance-Workbook.xlsx", storagePath: "advanced/Advanced-RE-Finance-Workbook.xlsx" },
      { filename: "Multifamily-Underwriting.pptx", storagePath: "multifamily/Multifamily-Underwriting.pptx" },
      { filename: "Multifamily-Adjustments-Worksheet.xlsx", storagePath: "multifamily/Multifamily-Adjustments-Worksheet.xlsx" },
      { filename: "Office-Underwriting.pptx", storagePath: "office/Office-Underwriting.pptx" },
      { filename: "Office-Adjustments-Worksheet.xlsx", storagePath: "office/Office-Adjustments-Worksheet.xlsx" },
      { filename: "Retail-Industrial-Underwriting.pptx", storagePath: "retail-industrial/Retail-Industrial-Underwriting.pptx" },
      { filename: "Retail-Industrial-Adjustments-Worksheet.xlsx", storagePath: "retail-industrial/Retail-Industrial-Adjustments-Worksheet.xlsx" }
    ]
  }
};

module.exports = { PRODUCTS };
