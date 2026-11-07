import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import RealTimeLogisticsMap from '../components/RealTimeLogisticsMap'
import {
  ORDER_TYPES,
  ORDER_STATUSES,
  getOrderById,
  updateOrderStatus,
} from '../data/demoOrders'

// Preset Merchant Catalog Items with full Portions & Extra Customization Groups
const PRESET_CATALOG_ITEMS = [
  {
    id: 'cat-item-burger-1',
    name: 'Truffle Bacon Double Smash Burger',
    category: 'Fast Food & Burgers',
    icon: 'lunch_dining',
    basePrice: 350,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80',
    description: 'Two smashed prime beef patties, black summer truffle mayo, melted gruyere cheese, and crispy bacon on toasted brioche.',
    portionSizes: [
      { id: 'single', name: 'Single Smash Patty', delta: -80, isDefault: false },
      { id: 'double', name: 'Double Smash Patty (Signature)', delta: 0, isDefault: true },
      { id: 'triple', name: 'Triple Monster Smash Patty', delta: 90, isDefault: false },
    ],
    groups: [
      {
        id: 'grp-cook',
        name: 'Cooking Temperature',
        type: 'radio',
        options: [
          { id: 'cook-mr', name: 'Medium-Rare (Juicy Red Center)', price: 0, isDefault: true },
          { id: 'cook-med', name: 'Medium (Warm Pink Center)', price: 0, isDefault: false },
          { id: 'cook-wd', name: 'Well-Done (Char-Grilled Crisp)', price: 0, isDefault: false },
        ],
      },
      {
        id: 'grp-cheese',
        name: 'Artisan Cheese Selection',
        type: 'radio',
        options: [
          { id: 'ch-gruyere', name: 'Aged Swiss Gruyere Cheese', price: 0, isDefault: true },
          { id: 'ch-cheddar', name: 'Wisconsin Sharp Yellow Cheddar', price: 15, isDefault: false },
          { id: 'ch-jack', name: 'Habanero Pepper Jack Melt', price: 20, isDefault: false },
        ],
      },
      {
        id: 'grp-addons',
        name: 'Extra Gourmet Add-ons & Toppings',
        type: 'checkbox',
        options: [
          { id: 'add-bacon', name: 'Crispy Smoked Maple Bacon', price: 60 },
          { id: 'add-mushrooms', name: 'Sautéed Truffle Portobello', price: 45 },
          { id: 'add-onions', name: 'Slow-Caramelized Sweet Onions', price: 25 },
          { id: 'add-egg', name: 'Sunny-Side Up Pasture Egg', price: 30 },
          { id: 'add-jalapeno', name: 'Fire-Roasted Jalapeño Peppers', price: 20 },
        ],
      },
    ],
  },
  {
    id: 'cat-item-chicken-2',
    name: 'Spicy Peri-Peri Crispy Chicken Burger',
    category: 'Fast Food & Burgers',
    icon: 'lunch_dining',
    basePrice: 290,
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=300&q=80',
    description: 'Crispy golden fried chicken breast dipped in zesty peri-peri glaze, house slaw, pickles, and garlic emulsion.',
    portionSizes: [
      { id: 'regular', name: 'Regular Crispy Fillet', delta: 0, isDefault: true },
      { id: 'jumbo', name: 'Jumbo Double Fillet', delta: 75, isDefault: false },
    ],
    groups: [
      {
        id: 'grp-heat',
        name: 'Peri-Peri Spice Intensity',
        type: 'radio',
        options: [
          { id: 'heat-mild', name: 'Lemon & Herb (Mild)', price: 0, isDefault: false },
          { id: 'heat-med', name: 'Medium Peri-Peri (Zesty Heat)', price: 0, isDefault: true },
          { id: 'heat-hot', name: 'Extra Hot African Bird’s Eye', price: 15, isDefault: false },
        ],
      },
      {
        id: 'grp-addons-chick',
        name: 'Custom Add-ons',
        type: 'checkbox',
        options: [
          { id: 'add-slaw', name: 'Extra Creamy House Slaw', price: 25 },
          { id: 'add-ch-slice', name: 'Melted Cheddar Slice', price: 30 },
          { id: 'add-peri-sauce', name: 'Extra Peri-Peri Dip (100ml)', price: 25 },
        ],
      },
    ],
  },
  {
    id: 'cat-item-fries-3',
    name: 'Parmesan Herb Seasoned Truffle Fries',
    category: 'Sides & Appetizers',
    icon: 'tapas',
    basePrice: 130,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=300&q=80',
    description: 'Crisp shoestring Idaho potatoes tossed with white truffle oil, shaved 24-month parmesan, and fresh rosemary thyme salt.',
    portionSizes: [
      { id: 'reg-fries', name: 'Regular Portion (200g)', delta: 0, isDefault: true },
      { id: 'lg-fries', name: 'Large Sharing Basket (350g)', delta: 50, isDefault: false },
    ],
    groups: [
      {
        id: 'grp-dip',
        name: 'Artisan Dipping Sauce',
        type: 'radio',
        options: [
          { id: 'dip-aioli', name: 'Signature White Truffle Aioli', price: 0, isDefault: true },
          { id: 'dip-chipotle', name: 'Smoked Chipotle BBQ', price: 10, isDefault: false },
          { id: 'dip-ranch', name: 'Roasted Garlic Herb Ranch', price: 10, isDefault: false },
        ],
      },
      {
        id: 'grp-addons-fries',
        name: 'Loaded Add-ons',
        type: 'checkbox',
        options: [
          { id: 'add-parm-extra', name: 'Double Shaved Parmesan', price: 35 },
          { id: 'add-chili-flake', name: 'Smoked Paprika Chili Flakes', price: 10 },
          { id: 'add-truffle-oil', name: 'Extra Black Truffle Drizzle', price: 30 },
        ],
      },
    ],
  },
  {
    id: 'cat-item-drink-4',
    name: 'Artisan Cold Brew Oat Latte (450ml)',
    category: 'Beverages & Coffee',
    icon: 'local_cafe',
    basePrice: 95,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=300&q=80',
    description: '18-hour cold steeped Sidama single-origin beans infused with chilled barista oat milk and touch of mountain honey.',
    portionSizes: [
      { id: 'drink-med', name: 'Medium (350ml)', delta: -15, isDefault: false },
      { id: 'drink-lg', name: 'Large (450ml Standard)', delta: 0, isDefault: true },
      { id: 'drink-xl', name: 'Venti Mega (600ml)', delta: 35, isDefault: false },
    ],
    groups: [
      {
        id: 'grp-milk',
        name: 'Milk & Plant Alternatives',
        type: 'radio',
        options: [
          { id: 'milk-oat', name: 'Barista Organic Oat Milk', price: 0, isDefault: true },
          { id: 'milk-almond', name: 'Roasted Almond Milk', price: 15, isDefault: false },
          { id: 'milk-whole', name: 'Pasteurized Whole Milk', price: 0, isDefault: false },
          { id: 'milk-black', name: 'Pure Black (No Milk Added)', price: 0, isDefault: false },
        ],
      },
      {
        id: 'grp-sweet',
        name: 'Sweetener & Mountain Honey',
        type: 'radio',
        options: [
          { id: 'sw-honey', name: 'Raw Sidama Mountain Honey', price: 15, isDefault: true },
          { id: 'sw-zero', name: 'Unsweetened (Zero Sugar)', price: 0, isDefault: false },
          { id: 'sw-vanilla', name: 'Madagascar Vanilla Syrup', price: 20, isDefault: false },
        ],
      },
      {
        id: 'grp-ice',
        name: 'Ice Level',
        type: 'radio',
        options: [
          { id: 'ice-reg', name: 'Regular Ice Cubes', price: 0, isDefault: true },
          { id: 'ice-less', name: 'Less Ice', price: 0, isDefault: false },
          { id: 'ice-none', name: 'No Ice (Chilled Liquid)', price: 0, isDefault: false },
        ],
      },
    ],
  },
  {
    id: 'cat-item-dessert-5',
    name: 'Belgian Dark Chocolate Lava Cake',
    category: 'Desserts & Bakery',
    icon: 'cake',
    basePrice: 160,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=300&q=80',
    description: 'Warm molten 70% dark Belgian cocoa center served with Madagascar vanilla gelato scoop and fresh raspberry coulis.',
    portionSizes: [
      { id: 'des-single', name: 'Single Cake Serving', delta: 0, isDefault: true },
      { id: 'des-double', name: 'Duo Sharing Platter (2 Cakes)', delta: 120, isDefault: false },
    ],
    groups: [
      {
        id: 'grp-gelato',
        name: 'Gelato Scoop Pairing',
        type: 'radio',
        options: [
          { id: 'gel-vanilla', name: 'Madagascar Vanilla Gelato', price: 0, isDefault: true },
          { id: 'gel-espresso', name: 'Ethiopian Espresso Gelato', price: 15, isDefault: false },
          { id: 'gel-pistachio', name: 'Bronte Pistachio Gelato', price: 25, isDefault: false },
        ],
      },
      {
        id: 'grp-toppings',
        name: 'Garnish & Drizzles',
        type: 'checkbox',
        options: [
          { id: 'top-coulis', name: 'Extra Wild Berry Coulis', price: 20 },
          { id: 'top-hazelnut', name: 'Toasted Crushed Hazelnuts', price: 25 },
          { id: 'top-cream', name: 'Whipped Chantilly Cream', price: 15 },
        ],
      },
    ],
  },
]

