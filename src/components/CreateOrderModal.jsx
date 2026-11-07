import { useState } from 'react'
import { ORDER_TYPES, createNewOrder } from '../data/demoOrders'

export default function CreateOrderModal({ isOpen, onClose, onOrderCreated }) {
  const [orderType, setOrderType] = useState('FOOD')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('+251 91 ')
  const [storeName, setStoreName] = useState('')
  const [branchName, setBranchName] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [addressLabel, setAddressLabel] = useState('Home')
  const [subtotal, setSubtotal] = useState('450')
  const [deliveryFee, setDeliveryFee] = useState('80')
  const [paymentMethod, setPaymentMethod] = useState('WALLET')
  const [itemTitle, setItemTitle] = useState('')
  const [deliveryInstruction, setDeliveryInstruction] = useState('')
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledTime, setScheduledTime] = useState('')
  const [isPrescriptionUploaded, setIsPrescriptionUploaded] = useState(false)

  if (!isOpen) return null

  const selectedCategoryMeta = ORDER_TYPES.find((t) => t.code === orderType) || ORDER_TYPES[0]

  const handleSubmit = (e) => {
    e.preventDefault()

    const sub = Number(subtotal) || 400
    const fee = Number(deliveryFee) || 75
    const tax = Math.round(sub * 0.05)
    const total = sub + fee + tax

    const newOrderData = {
      order_type: orderType,
      category_id: `cat-${orderType.toLowerCase()}`,
      customer: {
        name: customerName.trim() || 'New Customer',
        phone: customerPhone.trim() || '+251 91 123 4567',
        email: `${customerName.trim().toLowerCase().replace(/\s+/g, '.') || 'customer'}@gmail.com`,
        initials: (customerName.trim() || 'NC')
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      },
      merchant: {
        name: storeName.trim() || `${selectedCategoryMeta.label} Store`,
        category: selectedCategoryMeta.shortLabel,
      },
      branch: {
        name: branchName.trim() || 'Main Branch',
        address: 'Bole, Addis Ababa',
      },
      subtotal_amount: sub,
      delivery_fee_amount: fee,
      tax_amount: tax,
      total_amount: total,
      payment_method: paymentMethod,
      delivery_address_label: addressLabel,
      delivery_address_line: addressLine.trim() || 'Bole Medhanialem, Addis Ababa',
      delivery_instruction: deliveryInstruction.trim(),
      scheduled_delivery_at: isScheduled ? scheduledTime : null,
      is_prescription_uploaded: isPrescriptionUploaded,
      prescription_image_url: isPrescriptionUploaded
        ? 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
        : null,
      items: [
        {
          id: `item-${Date.now()}`,
          name: itemTitle.trim() || `${selectedCategoryMeta.shortLabel} Order Package`,
          quantity: 1,
          unit_price: sub,
          total_price: sub,
          options_summary: 'Standard fulfillment options',
        },
      ],
    }

    const created = createNewOrder(newOrderData)
    if (onOrderCreated) onOrderCreated(created)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
    >
      <div
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/40">
              <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
            </span>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
                Create New Order
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Manual dispatch entry across any delivery or service category.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Order Category Selector */}
          <div>
            <label className="mb-1.5 block font-bold text-slate-700 dark:text-zinc-300">
              Order Type &amp; Category *
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ORDER_TYPES.map((cat) => (
                <button
                  key={cat.code}
                  type="button"
                  onClick={() => setOrderType(cat.code)}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 font-bold transition text-left ${
                    orderType === cat.code
                      ? 'border-[#FF6B35] bg-orange-50/50 text-[#FF6B35] ring-2 ring-[#FF6B35]/20 dark:border-[#FF6B35] dark:bg-orange-950/30'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{cat.icon}</span>
                  <span className="truncate">{cat.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-bold text-slate-700 dark:text-zinc-300">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Almaz Bekele"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-slate-700 dark:text-zinc-300">
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Merchant & Store */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-bold text-slate-700 dark:text-zinc-300">
                Store / Merchant Name *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. FreshMart Supermarket"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-slate-700 dark:text-zinc-300">
                Store Branch
              </label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. Bole Medhanialem Branch"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Items & Amount */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mb-1 block font-bold text-slate-700 dark:text-zinc-300">
                Items Description *
              </label>
              <input
                type="text"
                required
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                placeholder="e.g. 2x Organic Avocados, 1x Milk 2L"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-slate-700 dark:text-zinc-300">
                Subtotal (ETB) *
              </label>
              <input
                type="number"
                required
                min="10"
                value={subtotal}
                onChange={(e) => setSubtotal(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-slate-700 dark:text-zinc-300">
                Delivery Fee (ETB) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Delivery Destination */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block font-bold text-slate-700 dark:text-zinc-300">
                Address Label
              </label>
              <select
                value={addressLabel}
                onChange={(e) => setAddressLabel(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="Home">Home Residence</option>
                <option value="Office">Corporate Office</option>
                <option value="Apartment">Apartment Complex</option>
                <option value="Clinic">Medical Clinic</option>
                <option value="Gate">Compound Gate</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block font-bold text-slate-700 dark:text-zinc-300">
                Delivery Address Line *
              </label>
              <input
                type="text"
                required
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="e.g. Bole Rwanda St, Building 14, Apt 4B"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Payment & Prescription toggles */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-bold text-slate-700 dark:text-zinc-300">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="WALLET">Digital Wallet (Paid)</option>
                <option value="CASH">Cash on Delivery</option>
              </select>
            </div>

            {orderType === 'PHARMACY' && (
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="rx_check"
                  checked={isPrescriptionUploaded}
                  onChange={(e) => setIsPrescriptionUploaded(e.target.checked)}
                  className="h-4 w-4 rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                />
                <label htmlFor="rx_check" className="font-bold text-slate-800 dark:text-zinc-200 cursor-pointer">
                  Prescription Document Uploaded &amp; Validated
                </label>
              </div>
            )}
          </div>

          {/* Delivery Instructions */}
          <div>
            <label className="mb-1 block font-bold text-slate-700 dark:text-zinc-300">
              Delivery Notes / Instructions
            </label>
            <input
              type="text"
              value={deliveryInstruction}
              onChange={(e) => setDeliveryInstruction(e.target.value)}
              placeholder="e.g. Please ring bell twice, deliver to reception..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Pre-order / Scheduled Delivery */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_scheduled_check"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="h-4 w-4 rounded text-[#FF6B35] focus:ring-[#FF6B35]"
              />
              <label htmlFor="is_scheduled_check" className="font-bold text-slate-800 dark:text-zinc-200 cursor-pointer">
                Scheduled Pre-Order (Set Future Delivery Date &amp; Time)
              </label>
            </div>
            {isScheduled && (
              <div className="mt-2.5">
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="h-9 w-full sm:w-64 rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#FF6B35] px-5 py-2 font-bold text-white shadow-xs hover:bg-[#e0531f]"
            >
              Dispatch New Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
