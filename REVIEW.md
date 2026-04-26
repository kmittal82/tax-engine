# Tax Calculator Code Review — Issues Found

## Critical Issues

### 1. **Scope Mismatch in Tax Components** ⚠️
**Severity: HIGH**  
**Lines: 648, 659, 757, 769**

The code iterates through scopes `'source'` and `'resident'` (line 78), but several tax components use scope `'full'`:
- US Federal (line 648): `scope === 'full'`
- FICA (line 659): `scope === 'full'`
- City Tax (line 757): `scope === 'full'`

These components will **never fire** because `'full'` is never a scope value passed to them. They should use `'source'` or `'resident'`, or the loop needs to iterate through `'full'` as well.

**Impact:** Federal income tax, FICA, and city tax are not being calculated.

---

### 2. **Capital Gains Sourced Entirely to Vest Location**
**Severity: MEDIUM**  
**Lines: 1099-1111**

```javascript
const allocatedCG = income.capitalGain * vestAlloc;
```

Capital gains are allocated 100% to the vest location. However, the sourcing period for capital gains should potentially split based on the grant/vest allocation (especially for RSUs and PSUs where appreciation accumulates over time).

**Example:** An RSU granted in US and vested in UK should split the appreciation between where it was granted and where it was vested, not 100% to vest location.

---

### 3. **Missing FICA on Resident State Income** 
**Severity: MEDIUM**  
**Lines: 678-693**

When calculating resident state income tax (line 683-693), the code computes:
```javascript
const grossTax = ctx.fullIncome * ctx.juris.stateRate;
```

But **FICA is not being applied to the resident state portion**. In reality, FICA is a US-wide tax that applies to US-source income regardless of state residency.

---

### 4. **Foreign Tax Credit Logic Too Simplistic**
**Severity: MEDIUM**  
**Lines: 686-687, 734**

The foreign tax credit assumes a 1:1 credit for taxes paid abroad:
```javascript
const credit = Math.min(sourceStateTax, maxCredit);
```

Real foreign tax credit rules are complex:
- Limited to US tax liability on foreign-source income
- Applies per country (treaty-specific)
- Cannot exceed the lesser of foreign tax paid or US tax on that income
- Excess credits can carryback/carryforward (not modeled)

**Current logic:** If a US resident works in Germany and pays 45% German tax on income allocated to Germany, they get a credit equal to min(German tax, US tax on that portion). This ignores:
- Limitation baskets (passive, general, etc.)
- Treaty-specific relief mechanisms

---

### 5. **No Validation of ISO Holding Period Rules**
**Severity: MEDIUM**  
**Lines: 839-851**

ISOs have strict rules:
- Must be exercised within 10 years of grant
- Must hold 2 years from grant + 1 year from exercise for LTCG treatment

The calculator doesn't validate these. An ISO exercised 11 years after grant will incorrectly show LTCG treatment.

---

### 6. **Canadian 50% Deduction Not Implemented**
**Severity: MEDIUM**  
**Lines: 517, 701-710**

Canada's jurisdiction shows:
```javascript
qualifiedPlans:{NQ:{rate:0.165,name:'50% deduction (qualified)'}}
```

This is listed but **the 50% deduction is not actually modeled**. The computation just applies 16.5% instead of 33%, which is a shortcut that doesn't match actual Canadian law. Canada uses a 50% inclusion rate on **option value**, not income, which is different.

---

### 7. **Net Cash Calculation Doesn't Handle All Award Types**
**Severity: MEDIUM**  
**Lines: 1125, 1584-1587**

```javascript
const netCash = income.proceeds - totalTax - income.exerciseCost;
```

This works for NQ/ISO (where `exerciseCost = strike × shares`) and ESPP (where `exerciseCost = purchase price × shares`), but RSUs/PSUs have `exerciseCost = 0`. For these awards:
- There's often withholding (shares sold to cover taxes)
- Proceeds should account for this
- Current code shows full proceeds, then subtracts taxes, which is misleading

**Example:** 1000 RSUs at $100/share = $100k proceeds. If 40% tax, shows net cash = $60k. But in reality, ~400 shares are withheld, net is ~600 shares + ~400 shares sold at $100 = $100k cash, minus $40k taxes = $60k. The logic works but is confusing for RSU/PSU case.

---

## Moderate Issues

### 8. **Floating Point Precision Not Handled**
Lines: 1124-1125, 1617

Tax calculations should round to cents (2 decimal places), but `toLocaleString()` only formats for display. The underlying calculation might accumulate floating-point errors:

```javascript
const totalTax = finalTaxResults.reduce((sum, r) => sum + r.net, 0);
```

Should be:
```javascript
const totalTax = Math.round(finalTaxResults.reduce((sum, r) => sum + r.net, 0) * 100) / 100;
```

---

### 9. **Allocation Bar Doesn't Account for Rounding**
**Lines: 1481-1482**

```javascript
document.getElementById('alloc-pct-grant').textContent = (alloc.grant * 100).toFixed(0) + '%';
```

