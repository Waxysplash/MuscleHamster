/**
 * validation.js
 * MuscleHamster Expo
 *
 * Input validation and sanitization utilities for security hardening
 */

// Firebase UID format: 20-128 alphanumeric characters
const USER_ID_REGEX = /^[a-zA-Z0-9]{20,128}$/;

// Invite code format: MH-XXXXXX (6 alphanumeric chars, excluding confusing ones)
const INVITE_CODE_REGEX = /^MH-[A-HJ-NP-Z2-9]{6}$/i;

// Safe hamster name: 1-50 chars, letters, numbers, spaces, basic punctuation
const HAMSTER_NAME_REGEX = /^[\p{L}\p{N}\s\-'.,!?]{1,50}$/u;

// Dangerous patterns for XSS prevention
const HTML_TAG_REGEX = /<[^>]*>/g;
const DANGEROUS_CHARS_REGEX = /[<>'"&]/g;
const SCRIPT_PATTERN = /javascript:|data:|vbscript:/gi;

/**
 * Validate Firebase User ID format
 * @param {string} id - User ID to validate
 * @returns {boolean} True if valid
 */
export const isValidUserId = (id) => {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return USER_ID_REGEX.test(id);
};

/**
 * Validate invite code format (MH-XXXXXX)
 * @param {string} code - Invite code to validate
 * @returns {boolean} True if valid
 */
export const isValidInviteCode = (code) => {
  if (!code || typeof code !== 'string') {
    return false;
  }
  const normalized = code.toUpperCase().trim();
  return INVITE_CODE_REGEX.test(normalized);
};

/**
 * Validate hamster name (1-50 chars, safe characters)
 * @param {string} name - Name to validate
 * @returns {boolean} True if valid
 */
export const isValidHamsterName = (name) => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 50) {
    return false;
  }
  return HAMSTER_NAME_REGEX.test(trimmed);
};

/**
 * Sanitize text by removing HTML and dangerous characters
 * @param {string} text - Text to sanitize
 * @param {number} maxLength - Maximum length (default 100)
 * @returns {string} Sanitized text
 */
export const sanitizeText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(HTML_TAG_REGEX, '')           // Remove HTML tags
    .replace(DANGEROUS_CHARS_REGEX, '')    // Remove dangerous chars
    .replace(SCRIPT_PATTERN, '')           // Remove script protocols
    .trim()
    .substring(0, maxLength);
};

/**
 * Sanitize a name for display (with fallback)
 * @param {string} name - Name to sanitize
 * @param {string} fallback - Fallback if name is invalid
 * @returns {string} Sanitized name or fallback
 */
export const sanitizeName = (name, fallback = 'A friend') => {
  if (!name || typeof name !== 'string') {
    return fallback;
  }

  const sanitized = sanitizeText(name, 50);
  return sanitized.length > 0 ? sanitized : fallback;
};

/**
 * Validate friend request parameters
 * @param {string} senderId - Sender user ID
 * @param {string} receiverId - Receiver user ID
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateFriendRequest = (senderId, receiverId) => {
  const errors = [];

  if (!isValidUserId(senderId)) {
    errors.push('Invalid sender ID');
  }

  if (!isValidUserId(receiverId)) {
    errors.push('Invalid receiver ID');
  }

  if (senderId && receiverId && senderId === receiverId) {
    errors.push("You can't send a friend request to yourself");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate nudge parameters
 * @param {string} senderId - Sender user ID
 * @param {string} recipientId - Recipient user ID
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateNudge = (senderId, recipientId) => {
  const errors = [];

  if (!isValidUserId(senderId)) {
    errors.push('Invalid sender ID');
  }

  if (!isValidUserId(recipientId)) {
    errors.push('Invalid recipient ID');
  }

  if (senderId && recipientId && senderId === recipientId) {
    errors.push("You can't nudge yourself");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate block user parameters
 * @param {string} blockerId - Blocker user ID
 * @param {string} blockedId - Blocked user ID
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateBlockUser = (blockerId, blockedId) => {
  const errors = [];

  if (!isValidUserId(blockerId)) {
    errors.push('Invalid blocker ID');
  }

  if (!isValidUserId(blockedId)) {
    errors.push('Invalid blocked user ID');
  }

  if (blockerId && blockedId && blockerId === blockedId) {
    errors.push("You can't block yourself");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate invite code lookup parameters
 * @param {string} code - Invite code
 * @param {string} currentUserId - Current user ID (optional, to check self-use)
 * @returns {{ valid: boolean, errors: string[], normalizedCode: string | null }}
 */
export const validateInviteCodeLookup = (code, currentUserId = null) => {
  const errors = [];
  let normalizedCode = null;

  if (!code || typeof code !== 'string') {
    errors.push('Invite code is required');
  } else {
    normalizedCode = code.toUpperCase().trim();

    if (!isValidInviteCode(normalizedCode)) {
      errors.push('Invalid invite code format. Codes look like: MH-ABC123');
    }
  }

  if (currentUserId && !isValidUserId(currentUserId)) {
    errors.push('Invalid user session');
  }

  return {
    valid: errors.length === 0,
    errors,
    normalizedCode,
  };
};

export default {
  isValidUserId,
  isValidInviteCode,
  isValidHamsterName,
  sanitizeText,
  sanitizeName,
  validateFriendRequest,
  validateNudge,
  validateBlockUser,
  validateInviteCodeLookup,
};
