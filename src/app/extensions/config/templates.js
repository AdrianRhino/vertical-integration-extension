export default {
  templates: [
    {
      id: "roofing-residential",
      name: "Residential Roofing Package",
      items: [
        { skuKey: "shingle-black", title: "Arch Shingles", variant: "Onyx Black", uom: "SQ", quantity: 10, skuMap: { ABC: "ABC-SH-BLK", SRS: "SRS-SH-BLK", BEACON: "BCN-SH-BLK" } },
        { skuKey: "underlayment", title: "Syn. Underlayment", variant: "Standard 30lb", uom: "ROLL", quantity: 2, skuMap: { ABC: "ABC-UL-30", SRS: "SRS-UL-30", BEACON: "BCN-UL-30" } },
        { skuKey: "drip-edge", title: "Drip Edge", variant: "White 10ft", uom: "EA", quantity: 5, skuMap: { ABC: "ABC-DE-WHT", SRS: "SRS-DE-WHT", BEACON: "BCN-DE-WHT" } }
      ]
    },
    {
      id: "siding-commercial",
      name: "Commercial Siding Package",
      items: [
        { skuKey: "vinyl-white", title: "Vinyl Siding", variant: "Colonial White", uom: "SQ", quantity: 20, skuMap: { ABC: "ABC-VS-WHT", SRS: "SRS-VS-WHT", BEACON: "BCN-VS-WHT" } },
        { skuKey: "j-channel", title: "J-Channel", variant: "White", uom: "EA", quantity: 15, skuMap: { ABC: "ABC-JC-WHT", SRS: "SRS-JC-WHT", BEACON: "BCN-JC-WHT" } }
      ]
    },
    {
      id: "gutters-standard",
      name: "Standard Gutter Package",
      items: [
        { skuKey: "gutter-coil", title: "5in Gutter Coil", variant: "Mill Finish", uom: "FT", quantity: 100, skuMap: { ABC: "ABC-GT-5", SRS: "SRS-GT-5", BEACON: "BCN-GT-5" } },
        { skuKey: "downspout", title: "Downspout", variant: "3x4 White", uom: "EA", quantity: 4, skuMap: { ABC: "ABC-DS-3X4", SRS: "SRS-DS-3X4", BEACON: "BCN-DS-3X4" } }
      ]
    }
  ]
};