Using `.toFixed(0)` rounds, so if `alloc.grant = 0.333`, it shows "33%" when it should show "33.3%" or account for rounding errors summing to 100%.

---

### 10. **US State Tax Credit Initialization Issue**
**Lines: 1090-1091**

```javascript
sourceStateTax: taxResults.find(r => r.juris === juris.stateCode && r.scope === 'source')?.tax || 0,
```

This looks for a previous result in `taxResults`, but if the source state hasn't been processed yet, it defaults to 0. The algorithm doesn't guarantee processing order. Should either:
1. Sort results by jurisdiction before calculating credits
2. Use a two-pass algorithm

---

### 11. **Qualified Plan Detection Timing**
**Lines: 1515-1520**

```javascript
const qp = juris.qualifiedPlans[award.id];
if (qp) {
  pill.innerHTML = `<div class="qualified-plan-pill">${qp.name}</div>`;
}
```

This checks if a qualified plan *exists* for that award in that jurisdiction, but doesn't check if the user *qualifies* for it. For example:
- Canada's 50% deduction requires specific conditions
- UK's EMI requires company size < £30M, employee < 1% shareholder
- Germany's ESPP allowance only covers first €2,400/year

Just showing the plan exists is misleading.

---

### 12. **AMT Alert Box Has No Calculation**
**Lines: 401-402, 1699-1703**

The alert says "The bargain element is an AMT preference item" but there's **no AMT component** in TaxComponentRegistry. AMT is complex:
- 26% or 28% rate on AMT-taxable income
- Only if AMT exceeds regular tax
- Uses different income definitions
- Has exemptions and phase-outs

Current code: Shows alert but doesn't calculate AMT. Shows $0 AMT tax. **This is misleading.**

---

### 13. **Section 83(b) Election Sourcing Not Wired**
**Lines: 605-609**

There's a `pointInTimeGrant` sourcing strategy (83(b) election), but it's not actually selectable by the user, and the awards don't indicate whether they support it. ISOs cannot file 83(b), but NQ options can.

---

### 14. **No Estimated Tax Liability**
All calculations show final tax, but ignore:
- Quarterly estimated tax payments
- Withholding delays
- Penalties for underpayment

---

### 15. **Timeline Labels for ESPP/PSU Are Generic**
**Lines: 1022, 1011-1014**

ESPP shows:
```javascript
timeline: [
  { pos: 0, label: 'Offer Period Start', taxable: false },
  { pos: 50, label: 'Purchase', taxable: false },
  { pos: 100, label: 'Sale', taxable: true }
]
```

But this is simplified. Real ESPP timelines:
- Offer starts (day 0)
- Purchase date (typically 6 or 27 months later)
- Sale date (immediately, or with holding period)

The timeline shows 50% at purchase, but typically purchase and sale happen on the same day (or immediately after).

---

### 16. **RSU Future Appreciation Modeling**
**Lines: 968-982**

RSU `computeIncome()`:
```javascript
const vesting = inputs.targetValue * inputs.vestingPct / 100;
const appreciation = vestingPct > 0 ? inputs.postVestValue - inputs.targetValue : 0;
```

This calculates appreciation based on a single post-vest value, but RSUs vest in tranches. If an RSU vests 25% per year, appreciation should accumulate per tranche, not be lumped at the end.

---

## Minor Issues

### 17. **Comparison Baselines Don't Account for Award Differences**
**Lines: 1138-1151**

The baseline calculations swap grant/vest locations but don't handle awards where location matters differently. Example:
- RSU granted in US: sourced entirely to grant location
- RSU granted in UK: sourced entirely to grant location
- Swapping locations should swap sourcing, but the code treats all awards the same

---

### 18. **No Currency Conversion**
International calculator shows rates in %, but doesn't handle:
- Multi-currency transactions
- FX gains/losses
- Reporting currency (e.g., USD for US tax, EUR for EU)

---

### 19. **Missing Treaty Utilization**
**Line: 584**

Code has `treatyWithUS: true/false`, but never uses it. Treaties provide:
- Exemptions on certain income types
- Reduced withholding rates
- Credits for taxes paid

Current code ignores all treaty benefits.

---

## Suggestions for Priority Fixes

1. **Fix scope bug** (Issue #1) — CRITICAL, causes federal/FICA/city tax to not calculate
2. **Implement AMT** (Issue #12) — Remove alert or calculate correctly
3. **Fix ISO holding period validation** (Issue #5) — Prevents incorrect LTCG treatment
4. **Improve foreign tax credit** (Issue #4) — At minimum, document limitations
5. **Add decimal rounding** (Issue #8) — Prevents floating-point errors compounding

---

## Summary

**The calculator has a strong plugin architecture** but several critical calculation bugs prevent it from being a "full blown" tax calculator:
- Federal/FICA/city taxes don't calculate due to scope mismatch
- Foreign tax credits are oversimplified
- AMT is shown but not computed
- Many jurisdiction-specific rules are not modeled
- No validation of holding periods, qualification thresholds, or timing rules

It's suitable for **educational purposes or order-of-magnitude estimates**, but not for **actual tax planning or reporting**.
