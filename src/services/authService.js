const AUTH_USERS_STORAGE_KEY = 'shima_auth_users_registry'
const AUTH_SESSION_KEY = 'shima_auth_user'

/**
 * Loads registered users from localStorage.
 * Starts empty as requested ("remove all auth user").
 */
export function getRegisteredUsers() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(AUTH_USERS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('Failed to parse auth users from localStorage:', e)
    return []
  }
}

/**
 * Saves registered users to localStorage.
 */
export function saveRegisteredUsers(users) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(users))
  } catch (e) {
    console.error('Failed to save auth users:', e)
  }
}

/**
 * Clears all users from the auth registry (used to reset if needed).
 */
export function clearAllAuthUsers() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_USERS_STORAGE_KEY)
  }
}

/**
 * Authenticates user credentials.
 * - If user logs in for the first time with an email:
 *   stores the email and password, marks isFirstTimeLogin: true,
 *   and signals to redirect to the first-time login page.
 * - Next time the user logs in after setting their permanent password:
 *   validates password and logs in directly to the console dashboard.
 */
export function authenticateUser(emailInput, passwordInput) {
  const email = (emailInput || '').trim().toLowerCase()
  const password = (passwordInput || '').trim()

  if (!email) {
    return { success: false, error: 'Please enter your email address.' }
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' }
  }

  const users = getRegisteredUsers()
  const existingUser = users.find((u) => u.email.toLowerCase() === email)

  // 1. BRAND NEW USER: Very first time logging in with this email!
  if (!existingUser) {
    const newUser = {
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      role: email.includes('admin') ? 'Platform Super Admin' : 'Operations Specialist',
      tempPassword: password, // Store initial login password as temp password
      password: password,
      isFirstTimeLogin: true, // First-time login flag active
      createdAt: new Date().toISOString(),
    }

    const updated = [...users, newUser]
    saveRegisteredUsers(updated)

    return {
      success: true,
      isFirstTimeLogin: true,
      user: newUser,
      message: 'First-time login detected. Redirecting to mandatory password setup...',
    }
  }

  // 2. USER STILL IN FIRST-TIME SETUP: Has not yet chosen permanent password
  if (existingUser.isFirstTimeLogin) {
    if (existingUser.tempPassword && existingUser.tempPassword !== password && existingUser.password !== password) {
      return {
        success: false,
        error: 'Incorrect initial password. Please enter the password you first used for this account.',
      }
    }

    return {
      success: true,
      isFirstTimeLogin: true,
      user: existingUser,
      message: 'First-time login detected. Redirecting to mandatory password setup...',
    }
  }

  // 3. RETURNING USER: Has already completed first-time setup!
  // Validate against their permanent password
  if (existingUser.password !== password) {
    return {
      success: false,
      error: 'Incorrect password. Please enter your permanent password.',
    }
  }

  // Next time login goes DIRECT: activate session
  const sessionUser = {
    id: existingUser.id,
    name: existingUser.name,
    email: existingUser.email,
    role: existingUser.role,
    department: existingUser.department || 'Operations',
    avatar: existingUser.avatar,
    token: `shima_session_${Date.now()}`,
    loginAt: new Date().toISOString(),
  }
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionUser))

  return {
    success: true,
    isFirstTimeLogin: false,
    user: sessionUser,
    message: `Welcome back, ${sessionUser.name}! Logging in...`,
  }
}

/**
 * Completes the first-time password setup:
 * updates the user's permanent password, sets isFirstTimeLogin = false,
 * clears tempPassword, and activates the logged-in session.
 */
export function completeFirstTimeSetup(emailInput, newPassword) {
  const email = (emailInput || '').trim().toLowerCase()
  const users = getRegisteredUsers()

  let updatedUser = null
  const updatedUsers = users.map((u) => {
    if (u.email.toLowerCase() === email) {
      updatedUser = {
        ...u,
        password: newPassword,
        tempPassword: null,
        isFirstTimeLogin: false, // Set to false so next time goes direct!
        updatedAt: new Date().toISOString(),
      }
      return updatedUser
    }
    return u
  })

  if (!updatedUser) {
    updatedUser = {
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      role: email.includes('admin') ? 'Platform Super Admin' : 'Operations Specialist',
      password: newPassword,
      tempPassword: null,
      isFirstTimeLogin: false,
      updatedAt: new Date().toISOString(),
    }
    updatedUsers.push(updatedUser)
  }

  saveRegisteredUsers(updatedUsers)

  // Save active session in localStorage
  const sessionUser = {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    department: updatedUser.department || 'Operations',
    avatar: updatedUser.avatar,
    token: `shima_session_${Date.now()}`,
    firstTimeSetupCompleted: true,
    loginAt: new Date().toISOString(),
  }
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionUser))

  return {
    success: true,
    user: sessionUser,
  }
}

/**
 * Updates password (from reset password flow)
 */
export function updateUserPassword(emailInput, newPassword) {
  const email = (emailInput || '').trim().toLowerCase()
  const users = getRegisteredUsers()

  let found = false
  const updatedUsers = users.map((u) => {
    if (u.email.toLowerCase() === email) {
      found = true
      return {
        ...u,
        password: newPassword,
        isFirstTimeLogin: false,
        updatedAt: new Date().toISOString(),
      }
    }
    return u
  })

  if (!found) {
    updatedUsers.push({
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      role: 'Staff Member',
      password: newPassword,
      isFirstTimeLogin: false,
      updatedAt: new Date().toISOString(),
    })
  }

  saveRegisteredUsers(updatedUsers)
  return { success: true }
}

/**
 * Gets currently logged in session
 */
export function getCurrentSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
