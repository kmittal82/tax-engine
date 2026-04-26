# Tax Calculator - Fixes Applied

## Summary
Fixed 7 major bugs in the Equity Tax Engine calculator. All changes are in `/Users/kunalmittal/Tax_Engine_Hub/index.html`.

---

## Fixes Applied

### ✅ Fix 1: Scope Mismatch (CRITICAL)
**Lines: 1107–1150**

**Problem**: Federal income tax, FICA, and city tax components checked for `scope === 'full'` but the loop only used `['source', 'resident']` scopes, causing these taxes to **never calculate** (showing $0).

**Solution**: Restructured the tax calculation loop into two phases:
- **Phase A**: Source taxes computed for both grant and vest jurisdictions
- **Phase B**: Resident and 'full' scopes computed ONLY for vest jurisdiction
- Added `isSameJuris` check to prevent double-counting when grant and vest are the same location

**Result**: Federal income tax, FICA, and city tax now correctly calculate and appear in the results table.

---

### ✅ Fix 2: Credit Lookup for Cross-Jurisdiction Scenarios
**Lines: 1131–1150**

**Problem**: When calculating resident taxes in vest jurisdiction, the code looked for source taxes in the SAME jurisdiction (wrong). For CA→NY scenarios, NY resident tax was looking for NY source taxes instead of CA source taxes for the credit.

**Solution**: Pre-captured grant source taxes before computing vest resident taxes:
```javascript
const grantSourceStateTax = taxResults.find(r => r.juris === grantJuris.stateCode && r.scope === 'source')?.tax || 0;
const grantForeignIncomeTax = taxResults.find(r => r.juris === grantJuris.shortCode && r.scope === 'source' && r.label.includes('Income'))?.tax || 0;
```
Passed these explicitly to resident components for proper credit calculation.

**Result**: Cross-border tax credits now correctly apply foreign/out-of-state taxes against resident taxes.

---

### ✅ Fix 3: AMT Calculation Component (NEW)
**Lines: 787–804**

**Problem**: AMT alert showed "AMT preference" but no actual AMT tax was calculated. Alert was misleading since it showed $0 in the table.

**Solution**: Added `us_amt` component to TaxComponentRegistry:
- Calculates AMT on ISO spread above $137,000 exemption at 26% rate
- Only applies if AMT exceeds regular federal tax (per IRS rules)
- Shows as separate row in tax table

**Result**: ISO exercises now show actual AMT liability, and the alert is backed by a real calculation.

---

### ✅ Fix 4: Federal Foreign Tax Credit (NEW)
**Lines: 805–818**

**Problem**: When working cross-country (e.g., France → US), no federal foreign tax credit was applied. US federal tax was calculated on full income with no credit for foreign taxes paid.

**Solution**: Added `us_fed_foreign_tax_credit` component:
- Fires for US vest with foreign grant
- Credits foreign income tax against US federal tax
- Limited to US federal rate × sourced income (per Form 1116)

**Result**: Cross-country scenarios now properly model US federal foreign tax credit.

---

### ✅ Fix 5: Capital Gains Sourcing
**Lines: 1154–1155**

**Problem**: Capital gains were incorrectly multiplied by `vestAlloc` ratio:
```javascript
const allocatedCG = income.capitalGain * vestAlloc;  // WRONG
```
This caused display inconsistencies with tax calculations.

**Solution**: Changed to apply full capital gains (sourced to vest/sale location):
```javascript
const allocatedCG = income.capitalGain;  // Correct
```

**Result**: Capital gains display now matches actual tax calculations.

---

### ✅ Fix 6: Floating-Point Rounding
**Lines: 1174–1180**

**Problem**: Accumulated floating-point errors (e.g., `0.1 + 0.2 = 0.30000000000000004`) propagated through totals, causing displays like `$70.00000000001`.

**Solution**: Added rounding to cents for key financial intermediaries:
```javascript
net: Math.round((r.tax - r.credit) * 100) / 100
const totalTax = Math.round(finalTaxResults.reduce((sum, r) => sum + r.net, 0) * 100) / 100;
const netCash = Math.round((income.proceeds - totalTax - income.exerciseCost) * 100) / 100;
```

**Result**: All monetary values now display as clean numbers (e.g., `$70.00`).

---

### ✅ Fix 7: Allocation Percentage Display
**Lines: 1479–1485**

**Problem**: Allocation percentages were rounded to integers with `.toFixed(0)`, showing "50%" when it might be "50.2%".

**Solution**: Changed to round to 1 decimal place:
```javascript
const grantPct = Math.round(alloc.grant * 1000) / 10;
```

**Result**: Allocation percentages now display as "50.0%" when appropriate, with better precision.

---

## Testing Checklist

✅ **Federal + FICA + City Taxes Now Calculate**
- Open calculator
- Set NQ Options, grant=CA, vest=TX
- Federal, FICA, and city taxes now appear in table (previously $0)

✅ **Cross-Border Scenarios**
- Set grant=CA, vest=NY with 50/50 days
- Total state taxes should be ~50% CA rate + 50% NY rate (no 1.5× double-counting)

✅ **AMT Calculation**
- Set ISO qualifying, any location
- AMT row appears in table with dollar amount
- AMT alert is now backed by actual calculation

✅ **Foreign Tax Credit**
- Set grant=France, vest=California
- Federal foreign tax credit row appears
- Credit is limited to US federal rate on sourced income

✅ **Rounding**
- All dollar amounts display cleanly (no floating-point artifacts)
- Allocation percentages show 1 decimal precision

---

## No Breaking Changes
- All existing functionality preserved
- UI layout unchanged
- API for adding new awards/jurisdictions unchanged
- Plugin architecture still fully extensible

---

## Known Limitations (Not Fixed - Architectural)
1. **Foreign tax credit per-country baskets**: Simplified to single aggregate credit
2. **ISO holding period validation**: Still shows LTCG even if holding period not met
3. **Qualified plan thresholds**: Shows if plan exists, doesn't validate user qualifies
4. **Estimated tax/withholding**: Not modeled
5. **Canadian 50% inclusion rate**: Simplified to fixed rate
6. **AMT AIME calculation**: Simplified to ordinary income as proxy

These are architectural limitations that would require more complex modeling and are noted in REVIEW.md.

---

**All critical bugs from the review have been fixed. The calculator is now suitable for order-of-magnitude estimates and educational use.**
