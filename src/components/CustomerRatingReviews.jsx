import { useState, useMemo } from 'react'

export default function CustomerRatingReviews({
  entityType = 'branch', // 'branch' or 'rider'
  entityName = 'Entity',
  initialReviews = [],
  onSaveReviews,
  aspectCriteria = [],
  baseRatingsCount = 1240,
}) {
  const [reviews, setReviews] = useState(initialReviews)
  const [starFilter, setStarFilter] = useState('ALL') // 'ALL', '5', '4', '3', '2', '1', 'POSITIVE', 'CRITICAL', 'WITH_REPLY'
  const [sortBy, setSortBy] = useState('MOST_RELEVANT') // 'MOST_RELEVANT', 'NEWEST', 'HIGHEST', 'LOWEST'
  const [searchQuery, setSearchQuery] = useState('')

  // Reply Modal State
  const [replyingReview, setReplyingReview] = useState(null)
  const [replyText, setReplyText] = useState('')

  // Add Review Modal State
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false)
  const [newReviewAuthor, setNewReviewAuthor] = useState('')
  const [newReviewRating, setNewReviewRating] = useState(5)
  const [newReviewOrderId, setNewReviewOrderId] = useState('')
  const [newReviewTitle, setNewReviewTitle] = useState('')
  const [newReviewComment, setNewReviewComment] = useState('')
  const [newReviewTagInput, setNewReviewTagInput] = useState('')
  const [formError, setFormError] = useState('')

  // Derived rating calculations
  const { totalReviews, averageRating, starCounts, starPercentages } = useMemo(() => {
    const total = reviews.length
    if (total === 0) {
      return {
        totalReviews: 0,
        averageRating: '5.0',
        starCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        starPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      }
    }

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    let sum = 0

    reviews.forEach((r) => {
      const s = Math.min(5, Math.max(1, Math.round(r.rating || 5)))
      counts[s] = (counts[s] || 0) + 1
      sum += r.rating
    })

    const avg = (sum / total).toFixed(1)
    const pcts = {
      5: Math.round((counts[5] / total) * 100),
      4: Math.round((counts[4] / total) * 100),
      3: Math.round((counts[3] / total) * 100),
      2: Math.round((counts[2] / total) * 100),
      1: Math.round((counts[1] / total) * 100),
    }

    return {
      totalReviews: total,
      averageRating: avg,
      starCounts: counts,
      starPercentages: pcts,
    }
  }, [reviews])

  // Filter & Sort reviews
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        // Star filter
        if (starFilter === '5' && r.rating !== 5) return false
        if (starFilter === '4' && r.rating !== 4) return false
        if (starFilter === '3' && r.rating !== 3) return false
        if (starFilter === '2' && r.rating !== 2) return false
        if (starFilter === '1' && r.rating !== 1) return false
        if (starFilter === 'POSITIVE' && r.rating < 4) return false
        if (starFilter === 'CRITICAL' && r.rating > 3) return false
        if (starFilter === 'WITH_REPLY' && !r.developerReply) return false

        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const authorMatch = r.author?.toLowerCase().includes(q)
          const titleMatch = r.title?.toLowerCase().includes(q)
          const commentMatch = r.comment?.toLowerCase().includes(q)
          const orderMatch = r.orderId?.toLowerCase().includes(q)
          const tagsMatch = r.tags?.some((t) => t.toLowerCase().includes(q))
          if (!authorMatch && !titleMatch && !commentMatch && !orderMatch && !tagsMatch) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'MOST_RELEVANT') return (b.helpfulCount || 0) - (a.helpfulCount || 0)
        if (sortBy === 'NEWEST') return new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)
        if (sortBy === 'HIGHEST') return b.rating - a.rating
        if (sortBy === 'LOWEST') return a.rating - b.rating
        return 0
      })
  }, [reviews, starFilter, sortBy, searchQuery])

  // Helpful vote toggle
  const handleToggleHelpful = (reviewId) => {
    const updated = reviews.map((r) => {
      if (r.id === reviewId) {
        const currentlyVoted = r.userVotedHelpful
        return {
          ...r,
          userVotedHelpful: !currentlyVoted,
          helpfulCount: currentlyVoted ? Math.max(0, (r.helpfulCount || 0) - 1) : (r.helpfulCount || 0) + 1,
        }
      }
      return r
    })
    setReviews(updated)
    if (onSaveReviews) onSaveReviews(updated)
  }

  // Developer / Admin response submit
  const handleSaveReply = (e) => {
    e.preventDefault()
    if (!replyingReview) return

    const now = new Date()
    const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const authorRole = entityType === 'branch' ? `${entityName} (Branch Manager)` : `Shima Dispatch Support (for ${entityName})`

    const updated = reviews.map((r) => {
      if (r.id === replyingReview.id) {
        return {
          ...r,
          developerReply: replyText.trim()
            ? {
                author: authorRole,
                date: dateFormatted,
                comment: replyText.trim(),
              }
            : null,
        }
      }
      return r
    })

    setReviews(updated)
    if (onSaveReviews) onSaveReviews(updated)
    setReplyingReview(null)
    setReplyText('')
  }

  // Add new customer review submit
  const handleAddReviewSubmit = (e) => {
    e.preventDefault()
    if (!newReviewAuthor.trim()) {
      setFormError('Please enter the customer name')
      return
    }
    if (!newReviewComment.trim()) {
      setFormError('Please enter the review comments')
      return
    }

    const now = new Date()
    const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    const tags = newReviewTagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const newRev = {
      id: `rev-${Date.now()}`,
      entityId: 'current',
      author: newReviewAuthor.trim(),
      avatar: `https://ui-avatars.com/api/?background=FF6B35&color=fff&bold=true&size=100&name=${encodeURIComponent(
        newReviewAuthor.trim()
      )}`,
      rating: Number(newReviewRating),
      date: dateFormatted,
      timestamp: now.toISOString(),
      verifiedOrder: true,
      orderId: newReviewOrderId.trim() || `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      orderItems: entityType === 'branch' ? 'Freshly prepared combo' : 'Express courier delivery',
      title: newReviewTitle.trim() || (newReviewRating >= 4 ? 'Great experience!' : 'Feedback on order'),
      comment: newReviewComment.trim(),
      helpfulCount: 1,
      userVotedHelpful: false,
      tags: tags.length > 0 ? tags : ['Verified Experience'],
      developerReply: null,
    }

    const updated = [newRev, ...reviews]
    setReviews(updated)
    if (onSaveReviews) onSaveReviews(updated)

    // Reset Form
    setNewReviewAuthor('')
    setNewReviewRating(5)
    setNewReviewOrderId('')
    setNewReviewTitle('')
    setNewReviewComment('')
    setNewReviewTagInput('')
    setFormError('')
    setIsAddReviewModalOpen(false)
  }

  // Render Star Rating Helper
  const renderStars = (score, size = 'text-base') => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`material-symbols-outlined ${size} select-none ${
              score >= star
                ? 'font-variation-fill'
                : score >= star - 0.5
                ? 'font-variation-half'
                : 'text-slate-300 dark:text-zinc-700'
            }`}
            style={{
              fontVariationSettings: score >= star ? "'FILL' 1" : score >= star - 0.5 ? "'FILL' 0.5" : "'FILL' 0",
            }}
          >
            star
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* CUSTOMER RATING SCORECARD & BREAKDOWN */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Giant Average Score & Count */}
          <div className="flex shrink-0 items-center gap-6 sm:gap-8">
            <div className="flex flex-col items-center justify-center">
              <span className="font-['Plus_Jakarta_Sans'] text-5xl font-black tracking-tight text-slate-900 dark:text-zinc-100 sm:text-6xl">
                {averageRating}
              </span>
              <div className="mt-1">{renderStars(Number(averageRating), 'text-lg')}</div>
              <span className="mt-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                {(baseRatingsCount + totalReviews).toLocaleString()} ratings
              </span>
            </div>

            {/* Vertical separator */}
            <div className="h-28 w-px bg-slate-200 dark:bg-zinc-800" />

            {/* 5-to-1 Star Progress Bars */}
            <div className="flex flex-col justify-center space-y-1.5 min-w-[180px] sm:min-w-[240px]">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = starCounts[star] || 0
                const pct = starPercentages[star] || 0
                const isSelected = starFilter === String(star)

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStarFilter(isSelected ? 'ALL' : String(star))}
                    className={`group flex items-center gap-2 text-left text-xs transition-opacity hover:opacity-100 ${
                      starFilter !== 'ALL' && !isSelected ? 'opacity-40' : 'opacity-100'
                    }`}
                    title={`Filter by ${star} star reviews (${count})`}
                  >
                    <span className="w-2.5 font-mono text-[11px] font-bold text-slate-600 dark:text-zinc-300">
                      {star}
                    </span>
                    <span className="material-symbols-outlined text-[13px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor:
                            star >= 4 ? '#10B981' : star === 3 ? '#F59E0B' : '#EF4444',
                        }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-[10px] font-medium text-slate-400 dark:text-zinc-500">
                      {pct}%
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: Sub-criteria Quality Breakdown */}
          <div className="flex flex-1 flex-col justify-between gap-4 border-t border-slate-100 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 dark:border-zinc-800">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  {entityType === 'branch' ? 'Branch Experience Scores' : 'Courier Performance Metrics'}
                </h4>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  Verified Customer Feedback
                </span>
              </div>

              {/* Sub criteria chips */}
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-2">
                {(aspectCriteria.length > 0
                  ? aspectCriteria
                  : entityType === 'branch'
                  ? [
                      { label: 'Food Quality & Taste', score: '4.9 ★', sub: '98% Positive' },
                      { label: 'Packaging & Temp', score: '4.8 ★', sub: '96% Positive' },
                      { label: 'Preparation Speed', score: '4.7 ★', sub: '16.5m Avg SLA' },
                      { label: 'Order Accuracy', score: '4.9 ★', sub: '99% Correct' },
                    ]
                  : [
                      { label: 'Delivery Punctuality', score: '4.9 ★', sub: '98% On-time' },
                      { label: 'Communication', score: '4.9 ★', sub: '99% Courteous' },
                      { label: 'Package Handling', score: '4.8 ★', sub: 'Zero Spills' },
                      { label: 'Dropoff Accuracy', score: '4.9 ★', sub: 'Exact Doorstep' },
                    ]
                ).map((crit) => (
                  <div
                    key={crit.label}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-zinc-800 dark:bg-zinc-850"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-bold text-slate-800 dark:text-zinc-200">{crit.label}</p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500">{crit.sub}</p>
                    </div>
                    <span className="shrink-0 font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                      {crit.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Ratings are calculated from verified app orders over the last 90 days.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER CHIPS & SEARCH */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Rating Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: `All (${totalReviews})` },
            { id: '5', label: `5 ★ (${starCounts[5] || 0})` },
            { id: '4', label: `4 ★ (${starCounts[4] || 0})` },
            { id: '3', label: `3 ★ (${starCounts[3] || 0})` },
            { id: '2', label: `2 ★ (${starCounts[2] || 0})` },
            { id: '1', label: `1 ★ (${starCounts[1] || 0})` },
            { id: 'POSITIVE', label: 'Positive (4-5★)' },
            { id: 'CRITICAL', label: 'Critical (1-3★)' },
            { id: 'WITH_REPLY', label: 'With Official Reply' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setStarFilter(pill.id)}
              className={`inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-2xs ${
                starFilter === pill.id
                  ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'border border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-750'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2 sm:ml-auto">
          {/* Keyword Search */}
          <div className="relative min-w-[200px]">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-7 text-xs font-medium text-slate-800 placeholder-slate-400 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            )}
          </div>

          {/* Sort Menu */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 cursor-pointer rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <option value="MOST_RELEVANT">Most Helpful</option>
            <option value="NEWEST">Newest First</option>
            <option value="HIGHEST">Highest Rating</option>
            <option value="LOWEST">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-zinc-600">
              star_half
            </span>
            <p className="mt-2 text-sm font-bold text-slate-700 dark:text-zinc-300">No reviews found</p>
            <p className="text-xs text-slate-400">
              Try adjusting your star filter or search query.
            </p>
            <button
              type="button"
              onClick={() => {
                setStarFilter('ALL')
                setSearchQuery('')
              }}
              className="mt-3 text-xs font-bold text-[#FF6B35] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Header: Author + Verified + Stars + Date */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar}
                    alt={rev.author}
                    className="h-10 w-10 rounded-full border border-slate-100 object-cover dark:border-zinc-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900 dark:text-zinc-100">
                        {rev.author}
                      </span>
                      {rev.verifiedOrder && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                          <span className="material-symbols-outlined text-[11px] text-emerald-600">check_circle</span>
                          Verified Eater
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-500">
                      <span>{renderStars(rev.rating, 'text-sm')}</span>
                      <span>•</span>
                      <span>{rev.date}</span>
                      {rev.orderId && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                            {rev.orderId}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top right quick tags */}
                {rev.orderItems && (
                  <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {rev.orderItems}
                  </span>
                )}
              </div>

              {/* Review Content */}
              <div className="mt-3.5 space-y-1.5">
                {rev.title && (
                  <h4 className="font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                    {rev.title}
                  </h4>
                )}
                <p className="text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
                  {rev.comment}
                </p>

                {/* Aspect Tags */}
                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {rev.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Official Response from Branch / Manager */}
              {rev.developerReply && (
                <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/90 p-3.5 dark:border-zinc-800 dark:bg-zinc-850">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B35] text-white">
                        <span className="material-symbols-outlined text-xs">storefront</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-zinc-100">
                        {rev.developerReply.author}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                      {rev.developerReply.date}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-zinc-300">
                    {rev.developerReply.comment}
                  </p>
                </div>
              )}

              {/* Footer Actions: Was this helpful? & Admin Reply button */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs dark:border-zinc-800">
                <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                  <span className="text-[11px]">Did you find this helpful?</span>
                  <button
                    type="button"
                    onClick={() => handleToggleHelpful(rev.id)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      rev.userVotedHelpful
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/30 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">thumb_up</span>
                    <span>Yes ({rev.helpfulCount || 0})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* REPLY MODAL */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-[#FF6B35]">reply</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  Official Response to Review
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReplyingReview(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-zinc-800/60 dark:text-zinc-300">
              <span className="font-bold text-slate-800 dark:text-zinc-200">
                {replyingReview.author}:
              </span>{' '}
              &ldquo;{replyingReview.comment}&rdquo;
            </div>

            <form onSubmit={handleSaveReply} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Your Public Reply
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank the customer, explain steps taken to resolve any issues, or share appreciation..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-orange-600 active:scale-95"
                >
                  Publish Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER REVIEW MODAL */}
      {isAddReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-amber-500">rate_review</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  Log Customer Rating &amp; Feedback
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {formError && (
              <div className="mt-3 rounded-xl bg-rose-50 p-2.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddReviewSubmit} className="mt-4 space-y-3.5">
              {/* Star Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Star Rating (1 to 5)
                </label>
                <div className="mt-1.5 flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <span
                        className={`material-symbols-outlined text-3xl ${
                          newReviewRating >= star ? 'text-amber-400' : 'text-slate-300 dark:text-zinc-700'
                        }`}
                        style={{ fontVariationSettings: newReviewRating >= star ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    </button>
                  ))}
                  <span className="ml-2 font-mono text-xs font-bold text-slate-600 dark:text-zinc-400">
                    {newReviewRating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Author & Order ID */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    placeholder="e.g. Bethlehem Haile"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Order / Delivery Ref #
                  </label>
                  <input
                    type="text"
                    value={newReviewOrderId}
                    onChange={(e) => setNewReviewOrderId(e.target.value)}
                    placeholder="e.g. #ORD-9982"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              {/* Title & Comment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Headline / Short Title
                </label>
                <input
                  type="text"
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  placeholder="e.g. Piping hot and fast delivery"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Review Comment *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Describe food taste, packaging, speed, or courier handling..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newReviewTagInput}
                  onChange={(e) => setNewReviewTagInput(e.target.value)}
                  placeholder="e.g. Hot Food, Polite Rider, Great Sauce"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddReviewModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-orange-600 active:scale-95"
                >
                  Save Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