export default function OrderDetailPage() {
  const navigate = useNavigate()
  const params = useParams()
  const orderId = params.id || params.orderId

  const [order, setOrder] = useState(() => getOrderById(orderId))
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [toastMessage, setToastMessage] = useState(null)
  const [copiedText, setCopiedText] = useState('')
  const [isFullscreenMapOpen, setIsFullscreenMapOpen] = useState(false)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)

  // Modals for Menu Item Customizations
  const [isAddCustomItemModalOpen, setIsAddCustomItemModalOpen] = useState(false)
  const [selectedCatalogItem, setSelectedCatalogItem] = useState(PRESET_CATALOG_ITEMS[0])
  const [selectedPortionId, setSelectedPortionId] = useState(PRESET_CATALOG_ITEMS[0].portionSizes[0]?.id || '')
  const [selectedRadios, setSelectedRadios] = useState({})
  const [selectedAddons, setSelectedAddons] = useState([])
  const [customSpecialInstructions, setCustomSpecialInstructions] = useState('')
  const [customItemQuantity, setCustomItemQuantity] = useState(1)
  const [inspectingItem, setInspectingItem] = useState(null)

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Reload order on storage update
  const syncOrder = useCallback(() => {
    const updated = getOrderById(orderId)
    if (updated) setOrder(updated)
  }, [orderId])

  useEffect(() => {
    window.addEventListener('orders-data-updated', syncOrder)
    return () => window.removeEventListener('orders-data-updated', syncOrder)
  }, [syncOrder])

  // Copy to clipboard helper
  const handleCopy = (text, label) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    showToast(`Copied ${label} to clipboard.`)
    setTimeout(() => setCopiedText(''), 2000)
  }

  // Handle when catalog item changes in Add Modal
  const handleSelectCatalogItem = (catItem) => {
    setSelectedCatalogItem(catItem)
    const defPortion = catItem.portionSizes?.find((p) => p.isDefault) || catItem.portionSizes?.[0]
    setSelectedPortionId(defPortion?.id || '')

    const initRadios = {}
    ;(catItem.groups || []).forEach((grp) => {
      if (grp.type === 'radio') {
        const defOpt = grp.options?.find((o) => o.isDefault) || grp.options?.[0]
        if (defOpt) initRadios[grp.id] = defOpt.id
      }
    })
    setSelectedRadios(initRadios)
    setSelectedAddons([])
    setCustomSpecialInstructions('')
    setCustomItemQuantity(1)
  }

  // Calculate live total price for customized item
  const calculatedCustomizedUnitPrice = useMemo(() => {
    if (!selectedCatalogItem) return 0
    let price = selectedCatalogItem.basePrice

    const currentPortion = selectedCatalogItem.portionSizes?.find((p) => p.id === selectedPortionId)
    if (currentPortion) {
      price += currentPortion.delta || 0
    }

    ;(selectedCatalogItem.groups || []).forEach((grp) => {
      if (grp.type === 'radio') {
        const selectedOptId = selectedRadios[grp.id]
        const opt = grp.options?.find((o) => o.id === selectedOptId)
        if (opt) price += opt.price || 0
      } else if (grp.type === 'checkbox') {
        ;(grp.options || []).forEach((opt) => {
          if (selectedAddons.includes(opt.id)) {
            price += opt.price || 0
          }
        })
      }
    })

    return Math.max(0, price)
  }, [selectedCatalogItem, selectedPortionId, selectedRadios, selectedAddons])

  // Handle Add Item with Customizations to Order
  const handleAddCustomizedItemToOrder = () => {
    if (!order || !selectedCatalogItem) return

    const currentPortion = selectedCatalogItem.portionSizes?.find((p) => p.id === selectedPortionId)
    const portionName = currentPortion?.name || 'Standard'

    const summaries = [portionName]

    ;(selectedCatalogItem.groups || []).forEach((grp) => {
      if (grp.type === 'radio') {
        const selectedOptId = selectedRadios[grp.id]
        const opt = grp.options?.find((o) => o.id === selectedOptId)
        if (opt) summaries.push(opt.name)
      } else if (grp.type === 'checkbox') {
        ;(grp.options || []).forEach((opt) => {
          if (selectedAddons.includes(opt.id)) {
            summaries.push(`+${opt.name}`)
          }
        })
      }
    })

    if (customSpecialInstructions.trim()) {
      summaries.push(`Note: "${customSpecialInstructions.trim()}"`)
    }

    const newItemId = `item_custom_${Date.now()}`
    const unitPrice = calculatedCustomizedUnitPrice
    const qty = Math.max(1, customItemQuantity)
    const totalPrice = unitPrice * qty

    const newItem = {
      id: newItemId,
      name: selectedCatalogItem.name,
      quantity: qty,
      unit_price: unitPrice,
      total_price: totalPrice,
      portion_size: portionName,
      options_summary: summaries.join(', '),
      customizations: {
        item_id: selectedCatalogItem.id,
        portion: currentPortion,
        special_instructions: customSpecialInstructions.trim(),
        selected_radios: selectedRadios,
        selected_addons: selectedAddons,
      },
    }

    const updatedItems = [...(order.items || []), newItem]
    const subtotal = updatedItems.reduce((acc, i) => acc + (Number(i.total_price) || 0), 0)
    const tax = Math.round(subtotal * 0.05)
    const deliveryFee = Number(order.delivery_fee_amount) || 95
    const total = subtotal + deliveryFee + tax

    const updatedOrder = {
      ...order,
      items: updatedItems,
      subtotal_amount: subtotal,
      tax_amount: tax,
      total_amount: total,
    }

    setOrder(updatedOrder)

    // Save to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('deliver_app_orders_data_v3') || '[]')
      const nextStored = stored.map((o) => (o.id === order.id || o.order_number === order.order_number ? updatedOrder : o))
      localStorage.setItem('deliver_app_orders_data_v3', JSON.stringify(nextStored))
      window.dispatchEvent(new CustomEvent('orders-data-updated'))
    } catch (e) {
      console.error(e)
    }

    showToast(`Added ${qty}x ${selectedCatalogItem.name} with customizations to order!`)
    setIsAddCustomItemModalOpen(false)
  }

  // Handle Remove Item
  const handleRemoveItem = (itemId) => {
    if ((order.items || []).length <= 1) {
      showToast('An order must contain at least one item.', 'error')
      return
    }

    const updatedItems = order.items.filter((i) => i.id !== itemId)
    const subtotal = updatedItems.reduce((acc, i) => acc + (Number(i.total_price) || 0), 0)
    const tax = Math.round(subtotal * 0.05)
    const deliveryFee = Number(order.delivery_fee_amount) || 95
    const total = subtotal + deliveryFee + tax

    const updatedOrder = {
      ...order,
      items: updatedItems,
      subtotal_amount: subtotal,
      tax_amount: tax,
      total_amount: total,
    }

    setOrder(updatedOrder)

    try {
      const stored = JSON.parse(localStorage.getItem('deliver_app_orders_data_v3') || '[]')
      const nextStored = stored.map((o) => (o.id === order.id || o.order_number === order.order_number ? updatedOrder : o))
      localStorage.setItem('deliver_app_orders_data_v3', JSON.stringify(nextStored))
      window.dispatchEvent(new CustomEvent('orders-data-updated'))
    } catch (e) {
      console.error(e)
    }

    showToast('Removed item from order.')
  }

  const categoryMeta =
    ORDER_TYPES.find((t) => t.code === order?.order_type) || {
      code: order?.order_type || 'FOOD',
      label: 'Standard Order',
      shortLabel: 'Order',
      icon: 'receipt_long',
      badgeClass: 'bg-slate-100 text-slate-700',
      color: '#64748B',
    }

  const statusMeta =
    ORDER_STATUSES[order?.status] || {
      code: order?.status || 'PENDING',
      label: order?.status || 'Processing',
      shortLabel: order?.status || 'Processing',
      badgeClass: 'bg-slate-100 text-slate-700',
      dotClass: 'bg-slate-400',
    }

  const tracking = order?.order_status_tracking || {}
  const isCancelled = order?.status === 'CANCELLED'
  const isDelivered = order?.status === 'DELIVERED'

  // Determine stage progress
  let activePhaseNumber = 1
  if (order?.status === 'PREPARING') activePhaseNumber = 2
  else if (order?.status === 'OUT_FOR_DELIVERY') activePhaseNumber = 3
  else if (order?.status === 'DELIVERED') activePhaseNumber = 4

  // Route Coordinates (Initial Store / Branch vs Final Customer Destination)
  const originLat = Number(order?.branch?.latitude) || 9.0016
  const originLng = Number(order?.branch?.longitude) || 38.7842
  const originName = order?.merchant?.name || 'Store Location'
  const originBranch = order?.branch?.name || 'Main Branch'
  const originAddress = order?.branch?.address || 'Cameroon St, Bole, Addis Ababa'

  const destLat = Number(order?.delivery_latitude) || 9.0034
  const destLng = Number(order?.delivery_longitude) || 38.7845
  const destLabel = order?.delivery_address_label || 'Customer Dropoff'
  const destAddress = order?.delivery_address_line || 'Bole Sub-City, Atlas Road'
  const destApt = order?.delivery_address_apt || ''

  // Bounding box for route embedding with padding
  const minLat = Math.min(originLat, destLat) - 0.007
  const maxLat = Math.max(originLat, destLat) + 0.007
  const minLng = Math.min(originLng, destLng) - 0.01
  const maxLng = Math.max(originLng, destLng) + 0.01
  const routeBbox = `${minLng.toFixed(6)},${minLat.toFixed(6)},${maxLng.toFixed(6)},${maxLat.toFixed(6)}`

  // Estimate driving distance using Haversine formula
  const dLatRad = ((destLat - originLat) * Math.PI) / 180
  const dLonRad = ((destLng - originLng) * Math.PI) / 180
  const haversineA =
    Math.sin(dLatRad / 2) * Math.sin(dLatRad / 2) +
    Math.cos((originLat * Math.PI) / 180) *
      Math.cos((destLat * Math.PI) / 180) *
      Math.sin(dLonRad / 2) *
      Math.sin(dLonRad / 2)
  const haversineC = 2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA))
  const straightDistanceKm = 6371 * haversineC
  const drivingDistanceKm = Number((straightDistanceKm * 1.35).toFixed(1))
  const estimatedDrivingMinutes = Math.max(5, Math.round(drivingDistanceKm * 3.2 + 4))

  const handleAdvanceStatus = (targetStatus) => {
    const updated = updateOrderStatus(order.id, targetStatus)
    if (updated) {
      setOrder(updated)
      showToast(`Order status updated to ${targetStatus.replace(/_/g, ' ')}.`)
    }
  }

  const handleConfirmCancel = (e) => {
    e.preventDefault()
    if (!cancelReason.trim()) return
    const updated = updateOrderStatus(order.id, 'CANCELLED', { reason: cancelReason.trim() })
    if (updated) {
      setOrder(updated)
      setShowCancelModal(false)
      setCancelReason('')
      showToast('Order cancelled and customer wallet refund processed.', 'error')
    }
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  // Fallback if not found
  if (!order) {
    return (
      <MainLayout
        activeMenuKey="orderManagement"
        breadcrumbParent="Dashboard"
        breadcrumbCurrent="Order Not Found"
      >
        <div className="mx-auto max-w-4xl py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500">
            <span className="material-symbols-outlined text-3xl">receipt_long</span>
          </div>
          <h2 className="mt-4 font-['Plus_Jakarta_Sans'] text-xl font-bold text-slate-900 dark:text-zinc-100">
            Order Not Found
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            The order number &quot;{orderId}&quot; could not be located in our records.
          </p>
          <div className="mt-6">
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Return to Orders</span>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout
      activeMenuKey="orderManagement"
      breadcrumbParent="Dashboard"
      breadcrumbMiddle="Order Operations"
      breadcrumbCurrent={order.order_number}
    >
      <div className="space-y-6 pb-16">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold text-white shadow-2xl transition-all ${
              toastMessage.type === 'error' ? 'bg-rose-600' : 'bg-slate-900 dark:bg-emerald-600'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {toastMessage.type === 'error' ? 'error' : 'check_circle'}
            </span>
            <span>{toastMessage.message}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="ml-2 text-white/80 hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Header Action Bar with Back Arrow (Matching other detail pages) */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              title="Back to Orders list"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-3xl">
                  Order Details
                </h1>
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                Order Fulfillment, Fleet Logistics &amp; Extra Customizations Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintReceipt}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              title="Print Order Receipt"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Print Slip</span>
            </button>

            {!isCancelled && !isDelivered && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 shadow-2xs transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400"
              >
                <span className="material-symbols-outlined text-base">cancel</span>
                <span>Cancel Order</span>
              </button>
            )}
          </div>
        </section>

        {/* Order Main Header Hero Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-xs"
                style={{ backgroundColor: `${categoryMeta.color}15`, color: categoryMeta.color }}
              >
                <span className="material-symbols-outlined text-3xl">{categoryMeta.icon}</span>
              </span>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${categoryMeta.badgeClass}`}>
                    <span className="material-symbols-outlined text-sm">{categoryMeta.icon}</span>
                    <span>{categoryMeta.label}</span>
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${statusMeta.badgeClass}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotClass}`} />
                    <span>{statusMeta.label}</span>
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
                  <span>
                    Placed: <strong className="font-mono text-slate-800 dark:text-zinc-200">{tracking.order_placed_at || 'Today'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Store: <strong className="text-slate-800 dark:text-zinc-200">{order.merchant?.name}</strong> ({order.branch?.name})
                  </span>
                  <span>•</span>
                  <span>
                    Payment: <strong className="text-slate-800 dark:text-zinc-200">{order.payment_method}</strong> ({order.payment_status})
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Advance Status Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {order.status === 'PENDING' && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStatus('PREPARING')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                >
                  <span className="material-symbols-outlined text-base">soup_kitchen</span>
                  <span>Confirm &amp; Start Preparing</span>
                </button>
              )}

              {order.status === 'PREPARING' && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStatus('OUT_FOR_DELIVERY')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
                >
                  <span className="material-symbols-outlined text-base">moped</span>
                  <span>Dispatch Out for Delivery</span>
                </button>
              )}

              {order.status === 'OUT_FOR_DELIVERY' && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStatus('DELIVERED')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Complete Delivery</span>
                </button>
              )}

              {isDelivered && (
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <span className="material-symbols-outlined text-base">verified</span>
                  <span>Fulfilled &amp; Completed</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cancellation Alert Banner if cancelled */}
        {isCancelled && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs text-rose-800 shadow-xs dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-200">
              <span className="material-symbols-outlined text-xl text-rose-600">cancel</span>
              <span>Order Cancelled at {tracking.cancelled_at || 'Earlier'}</span>
            </div>
            <p className="mt-1 leading-relaxed">
              Reason: {tracking.cancellation_reason || 'Cancelled by dispatcher or customer request.'} A full refund of ETB {Number(order.total_amount).toFixed(2)} has been credited to the customer&apos;s digital wallet.
            </p>
          </div>
        )}

        {/* 4-PHASE HORIZONTAL FULFILLMENT STEPPER (BETWEEN HERO AND ITEMS/PROFILE) */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                Fulfillment Lifecycle &amp; Stepper
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                End-to-end tracking from customer order placement to store prep, courier pickup, and final delivery dropoff.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Status: {statusMeta.label}</span>
            </span>
          </div>

          {/* Stepped progress indicators */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Step 1: Customer Placement */}
            <div
              className={`rounded-2xl border p-4.5 transition ${
                activePhaseNumber >= 1
                  ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                  : 'border-slate-200 bg-slate-50/50 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2.5 font-bold text-xs">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white text-xs font-black shadow-2xs">
                  1
                </span>
                <span className="text-slate-900 dark:text-zinc-100">Customer Phase</span>
              </div>
              <div className="mt-3 space-y-1.5 text-[11px] font-mono text-slate-600 dark:text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Placed:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{tracking.order_placed_at || '14:10 PM'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment:</span>
                  <span className="text-emerald-600 font-bold">{order.payment_status} ({order.payment_method})</span>
                </div>
              </div>
            </div>

            {/* Step 2: Store Prep */}
            <div
              className={`rounded-2xl border p-4.5 transition ${
                activePhaseNumber >= 2
                  ? 'border-orange-200 bg-orange-50/40 dark:border-orange-900/40 dark:bg-orange-950/20'
                  : 'border-slate-200 bg-slate-50/50 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2.5 font-bold text-xs">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black shadow-2xs ${
                    activePhaseNumber >= 2 ? 'bg-[#FF6B35] text-white' : 'bg-slate-200 text-slate-600 dark:bg-zinc-700'
                  }`}
                >
                  2
                </span>
                <span className="text-slate-900 dark:text-zinc-100">Store Preparation</span>
              </div>
              <div className="mt-3 space-y-1.5 text-[11px] font-mono text-slate-600 dark:text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Confirmed:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{tracking.order_confirmed_at || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cooking:</span>
                  <span>{tracking.preparing_started_at || (order.status === 'PREPARING' ? 'In Progress' : '—')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ready:</span>
                  <span>{tracking.ready_for_pickup_at || '—'}</span>
                </div>
              </div>
            </div>

            {/* Step 3: Courier Pickup */}
            <div
              className={`rounded-2xl border p-4.5 transition ${
                activePhaseNumber >= 3
                  ? 'border-blue-200 bg-blue-50/40 dark:border-blue-900/40 dark:bg-blue-950/20'
                  : 'border-slate-200 bg-slate-50/50 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2.5 font-bold text-xs">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black shadow-2xs ${
                    activePhaseNumber >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-zinc-700'
                  }`}
                >
                  3
                </span>
                <span className="text-slate-900 dark:text-zinc-100">Courier Pickup</span>
              </div>
              <div className="mt-3 space-y-1.5 text-[11px] font-mono text-slate-600 dark:text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{tracking.rider_assigned_at || (order.rider ? 'Assigned' : 'Unassigned')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">At Store:</span>
                  <span>{tracking.rider_arrived_at_restaurant_at || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Picked Up:</span>
                  <span>{tracking.order_picked_up_at || '—'}</span>
                </div>
              </div>
            </div>

            {/* Step 4: Delivery Dropoff */}
            <div
              className={`rounded-2xl border p-4.5 transition ${
                activePhaseNumber >= 4
                  ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                  : 'border-slate-200 bg-slate-50/50 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2.5 font-bold text-xs">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black shadow-2xs ${
                    isDelivered ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-zinc-700'
                  }`}
                >
                  4
                </span>
                <span className="text-slate-900 dark:text-zinc-100">Delivery Dropoff</span>
              </div>
              <div className="mt-3 space-y-1.5 text-[11px] font-mono text-slate-600 dark:text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">In Transit:</span>
                  <span>{tracking.rider_en_route_to_customer_at || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">At Door:</span>
                  <span>{tracking.rider_arrived_at_delivery_at || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivered:</span>
                  <span className="text-emerald-600 font-bold">{tracking.order_delivered_at || (isDelivered ? 'Complete' : '—')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ORDER ITEMS (LEFT) & CUSTOMER PROFILE (RIGHT) WITH VERTICAL SEPARATOR */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800">
            {/* LEFT COLUMN: ORDER ITEMS & EXTRA CUSTOMIZATIONS */}
            <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col">
              {/* Top Action Header */}
              <div className="border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-[#FF6B35]">restaurant_menu</span>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
                    Order Items &amp; Extra Customizations
                  </h3>
                  <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-[#FF6B35] dark:bg-orange-950/40">
                    {order.items?.length || 0} Line Items
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                  Inspect portion size configurations, modifier groups, and add-on customizations.
                </p>
              </div>

              {/* Items Table with Customization Detail Button */}
              <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200/90 dark:border-zinc-800">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/90 bg-slate-50 font-bold uppercase tracking-wider text-slate-600 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                      <th className="px-4 py-3">Menu Item &amp; Customizations</th>
                      <th className="px-3 py-3 text-center">Portion Size</th>
                      <th className="px-3 py-3 text-center">Qty</th>
                      <th className="px-3 py-3 text-right">Unit Price</th>
                      <th className="px-4 py-3 text-right">Line Total</th>
                      <th className="px-3 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {(order.items || []).map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition">
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                            {item.name}
                          </p>
                          {item.options_summary && (
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {item.options_summary.split(', ').map((opt, oIdx) => (
                                <span
                                  key={oIdx}
                                  className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/30 dark:ring-orange-900/40"
                                >
                                  <span className="material-symbols-outlined text-[12px]">tune</span>
                                  <span>{opt}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                            {item.portion_size || 'Standard'}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-800 dark:text-zinc-200">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-slate-600 dark:text-zinc-400">
                          {order.currency || 'ETB'} {Number(item.unit_price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-extrabold text-slate-900 dark:text-zinc-100">
                          {order.currency || 'ETB'} {Number(item.total_price).toFixed(2)}
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setInspectingItem(item)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
                              title="Inspect Item Portions, Modifiers and Add-on Customizations"
                            >
                              <span className="material-symbols-outlined text-sm text-[#FF6B35]">tune</span>
                              <span>See Detail</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="inline-flex items-center justify-center rounded-lg border border-rose-200 p-1 text-rose-500 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/30 cursor-pointer"
                              title="Remove Item from Order"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Summary (Increased to fill vertical white space) */}
              <div className="mt-5 flex-1 flex flex-col justify-between gap-6 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-850">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-zinc-200">
                      <span className="material-symbols-outlined text-base text-[#FF6B35]">calculate</span>
                      <span>Transparent Pricing &amp; Kitchen Billing</span>
                    </div>
                    <p className="leading-relaxed">
                      All portion customizations, modifier delta additions, and packaging materials are calculated in real time.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      <span>{order.payment_status}</span>
                    </span>
                    <span className="rounded-lg bg-slate-200/70 px-2.5 py-1 text-[11px] font-mono font-bold text-slate-700 dark:bg-zinc-700 dark:text-zinc-300">
                      {order.payment_method}
                    </span>
                  </div>
                </div>

                {/* Settlement & Payout Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 border-y border-slate-200/80 dark:border-zinc-800 text-xs">
                  <div className="rounded-xl bg-white/80 p-3 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 space-y-1">
                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      Store Payout Net (85%)
                    </div>
                    <div className="font-mono text-base font-extrabold text-slate-900 dark:text-zinc-100">
                      {order.currency || 'ETB'} {(Number(order.subtotal_amount || 0) * 0.85).toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-500">Transferred upon customer completion</p>
                  </div>
                  <div className="rounded-xl bg-white/80 p-3 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 space-y-1">
                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      Platform Fee &amp; Commission (15%)
                    </div>
                    <div className="font-mono text-base font-extrabold text-slate-900 dark:text-zinc-100">
                      {order.currency || 'ETB'} {(Number(order.subtotal_amount || 0) * 0.15).toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-500">Includes server, payment &amp; dispatch routing</p>
                  </div>
                </div>

                {/* Final Calculation Summary Table */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-1">
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>Order Reference: <strong className="font-mono text-slate-700 dark:text-zinc-300">{order.order_number}</strong></p>
                    <p>Receipt timestamp: <span className="font-mono text-slate-600 dark:text-zinc-400">{tracking.order_placed_at || 'Today'}</span></p>
                  </div>

                  <div className="w-full sm:w-80 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                      <span>Subtotal ({order.items?.length || 0} items):</span>
                      <span className="font-bold text-slate-900 dark:text-zinc-100">
                        {order.currency || 'ETB'} {Number(order.subtotal_amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                      <span>Delivery Service Fee:</span>
                      <span className="font-bold text-slate-900 dark:text-zinc-100">
                        {order.currency || 'ETB'} {Number(order.delivery_fee_amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                      <span>Platform Tax (5% VAT):</span>
                      <span className="font-bold text-slate-900 dark:text-zinc-100">
                        {order.currency || 'ETB'} {Number(order.tax_amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/90 pt-2.5 text-base font-black text-[#FF6B35] dark:border-zinc-700">
                      <span>Total Amount:</span>
                      <span>
                        {order.currency || 'ETB'} {Number(order.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: CUSTOMER PROFILE & DROPOFF INFORMATION */}
            <div className="lg:col-span-5 p-5 sm:p-6 space-y-5 bg-slate-50/30 dark:bg-zinc-900/40">
              <div className="border-b border-slate-100 pb-4 dark:border-zinc-800">
                <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
                  Customer Profile &amp; Dropoff Information
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Recipient verification, delivery address notes, and medical attachments if applicable.
                </p>
              </div>

              {/* 1. Customer Profile Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-850">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Customer Profile &amp; Contact
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {order.customer?.tier || 'VIP Customer'}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <img
                    src={order.customer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={order.customer?.name}
                    className="h-14 w-14 rounded-2xl border object-cover shadow-2xs"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-100 truncate">
                      {order.customer?.name}
                    </h4>
                    <p className="text-xs font-mono text-slate-600 dark:text-zinc-400">
                      {order.customer?.phone}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                      {order.customer?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Minimized Active Delivery Courier Card (b/n Customer and Dropoff Address) */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-850">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#FF6B35]">two_wheeler</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Active Delivery Courier
                    </span>
                  </div>
                  {order.rider ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      ✓ Active Dispatch
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                      Unassigned
                    </span>
                  )}
                </div>

                {order.rider ? (
                  <div className="mt-3.5 space-y-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={order.rider?.avatar || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80'}
                        alt={order.rider?.name}
                        className="h-12 w-12 rounded-xl border object-cover shadow-2xs shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                            {order.rider?.name}
                          </h4>
                          <span className="text-[11px] font-bold text-amber-500">★ {order.rider?.rating || 4.9}</span>
                        </div>
                        <p className="text-xs font-mono text-slate-600 dark:text-zinc-400">
                          {order.rider?.phone}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          Plate: <strong className="text-slate-800 dark:text-zinc-200">{order.rider?.plate_number}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Minimized Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <a
                        href={`tel:${order.rider?.phone}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                      >
                        <span className="material-symbols-outlined text-sm text-emerald-600">call</span>
                        <span>Call</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => navigate(`/orders/${order.id}/reassign-rider`)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#FF6B35] py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#e0531f] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">swap_horiz</span>
                        <span>Reassign</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500">No courier assigned</span>
                    <button
                      type="button"
                      onClick={() => navigate(`/orders/${order.id}/reassign-rider`)}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#FF6B35] px-3 py-1.5 font-bold text-white shadow-xs hover:bg-[#e0531f] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      <span>Assign</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Delivery Address Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-850">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[#FF6B35]">location_on</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                      Dropoff Address
                    </h4>
                  </div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {destLabel}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                      {destAddress}
                    </p>
                    {destApt && (
                      <p className="mt-1 font-medium text-slate-600 dark:text-zinc-300">
                        Building / Unit: <strong className="text-slate-900 dark:text-zinc-100">{destApt}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Instructions */}
              {order.delivery_instruction && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-850">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Customer Delivery Instructions
                  </span>
                  <p className="mt-1.5 text-xs font-medium text-slate-800 dark:text-zinc-200 leading-relaxed">
                    &quot;{order.delivery_instruction}&quot;
                  </p>
                </div>
              )}

              {/* Voice Player */}
              {order.delivery_voice_url && (
                <div className="flex items-center justify-between rounded-2xl border border-orange-200/80 bg-orange-50/50 p-4 text-xs dark:border-orange-950/40 dark:bg-orange-950/20">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35]">
                      <span className="material-symbols-outlined text-lg">mic</span>
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-zinc-100">
                        Customer Audio Instruction
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Recorded 0:14 Voice Note
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-3 py-1.5 font-bold text-white shadow-2xs hover:bg-[#e0531f] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isPlayingAudio ? 'pause' : 'play_arrow'}
                    </span>
                    <span>{isPlayingAudio ? 'Pause' : 'Play Note'}</span>
                  </button>
                </div>
              )}

              {/* Pharmacy Prescription Card if applicable */}
              {order.order_type === 'PHARMACY' && (
                <div className="rounded-2xl border border-sky-200 bg-sky-50/40 p-5 shadow-xs dark:border-sky-900/40 dark:bg-sky-950/20">
                  <div className="flex items-center justify-between pb-3 border-b border-sky-200/60 dark:border-sky-900/40">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xl text-sky-600 dark:text-sky-400">
                        clinical_notes
                      </span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-sky-200">
                        Doctor Prescription Verification
                      </h4>
                    </div>
                    <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                      {order.is_prescription_uploaded ? 'Verified by Certified Pharmacist' : 'Over-the-Counter'}
                    </span>
                  </div>

                  {order.prescription_image_url && (
                    <div className="mt-4 flex flex-col sm:flex-row items-start gap-4">
                      <img
                        src={order.prescription_image_url}
                        alt="Prescription Document"
                        className="h-28 w-36 rounded-xl border border-sky-200 object-cover shadow-sm bg-white"
                      />
                      <div className="text-xs space-y-1.5 text-slate-700 dark:text-zinc-300">
                        <p className="font-bold text-slate-900 dark:text-zinc-100">
                          Official Certified Medical Prescription Attached
                        </p>
                        <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                          Validated under Ethiopian Food &amp; Drug Authority (EFDA) commercial dispensing protocols.
                        </p>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setShowPrescriptionModal(true)}
                            className="inline-flex items-center gap-1 font-bold text-sky-600 hover:underline dark:text-sky-400 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            <span>View Full Prescription</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: REAL-TIME FLEET LOGISTICS MAP (BELOW ORDER ITEMS & CUSTOMER PROFILE) */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-zinc-800">
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
                Delivery Route &amp; Live Tracking Map
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                One continuous route line connecting Merchant to Customer with real-time rider arrow position.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-xl bg-orange-50 px-3 py-1.5 text-xs font-bold text-[#FF6B35] ring-1 ring-orange-500/20 dark:bg-orange-950/40">
                <span className="material-symbols-outlined text-sm">straighten</span>
                <span>~{drivingDistanceKm} km • ~{estimatedDrivingMinutes} min transit</span>
              </span>
              <button
                type="button"
                onClick={() => setIsFullscreenMapOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">fullscreen</span>
                <span>Open Fullscreen Map</span>
              </button>
            </div>
          </div>

          {/* Embedded RealTimeLogisticsMap showing only 1 line, Merchant to Customer, and Rider Arrow */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 shadow-xl">
            <RealTimeLogisticsMap
              selectedOrderId={order.order_number || 'ORD-9021'}
              singleLineOnly={true}
              merchantName={originName}
              customerName={order.customer?.name || destLabel || 'Customer Destination'}
              riderName={order.rider?.name || 'Dawit Mengistu'}
              className="w-full"
            />
          </div>

          {/* Waypoints Breakdown (Point A Store & Point B Customer Destination) */}
          <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 rounded-2xl border border-slate-200/90 bg-slate-50/50 text-xs dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-800/30">
            {/* Point A: Store */}
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-zinc-200">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B35] text-[11px] font-black text-white">
                    A
                  </span>
                  <span>Point A: Store Pickup Location</span>
                </span>
              </div>
              <p className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                {originName} ({originBranch})
              </p>
              <p className="text-slate-600 dark:text-zinc-400">
                {originAddress}
              </p>
              <p className="font-mono text-[11px] text-slate-500">
                GPS Coordinates: {originLat}, {originLng}
              </p>
            </div>

            {/* Point B: Destination */}
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-black text-white">
                    B
                  </span>
                  <span>Point B: Customer Dropoff Destination</span>
                </span>
              </div>
              <p className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                {destLabel}: <span className="font-semibold">{destAddress}</span>
              </p>
              {destApt && (
                <p className="font-medium text-slate-600 dark:text-zinc-300">
                  Apartment / Suite: <strong className="text-slate-800 dark:text-zinc-100">{destApt}</strong>
                </p>
              )}
              <p className="font-mono text-[11px] text-slate-500">
                GPS Coordinates: {destLat}, {destLng}
              </p>
            </div>
          </div>
        </section>





        {/* MODAL: ADD MENU ITEM & EXTRA CUSTOMIZATIONS */}
        {isAddCustomItemModalOpen && (
          <div className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
            <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-700 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/40">
                    <span className="material-symbols-outlined text-2xl">restaurant_menu</span>
                  </span>
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
                      Add Menu Item &amp; Extra Customizations
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Select item from {originName} catalog, choose portion size variants, and configure extra modifier groups.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddCustomItemModalOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Scrollable Modal Body */}
              <div className="overflow-y-auto p-6 space-y-6 flex-1">
                {/* 1. Item Selector Carousel */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-2.5">
                    1. Select Catalog Product
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PRESET_CATALOG_ITEMS.map((cItem) => {
                      const isSel = selectedCatalogItem.id === cItem.id
                      return (
                        <div
                          key={cItem.id}
                          onClick={() => handleSelectCatalogItem(cItem)}
                          className={`cursor-pointer rounded-2xl border p-3 transition-all ${
                            isSel
                              ? 'border-[#FF6B35] bg-orange-50/50 ring-2 ring-[#FF6B35]/30 dark:border-[#FF6B35] dark:bg-orange-950/20'
                              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-850'
                          }`}
                        >
                          <img
                            src={cItem.image}
                            alt={cItem.name}
                            className="h-20 w-full rounded-xl object-cover"
                          />
                          <h4 className="mt-2 font-bold text-xs text-slate-900 dark:text-zinc-100 line-clamp-1">
                            {cItem.name}
                          </h4>
                          <span className="text-[11px] font-mono font-bold text-[#FF6B35]">
                            From ETB {cItem.basePrice}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Portion Size Variants */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-2.5">
                    2. Select Portion Size
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {(selectedCatalogItem.portionSizes || []).map((portion) => {
                      const isPortionSel = selectedPortionId === portion.id
                      return (
                        <div
                          key={portion.id}
                          onClick={() => setSelectedPortionId(portion.id)}
                          className={`cursor-pointer rounded-xl border p-3 transition-all ${
                            isPortionSel
                              ? 'border-[#FF6B35] bg-orange-50/60 ring-1 ring-[#FF6B35] dark:border-[#FF6B35] dark:bg-orange-950/30'
                              : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-850'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                              {portion.name}
                            </span>
                            <span
                              className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                isPortionSel ? 'border-[#FF6B35] bg-[#FF6B35] text-white' : 'border-slate-300 dark:border-zinc-700'
                              }`}
                            >
                              {isPortionSel && <span className="material-symbols-outlined text-[10px]">check</span>}
                            </span>
                          </div>
                          <span className="mt-1 block font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                            {portion.delta === 0 ? 'Standard Base' : portion.delta > 0 ? `+${portion.delta} ETB` : `${portion.delta} ETB`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 3. Extra Customization Groups */}
                {(selectedCatalogItem.groups || []).map((grp) => (
                  <div key={grp.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-850/60">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-zinc-800">
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                        {grp.name}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {grp.type === 'radio' ? 'Select 1 option' : 'Multiple selections allowed'}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {grp.options.map((opt) => {
                        const isChosen =
                          grp.type === 'radio'
                            ? selectedRadios[grp.id] === opt.id
                            : selectedAddons.includes(opt.id)

                        const toggleOpt = () => {
                          if (grp.type === 'radio') {
                            setSelectedRadios((prev) => ({ ...prev, [grp.id]: opt.id }))
                          } else {
                            setSelectedAddons((prev) =>
                              prev.includes(opt.id) ? prev.filter((id) => id !== opt.id) : [...prev, opt.id]
                            )
                          }
                        }

                        return (
                          <div
                            key={opt.id}
                            onClick={toggleOpt}
                            className={`flex items-center justify-between cursor-pointer rounded-xl border p-2.5 transition text-xs ${
                              isChosen
                                ? 'border-[#FF6B35] bg-white text-slate-900 shadow-2xs dark:border-[#FF6B35] dark:bg-zinc-900 dark:text-zinc-100'
                                : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded-${
                                  grp.type === 'radio' ? 'full' : 'md'
                                } border ${
                                  isChosen ? 'border-[#FF6B35] bg-[#FF6B35] text-white' : 'border-slate-300 dark:border-zinc-700'
                                }`}
                              >
                                {isChosen && <span className="material-symbols-outlined text-[10px]">check</span>}
                              </span>
                              <span>{opt.name}</span>
                            </div>
                            <span className="font-mono text-[11px] font-semibold text-[#FF6B35]">
                              {opt.price ? `+${opt.price} ETB` : 'Included'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {/* 4. Special Kitchen Preparation Note & Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Kitchen / Barista Special Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={customSpecialInstructions}
                      onChange={(e) => setCustomSpecialInstructions(e.target.value)}
                      placeholder="e.g. Extra crisp edges, dressing strictly on the side..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Quantity
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
                      <button
                        type="button"
                        onClick={() => setCustomItemQuantity((q) => Math.max(1, q - 1))}
                        className="px-3 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-mono font-bold text-xs text-slate-900 dark:text-zinc-100">
                        {customItemQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCustomItemQuantity((q) => q + 1)}
                        className="px-3 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer with Live Price Calculation */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-850">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-500 dark:text-zinc-400">Total Price:</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold text-[#FF6B35]">
                    ETB {(calculatedCustomizedUnitPrice * customItemQuantity).toFixed(2)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ({calculatedCustomizedUnitPrice} ETB x {customItemQuantity})
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddCustomItemModalOpen(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomizedItemToOrder}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e0531f] transition"
                  >
                    <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                    <span>Add Customized Item to Order</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: SEE CUSTOMIZATION DETAILS FOR AN EXISTING ORDER ITEM */}
        {inspectingItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35]">
                    <span className="material-symbols-outlined text-xl">tune</span>
                  </span>
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
                      Customization Details
                    </h3>
                    <p className="text-xs text-slate-500">
                      Line item breakdown for {inspectingItem.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingItem(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                {/* Item Core Details */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-zinc-800/50">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                      {inspectingItem.name}
                    </p>
                    <p className="text-slate-500">
                      Portion: <strong className="text-slate-800 dark:text-zinc-200">{inspectingItem.portion_size || 'Standard'}</strong>
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="block text-sm font-extrabold text-[#FF6B35]">
                      {order.currency || 'ETB'} {Number(inspectingItem.total_price).toFixed(2)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {inspectingItem.quantity}x @ {inspectingItem.unit_price} ETB
                    </span>
                  </div>
                </div>

                {/* Active Customizations Breakdown */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Active Modifier Selections &amp; Add-ons:
                  </span>
                  <div className="mt-2 space-y-2">
                    {inspectingItem.options_summary ? (
                      inspectingItem.options_summary.split(', ').map((opt, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-slate-700 dark:border-zinc-800 dark:bg-zinc-850 dark:text-zinc-300"
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-[#FF6B35]">check_circle</span>
                            <span className="font-semibold">{opt}</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md dark:bg-emerald-950/40">
                            Included in Price
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 italic">No extra custom options specified.</p>
                    )}
                  </div>
                </div>

                {/* Preparation & Service Notes */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-slate-600 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Kitchen Prep Status
                  </span>
                  <p className="mt-1 leading-relaxed">
                    Custom specifications dispatched to store kitchen terminal for {originName}.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectingItem(null)}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FULLSCREEN INTERACTIVE TRANSIT CORRIDOR MAP MODAL */}
        {isFullscreenMapOpen && (
          <div className="fixed inset-0 z-60 flex flex-col bg-slate-900/90 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
            <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-700 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              {/* Modal Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/40">
                    <span className="material-symbols-outlined text-2xl">route</span>
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
                        Transit Corridor: {originName} ➔ {destLabel}
                      </h3>
                      <span className="rounded-lg bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-[#FF6B35] ring-1 ring-orange-500/20 dark:bg-orange-950/40">
                        ~{drivingDistanceKm} km • ~{estimatedDrivingMinutes} min driving
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Order {order.order_number} • Transit Path Live Tracking
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(`${originLat},${originLng} to ${destLat},${destLng}`, 'Route Coordinates')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    <span className="material-symbols-outlined text-base">
                      {copiedText === 'Route Coordinates' ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedText === 'Route Coordinates' ? 'Coordinates Copied' : 'Copy Route GPS'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFullscreenMapOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    title="Close Fullscreen Map"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              </div>

              {/* Fullscreen Map Frame */}
              <div className="relative flex-1 bg-slate-100 dark:bg-zinc-950">
                <iframe
                  title="Fullscreen Route Map"
                  className="h-full w-full border-0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${routeBbox}&layer=mapnik&marker=${destLat},${destLng}`}
                  loading="eager"
                />

                {/* Floating Waypoints Drawer in Fullscreen View */}
                <div className="absolute top-4 left-4 max-w-sm rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95 text-xs space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 dark:border-zinc-800">
                    <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                      Waypoint Routing Summary
                    </span>
                    <span className="font-bold text-[#FF6B35]">
                      {order.rider ? `Courier: ${order.rider.name}` : 'Awaiting Dispatch'}
                    </span>
                  </div>

                  {/* Origin */}
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF6B35] text-[10px] font-black text-white">
                      A
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-zinc-100">{originName}</p>
                      <p className="text-[11px] text-slate-500">{originAddress}</p>
                      <p className="font-mono text-[10px] text-slate-400">GPS: {originLat}, {originLng}</p>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                      B
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-zinc-100">{destLabel}: {destAddress}</p>
                      {destApt && <p className="text-[11px] text-slate-600 dark:text-zinc-300">{destApt}</p>}
                      <p className="font-mono text-[10px] text-slate-400">GPS: {destLat}, {destLng}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t dark:border-zinc-800 flex items-center justify-between">
                    <span className="font-medium text-slate-500 text-[11px]">In-App Corridor Tracking</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`${originLat},${originLng} to ${destLat},${destLng}`, 'Route Coordinates')}
                      className="font-bold text-[#FF6B35] hover:underline"
                    >
                      {copiedText === 'Route Coordinates' ? 'Copied' : 'Copy GPS'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRESCRIPTION PREVIEW MODAL */}
        {showPrescriptionModal && order.prescription_image_url && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
            <div className="relative max-w-2xl w-full rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-sky-600">clinical_notes</span>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
                    Medical Prescription Document
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
              <div className="mt-4 flex flex-col items-center justify-center">
                <img
                  src={order.prescription_image_url}
                  alt="Official Prescription Document"
                  className="max-h-[65vh] rounded-xl object-contain border border-slate-200 shadow-sm"
                />
                <p className="mt-3 text-xs text-slate-500 text-center">
                  Order {order.order_number} • Prescription validated for cold-chain pharmaceutical dispensing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CANCEL ORDER MODAL */}
        {showCancelModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <span className="material-symbols-outlined text-2xl">warning</span>
                <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
                  Cancel Order {order.order_number}
                </h3>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
                Please specify the cancellation reason. If prepaid, an automatic refund will be credited to the customer&apos;s digital wallet.
              </p>

              <form onSubmit={handleConfirmCancel} className="mt-4 space-y-3">
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Customer requested cancellation / Store out of stock..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-400"
                  >
                    Go Back
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
